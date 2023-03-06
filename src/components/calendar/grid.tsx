import { StreamRequestTimeslotStatus } from "@prisma/client"
import dayjs, { type Dayjs } from "dayjs"
import { useMemo, useRef, useState } from "react"
import { DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import { classNames } from "../../utils/class-names"
import { CalendarModeEnum, useCalendarContext } from "./calendar-context"
import Cell, { CellTypes } from "./cell"
import TimeSlot from "./time-slot"
import { TimeSlotActionKind } from "./timeslot-reducer"

export interface GridElement {
	col: number
	row: number
	dateStart: Dayjs
	dateEnd: Dayjs
	type: CellTypes
}

export interface CellRangeState {
	startRow: number | null
	endRow: number | null
	colIndex: number | null
}

export default function Grid() {
	const { currentWeek, currentDate, setCurrentDate, filteredTimeSlots, timeSlotDispatch, schedule, mode } =
		useCalendarContext()

	const [cellRange, setCellRange] = useState<CellRangeState>({ startRow: null, endRow: null, colIndex: null })

	const grid = useMemo<GridElement[][]>(() => {
		return Array(7)
			.fill("")
			.map((_, col) =>
				Array(48)
					.fill("")
					.map((_, row) => {
						const dateStart = (currentWeek[col] as Dayjs).add(row * 30, "minute")
						const dateEnd = (currentWeek[col] as Dayjs).add((row + 1) * 30, "minute")

						let cellType = CellTypes.FREE
						if (schedule) {
							const isOccupied = schedule.some(({ streamRequestTimeSlots }) =>
								streamRequestTimeSlots.some(
									({ startTime, endTime, status }) =>
										// Check if the cell is has an event that overlaps with it
										status === StreamRequestTimeslotStatus.APPROVED &&
										((dateStart.isBefore(endTime) && dateStart.isAfter(startTime)) ||
											(dateEnd.isBefore(endTime) && dateEnd.isAfter(startTime)) ||
											(dateStart.isBefore(startTime) && dateEnd.isAfter(endTime)))
								)
							)
							if (isOccupied) {
								cellType = CellTypes.OCCUPIED
							}
						}

						if (dateEnd.isBefore(dayjs())) cellType = CellTypes.PAST

						return {
							col,
							row,
							dateStart,
							dateEnd,
							type: cellType
						}
					})
			)
	}, [currentWeek, schedule])

	const container = useRef<HTMLDivElement>(null)
	const containerNav = useRef<HTMLDivElement>(null)
	const containerOffset = useRef<HTMLDivElement>(null)

	// useEffect(() => {
	// 	if (container.current && containerNav.current && containerOffset.current) {
	// 		// Set the container scroll position based on the current time.
	// 		const currentMinute = new Date().getHours() * 60
	// 		container.current.scrollTop =
	// 			((container.current.scrollHeight - containerNav.current.offsetHeight - containerOffset.current.offsetHeight) *
	// 				currentMinute) /
	// 			1440
	// 	}
	// }, [container, containerNav, containerOffset])

	return (
		<div ref={container} className="isolate flex flex-auto flex-col overflow-auto bg-white">
			<div style={{ width: "165%" }} className="flex max-w-full flex-none flex-col sm:max-w-none md:max-w-full">
				<div
					ref={containerNav}
					className="sticky top-0 z-30 flex-none bg-white shadow ring-1 ring-black ring-opacity-5 sm:pr-8"
				>
					<div className="grid grid-cols-7 text-sm leading-6 text-gray-500 sm:hidden">
						{currentWeek.map((day, index) => (
							<button
								key={index}
								type="button"
								className={classNames(
									"flex flex-col items-center pt-2 pb-3",
									day.isSame(currentDate, "day") ? "bg-red-50" : ""
								)}
								onClick={() => setCurrentDate(day)}
							>
								{day.format("dd").charAt(0)}{" "}
								<span
									className={classNames(
										"mt-1 flex h-8 w-8 items-center justify-center font-semibold",
										day.isSame(dayjs(), "day") ? "rounded-full bg-red-600 text-white" : "text-gray-900"
									)}
								>
									{day.format("DD")}
								</span>
							</button>
						))}
					</div>

					<div className="-mr-px hidden grid-cols-7 divide-x divide-gray-100 border-r border-gray-100 text-sm leading-6 text-gray-500 sm:grid">
						<div className="col-end-1 w-14" />
						{currentWeek.map((day, index) => (
							<div key={index} className="flex items-center justify-center py-3">
								<span className={classNames("capitalize", day.isSame(dayjs(), "day") ? "flex items-baseline" : "")}>
									{day.format("ddd")}{" "}
									<span
										className={classNames(
											"items-center justify-center font-semibold",
											day.isSame(dayjs(), "day")
												? "ml-1.5 flex h-8 w-8 rounded-full bg-red-600 text-white"
												: "text-gray-900"
										)}
									>
										{day.format("DD")}
									</span>
								</span>
							</div>
						))}
					</div>
				</div>
				<div className="flex flex-auto">
					<div className="sticky left-0 z-10 w-14 flex-none bg-white ring-1 ring-gray-100" />
					<DndProvider backend={HTML5Backend}>
						<div className="grid flex-auto grid-cols-1 grid-rows-1">
							{/* Horizontal lines */}
							<div
								className="col-start-1 col-end-2 row-start-1 grid divide-y"
								style={{ gridTemplateRows: "repeat(48, minmax(2rem, 1fr))" }}
							>
								<div ref={containerOffset} className="row-end-1 h-7"></div>
								{/* //TODO: add a logic to generate a column of cells for mobile/sm display */}
								{Array.from({ length: 48 }, (_, index) => {
									if (index % 2 === 0) {
										return (
											<div key={index} className="border-gray-200">
												<div className="sticky left-0 z-20 -mt-2.5 -ml-14 w-14 pr-2 text-right text-xs leading-5 text-gray-400">
													{index === 0 ? "0:00" : `${index / 2}:00`}
												</div>
											</div>
										)
									}

									return <div key={index} className="border-gray-100" />
								})}
							</div>

							{/* Vertical lines */}
							<div className="col-start-1 col-end-2 row-start-1 hidden grid-cols-7 grid-rows-1 divide-x divide-gray-100 sm:grid sm:grid-cols-7">
								<div className="row-end-1 h-7"></div>
								{grid.map((col, colIndex) => (
									<div
										key={colIndex}
										className={classNames("row-span-full grid", `col-start-${colIndex + 1}`)}
										style={{ gridTemplateRows: "repeat(48, minmax(2rem, 1fr))" }}
									>
										{/* //TODO: add a logic to disable cell render if we're on mobile/sm display */}
										{mode !== CalendarModeEnum.VIEW &&
											col.map((cell, rowIndex) => (
												<Cell
													key={rowIndex}
													cell={cell}
													grid={grid}
													cellRange={cellRange}
													setCellRange={setCellRange}
												/>
											))}
									</div>
								))}
								<div className="col-start-8 row-span-full w-8" />
							</div>

							{/* Events */}
							<ol
								className="pointer-events-none col-start-1 col-end-2 row-start-1 grid grid-cols-1 sm:grid-cols-7 sm:pr-8"
								/* 48 = 24hrs divided in 30min blocks */
								style={{ gridTemplateRows: "1.75rem repeat(48, minmax(0, 1fr)) auto" }}
							>
								{filteredTimeSlots.map((event, index) => (
									<TimeSlot
										key={index}
										{...event}
										mode={"edit"}
										onDelete={() =>
											timeSlotDispatch({
												type: TimeSlotActionKind.RemoveTimeSlot,
												payload: event
											})
										}
									/>
								))}

								{schedule &&
									schedule.map((event) =>
										event.streamRequestTimeSlots.map((timeSlot, index) => (
											<TimeSlot
												key={index}
												mode={"display"}
												start={dayjs(timeSlot.startTime)}
												end={dayjs(timeSlot.endTime)}
												title={event.title}
												user={event.streamer.name || ""}
												status={timeSlot.status}
											/>
										))
									)}
							</ol>
						</div>
					</DndProvider>
				</div>
			</div>
		</div>
	)
}
