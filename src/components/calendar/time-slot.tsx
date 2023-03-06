import { XMarkIcon } from "@heroicons/react/20/solid"
import { StreamRequestTimeslotStatus } from "@prisma/client"
import dayjs, { type Dayjs } from "dayjs"
import Weekday from "dayjs/plugin/weekday"
import { forwardRef, useCallback, useMemo } from "react"
import { useDrag } from "react-dnd"
import { classNames } from "../../utils/class-names"
import { useCalendarContext } from "./calendar-context"
dayjs.extend(Weekday)

export function dateToRows(date: Dayjs, type: "start" | "end"): number {
	const hours = date.hour() === 0 && type === "end" ? 24 : date.hour()
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
	id?: string
	start: Dayjs
	end: Dayjs
	title?: string
	user?: string
	status?: StreamRequestTimeslotStatus
	className?: string
	mode: "display" | "edit"
	onDelete?: () => void
}

const TimeSlotComponent = forwardRef<HTMLLIElement, TimeSlotProps>(function TimeSlotComp(
	{ start, end, title = "New timeslot", user, status = StreamRequestTimeslotStatus.PENDING, onDelete, className = "" },
	ref
) {
	const { currentDate } = useCalendarContext()
	const startRows = dateToRows(start, "start")
	const endRows = dateToRows(end, "end")
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
			ref={ref}
			className={classNames(
				className,
				"pointer-events-auto relative mt-px sm:flex",
				start.isSame(currentDate, "day") ? "flex" : "hidden",
				`${ColsMapping[col] || ""}`,
				`sm:col-span-1`
			)}
			style={{ gridRow: `${startRows} / span ${spanRows}` }}
		>
			<div
				className={classNames(
					"group absolute inset-1 flex flex-col overflow-y-auto rounded-lg p-2 text-xs leading-5",
					statusColor(status).bg
				)}
			>
				{onDelete && (
					<button
						type="button"
						className="absolute top-0 right-0 h-6 w-6 rounded-full p-1 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-100"
						onClick={onDelete}
					>
						<span className="sr-only">Supprimer</span>
						<XMarkIcon />
					</button>
				)}

				<p className={classNames("order-1 font-semibold", statusColor(status).text)}>{title}</p>
				{user && <p className={classNames("order-1 font-semibold", statusColor(status).text)}>Par {user}</p>}
				<p className={statusColor(status).subText}>
					<time dateTime={dayjs(start).format("YYYY-MM-DDTHH:mm")}>
						{dayjs(start).format("HH:mm")} - {dayjs(end).format("HH:mm")}
					</time>
				</p>
			</div>
		</li>
	)
})

export const TimeSlotDndType = "timeslot"
export interface TimeSlotDndItem {
	type: "timeslot"
	id: string
	start: Dayjs
	end: Dayjs
	spanRows: number
}

export interface TimeSlotDndOver {
	col: number | null
	row: number | null
	span: number | null
}

function TimeSlotEditComponent(props: TimeSlotProps) {
	const startRows = dateToRows(props.start, "start")
	const endRows = dateToRows(props.end, "end")
	const spanRows = endRows - startRows

	const item = useMemo(
		() => ({
			type: "timeslot",
			id: props.id,
			start: props.start,
			end: props.end,
			spanRows
		}),
		[props.id, props.start, props.end, spanRows]
	)

	const [{ isDragging }, drag] = useDrag(() => ({
		type: TimeSlotDndType,
		item,
		collect: (monitor) => ({
			isDragging: !!monitor.isDragging()
		})
	}))

	return <TimeSlotComponent ref={drag} {...props} className={classNames(isDragging ? "opacity-50" : "")} />
}

export default function TimeSlot(props: TimeSlotProps) {
	if (props.mode === "display") {
		return <TimeSlotComponent {...props} />
	}
	return <TimeSlotEditComponent {...props} />
}
