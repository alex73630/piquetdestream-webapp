import { useEffect } from "react"
import { useDrag, useDrop } from "react-dnd"
import { classNames } from "../../utils/class-names"
import { type GridElement, type CellRangeState } from "./grid"
import { type TimeSlotProps } from "./time-slot"

export enum CellTypes {
	FREE = "free",
	OCCUPIED = "occupied",
	PAST = "past"
}

interface CellProps {
	grid: GridElement[][]
	cell: GridElement
	addEvent: (event: TimeSlotProps) => void
	cellRange: CellRangeState
	setCellRange: React.Dispatch<React.SetStateAction<CellRangeState>>
}

export default function Cell({ cell, cellRange, setCellRange, addEvent, grid }: CellProps) {
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

	const canDrop = (item: GridElement, target: GridElement) => {
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

	const handleCellDrop = (item: GridElement, target: GridElement) => {
		console.log(`Item ${item.col}-${item.row} dropped on ${target.col}-${target.row}`)

		// Get the start and end date of the range
		const start = item.dateStart.isBefore(target.dateStart) ? item.dateStart : target.dateStart
		const end = item.dateEnd.isBefore(target.dateEnd) ? target.dateEnd : item.dateEnd

		// Create a new event using item and target
		const newEvent: TimeSlotProps = {
			start: start,
			end: end,
			title: "New event",
			status: "PENDING"
		}

		// Add the new event to the list of events
		addEvent(newEvent)

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
				const newEvent: TimeSlotProps = {
					start: startItem.dateStart,
					end: endItem.dateEnd,
					title: "New event",
					status: "PENDING"
				}
				addEvent(newEvent)
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

	const [{ isOver }, drop] = useDrop(
		() => ({
			accept: [CellTypes.FREE, CellTypes.OCCUPIED],
			item: { ...cell },
			drop: (item) => handleCellDrop(item, cell),
			canDrop: (item: GridElement) => canDrop(item, cell),
			collect: (monitor) => ({
				isOver: !!monitor.isOver()
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
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isDragging, isOver, cell.col, cell.row])

	const isSelectInColumn = () => {
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
	}

	const isInRange = () => {
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
	}

	return (
		<div
			ref={(node) => drag(drop(node))}
			className={classNames(
				"select-none",
				isDragging ? "bg-slate-100 bg-opacity-50" : "",
				isInRange() ? "bg-slate-100 bg-opacity-50" : "",
				isSelectInColumn() && cell.type !== CellTypes.PAST
					? "cursor-pointer"
					: "cursor-not-allowed bg-slate-200 bg-opacity-75"
			)}
			onClick={() => handleCellClick(cell)}
		></div>
	)
}
