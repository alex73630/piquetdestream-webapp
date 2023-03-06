import { type Dayjs } from "dayjs"
import { v4 as uuidv4 } from "uuid"

export enum TimeSlotActionKind {
	AddTimeSlot = "AddTimeSlot",
	RemoveTimeSlot = "RemoveTimeSlot",
	UpdateTimeSlot = "UpdateTimeSlot"
}

export interface TimeSlotPayload {
	id?: string
	start: Dayjs
	end: Dayjs
}

export interface TimeSlotAction {
	type: TimeSlotActionKind
	payload: TimeSlotPayload
}

export interface TimeSlotState {
	timeSlots: TimeSlotPayload[]
}

export const timeSlotReducer = (state: TimeSlotState, action: TimeSlotAction) => {
	switch (action.type) {
		case TimeSlotActionKind.AddTimeSlot:
			if (!!action.payload.id && state.timeSlots.find((ts) => ts.id === action.payload.id)) {
				throw new Error(`TimeSlot with same id already exists: ${action.payload.id}`)
			}
			if (!action.payload.id || action.payload.id === "") {
				let id = uuidv4()
				while (state.timeSlots.find((ts) => ts.id === id)) {
					id = uuidv4()
				}
				action.payload.id = id
			}
			return {
				...state,
				timeSlots: [...state.timeSlots, action.payload]
			}
		case TimeSlotActionKind.RemoveTimeSlot:
			return {
				...state,
				timeSlots: state.timeSlots.filter((ts) => ts.id !== action.payload.id)
			}
		case TimeSlotActionKind.UpdateTimeSlot:
			return {
				...state,
				timeSlots: state.timeSlots.map((ts) => {
					if (ts.id === action.payload.id) {
						return {
							...ts,
							...action.payload
						}
					}
					return ts
				})
			}
		default:
			return state
	}
}
