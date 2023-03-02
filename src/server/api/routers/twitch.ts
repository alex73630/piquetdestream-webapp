import { ApiClient } from "@twurple/api"
import { RefreshingAuthProvider } from "@twurple/auth"
import { z } from "zod"
import { env } from "../../../env.mjs"
import { createTRPCRouter, protectedProcedure } from "../trpc"

const twitchAuthProvider = new RefreshingAuthProvider({
	clientId: env.TWITCH_CLIENT_ID,
	clientSecret: env.TWITCH_CLIENT_SECRET
})

const twitchClient = new ApiClient({
	authProvider: twitchAuthProvider
})

export interface TwitchChannel {
	name: string
	image?: string
}

export const twitchRouter = createTRPCRouter({
	searchChannels: protectedProcedure
		.input(
			z.object({
				name: z.string()
			})
		)
		.mutation(async ({ input }): Promise<TwitchChannel[]> => {
			const channels = await twitchClient.search.searchChannels(input.name, {
				limit: 5
			})

			return channels.data.map((channel) => ({
				name: `@${channel.displayName}`,
				image: channel.thumbnailUrl
			}))
		}),
	searchCategories: protectedProcedure
		.input(
			z.object({
				name: z.string()
			})
		)
		.mutation(async ({ input }): Promise<TwitchChannel[]> => {
			const categories = await twitchClient.search.searchCategories(input.name, {
				limit: 5
			})

			return categories.data.map((category) => ({
				name: category.name
			}))
		})
})
