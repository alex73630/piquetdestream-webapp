import { type DetailedHTMLProps, type InputHTMLAttributes } from "react"

interface TextInputProps {
	title: string
	required?: boolean
	className?: string
	error?: string
	description?: string
	inputProps: DetailedHTMLProps<InputHTMLAttributes<HTMLTextAreaElement>, HTMLTextAreaElement>
}

export default function TextAreaInput(props: TextInputProps) {
	return (
		<div className={props.className}>
			<label htmlFor="first-name" className="block text-sm font-medium text-gray-700">
				{props.title} {props.required && <span className="text-red-500">*</span>}
			</label>
			<div className="mt-1">
				<textarea
					rows={3}
					className="block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm"
					{...props.inputProps}
				/>
			</div>
			{props.description && <p className="mt-2 text-sm text-gray-500">{props.description}</p>}
			{props.error && <p className="mt-2 text-sm text-red-600">{props.error}</p>}
		</div>
	)
}
