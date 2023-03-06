import {
	type StreamRequest,
	type StreamRequestTimeSlots,
	StreamRequestTimeslotStatus,
	type TechAppointment,
	type User
} from "@prisma/client"
import dayjs, { type Dayjs } from "dayjs"
import "dayjs/locale/fr"
import {
	createContext,
	type Dispatch,
	useContext,
	useMemo,
	useReducer,
	useState,
	type FunctionComponent,
	useEffect
} from "react"
import { api } from "../../utils/api"
import { type TimeSlotDndOver } from "./time-slot"
import { type TimeSlotAction, type TimeSlotPayload, timeSlotReducer, type TimeSlotState } from "./timeslot-reducer"

dayjs.locale("fr")

export enum CalendarModeEnum {
	VIEW = "view",
	REQUEST = "request",
	SCHEDULE = "schedule"
}

export type CalendarContextProps = {
	currentDate: Dayjs
	setCurrentDate: (date: Dayjs) => void
	currentWeek: Dayjs[]
	timeSlots: TimeSlotState
	filteredTimeSlots: TimeSlotPayload[]
	timeSlotDispatch: Dispatch<TimeSlotAction>
	timeSlotDndOver: TimeSlotDndOver
	setTimeSlotDndOver: (timeSlotDndOver: TimeSlotDndOver) => void
	changeWeek: (direction: "next" | "previous" | "today") => void
	mode: CalendarModeEnum
	schedule: (StreamRequest & {
		streamRequestTimeSlots: StreamRequestTimeSlots[]
		techAppointment: TechAppointment | null
		streamer: User
	})[]
}

export type CalendarProps = {
	startDate: Dayjs
	statusFilter: StreamRequestTimeslotStatus[]
	onChange: (timeSlots: TimeSlotPayload[]) => void
	mode: CalendarModeEnum
}

export type CalendarProviderProps = {
	children: React.ReactNode
} & Partial<CalendarProps> &
	Partial<CalendarContextProps>

export const CalendarContext = createContext<CalendarContextProps>({} as CalendarContextProps)

export const CalendarProvider: FunctionComponent<CalendarProviderProps> = ({
	children,
	startDate: startDateProp,
	statusFilter: statusFilterProp,
	onChange,
	mode = CalendarModeEnum.VIEW
}) => {
	const [currentDate, setCurrentDate] = useState(startDateProp || dayjs())

	const [
		statusFilter
		// , setStatusFilter
	] = useState<StreamRequestTimeslotStatus[]>(statusFilterProp ?? [StreamRequestTimeslotStatus.APPROVED])

	const currentWeek = useMemo(() => {
		const startOfWeek = currentDate.startOf("week")
		return Array(7)
			.fill("")
			.map((_, i) => startOfWeek.add(i, "day"))
	}, [currentDate])

	const changeWeek = (direction: "next" | "previous" | "today") => {
		switch (direction) {
			case "next":
				setCurrentDate((prev) => prev.add(1, "week"))
				break
			case "previous":
				setCurrentDate((prev) => prev.subtract(1, "week"))
				break
			case "today":
				setCurrentDate(dayjs())
				break
		}
	}

	const [timeSlotsState, timeSlotDispatch] = useReducer(timeSlotReducer, { timeSlots: [] })

	useEffect(() => {
		if (onChange) {
			onChange(timeSlotsState.timeSlots)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [timeSlotsState.timeSlots])

	// Filter time slots that are not in the current week
	const filteredTimeSlots = useMemo(() => {
		return timeSlotsState.timeSlots.filter((timeSlot) => {
			const timeSlotDate = dayjs(timeSlot.start)
			return currentWeek.some((weekDay) => weekDay.isSame(timeSlotDate, "day"))
		})
	}, [currentWeek, timeSlotsState.timeSlots])

	const [timeSlotDndOver, setTimeSlotDndOver] = useState<TimeSlotDndOver>({
		col: null,
		row: null,
		span: null
	})

	const { data: schedule } = api.schedule.getSchedule.useQuery({
		weekStart: currentWeek[0]?.toDate() || dayjs().startOf("week").toDate(),
		status: statusFilter
	})

	return (
		<CalendarContext.Provider
			value={{
				currentWeek,
				timeSlotDispatch,
				timeSlots: timeSlotsState,
				filteredTimeSlots,
				timeSlotDndOver,
				setTimeSlotDndOver,
				changeWeek,
				mode,
				currentDate,
				setCurrentDate,
				schedule: schedule || []
			}}
		>
			{children}
		</CalendarContext.Provider>
	)
}

export const useCalendarContext = () => useContext(CalendarContext)
