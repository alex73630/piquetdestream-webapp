import { type GetServerSidePropsContext, type NextPage } from "next"
import Head from "next/head"
import Link from "next/link"
import { signIn, signOut, useSession } from "next-auth/react"
import Image from "next/image"
import logo from "~/../public/logos/Logo-Alt.png"

import { api } from "~/utils/api"
import { getServerSession } from "next-auth"
import { authOptions } from "../server/auth"

const Home: NextPage = () => {
	// const hello = api.example.hello.useQuery({ text: "from tRPC" })

	return (
		<>
			<Head>
				<title>Piquet De Stream Webapp</title>
				<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
				<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
				<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
			</Head>
			<div className="flex h-full min-h-screen bg-slate-800 px-6 lg:px-8">
				<div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56">
					<div className="flex flex-col items-center justify-center text-center ">
						<Image src={logo} alt="Piquet de stream" width={200} height={200} className="object-center" />
						<h1 className="text-4xl font-bold tracking-tight text-gray-100 sm:text-6xl">Piquet de Stream</h1>
						<div className="hidden sm:mt-4 sm:flex sm:justify-center">
							<div className="relative rounded-full py-1 px-3 text-sm leading-6 text-gray-100 ring-1 ring-gray-100/10 hover:ring-gray-100/20">
								Webapp
							</div>
						</div>
						<p className="mt-6 text-lg leading-8 text-gray-200">
							Connectez-vous avec votre compte Discord pour proposer un stream, faire la gestion du planning et des
							multistreams.
						</p>
						<div className="mt-4 flex items-center justify-center gap-x-6">
							<AuthShowcase />
						</div>
					</div>
				</div>
			</div>
		</>
	)
}

export default Home

const AuthShowcase: React.FC = () => {
	const { data: sessionData } = useSession()

	const { data: secretMessage } = api.example.getSecretMessage.useQuery(
		undefined, // no input
		{ enabled: sessionData?.user !== undefined }
	)

	return (
		<div className="flex flex-col items-center justify-center gap-4">
			<p className="text-center text-2xl text-white">
				{sessionData && <span>Logged in as {sessionData.user?.name}</span>}
				{secretMessage && <span> - {secretMessage}</span>}
			</p>
			<button
				className="rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
				onClick={sessionData ? () => void signOut() : () => void signIn("discord")}
			>
				{sessionData ? "Se deconnecter" : "Connection"}
			</button>
			{sessionData && !sessionData.user.connectedAccounts?.find((acc) => acc.provider === "twitch") && (
				<button
					className="rounded-full bg-white/10 px-10 py-3 font-semibold text-white no-underline transition hover:bg-white/20"
					onClick={() => void signIn("twitch")}
				>
					Connect Twitch account
				</button>
			)}
		</div>
	)
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
	const session = await getServerSession(context.req, context.res, authOptions)

	if (session) {
		return {
			redirect: {
				destination: "/dashboard",
				permanent: false
			}
		}
	}

	return {
		props: {}
	}
}
