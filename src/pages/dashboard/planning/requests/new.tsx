import Layout, { NavigationEnum } from "~/components/layout"
import Card from "../../../../components/card"
import StreamRequestForm from "../../../../components/forms/stream-request"
import { api } from "../../../../utils/api"

export default function Page() {
	const navigation = NavigationEnum.StreamRequest

	const createStreamRequestMutation = api.schedule.createStreamRequest.useMutation()

	return (
		<Layout headerTitle="Stream Request" navigation={navigation}>
			<Card headerTitle="Nouvelle requête" className="">
				<StreamRequestForm
					mode="create"
					onSubmit={(payload) => {
						createStreamRequestMutation.mutate(payload.data)
					}}
				/>
			</Card>
		</Layout>
	)
}
