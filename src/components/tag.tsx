import { useEffect, useState } from "react"

type TagProps = {
	text: string
	color?: string
}

function classNames(...classes: string[]) {
	return classes.filter(Boolean).join(" ")
}

export default function Tag({ text, color }: TagProps) {
	const [tagColor, setTagColor] = useState<string>("bg-green-100 text-green-800")

	useEffect(() => {
		if (color) {
			setTagColor(`bg-${color}-100 text-${color}-800`)
		} else {
			setTagColor("bg-green-100 text-green-800")
		}
	}, [color])

	return (
		<span className={classNames("mr-1 inline-flex rounded-full px-2 text-xs font-semibold leading-5", tagColor)}>
			{text}
		</span>
	)
}
