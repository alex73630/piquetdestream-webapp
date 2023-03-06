import Layout, { NavigationEnum } from "~/components/layout"
import Calendar from "../../../components/calendar/calendar"
import { CalendarModeEnum } from "../../../components/calendar/calendar-context"
import Card from "../../../components/card"

export default function Page() {
	const navigation = NavigationEnum.Planning
	return (
		<Layout headerTitle={navigation} navigation={navigation}>
			<div className="grid">
				{/* Left column */}
				<Card headerTitle="Calendrier" className="">
					<div className="h-[48rem]">
						<Calendar mode={CalendarModeEnum.VIEW} />
					</div>
				</Card>
			</div>
		</Layout>
	)
}
