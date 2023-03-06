import { StreamRequestTimeslotStatus, TechAppointmentStatus } from "@prisma/client"
import dayjs from "dayjs"
import "dayjs/locale/fr"
import { z } from "zod"
import { RolesEnum } from "../../../../interfaces/roles.enum"
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../../trpc"
import { CreateStreamRequestValidation } from "./validators"

dayjs.locale("fr")

export const scheduleRouter = createTRPCRouter({
	getSchedule: publicProcedure
		.input(
			z.object({
				streamerIds: z.array(z.string()).optional(),
				weekStart: z.date(),
				status: z
					.array(
						z.enum([
							StreamRequestTimeslotStatus.APPROVED,
							StreamRequestTimeslotStatus.PENDING,
							StreamRequestTimeslotStatus.DENIED
						])
					)
					.optional()
			})
		)
		.query(({ ctx, input }) => {
			const weekStart = dayjs(input.weekStart).startOf("day").toDate()
			const weekEnd = dayjs(input.weekStart).endOf("week").add(1, "day").startOf("day").toDate()

			console.log(weekStart, weekEnd)

			// If user unauthenticated, they can only see approved stream requests
			if (!ctx.session?.user) {
				return ctx.prisma.streamRequest.findMany({
					where: {
						streamRequestTimeSlots: {
							some: {
								startTime: {
									gte: weekStart
								},
								endTime: {
									lte: weekEnd
								},
								status: StreamRequestTimeslotStatus.APPROVED
							}
						}
					},
					include: {
						streamRequestTimeSlots: true,
						streamer: true,
						techAppointment: true
					}
				})
			}

			return ctx.prisma.streamRequest.findMany({
				where: {
					streamRequestTimeSlots: {
						some: {
							startTime: {
								gte: weekStart
							},
							endTime: {
								lte: weekEnd
							},
							...(input.status && {
								status: {
									in: input.status
								}
							})
						}
					},
					...(input.streamerIds && {
						streamerId: {
							in: input.streamerIds
						}
					})
				},
				include: {
					streamRequestTimeSlots: {
						where: {
							startTime: {
								gte: weekStart
							},
							endTime: {
								lte: weekEnd
							},
							...(input.status && {
								status: {
									in: input.status
								}
							})
						}
					},
					streamer: true,
					techAppointment: true
				}
			})
		}),
	createStreamRequest: protectedProcedure.input(CreateStreamRequestValidation).mutation(async ({ ctx, input }) => {
		// If user is an admin or planning, they can create a stream request for another user
		const streamerId =
			(ctx.session.user.roles.includes(RolesEnum.ADMIN) || ctx.session.user.roles.includes(RolesEnum.PLANNING)) &&
			input.streamerId
				? input.streamerId
				: ctx.session.user.id

		// Check if streamer has the streamer role
		const streamer = await ctx.prisma.user.findUnique({
			where: {
				id: streamerId
			},
			include: {
				userState: true
			}
		})
		if (!streamer) {
			throw new Error("Streamer not found")
		}
		if (!streamer.userState?.roles.includes(RolesEnum.STREAMER)) {
			throw new Error("User is not a streamer")
		}

		// Reject request if stream request includes a time slot in the past unless user is an admin or planning
		const now = new Date()
		const pastTimeSlots = input.streamRequestTimeSlots.filter((timeslot) => timeslot.startTime < now)
		if (
			pastTimeSlots.length > 0 &&
			!ctx.session.user.roles.includes(RolesEnum.ADMIN) &&
			!ctx.session.user.roles.includes(RolesEnum.PLANNING)
		) {
			throw new Error("Cannot create a stream request with a time slot in the past")
		}

		// Remove any requested time slots that overlap with existing and approved time slots from any streamer
		const firstRequestedTimeSlot = input.streamRequestTimeSlots[0] as { startTime: Date; endTime: Date }
		const lastRequestedTimeSlot = input.streamRequestTimeSlots[input.streamRequestTimeSlots.length - 1] as {
			startTime: Date
			endTime: Date
		}
		const existingApprovedTimeSlots = await ctx.prisma.streamRequestTimeSlots.findMany({
			where: {
				status: StreamRequestTimeslotStatus.APPROVED,
				startTime: {
					lte: lastRequestedTimeSlot.endTime
				},
				endTime: {
					gte: firstRequestedTimeSlot.startTime
				}
			}
		})

		// Mark valid time slots as pending and invalid time slots as denied
		const timeslots: {
			startTime: Date
			endTime: Date
			status: StreamRequestTimeslotStatus
		}[] = input.streamRequestTimeSlots.map((timeslot) => {
			const existingApprovedTimeSlot = existingApprovedTimeSlots.find(
				(existingApprovedTimeSlot) =>
					timeslot.startTime >= existingApprovedTimeSlot.startTime &&
					timeslot.endTime <= existingApprovedTimeSlot.endTime
			)
			return {
				startTime: timeslot.startTime,
				endTime: timeslot.endTime,
				status: existingApprovedTimeSlot
					? StreamRequestTimeslotStatus.DENIED
					: StreamRequestTimeslotStatus.PENDING
			}
		})

		// Create stream request
		const streamRequest = await ctx.prisma.streamRequest.create({
			data: {
				title: input.title,
				description: input.description,
				category: input.category,
				guests: input.guests,
				streamer: {
					connect: {
						id: streamerId
					}
				},
				streamRequestTimeSlots: {
					create: timeslots
				}
			},
			include: {
				streamRequestTimeSlots: true,
				streamer: true,
				techAppointment: true
			}
		})

		return streamRequest
	}),

	setStreamRequestStatus: protectedProcedure
		.input(
			z.object({
				streamRequestId: z.number(),
				streamRequestTimeslotId: z.number(),
				status: z.enum([
					StreamRequestTimeslotStatus.APPROVED,
					StreamRequestTimeslotStatus.PENDING,
					StreamRequestTimeslotStatus.DENIED
				])
			})
		)
		.mutation(async ({ ctx, input }) => {
			if (
				!ctx.session.user.roles.includes(RolesEnum.ADMIN) &&
				!ctx.session.user.roles.includes(RolesEnum.PLANNING)
			) {
				throw new Error("You do not have permission to perform this action")
			}
			const streamRequest = await ctx.prisma.streamRequest.findUnique({
				where: {
					id: input.streamRequestId
				},
				include: {
					streamRequestTimeSlots: true
				}
			})
			if (!streamRequest) {
				throw new Error("Stream request not found")
			}

			const streamRequestTimeslot = streamRequest.streamRequestTimeSlots.find(
				(timeslot) => timeslot.id === input.streamRequestTimeslotId
			)

			if (!streamRequestTimeslot) {
				throw new Error("Stream request timeslot not found")
			}

			// This is an approve request
			if (input.status === StreamRequestTimeslotStatus.APPROVED) {
				// If the stream request already has a timeslot approved, we can't approve another one
				const approvedTimeslot = streamRequest.streamRequestTimeSlots.find(
					(timeslot) => timeslot.status === StreamRequestTimeslotStatus.APPROVED
				)
				if (approvedTimeslot) {
					throw new Error("This stream request already has an approved timeslot")
				}

				// Else approve the timeslot and deny all others
				const updatedTimeslots = streamRequest.streamRequestTimeSlots.map((timeslot) => {
					return {
						where: {
							id: timeslot.id
						},
						data: {
							status:
								timeslot.id === input.streamRequestTimeslotId
									? StreamRequestTimeslotStatus.APPROVED
									: StreamRequestTimeslotStatus.DENIED
						}
					}
				})

				await ctx.prisma.streamRequestTimeSlots.updateMany({
					data: updatedTimeslots
				})
			}

			// This is a pending request
			if (input.status === StreamRequestTimeslotStatus.PENDING) {
				// We can't set a timeslot to pending if there is already an approved timeslot, unless the approved timeslot is the one we're trying to set to pending
				const approvedTimeslot = streamRequest.streamRequestTimeSlots.find(
					(timeslot) =>
						timeslot.status === StreamRequestTimeslotStatus.APPROVED &&
						timeslot.id !== input.streamRequestTimeslotId
				)

				if (approvedTimeslot) {
					throw new Error("This stream request already has an approved timeslot")
				}

				// Else set the timeslot to pending
				await ctx.prisma.streamRequestTimeSlots.update({
					where: {
						id: input.streamRequestTimeslotId
					},
					data: {
						status: StreamRequestTimeslotStatus.PENDING
					}
				})
			}

			// This is a deny request
			if (input.status === StreamRequestTimeslotStatus.DENIED) {
				// Else deny the timeslot
				await ctx.prisma.streamRequestTimeSlots.update({
					where: {
						id: input.streamRequestTimeslotId
					},
					data: {
						status: StreamRequestTimeslotStatus.DENIED
					}
				})
			}

			return ctx.prisma.streamRequest.findUnique({
				where: {
					id: input.streamRequestId
				},
				include: {
					streamRequestTimeSlots: true,
					streamer: true,
					techAppointment: true
				}
			})
		}),
	createTechAppointment: protectedProcedure
		.input(
			z.object({
				streamRequestId: z.number(),
				startTime: z.date(),
				techId: z.string()
			})
		)
		.mutation(async ({ ctx, input }) => {
			if (
				!ctx.session.user.roles.includes(RolesEnum.ADMIN) &&
				!ctx.session.user.roles.includes(RolesEnum.PLANNING)
			) {
				throw new Error("You do not have permission to perform this action")
			}

			const streamRequest = await ctx.prisma.streamRequest.findUnique({
				where: {
					id: input.streamRequestId
				},
				include: {
					streamRequestTimeSlots: true,
					techAppointment: true
				}
			})

			if (!streamRequest) {
				throw new Error("Stream request not found")
			}

			if (
				streamRequest.techAppointment &&
				streamRequest.techAppointment.status !== TechAppointmentStatus.DENIED
			) {
				throw new Error(
					"This stream request already has a tech appointment with status " +
						streamRequest.techAppointment.status
				)
			}

			const approvedTimeslot = streamRequest.streamRequestTimeSlots.find(
				(timeslot) => timeslot.status === StreamRequestTimeslotStatus.APPROVED
			)

			if (!approvedTimeslot) {
				throw new Error("No approved timeslot found for this stream request")
			}

			const tech = await ctx.prisma.user.findUnique({
				where: {
					id: input.techId
				},
				include: {
					userState: true
				}
			})

			if (!tech) {
				throw new Error("Tech not found")
			}

			// Check if tech has tech role
			if (!tech.userState?.roles.includes(RolesEnum.TECH)) {
				throw new Error("User is not a tech")
			}

			// Create or update tech appointment
			const techAppointment = await ctx.prisma.techAppointment.upsert({
				where: {
					id: streamRequest.techAppointment?.id
				},
				create: {
					streamRequest: {
						connect: {
							id: input.streamRequestId
						}
					},
					tech: {
						connect: {
							id: input.techId
						}
					},
					startTime: input.startTime,
					status: TechAppointmentStatus.PENDING
				},
				update: {
					tech: {
						connect: {
							id: input.techId
						}
					},
					startTime: input.startTime,
					status: TechAppointmentStatus.PENDING
				}
			})

			return techAppointment
		}),
	setTechAppointmentStatus: protectedProcedure
		.input(
			z.object({
				techAppointmentId: z.number(),
				status: z.enum([TechAppointmentStatus.APPROVED, TechAppointmentStatus.DENIED])
			})
		)
		.mutation(async ({ ctx, input }) => {
			if (
				!ctx.session.user.roles.includes(RolesEnum.ADMIN) &&
				!ctx.session.user.roles.includes(RolesEnum.PLANNING)
			) {
				throw new Error("You do not have permission to perform this action")
			}

			const techAppointment = await ctx.prisma.techAppointment.findUnique({
				where: {
					id: input.techAppointmentId
				},
				include: {
					streamRequest: true
				}
			})

			if (!techAppointment) {
				throw new Error("Tech appointment not found")
			}

			// This is an approve request
			if (input.status === TechAppointmentStatus.APPROVED) {
				// If the tech appointment already has been approved, we can't approve another one
				if (techAppointment.status === TechAppointmentStatus.APPROVED) {
					throw new Error("This tech appointment has already been approved")
				}

				// Else approve the tech appointment and deny all others
				await ctx.prisma.techAppointment.update({
					where: {
						id: input.techAppointmentId
					},
					data: {
						status: TechAppointmentStatus.APPROVED
					}
				})
			}

			// This is a deny request
			if (input.status === TechAppointmentStatus.DENIED) {
				// Else deny the tech appointment
				await ctx.prisma.techAppointment.update({
					where: {
						id: input.techAppointmentId
					},
					data: {
						status: TechAppointmentStatus.DENIED
					}
				})
			}

			return ctx.prisma.streamRequest.findUnique({
				where: {
					id: techAppointment.streamRequest?.id
				},
				include: {
					streamRequestTimeSlots: true,
					streamer: true,
					techAppointment: true
				}
			})
		})
})
