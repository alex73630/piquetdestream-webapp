import { ExclamationTriangleIcon } from "@heroicons/react/24/outline"
import { signIn, useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import Image from "next/image"
import Card from "../../components/card"
import Layout, { NavigationEnum } from "../../components/layout"
import { RolesEnum } from "../../interfaces/roles.enum"
import Tag from "../../components/tag"
import Setup from "../../components/setup"
import { api } from "../../utils/api"

export default function Page() {
	const { data: sessionData } = useSession()

	const [discordUsername, setDiscordUsername] = useState<string | null>(null)
	const [roles, setRoles] = useState<RolesEnum[]>([])
	const [twitchUsername, setTwitchUsername] = useState<string | null>(null)

	useEffect(() => {
		if (sessionData?.user.connectedAccounts) {
			const discordAccount = sessionData?.user.connectedAccounts?.find((account) => account.provider === "discord")
			const twitchAccount = sessionData?.user.connectedAccounts?.find((account) => account.provider === "twitch")

			setDiscordUsername(discordAccount?.providerAccountName || null)
			setTwitchUsername(twitchAccount?.providerAccountName || null)
		}
		if (sessionData?.user.roles) {
			setRoles(sessionData.user.roles)
		}
	}, [sessionData])

	const [showSetup, setShowSetup] = useState(false)
	const onboardingStepsQuery = api.onboarding.getStepsCompletion.useQuery()

	useEffect(() => {
		// if (sessionData?.user.roles?.includes(RolesEnum.STREAMER)) {
		// check if the user has completed the onboarding steps
		if (!onboardingStepsQuery.isLoading) {
			const steps = onboardingStepsQuery.data
			if (steps?.some((step) => !step.completed)) {
				setShowSetup(true)
			} else {
				setShowSetup(false)
			}
		}
		// }
	}, [onboardingStepsQuery.data, onboardingStepsQuery.isLoading, sessionData?.user])

	return (
		<Layout headerTitle="Dashboard" navigation={NavigationEnum.Dashboard}>
			<div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-3 lg:gap-8">
				{/* Left column */}
				<div className="grid grid-cols-1 gap-4 lg:col-span-2">
					<section aria-labelledby="section-1-title" className="space-y-6 lg:col-span-2 lg:col-start-1">
						<Card headerTitle="Bienvenue sur le dashboard du Piquet de Stream" className=""></Card>
						{showSetup && (
							<Card headerTitle="Guide de démarrage pour Streameureuse" className="">
								<Setup />
							</Card>
						)}
					</section>
				</div>

				{/* Right column */}
				<div className="grid grid-cols-1 gap-4">
					<section aria-labelledby="section-2-title" className="space-y-6 lg:col-span-2 lg:col-start-1">
						{/* Connected accounts side card */}
						<Card headerTitle="Comptes connectés" className="row-start-1 grid grid-cols-1 gap-4">
							<div>
								<h4>Vous êtes connecté via ces plateformes:</h4>
								<ul role="list" className="divide-y divide-gray-200">
									<li className="py-4">
										<div className="flex">
											<div className="mr-4 flex-shrink-0 self-center">
												<div className="relative h-16 w-16">
													<Image src="/icons/discord-mark-black.svg" alt="Discord logo" fill />
												</div>
											</div>
											<div>
												<h4 className="text-lg font-bold">Discord</h4>
												<p className="mt-1">{discordUsername || "Non connecté"}</p>
												{discordUsername && (
													<p className="mt-1 whitespace-nowrap">
														{roles.map((role) => {
															let color = "green"
															switch (role) {
																case RolesEnum.ADMIN:
																	color = "red"
																	break
																case RolesEnum.PLANNING:
																	color = "yellow"
																	break
																case RolesEnum.STREAMER:
																	color = "green"
																	break
																default:
																	color = "gray"
																	break
															}
															return <Tag key={role} text={role} color={color} />
														})}
													</p>
												)}
											</div>
										</div>
									</li>
									<li className="py-4">
										<div className="flex">
											<div className="mr-4 flex-shrink-0 self-center">
												<div className="relative h-16 w-16">
													<Image src="/icons/twitch.svg" alt="Twitch logo" fill />
												</div>
											</div>
											<div>
												<h4 className="text-lg font-bold">Twitch</h4>
												<p className="mt-1">
													{twitchUsername || (
														<button
															type="button"
															className="inline-flex items-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
															onClick={() => {
																void signIn("twitch")
															}}
														>
															<ExclamationTriangleIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
															Se connecter
														</button>
													)}
												</p>
											</div>
										</div>
									</li>
								</ul>
							</div>
						</Card>
					</section>
				</div>
			</div>
		</Layout>
	)
}
