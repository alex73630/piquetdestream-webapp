import { z } from "zod"

export const CreateStreamRequestValidation = z
	.object({
		streamerId: z.string().optional(),
		title: z
			.string()
			.min(1, "Le titre ne peut pas être vide")
			.max(100, "Le titre ne peut pas dépasser 100 caractères"),
		description: z.string().optional(),
		category: z.string().min(1, "La catégorie ne peut pas être vide"),
		guests: z.array(z.string()),
		streamRequestTimeSlots: z
			.array(
				z.object({
					startTime: z.date(),
					endTime: z.date()
				})
			)
			.min(1, "Vous devez sélectionner au moins une plage horaire")
	})
	.refine((data) => data.streamRequestTimeSlots.every((slot) => slot.startTime < slot.endTime), {
		message: "L'heure de fin doit être supérieure à l'heure de début"
	})

export type CreateStreamRequestInput = z.infer<typeof CreateStreamRequestValidation>

export const EditStreamRequestValidation = z.object({
	id: z.number(),
	streamerId: z.string().optional(),
	title: z.string(),
	description: z.string().optional(),
	category: z.string(),
	guests: z.array(z.string()),
	streamRequestTimeSlots: z
		.array(
			z.object({
				id: z.number().optional(),
				startTime: z.date(),
				endTime: z.date()
			})
		)
		.min(1)
})

export type EditStreamRequestInput = z.infer<typeof EditStreamRequestValidation>

export type StreamRequestPayload = CreateStreamRequestInput | EditStreamRequestInput

export type StreamRequestPayloadModes =
	| {
			mode: "create"
			data: CreateStreamRequestInput
	  }
	| {
			mode: "edit"
			data: EditStreamRequestInput
	  }
