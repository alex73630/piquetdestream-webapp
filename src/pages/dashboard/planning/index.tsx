import Layout, { NavigationEnum } from "~/components/layout"

export default function Page() {
	const navigation = NavigationEnum.Planning
	return (
		<Layout headerTitle={navigation} navigation={navigation}>
			<div className="overflow-hidden bg-white shadow sm:rounded-lg">
				<div className="px-4 py-5 sm:px-6"></div>
			</div>
		</Layout>
	)
}
