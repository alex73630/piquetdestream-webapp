import dayjs from "dayjs"
import { useCallback, useEffect, useMemo } from "react"
import { useDrag, useDrop } from "react-dnd"
import { classNames } from "../../utils/class-names"
import { useCalendarContext } from "./calendar-context"
import { type GridElement, type CellRangeState } from "./grid"
import { type TimeSlotDndItem, TimeSlotDndType } from "./time-slot"
import { TimeSlotActionKind, type TimeSlotPayload } from "./timeslot-reducer"

export enum CellTypes {
	FREE = "free",
	OCCUPIED = "occupied",
	PAST = "past"
}

interface CellProps {
	grid: GridElement[][]
	cell: GridElement
	cellRange: CellRangeState
	setCellRange: React.Dispatch<React.SetStateAction<CellRangeState>>
}

export default function Cell({ cell, cellRange, setCellRange, grid }: CellProps) {
	const { timeSlotDispatch, setTimeSlotDndOver, timeSlotDndOver } = useCalendarContext()

	const isOccupiedInbetween = (rowA: number, rowB: number) => {
		const start = rowA < rowB ? rowA : rowB
		const end = rowA > rowB ? rowA : rowB

		for (let i = start; i <= end; i++) {
			if ((grid[cell.col] as GridElement[])[i]?.type === CellTypes.OCCUPIED) {
				return true
			}
		}

		return false
	}

	const handleCanDropTimeSlot = (item: TimeSlotDndItem, target: GridElement) => {
		if (target.type === CellTypes.OCCUPIED) {
			return false
		}
		if (
			typeof timeSlotDndOver.span === "number" &&
			typeof timeSlotDndOver.row === "number" &&
			typeof timeSlotDndOver.col === "number" &&
			timeSlotDndOver.span > 1
		) {
			if (target.col === timeSlotDndOver.col) {
				// Check if this cell is in timeslot range
				const timeSlotStartRow = timeSlotDndOver.row
				const timeSlotEndRow = timeSlotDndOver.row + timeSlotDndOver.span

				const isInRange = target.row >= timeSlotStartRow && target.row <= timeSlotEndRow

				if (isInRange) {
					return !isOccupiedInbetween(timeSlotStartRow, timeSlotEndRow)
				}
			}
		}

		return true
	}

	const canDrop = (item: GridElement | TimeSlotDndItem, target: GridElement) => {
		if (item.type === TimeSlotDndType) {
			return handleCanDropTimeSlot(item, target)
		}

		if (item.col !== target.col) {
			return false
		}
		if (target.type === CellTypes.OCCUPIED) {
			return false
		}

		if (isOccupiedInbetween(item.row, target.row)) {
			return false
		}

		return true
	}

	const handleCellDrop = (item: GridElement | TimeSlotDndItem, target: GridElement) => {
		if (item.type === TimeSlotDndType) {
			console.log(`Timeslot ${item.id} dropped on ${target.col}-${target.row}`)

			// Get difference in minutes between the start of the timeslot and the start of the cell
			const diff = target.dateStart.diff(item.start, "minute")

			// Create a new event using item and target
			const newEvent: TimeSlotPayload = {
				id: item.id,
				start: item.start.add(diff, "minute"),
				end: item.end.add(diff, "minute")
			}

			// Update the event in the list of events
			timeSlotDispatch({ type: TimeSlotActionKind.UpdateTimeSlot, payload: newEvent })
			setTimeSlotDndOver({ col: null, row: null, span: null })

			return
		}

		console.log(`Item ${item.col}-${item.row} dropped on ${target.col}-${target.row}`)

		// Get the start and end date of the range
		const start = item.dateStart.isBefore(target.dateStart) ? item.dateStart : target.dateStart
		const end = item.dateEnd.isBefore(target.dateEnd) ? target.dateEnd : item.dateEnd

		// Create a new event using item and target
		const newEvent: TimeSlotPayload = {
			start: start,
			end: end
		}

		// Add the new event to the list of events
		timeSlotDispatch({ type: TimeSlotActionKind.AddTimeSlot, payload: newEvent })

		setCellRange({ startRow: null, endRow: null, colIndex: null })
	}

	// Handle cell click
	// First click sets the start of the range
	// Second click sets the end of the range
	// If the second click is before the first click, the range is reversed
	const handleCellClick = (cell: GridElement) => {
		if (cellRange.startRow === null) {
			setCellRange({ startRow: cell.row, endRow: null, colIndex: cell.col })
		} else if (cellRange.endRow === null) {
			if (cellRange.colIndex !== cell.col) {
				return
			}

			// Duplicate cellRange
			let newCellRange = { ...cellRange }

			if (cellRange.startRow < cell.row) {
				newCellRange = { startRow: cellRange.startRow, endRow: cell.row, colIndex: cell.col }
			}
			if (cellRange.startRow > cell.row) {
				newCellRange = { startRow: cell.row, endRow: cellRange.startRow, colIndex: cell.col }
			}

			// If cellrange is filled, create a new event
			if (newCellRange.startRow !== null && newCellRange.endRow !== null && newCellRange.colIndex !== null) {
				// Get the start and end date of the range
				const startItem = (grid[newCellRange.colIndex] as GridElement[])[newCellRange.startRow] as GridElement
				const endItem = (grid[newCellRange.colIndex] as GridElement[])[newCellRange.endRow] as GridElement

				// Create a new event using item and target
				const newEvent: TimeSlotPayload = {
					start: startItem.dateStart,
					end: endItem.dateEnd
				}
				timeSlotDispatch({ type: TimeSlotActionKind.AddTimeSlot, payload: newEvent })
				setCellRange({ startRow: null, endRow: null, colIndex: null })
			}
		} else {
			setCellRange({ startRow: null, endRow: null, colIndex: null })
		}
	}

	const [{ isDragging }, drag] = useDrag(() => ({
		type: cell.type,
		item: { ...cell },
		collect: (monitor) => ({
			isDragging: !!monitor.isDragging()
		})
	}))

	const [{ isOver, isTimeSlotOver, timeSlotSpan, draggedItem, draggedItemType }, drop] = useDrop(
		() => ({
			accept: [CellTypes.FREE, CellTypes.OCCUPIED, TimeSlotDndType],
			item: { ...cell },
			drop: (item) => handleCellDrop(item, cell),
			canDrop: (item: GridElement | TimeSlotDndItem) => canDrop(item, cell),
			collect: (monitor) => ({
				isOver: !!monitor.isOver(),
				isTimeSlotOver: !!monitor.isOver({ shallow: true }) && monitor.getItemType() === TimeSlotDndType,
				draggedItemType: monitor.getItemType(),
				draggedItem: monitor.getItem(),
				timeSlotSpan: monitor.getItemType() === TimeSlotDndType ? monitor.getItem<TimeSlotDndItem>().spanRows : null
			})
		}),
		[cell.col, cell.row]
	)

	useEffect(() => {
		if (isDragging) {
			console.log(`Dragging ${cell.col}-${cell.row}`)
			setCellRange({ startRow: cell.row, endRow: cell.row, colIndex: cell.col })
		}
		if (isOver && cellRange.startRow !== cell.row && cellRange.endRow !== cell.row && cellRange.colIndex === cell.col) {
			console.log(`Over ${cell.col}-${cell.row}`)
			if (typeof cellRange.startRow === "number" && cellRange.colIndex === cell.col) {
				setCellRange({ startRow: cellRange.startRow, endRow: cell.row, colIndex: cell.col })
			}
		}
		if (isTimeSlotOver) {
			console.log(`Timeslot over cell ${cell.col}-${cell.row}`)
			setTimeSlotDndOver({ col: cell.col, row: cell.row, span: timeSlotSpan })
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isDragging, isOver, cell.col, cell.row])

	const isItemDroppable = useCallback(() => {
		if (draggedItemType === TimeSlotDndType) {
			return handleCanDropTimeSlot(draggedItem as TimeSlotDndItem, cell)
		}
		// Check if there is an occupied cell between the start row and this cell
		if (cellRange.startRow !== null) {
			if (cell.type === CellTypes.OCCUPIED) {
				return false
			}
			if (isOccupiedInbetween(cellRange.startRow, cell.row)) {
				return false
			}
		}
		if (cellRange.colIndex === null) {
			return true
		}
		if (cellRange.colIndex === cell.col) {
			return true
		}

		return false
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [cell, cellRange, draggedItemType, draggedItem])

	const isInRange = useCallback(() => {
		if (draggedItemType === TimeSlotDndType) {
			if (
				typeof timeSlotDndOver.span === "number" &&
				typeof timeSlotDndOver.row === "number" &&
				typeof timeSlotDndOver.col === "number" &&
				timeSlotDndOver.span > 1
			) {
				if (cell.col === timeSlotDndOver.col) {
					// Check if this cell is in timeslot range
					const timeSlotStartRow = timeSlotDndOver.row
					const timeSlotEndRow = timeSlotDndOver.row + timeSlotDndOver.span

					return cell.row >= timeSlotStartRow && cell.row <= timeSlotEndRow
				}
			}
		}

		if (cellRange.startRow === cell.row && cellRange.colIndex === cell.col) {
			return true
		}
		if (cellRange.startRow === null || cellRange.endRow === null || cellRange.colIndex === null) {
			return false
		}
		if (cellRange.colIndex !== cell.col) {
			return false
		}
		if (cellRange.startRow < cellRange.endRow) {
			if (cell.row >= cellRange.startRow && cell.row <= cellRange.endRow) {
				// Check if there is an occupied cell in the range
				// if (isOccupiedInbetween(cellRange.startRow, cellRange.endRow)) {
				// 	return false
				// } else {
				// 	return true
				// }

				return true
			}
		} else {
			if (cell.row >= cellRange.endRow && cell.row <= cellRange.startRow) {
				// Check if there is an occupied cell in the range
				// if (isOccupiedInbetween(cellRange.endRow, cellRange.startRow)) {
				// 	return false
				// } else {
				// 	return true
				// }
				return true
			}
		}
		return false
	}, [
		cell.col,
		cell.row,
		cellRange.colIndex,
		cellRange.endRow,
		cellRange.startRow,
		draggedItemType,
		timeSlotDndOver.col,
		timeSlotDndOver.row,
		timeSlotDndOver.span
	])

	const isDuringOffTime = useCallback(() => {
		const startOffTime = {
			hour: 0,
			minute: 0
		}
		const endOffTime = {
			hour: 10,
			minute: 0
		}

		// Get cell day
		const cellDay = dayjs(cell.dateStart).startOf("day")

		// Get start and end of off time
		const startOffTimeDate = dayjs(cellDay).hour(startOffTime.hour).minute(startOffTime.minute)
		const endOffTimeDate = dayjs(cellDay).hour(endOffTime.hour).minute(endOffTime.minute)

		// Check if cell is during off time
		if (cell.dateEnd >= startOffTimeDate && cell.dateEnd <= endOffTimeDate) {
			return true
		}
		return false
	}, [cell.dateEnd, cell.dateStart])

	const className = useMemo(() => {
		const itemDroppable = isItemDroppable() ? "cursor-pointer" : "cursor-not-allowed bg-slate-200 bg-opacity-75"
		const inRange = isInRange()
			? isItemDroppable()
				? "bg-blue-200 bg-opacity-50"
				: "bg-red-300 bg-opacity-50"
			: itemDroppable
		return classNames(
			"select-none",
			isDragging ? "bg-slate-200 bg-opacity-50" : isDuringOffTime() ? "bg-slate-50 bg-opacity-50" : "",
			inRange,
			cell.type === CellTypes.PAST ? "cursor-not-allowed bg-slate-200 bg-opacity-75" : ""
		)
	}, [isDragging, isInRange, isItemDroppable, isDuringOffTime, cell.type])

	return (
		<div
			ref={(node) => drag(drop(node))}
			className={className}
			onClick={() => handleCellClick(cell)}
			onTouchStart={() => handleCellClick(cell)}
		></div>
	)
}
