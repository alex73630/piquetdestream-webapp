import { type ReactElement } from "react"

type CardProps = {
	children: ReactElement
	headerTitle: string
	className?: string
}

export default function Card({ children, headerTitle, className }: CardProps) {
	return (
		<div className={className ?? ""}>
			<div className="overflow-hidden rounded-lg bg-white shadow">
				<div className="border-b border-gray-200 bg-white px-4 py-5 sm:px-6">
					<h3 className="text-lg font-medium leading-6 text-gray-900">{headerTitle}</h3>
				</div>
				<div className="px-4 py-4 sm:p-6">{children}</div>
			</div>
		</div>
	)
}
