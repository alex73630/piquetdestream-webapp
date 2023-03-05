import {
	type StreamRequest,
	type StreamRequestTimeSlots,
	StreamRequestTimeslotStatus,
	type TechAppointment,
	type User
} from "@prisma/client"
import dayjs, { type Dayjs } from "dayjs"
import "dayjs/locale/fr"
import { createContext, useCallback, useContext, useMemo, useState, type FunctionComponent } from "react"
import { api } from "../../utils/api"
import { type TimeSlotProps } from "./time-slot"

dayjs.locale("fr")

export type CalendarContextProps = {
	currentWeek: Dayjs[]
	onTimeslotChange: (events: TimeSlotProps[]) => void
	changeWeek: (direction: "next" | "previous" | "today") => void
	mode: "edit" | "view"
	schedule: (StreamRequest & {
		streamRequestTimeSlots: StreamRequestTimeSlots[]
		techAppointment: TechAppointment | null
		streamer: User
	})[]
}

export type CalendarProps = {
	startDate: Dayjs
	statusFilter: StreamRequestTimeslotStatus[]
	onChange: (events: TimeSlotProps[]) => void
	mode: "edit" | "view"
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
	mode = "view"
}) => {
	const [startDate, setStartDate] = useState(startDateProp || dayjs())

	const [statusFilter, _setStatusFilter] = useState<StreamRequestTimeslotStatus[]>(
		statusFilterProp ?? [StreamRequestTimeslotStatus.APPROVED]
	)

	const currentWeek = useMemo(() => {
		const startOfWeek = startDate.startOf("week")
		return Array(7)
			.fill("")
			.map((_, i) => startOfWeek.add(i, "day"))
	}, [startDate])

	const changeWeek = (direction: "next" | "previous" | "today") => {
		switch (direction) {
			case "next":
				setStartDate((prev) => prev.add(1, "week"))
				break
			case "previous":
				setStartDate((prev) => prev.subtract(1, "week"))
				break
			case "today":
				setStartDate(dayjs())
				break
		}
	}

	const handleTimeslotChange = useCallback(
		(events: TimeSlotProps[]) => {
			if (onChange) onChange(events)
		},
		[onChange]
	)

	const {
		data: schedule,
		isLoading: _scheduleIsLoading,
		isError: _scheduleIsError
	} = api.schedule.getSchedule.useQuery({
		weekStart: currentWeek[0]?.toDate() || dayjs().startOf("week").toDate(),
		status: statusFilter
	})

	return (
		<CalendarContext.Provider
			value={{ currentWeek, onTimeslotChange: handleTimeslotChange, changeWeek, mode, schedule: schedule || [] }}
		>
			{children}
		</CalendarContext.Provider>
	)
}

export const useCalendarContext = () => useContext(CalendarContext)
