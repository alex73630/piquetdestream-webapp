import { z } from "zod"
import { RolesEnum } from "../../../interfaces/roles.enum"
import { createTRPCRouter, protectedProcedure } from "../trpc"

export const streamersRouter = createTRPCRouter({
	searchStreamers: protectedProcedure
		.input(
			z.object({
				name: z.string().min(1)
			})
		)
		.mutation(async ({ input, ctx }) => {
			// Get streamers from database
			const streamers = await ctx.prisma.user.findMany({
				where: {
					accounts: {
						some: {
							providerAccountName: {
								contains: input.name,
								mode: "insensitive"
							}
						}
					},
					userState: {
						roles: {
							has: RolesEnum.STREAMER
						}
					}
				},
				include: {
					userState: true,
					accounts: true,
					streamKey: true
				}
			})

			return streamers
		}),
	getStreamer: protectedProcedure
		.input(
			z.object({
				id: z.string().min(1)
			})
		)
		.mutation(async ({ input, ctx }) => {
			// Get streamer from database
			const streamer = await ctx.prisma.user.findFirst({
				where: {
					id: input.id
				},
				include: {
					userState: true,
					accounts: true,
					streamKey: true
				}
			})

			return streamer
		})
})
