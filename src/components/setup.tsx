import { Tab } from "@headlessui/react"
import { LinkIcon, PaperAirplaneIcon } from "@heroicons/react/24/outline"
import Link from "next/link"
import { useEffect, useState, type ReactElement } from "react"
import { type StepCompletion, type OnboardingPanelComponentEnum } from "../server/api/routers/onboarding"
import { api } from "../utils/api"
import { classNames } from "../utils/class-names"

export default function Setup() {
	const stepsCompletionQuery = api.onboarding.getStepsCompletion.useQuery()
	const [selectedIndex, setSelectedIndex] = useState(0)
	const [completedSteps, setCompletedSteps] = useState<boolean[]>([])

	useEffect(() => {
		if (stepsCompletionQuery.data) {
			const steps = stepsCompletionQuery.data.map((step) => step.completed)
			if (JSON.stringify(steps) !== JSON.stringify(completedSteps)) {
				setCompletedSteps(steps)
				setSelectedIndex(steps.findIndex((step) => step === false))
			}
		}
	}, [stepsCompletionQuery.data, completedSteps])

	if (stepsCompletionQuery.isLoading) {
		return <div>Chargement en cours...</div>
	}

	if (stepsCompletionQuery.isError) {
		return <div>Erreur lors de la requête, veuillez réessayer</div>
	}

	const stepCompletionMutation = api.onboarding.setStepCompletion.useMutation()

	const panels: Record<OnboardingPanelComponentEnum, (step: StepCompletion) => ReactElement> = {
		JoinDiscordPanel: () => <JoinDiscordPanel />,
		GetStreamerRolePanel: () => <GetStreamerRolePanel />,
		ConnectTwitchPanel: () => <ConnectTwitchPanel />,
		ConfigureObsPanel: (step) => (
			<ConfigureObsPanel
				stepState={step}
				setStepState={(state) => {
					void stepCompletionMutation.mutateAsync({ stepId: state.id, completed: state.completed }).then(() => {
						void stepsCompletionQuery.refetch()
					})
				}}
			/>
		),
		RequestStreamPanel: () => <RequestStreamPanel />
	}

	return (
		<Tab.Group selectedIndex={selectedIndex} onChange={setSelectedIndex}>
			{/* // TODO: Fix jumpy tab list */}
			<Tab.List className="h-22 flex space-y-0 space-x-4 overflow-hidden overflow-x-auto pb-4">
				{stepsCompletionQuery.data.map((step, index) => (
					// Disable step if previous step is not completed
					<Tab key={index} className="p-1" disabled={stepsCompletionQuery.data[index - 1]?.completed === false}>
						<div
							className={classNames(
								"group flex w-32 flex-col border-t-4 pt-4 text-left transition-all ui-selected:border-t-8",

								index === 0 || stepsCompletionQuery.data[index - 1]?.completed
									? stepsCompletionQuery.data[index]?.completed
										? "border-red-600 hover:border-red-800"
										: "border-gray-300 hover:border-gray-400"
									: "border-gray-100"
							)}
						>
							<span
								className={classNames(
									"text-sm font-medium",
									index === 0 || stepsCompletionQuery.data[index - 1]?.completed
										? stepsCompletionQuery.data[index]?.completed
											? "text-red-600 group-hover:text-red-800"
											: "text-gray-500 group-hover:text-gray-700"
										: "text-gray-200"
								)}
							>
								Etape {index + 1}
							</span>
							<span
								className={classNames(
									"text-sm font-medium",
									index === 0 || stepsCompletionQuery.data[index - 1]?.completed ? "" : "text-gray-200"
								)}
							>
								{step.description}
							</span>
						</div>
					</Tab>
				))}
			</Tab.List>
			<div className="relative py-4">
				<div className="absolute inset-0 flex items-center" aria-hidden="true">
					<div className="w-full border-t border-gray-300" />
				</div>
			</div>
			<Tab.Panels>
				{stepsCompletionQuery.data.map((step, index) => (
					<Tab.Panel key={index}>{panels[step.panelComponent](step)}</Tab.Panel>
				))}
			</Tab.Panels>
		</Tab.Group>
	)
}

function JoinDiscordPanel() {
	return (
		<div>
			<div>
				<h3 className="text-lg font-medium leading-6 text-gray-900">Rejoindre le serveur Discord</h3>
				<p className="mt-1 max-w-2xl text-sm text-gray-500">
					Pour continuer vous devez rejoindre le Discord du Piquet de Stream
				</p>
			</div>
		</div>
	)
}

