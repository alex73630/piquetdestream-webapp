import { useEffect, useState } from "react"
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/20/solid"
import { Combobox } from "@headlessui/react"
import { api } from "../../../utils/api"
import { classNames } from "../../../utils/class-names"
import useDebounce from "../../useDebounce"
import logo from "~/../public/logos/Logo-WoText.png"
import Image from "next/image"

interface StreamerSearchProps {
	label?: string
	streamerId?: string | null
	onChange?: (streamer: string | null) => void
}

interface StreamerSearchPayload {
	id: string
	name: string
	image: string
}

export default function StreamerSearch({ onChange, label, streamerId }: StreamerSearchProps) {
	const [query, setQuery] = useState("")
	const debouncedQuery = useDebounce(query, 300)
	const [searchChannels, setSearchChannels] = useState<StreamerSearchPayload[]>([])
	const [selectedStreamer, setSelectedStreamer] = useState<StreamerSearchPayload | null>(null)

	const streamerSearchChannelMutate = api.streamers.searchStreamers.useMutation()
	const getStreamerMutate = api.streamers.getStreamer.useMutation()

	useEffect(() => {
		if (debouncedQuery !== "") {
			streamerSearchChannelMutate
				.mutateAsync({
					name: debouncedQuery
				})
				.then((data) => {
					// Filter out streamers with a streamkey
					const list = data
						.filter((streamer) => streamer.streamKey === null)
						.map((streamer) => ({
							id: streamer.id,
							name: streamer.name || "",
							image: streamer.image || ""
						}))

					const newList: StreamerSearchPayload[] = []

					if (selectedStreamer) {
						newList.push(selectedStreamer)
					}

					newList.push(...list)

					setSearchChannels(newList)
				})
				.catch((err) => {
					console.log(err)
				})
		} else {
			setSearchChannels([])
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [debouncedQuery])

	useEffect(() => {
		onChange ? onChange(selectedStreamer ? selectedStreamer?.id : null) : null
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selectedStreamer])

	useEffect(() => {
		if (streamerId && streamerId !== "" && !selectedStreamer) {
			getStreamerMutate
				.mutateAsync({
					id: streamerId
				})
				.then((data) => {
					if (!data) return
					setSelectedStreamer({
						id: data.id,
						name: data.name || "",
						image: data.image || ""
					})
				})
				.catch((err) => {
					console.log(err)
				})
		}
		if (streamerId === "clear") {
			setSelectedStreamer(null)
		}
	}, [streamerId, selectedStreamer, getStreamerMutate])

	const clearSearch = () => {
		setQuery("")
		setSearchChannels([])
	}

	return (
		<Combobox value={selectedStreamer} onChange={(value) => setSelectedStreamer(value)}>
			{label ? <Combobox.Label className="block text-sm font-medium text-gray-700">{label}</Combobox.Label> : null}

			<div className={classNames("relative", label ? "mt-1" : "")}>
				<Combobox.Input
					className="w-full rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 shadow-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 sm:text-sm"
					onChange={(event) => setQuery(event.target.value)}
					displayValue={(value: StreamerSearchPayload | null) => (value ? value.name : query)}
					placeholder={"Entrer le nom du streamer"}
				/>
				<Combobox.Button className="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none">
					<ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
				</Combobox.Button>

				<Combobox.Options className="z-100 absolute mt-1 max-w-3xl overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
					{searchChannels.map((person, index) => (
						<Combobox.Option
							key={index}
							value={person}
							className={({ active }) =>
								classNames(
									"relative cursor-default select-none py-2 pl-3 pr-9",
									active ? "bg-red-600 text-white" : "text-gray-900"
								)
							}
							onClick={() => clearSearch()}
						>
							{({ active, selected }) => (
								<>
									<div className="flex items-center">
										<Image
											src={person.image ?? logo}
											alt=""
											className="h-6 w-6 flex-shrink-0 rounded-full"
											width={64}
											height={64}
										/>
										<span className={classNames("ml-3 truncate", selected ? "font-semibold" : "")}>{person.name}</span>
									</div>

									{selected && (
										<span
											className={classNames(
												"absolute inset-y-0 right-0 flex items-center pr-4",
												active ? "text-white" : "text-red-600"
											)}
										>
											<CheckIcon className="h-5 w-5" aria-hidden="true" />
										</span>
									)}
								</>
							)}
						</Combobox.Option>
					))}
				</Combobox.Options>
			</div>
		</Combobox>
	)
}
