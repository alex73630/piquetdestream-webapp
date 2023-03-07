import { useSession } from "next-auth/react"
import { useMemo } from "react"
import Layout, { NavigationEnum } from "~/components/layout"
import Card from "../../../components/card"
import AddStreamKey from "../../../components/irl/add-streamkey"
import StreamkeyList from "../../../components/irl/streamkey-list"
import { RolesEnum } from "../../../interfaces/roles.enum"

export default function Page() {
	const navigation = NavigationEnum.StreamKey
	const { data: sessionData } = useSession()

	const isStreamer = useMemo(
		() => !!sessionData?.user.roles.includes(RolesEnum.STREAMER) && !!sessionData?.user.completedObsSetup,
		[sessionData]
	)
	const isTechOrAdmin = useMemo(
		() => !!sessionData?.user.roles.includes(RolesEnum.TECH) || !!sessionData?.user.roles.includes(RolesEnum.ADMIN),
		[sessionData]
	)

	return (
		<Layout headerTitle="Stream Manifestation" navigation={navigation}>
			<div className="grid">
				{/* If streamer, show reset form */}
				{isStreamer && (
					<Card headerTitle="Clé de stream IRL" className="pb-4">
						<div className="">
							{/* Reset form */}
							Reset form
						</div>
					</Card>
				)}

				{/* If tech or admin, show key list */}
				{isTechOrAdmin && (
					<Card headerTitle="Streamers IRL" className="">
						<div className="min-h-[20vh]">
							<AddStreamKey />
							<StreamkeyList />
						</div>
					</Card>
				)}
			</div>
		</Layout>
	)
}
