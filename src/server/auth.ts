import { type GetServerSidePropsContext } from "next"
import { getServerSession, type NextAuthOptions, type DefaultSession } from "next-auth"
import DiscordProvider, { type DiscordProfile } from "next-auth/providers/discord"
import TwitchProvider, { type TwitchProfile } from "next-auth/providers/twitch"
import DiscordOauth2 from "discord-oauth2"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { env } from "~/env.mjs"
import { prisma } from "~/server/db"
import { type RolesEnum } from "../interfaces/roles.enum"
import { roleIdToEnum } from "../utils/roles"

const DiscordOauthClient = new DiscordOauth2()
/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
	interface Session extends DefaultSession {
		user: {
			id: string
			connectedAccounts?: {
				provider: string
				providerAccountId: string
				providerAccountName: string
			}[]
			completedObsSetup: boolean
			completedOnboarding: boolean
			isInGuild: boolean
			roles: RolesEnum[]
			// ...other properties
			// role: UserRole;
		} & DefaultSession["user"]
	}

	interface User {
		id: string
		// ...other properties
		// role: UserRole;
	}
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authOptions: NextAuthOptions = {
	callbacks: {
		// Allow sign in :
		// - with Discord only if user is in the guild
		// - with Twitch only if user has an existing account logged with Discord
		async signIn({ user, account }) {
			if (user && account && account.provider === "discord") {
				if (account.access_token) {
					try {
						const guildMember = await DiscordOauthClient.getGuildMember(
							account.access_token,
							env.DISCORD_GUILD_ID
						)
						if (guildMember) {
							return true
						}
					} catch (error) {
						console.log("Error while getting guild member", user.name)
						return "/?loginError=discord.notInGuild"
					}
				}
			} else if (account && account.provider === "twitch") {
				console.log("Login from Twitch")
				return true
			}
			return "/?loginError=unknown"
		},
		async session({ session, token }) {
			if (session.user && token.sub) {
				const accounts = await prisma.account.findMany({
					where: {
						userId: token.sub
					}
				})

				const userState = await prisma.userState.findFirst({
					where: {
						userId: token.sub
					}
				})

				session.user.id = token.sub
				session.user.connectedAccounts = accounts.map((account) => ({
					provider: account.provider,
					providerAccountId: account.providerAccountId,
					providerAccountName: account.providerAccountName || ""
				}))
				session.user.completedObsSetup = !!userState?.completedObsSetup
				session.user.completedOnboarding = !!userState?.completedOnboarding
				session.user.isInGuild = !!userState
				session.user.roles = (userState?.roles as RolesEnum[]) || []
				// session.user.role = user.role; <-- put other properties on the session here
			}

			return session
		},
		async jwt({ token, user, account, isNewUser }) {
			// // Reject token if user is not in the guild
			// if (account && account.provider === "discord") {
			// 	if (account.access_token) {
			// 		try {
			// 			const guildMember = await DiscordOauthClient.getGuildMember(
			// 				account.access_token,
			// 				env.DISCORD_GUILD_ID
			// 			)
			// 			if (!guildMember) {
			// 				throw new Error("unauthorized")
			// 			}
			// 		} catch (error) {
			// 			console.log("Error while getting guild member", user?.name)
			// 			throw new Error("unauthorized")
			// 		}
			// 	}
			// }

			// Throw error if new user from Twitch
			if (account && account.provider === "twitch" && isNewUser) {
				// delete user and account
				if (user) {
					await prisma.user.delete({
						where: {
							id: user.id
						}
					})
				}
				throw new Error("unauthorized")
			}

			if (user) {
				token.sub = user.id
			}

			return token
		}
	},
	events: {
		async signIn({ user, account }) {
			if (user && account && account.provider === "discord") {
				const discordAccount = await prisma.account.findFirst({
					where: {
						provider: account.provider,
						providerAccountId: account.providerAccountId
					}
				})

				if (discordAccount && discordAccount.access_token) {
					const guildMember = await DiscordOauthClient.getGuildMember(
						discordAccount.access_token,
						env.DISCORD_GUILD_ID
					)
					if (guildMember) {
						// Map roles to enum
						const roles = guildMember.roles
							.map((role) => roleIdToEnum(role))
							.filter((role) => !!role) as RolesEnum[]

						// Update user state
						const userState = await prisma.userState.upsert({
							where: {
								userId: user.id
							},
							update: {
								roles: roles
							},
							create: {
								userId: user.id,
								roles: roles
							}
						})
						await prisma.user.update({
							where: {
								id: user.id
							},
							data: {
								userState: {
									connect: {
										id: userState.id
									}
								}
							}
						})
					} else {
						// Remove user state
						await prisma.userState.delete({
							where: {
								userId: user.id
							}
						})
					}
				}
			}
		},
		async linkAccount({ account, profile }) {
			await prisma.account.update({
				where: {
					provider_providerAccountId: {
						provider: account.provider,
						providerAccountId: account.providerAccountId
					}
				},
				data: {
					providerAccountName: profile.name
				}
			})
		}
	},
	adapter: PrismaAdapter(prisma),
	pages: {
		signIn: "/login"
	},
	session: {
		strategy: "jwt"
	},
	providers: [
		DiscordProvider<DiscordProfile>({
			clientId: env.DISCORD_CLIENT_ID,
			clientSecret: env.DISCORD_CLIENT_SECRET,
			authorization: {
				params: {
					scope: ["identify", "guilds", "guilds.members.read"].join(" ")
				}
			},
			profile(profile) {
				return {
					id: profile.id,
					name: profile.username + "#" + profile.discriminator,
					image: `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png`
				}
			}
		}),
		TwitchProvider<TwitchProfile>({
			clientId: env.TWITCH_CLIENT_ID,
			clientSecret: env.TWITCH_CLIENT_SECRET,
			profile(profile) {
				return {
					id: profile.sub,
					name: profile.preferred_username,
					image: profile.picture
				}
			}
		})
		/**
		 * ...add more providers here.
		 *
		 * Most other providers require a bit more work than the Discord provider. For example, the
		 * GitHub provider requires you to add the `refresh_token_expires_in` field to the Account
		 * model. Refer to the NextAuth.js docs for the provider you want to use. Example:
		 *
		 * @see https://next-auth.js.org/providers/github
		 */
	]
}

/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = (ctx: {
	req: GetServerSidePropsContext["req"]
	res: GetServerSidePropsContext["res"]
}) => {
	return getServerSession(ctx.req, ctx.res, authOptions)
}
