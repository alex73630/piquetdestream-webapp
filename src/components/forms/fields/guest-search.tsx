import { useEffect, useState } from "react"
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/20/solid"
import { Combobox } from "@headlessui/react"
import { api } from "../../../utils/api"
import { classNames } from "../../../utils/class-names"
import { type TwitchChannel } from "../../../server/api/routers/twitch"
import useDebounce from "../../useDebounce"
import Badge from "../../badge"
import logo from "~/../public/logos/Logo-WoText.png"
import Image from "next/image"
import Fuse from "fuse.js"

interface GuestSearchProps {
	guests?: string[]
	onChange?: (guests: string[]) => void
}

export default function GuestSearch({ guests, onChange }: GuestSearchProps) {
	const [query, setQuery] = useState("")
	const debouncedQuery = useDebounce(query, 300)
	const [searchChannels, setSearchChannels] = useState<TwitchChannel[]>([])
	const [selectedGuests, setSelectedGuests] = useState<TwitchChannel[]>(
		guests ? guests.map((guest) => ({ name: guest })) : []
	)

	const twitchSearchChannelMutate = api.twitch.searchChannels.useMutation()

	useEffect(() => {
		if (debouncedQuery !== "") {
			twitchSearchChannelMutate
				.mutateAsync({
					name: debouncedQuery
				})
				.then((data) => {
					const list = data.filter((channel) => {
						return !selectedGuests.some((guest) => {
							return guest.name === `@${channel.name}`
						})
					})

					const fuse = new Fuse(selectedGuests, {
						keys: ["name"]
					})

					const filteredGuests = fuse.search(debouncedQuery).map((result) => result.item)

					setSearchChannels([...filteredGuests, ...list])
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
		onChange ? onChange(selectedGuests.map((guest) => guest.name)) : null
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selectedGuests])

	const clearSearch = () => {
		setQuery("")
		setSearchChannels([])
	}

	const handleRemoveGuest = (index: number) => {
		const newGuests = [...selectedGuests]
		newGuests.splice(index, 1)
		setSelectedGuests(newGuests)
	}

	return (
		<Combobox value={selectedGuests} onChange={(value) => setSelectedGuests(value)} multiple>
			<Combobox.Label className="block text-sm font-medium text-gray-700">Invités</Combobox.Label>

			{selectedGuests.length > 0 && (
				<div className="my-2 flex flex-wrap gap-2">
					{selectedGuests.map((guest, index) => (
						<Badge key={index} text={guest.name} removable onRemove={() => handleRemoveGuest(index)} />
					))}
				</div>
			)}
			<div className="relative mt-1">
				<Combobox.Input
					className="w-full rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 shadow-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 sm:text-sm"
					onChange={(event) => setQuery(event.target.value)}
					displayValue={() => query}
					placeholder={"Entrer le nom d'un invité ou son pseudo Twitch"}
				/>
				<Combobox.Button className="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none">
					<ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
				</Combobox.Button>

				<Combobox.Options className="z-100 fixed mt-1 max-w-3xl overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
					{query.length > 0 && (
						<Combobox.Option
							className={({ active }) =>
								classNames(
									"relative cursor-default select-none py-2 pl-3 pr-9",
									active ? "bg-red-600 text-white" : "text-gray-900"
								)
							}
							value={{ name: query }}
							onClick={() => clearSearch()}
						>
							{({ selected }) => (
								<>
									<div className="flex items-center">
										<Image src={logo} alt="" className="h-6 w-6 flex-shrink-0 rounded-full" width={64} height={64} />
										<span className={classNames("ml-3 truncate", selected ? "font-semibold" : "")}>
											Ajouter {query}
										</span>
									</div>
								</>
							)}
						</Combobox.Option>
					)}
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
