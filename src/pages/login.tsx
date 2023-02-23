import { type GetServerSidePropsContext } from "next"
import { getServerSession } from "next-auth"
import { signIn, useSession } from "next-auth/react"
import { useRouter } from "next/router"
import { useEffect } from "react"
import { authOptions } from "../server/auth"

export default function Login() {
	const { data: sessionData } = useSession()
	const router = useRouter()

	useEffect(() => {
		if (sessionData) {
			void router.push("/dashboard")
		} else {
			void signIn("discord", { callbackUrl: "/dashboard" })
		}
	}, [sessionData, router])
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
