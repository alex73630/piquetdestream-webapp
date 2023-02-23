import { type Session } from "next-auth"
import { z } from "zod"

import { createTRPCRouter, publicProcedure, protectedProcedure } from "~/server/api/trpc"
import { RolesEnum } from "../../../interfaces/roles.enum"

export enum OnboardingPanelComponentEnum {
	JoinDiscordPanel = "JoinDiscordPanel",
	GetStreamerRolePanel = "GetStreamerRolePanel",
	ConnectTwitchPanel = "ConnectTwitchPanel",
	ConfigureObsPanel = "ConfigureObsPanel",
	RequestStreamPanel = "RequestStreamPanel"
}

export interface StepCompletion {
	id: number
	description: string
	panelComponent: OnboardingPanelComponentEnum
	completed: boolean
}

const steps = [
	{
		description: "Rejoindre le Discord",
		panelComponent: OnboardingPanelComponentEnum.JoinDiscordPanel,
		check: (session: Session): boolean => {
			return session.user.isInGuild
		}
	},
	{
		description: "Rôle streameureuse",
		panelComponent: OnboardingPanelComponentEnum.GetStreamerRolePanel,
		check: (session: Session): boolean => {
			return session.user.isInGuild && session.user.roles.includes(RolesEnum.STREAMER)
		}
	},
	{
		description: "Connexion Twitch",
		panelComponent: OnboardingPanelComponentEnum.ConnectTwitchPanel,
		check: (session: Session): boolean => {
			return (
				session.user.isInGuild &&
				session.user.roles.includes(RolesEnum.STREAMER) &&
				!!session.user.connectedAccounts?.some((account) => account.provider === "twitch")
			)
		}
	},
	{
		description: "Configuration OBS",
		panelComponent: OnboardingPanelComponentEnum.ConfigureObsPanel,
		check: (session: Session): boolean => {
			const check = session.user.completedObsSetup
			return (
				session.user.isInGuild &&
				session.user.roles.includes(RolesEnum.STREAMER) &&
				!!session.user.connectedAccounts?.some((account) => account.provider === "twitch") &&
				check
			)
		}
	},
	{
		description: "Requête de stream",
		panelComponent: OnboardingPanelComponentEnum.RequestStreamPanel,
		check: (session: Session): boolean => {
			const check = session.user.completedOnboarding
			return (
				session.user.isInGuild &&
				session.user.roles.includes(RolesEnum.STREAMER) &&
				!!session.user.connectedAccounts?.some((account) => account.provider === "twitch") &&
				check
			)
		}
	}
]

export const onboardingRouter = createTRPCRouter({
	getSteps: publicProcedure.query(() => {
		const returnSteps = steps.map((step) => {
			return {
				description: step.description,
				panelComponent: step.panelComponent
			}
		})
		return returnSteps
	}),
	getStepsCompletion: protectedProcedure.query(({ ctx }): StepCompletion[] => {
		const stepCompletion: StepCompletion[] = steps.map((step, index) => {
			return {
				id: index,
				description: step.description,
				panelComponent: step.panelComponent,
				completed: step.check(ctx.session)
			}
		})

		return stepCompletion
	}),
	setStepCompletion: protectedProcedure
		.input(
			z.object({
				stepId: z.number(),
				completed: z.boolean()
			})
		)
		.mutation(async ({ ctx, input }) => {
			const { stepId, completed } = input
			const step = steps[stepId]
			if (step) {
				switch (step.panelComponent) {
					case OnboardingPanelComponentEnum.ConfigureObsPanel:
						await ctx.prisma.userState.update({
							where: {
								userId: ctx.session.user.id
							},
							data: {
								completedObsSetup: completed
							}
						})
						break
					case OnboardingPanelComponentEnum.RequestStreamPanel:
						await ctx.prisma.userState.update({
							where: {
								userId: ctx.session.user.id
							},
							data: {
								completedOnboarding: completed
							}
						})
						break
					default:
						break
				}
			}
			return true
		})
})