function GetStreamerRolePanel() {
	return (
		<div>
			<div>
				<h3 className="text-lg font-medium leading-6 text-gray-900">Obtenir le rôle Streameureuse</h3>
				<p className="mt-1 max-w-2xl text-sm text-gray-500">
					Pour pouvoir créer une demande de stream, vous devez avoir le rôle &quot;Streameureuse&quot; sur le Discord.
					Vous pouvez le demander dans le salon #repartition-des-roles en cliquant sur la réaction correspondante.
				</p>
			</div>
		</div>
	)
}

function ConnectTwitchPanel() {
	return (
		<div>
			<div>
				<h3 className="text-lg font-medium leading-6 text-gray-900">Connecter son compte Twitch</h3>
				<p className="mt-1 max-w-2xl text-sm text-gray-500">
					Afin de simplifier le processus de gestion de planning, nous demandons à tous les streameureuses de connecter
					leur compte Twitch. Nous sauvegardons seulement votre nom d&apos;utilisateur pour vous mentionner dans le
					titre sur Twitch et sur le planning pour les réseaux sociaux.
				</p>
			</div>
		</div>
	)
}

function ConfigureObsPanel({
	stepState,
	setStepState
}: {
	stepState: StepCompletion
	setStepState: (stepState: StepCompletion) => void
}) {
	return (
		<div>
			<div>
				<h3 className="text-lg font-medium leading-6 text-gray-900">Configurer OBS</h3>
				<p className="my-4 max-w-2xl text-sm text-gray-500">
					L&apos;équipe techique du Piquet de Stream à préparé une collection de scènes pour OBS prête à utiliser pour
					que les streameureuses puissent rapidement configurer leur stream. Pour l&apos;utiliser, il suffit de suivre
					le tutoriel ci-dessous.
				</p>
				<a
					href="https://docs.google.com/presentation/d/1qiFiGHoxfwSvavASb9ZJnR7f1uxwoSca/edit?usp=share_link&ouid=117272916548164837180&rtpof=true&sd=true"
					target="_blank"
					className="inline-flex items-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
					rel="noreferrer"
				>
					<LinkIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
					Lire le tutoriel
				</a>
				<p className="my-4 max-w-2xl text-sm text-gray-500">
					Lorsque vous avez complété et <span className="font-bold">testé personnellement</span> votre configuration,
					cliquez sur la case ci-dessous pour continuer.
				</p>
				<div className="relative flex items-start">
					<div className="flex h-6 items-center">
						<input
							id="obs-config-completed"
							aria-describedby="obs-config-completed-description"
							name="obs-config-completed"
							type="checkbox"
							className="h-5 w-5 rounded border-gray-300 text-red-600 focus:ring-red-500"
							checked={stepState.completed}
							onChange={(e) => setStepState({ ...stepState, completed: e.target.checked })}
						/>
					</div>
					<div className="ml-3">
						<label
							id="obs-config-completed-description"
							htmlFor="obs-config-completed"
							className="font-medium text-gray-700"
						>
							J&apos;ai terminé la configuration de mon stream
						</label>
					</div>
				</div>
				<p className="my-4 max-w-2xl text-sm text-gray-500">
					Un membre de l&apos;équipe technique fera un test supplémentaire de votre configuration avec vous avant votre
					premier stream pour s&apos;assurer que tout est prêt pour votre début sur la chaine.
				</p>
			</div>
		</div>
	)
}

function RequestStreamPanel() {
	return (
		<div>
			<div>
				<h3 className="text-lg font-medium leading-6 text-gray-900">Faire une requête de stream</h3>
				<p className="my-4 max-w-2xl text-sm text-gray-500">
					Maintenant que vous avez terminé vos préparatifs, vous allez pouvoir demander votre premier créneau sur la
					chaine!
				</p>
				<p className="my-4 max-w-2xl text-sm text-gray-500">
					Pour se faire, il suffit de cliquer sur le bouton ci-dessous et de remplir le formulaire. Un membre de
					l&apos;équipe planning s&apos;occupera de traiter votre demande et vous accorder un créneau.
				</p>
				<Link
					href="/dashboard/planning/requests/new"
					className="inline-flex items-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
				>
					<PaperAirplaneIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
					Faire une demande
				</Link>
			</div>
		</div>
	)
}
