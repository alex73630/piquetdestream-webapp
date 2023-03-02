import { type StreamRequestTimeslotStatus } from "@prisma/client"
import dayjs, { type Dayjs } from "dayjs"
import Weekday from "dayjs/plugin/weekday"
import { useCallback } from "react"
import { classNames } from "../../utils/class-names"
dayjs.extend(Weekday)

export function dateToRows(date: Dayjs): number {
	const hours = date.hour()
	const minutes = date.minute()
	return hours * 2 + Math.floor(minutes / 30) + 2
}

export function rowsToDate(rows: number): Dayjs {
	const hours = Math.floor(rows / 2)
	const minutes = (rows % 2) * 30
	return dayjs(new Date(0, 0, 0, hours, minutes))
}

export function dateToCol(date: Dayjs): number {
	const day = date.locale("fr").weekday()
	return day
}

export const ColsMapping = [
	"sm:col-start-1",
	"sm:col-start-2",
	"sm:col-start-3",
	"sm:col-start-4",
	"sm:col-start-5",
	"sm:col-start-6",
	"sm:col-start-7"
]

export interface TimeSlotProps {
	start: Dayjs
	end: Dayjs
	title: string
	user?: string
	status: StreamRequestTimeslotStatus
	onDelete?: () => void
}

export default function TimeSlot({ start, end, title, user, status }: TimeSlotProps) {
	const startRows = dateToRows(start)
	const endRows = dateToRows(end)
	const spanRows = endRows - startRows

	const col = dateToCol(start)

	const statusColor = useCallback(
		(
			status: StreamRequestTimeslotStatus
		): {
			text: string
			subText: string
			bg: string
		} => {
			switch (status) {
				case "PENDING":
					return {
						text: "text-gray-700",
						subText: "text-gray-500 group-hover:text-gray-700",
						bg: "bg-gray-100 hover:bg-gray-200"
					}
				case "APPROVED":
					return {
						text: "text-green-700",
						subText: "text-green-500 group-hover:text-green-700",
						bg: "bg-green-100 hover:bg-green-200"
					}
				case "DENIED":
					return {
						text: "text-red-700",
						subText: "text-red-500 group-hover:text-red-700",
						bg: "bg-red-100 hover:bg-red-200"
					}
				default:
					return {
						text: "text-gray-700",
						subText: "text-gray-500 group-hover:text-gray-700",
						bg: "bg-gray-100 hover:bg-gray-200"
					}
			}
		},
		[]
	)

	return (
		<li
			className={classNames(
				"pointer-events-auto relative mt-px hidden sm:flex",
				`${ColsMapping[col] || ""}`,
				`sm:col-span-1`
			)}
			style={{ gridRow: `${startRows} / span ${spanRows}` }}
		>
			<a
				href="#"
				className={classNames(
					"group absolute inset-1 flex flex-col overflow-y-auto rounded-lg p-2 text-xs leading-5",
					statusColor(status).bg
				)}
			>
				<p className={classNames("order-1 font-semibold", statusColor(status).text)}>{title}</p>
				{user && <p className={classNames("order-1 font-semibold", statusColor(status).text)}>Par {user}</p>}
				<p className={statusColor(status).subText}>
					<time dateTime={dayjs(start).format("YYYY-MM-DDTHH:mm")}>
						{dayjs(start).format("HH:mm")} - {dayjs(end).format("HH:mm")}
					</time>
				</p>
			</a>
		</li>
	)
}
