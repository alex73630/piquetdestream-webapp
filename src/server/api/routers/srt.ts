import { TRPCError } from "@trpc/server"
import { randomUUID } from "crypto"
import { z } from "zod"
import { RolesEnum } from "../../../interfaces/roles.enum"
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc"

export const checkKeyPayload = z.object({
	channel_id: z.string().min(1),
	stream_key: z.string().min(1)
})

export const srtRouter = createTRPCRouter({
	checkKey: publicProcedure.input(checkKeyPayload).query(async ({ input, ctx }) => {
		try {
			// Check if the stream key is in the database
			const streamKey = await ctx.prisma.streamKey.findFirst({
				where: {
					key: input.stream_key,
					channel: input.channel_id
				}
			})

			if (!streamKey) {
				console.warn(`Invalid stream key for channel ${input.channel_id}`)
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "Invalid stream key"
				})
			}

			return true
		} catch (error) {
			console.warn(`Invalid stream key for channel ${input.channel_id}`)
			throw new TRPCError({
				code: "FORBIDDEN",
				message: "Invalid stream key"
			})
		}
	}),
	createKey: protectedProcedure
		.input(
			z.object({
				user_id: z.string().min(1)
			})
		)
		.mutation(async ({ input, ctx }) => {
			// TODO: allow streamers to reset their keys
			// Check if session user has role admin or tech
			if (!ctx.session.user.roles.includes(RolesEnum.ADMIN) && !ctx.session.user.roles.includes(RolesEnum.TECH)) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "You don't have permission to do that"
				})
			}

			// Get user from database with input user id
			const user = await ctx.prisma.user.findFirst({
				where: {
					id: input.user_id
				},
				include: {
					userState: true,
					accounts: true
				}
			})

			// Check if user exists, has role streamer and has a twitch account
			if (
				!user ||
				!user.userState?.roles.includes(RolesEnum.STREAMER) ||
				!user.accounts.find((account) => account.provider === "twitch")
			) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "User not found"
				})
			}

			const twitchUsername = user.accounts.find((account) => account.provider === "twitch")
				?.providerAccountName as string

			// Fetch all existing stream keys to generate new unique key
			const streamKeys = await ctx.prisma.streamKey.findMany({ select: { key: true } })

			// Generate new unique key
			let newKey = randomUUID()
			while (streamKeys.find((streamKey) => streamKey.key === newKey)) {
				newKey = randomUUID()
			}

			// Upsert new stream key
			const streamKey = await ctx.prisma.streamKey.upsert({
				where: {
					userId: input.user_id
				},
				update: {
					channel: twitchUsername,
					key: newKey
				},
				create: {
					userId: input.user_id,
					channel: twitchUsername,
					key: newKey
				}
			})

			// Send base64 encoded key to frontend
			return Buffer.from(`ll_${streamKey.channel}:${streamKey.key}`).toString("base64")
		}),
	resetKey: protectedProcedure.mutation(async ({ ctx }) => {
		// Check if session user has role streamer
		if (!ctx.session.user.roles.includes(RolesEnum.STREAMER)) {
			throw new TRPCError({
				code: "FORBIDDEN",
				message: "You don't have permission to do that"
			})
		}

		// Check if user as a stream key
		const streamKey = await ctx.prisma.streamKey.findFirst({
			where: {
				userId: ctx.session.user.id
			}
		})

		if (!streamKey) {
			throw new TRPCError({
				code: "FORBIDDEN",
				message: "You don't have permission to do that"
			})
		}

		// Fetch all existing stream keys to generate new unique key
		const streamKeys = await ctx.prisma.streamKey.findMany({ select: { key: true } })

		// Generate new unique key
		let newKey = randomUUID()
		while (streamKeys.find((streamKey) => streamKey.key === newKey)) {
			newKey = randomUUID()
		}

		// Update stream key
		const newStreamKey = await ctx.prisma.streamKey.update({
			where: {
				userId: ctx.session.user.id
			},
			data: {
				key: newKey
			}
		})

		// Send base64 encoded key to frontend
		return Buffer.from(`ll_${newStreamKey.channel}:${newStreamKey.key}`).toString("base64")
	}),
	listKeyOwners: protectedProcedure.query(async ({ ctx }) => {
		// Get all stream keys
		const streamKeys = await ctx.prisma.streamKey.findMany({
			include: {
				streamer: {
					include: {
						accounts: true,
						userState: true
					}
				}
			}
		})

		// Return stream keys with user data
		return streamKeys.map((streamKey) => ({
			id: streamKey.streamer.id,
			name: streamKey.streamer.name,
			channel: streamKey.channel,
			image: streamKey.streamer.image,
			roles: streamKey.streamer.userState?.roles
		}))
	})
})
