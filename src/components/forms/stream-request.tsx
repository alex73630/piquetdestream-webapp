import { type StreamRequestTimeSlots, type StreamRequest } from "@prisma/client"
import { Controller, useForm } from "react-hook-form"
// import { DevTool } from "@hookform/devtools"
import { zodResolver } from "@hookform/resolvers/zod"
import {
	type CreateStreamRequestInput,
	type EditStreamRequestInput,
	type StreamRequestPayloadModes,
	type StreamRequestPayload,
	CreateStreamRequestValidation,
	EditStreamRequestValidation
} from "../../server/api/routers/schedule/validators"
import GuestSearch from "./fields/guest-search"
import TextInput from "./fields/text-input"
import TextAreaInput from "./fields/textarea-input"
import TimePicker from "./fields/duration-input"
import Calendar from "../calendar/calendar"
import { CalendarModeEnum } from "../calendar/calendar-context"
import { useCallback } from "react"
import { type TimeSlotPayload } from "../calendar/timeslot-reducer"

interface StreamRequestFormProps {
	mode: "create" | "edit"
	streamRequest?: StreamRequest & {
		streamRequestTimeSlots: StreamRequestTimeSlots[]
	}
	onSubmit?: (streamRequestPayload: StreamRequestPayloadModes) => Promise<void> | void
}

export default function StreamRequestForm({ mode, streamRequest, onSubmit }: StreamRequestFormProps) {
	const defaultValuesFromStreamRequest = (
		streamRequest: StreamRequest & {
			streamRequestTimeSlots: StreamRequestTimeSlots[]
		}
	): EditStreamRequestInput => {
		return {
			title: streamRequest.title,
			description: streamRequest.description || "",
			category: streamRequest.category,
			guests: streamRequest.guests,
			id: streamRequest.id,
			streamRequestTimeSlots: streamRequest.streamRequestTimeSlots.map((streamRequestTimeSlot) => {
				return {
					id: streamRequestTimeSlot.id,
					startTime: streamRequestTimeSlot.startTime,
					endTime: streamRequestTimeSlot.endTime
				}
			})
		}
	}

	const {
		register,
		handleSubmit,
		control,
		setValue,
		formState: { errors },
		getValues
	} = useForm({
		defaultValues: streamRequest ? defaultValuesFromStreamRequest(streamRequest) : undefined,
		resolver: mode === "create" ? zodResolver(CreateStreamRequestValidation) : zodResolver(EditStreamRequestValidation)
	})

	const parseOnSubmit = (streamRequestPayload: StreamRequestPayload) => {
		console.log(streamRequestPayload)
		if (mode === "create") {
			onSubmit ? void onSubmit({ mode, data: streamRequestPayload as CreateStreamRequestInput }) : null
		} else if (mode === "edit") {
			onSubmit ? void onSubmit({ mode, data: streamRequestPayload as EditStreamRequestInput }) : null
		}
	}

	const calendarOnChange = useCallback(
		(timeSlots: TimeSlotPayload[]) => {
			setValue(
				"streamRequestTimeSlots",
				timeSlots.map((timeSlot) => ({ startTime: timeSlot.start.toDate(), endTime: timeSlot.end.toDate() }))
			)
		},
		[setValue]
	)

	return (
		<>
			<form
				onSubmit={(e) => {
					console.log(getValues(), errors)
					e.preventDefault()
					void handleSubmit(parseOnSubmit)(e)
				}}
			>
				<div className="space-y-8 divide-y divide-gray-200">
					<div>
						<div>
							<h3 className="text-base font-semibold leading-6 text-gray-900">Informations génériques du stream</h3>
							<p className="mt-1 text-sm text-gray-500">Détaillez le contenu de votre stream.</p>
						</div>
						<div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
							<TextInput
								title="Titre du stream"
								description="Ce titre sera affiché sur Twitch et sur le planning sur les réseaux sociaux."
								required
								inputProps={register("title", { required: true })}
								className="sm:col-span-3"
								error={errors.title?.message}
							/>

							{/* //TODO: Change it to a search field with Twitch categories */}
							<TextInput
								title="Catégorie"
								description="Indiquez la catégorie de votre stream selon la liste de Twitch."
								required
								inputProps={register("category", { required: true })}
								className="sm:col-span-3"
								error={errors.category?.message}
							/>

							<TextAreaInput
								title="Description"
								description="Décrivez le contenu de votre stream pour aider l'équipe planning pour la sélection."
								inputProps={register("description")}
								className="sm:col-span-3"
								error={errors.description?.message}
							/>

							<Controller
								name="guests"
								control={control}
								render={({ field }) => (
									<div className="sm:col-span-3">
										<GuestSearch
											onChange={(guests) =>
												field.onChange({
													target: {
														name: field.name,
														value: guests
													}
												})
											}
										/>
									</div>
								)}
							/>
						</div>
					</div>

					<div className="pt-5">
						<div>
							<h3 className="text-base font-semibold leading-6 text-gray-900">Horaires du stream</h3>
							<p className="mt-1 text-sm text-gray-500">Indiquez les horaires de votre stream.</p>
						</div>

						<div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
							{/* Ask stream duration */}
							<TimePicker title="Durée du stream" description="Indiquez la durée de votre stream." />

							{/* <TestGrid numCols={7} numRows={24} /> */}

							<div className="col-span-1 max-h-[70vh] overflow-y-auto sm:col-span-6">
								<Controller
									name="streamRequestTimeSlots"
									control={control}
									render={() => <Calendar mode={CalendarModeEnum.REQUEST} onChange={calendarOnChange} />}
								/>
							</div>
						</div>
					</div>

					<div className="pt-5">
						<div className="flex justify-end">
							<button
								type="submit"
								className="ml-3 inline-flex justify-center rounded-md border border-transparent bg-red-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
							>
								{mode === "create" ? "Créer" : "Éditer"} la demande
							</button>
						</div>
					</div>
				</div>
			</form>
			{/* <DevTool control={control} /> */}
		</>
	)
}
