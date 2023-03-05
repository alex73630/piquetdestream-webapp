import { classNames } from "../utils/class-names"

interface BadgeProps {
	text: string
	removable?: boolean
	onRemove?: () => void
}

export default function Badge({ text, removable, onRemove }: BadgeProps) {
	return (
		<span
			className={classNames(
				"inline-flex items-center rounded-full bg-red-100 py-0.5 text-sm font-medium text-red-700",
				removable ? "pl-2.5 pr-1" : "px-2.5"
			)}
		>
			{text}
			{removable && (
				<button
					type="button"
					className="ml-0.5 inline-flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full text-red-400 hover:bg-red-200 hover:text-red-500 focus:bg-red-500 focus:text-white focus:outline-none"
					onClick={onRemove}
				>
					<span className="sr-only">Remove large option</span>
					<svg className="h-2 w-2" stroke="currentColor" fill="none" viewBox="0 0 8 8">
						<path strokeLinecap="round" strokeWidth="1.5" d="M1 1l6 6m0-6L1 7" />
					</svg>
				</button>
			)}
		</span>
	)
}
