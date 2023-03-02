import { Fragment, useEffect, useState } from "react"
import { Listbox, Transition } from "@headlessui/react"
import { CheckIcon, ChevronDownIcon } from "@heroicons/react/24/outline"

interface TimePickerProps {
	title: string
	required?: boolean
	className?: string
	error?: string
	description?: string
	onChange?: (value: { hour: number; minutes: number }) => void
}

const hours = Array.from(Array(5).keys())
const minutes = Array.from(Array(4).keys()).map((val) => val * 15)

function classNames(...classes: string[]) {
	return classes.filter(Boolean).join(" ")
}

export default function TimePicker(props: TimePickerProps) {
	const [selectedHour, setSelectedHour] = useState(hours[0])
	const [selectedMinute, setSelectedMinute] = useState(minutes[0])

	const handleHourChange = (value: number) => {
		setSelectedHour(value)
	}

	const handleMinuteChange = (value: number) => {
		setSelectedMinute(value)
	}

	useEffect(() => {
		props.onChange &&
			props.onChange({ hour: selectedHour || (hours[0] as number), minutes: selectedMinute || (minutes[0] as number) })
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selectedHour, selectedMinute])

	return (
		<div className={props.className}>
			<label htmlFor="first-name" className="block text-sm font-medium text-gray-700">
				{props.title} {props.required && <span className="text-red-500">*</span>}
			</label>
			<div className="mt-1">
				<div className="flex space-x-2">
					<div className="w-1/2">
						<Listbox value={selectedHour} onChange={handleHourChange}>
							<div className="relative mt-1">
								<Listbox.Button className="relative w-full cursor-default rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-left shadow-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 sm:text-sm">
									<span className="block truncate">{selectedHour}</span>
									<span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
										<ChevronDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
									</span>
								</Listbox.Button>
								<Transition
									as={Fragment}
									leave="transition ease-in duration-100"
									leaveFrom="opacity-100"
									leaveTo="opacity-0"
								>
									<Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
										{hours.map((hour) => (
											<Listbox.Option
												key={hour}
												className={({ active }) =>
													classNames(
														active ? "bg-red-500 text-white" : "text-gray-900",
														"relative cursor-default select-none py-2 pl-3 pr-9"
													)
												}
												value={hour}
											>
												{({ selected, active }) => (
													<>
														<div className={classNames(selected ? "font-semibold" : "font-normal", "truncate")}>
															{hour}
														</div>
														{selected ? (
															<span
																className={classNames(
																	active ? "text-white" : "text-red-500",
																	"absolute inset-y-0 right-0 flex items-center pr-4"
																)}
															>
																<CheckIcon className="h-5 w-5" aria-hidden="true" />
															</span>
														) : null}
													</>
												)}
											</Listbox.Option>
										))}
									</Listbox.Options>
								</Transition>
							</div>
						</Listbox>
					</div>
					<div>
						<span className="text-xl">:</span>
					</div>
					<div className="w-1/2">
						<Listbox value={selectedMinute} onChange={handleMinuteChange}>
							<div className="relative mt-1">
								<Listbox.Button className="relative w-full cursor-default rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-left shadow-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 sm:text-sm">
									<span className="block truncate">{selectedMinute}</span>
									<span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
										<ChevronDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
									</span>
								</Listbox.Button>
								<Transition
									as={Fragment}
									leave="transition ease-in duration-100"
									leaveFrom="opacity-100"
									leaveTo="opacity-0"
								>
									<Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
										{minutes.map((minute) => (
											<Listbox.Option
												key={minute}
												className={({ active }) =>
													classNames(
														active ? "bg-red-500 text-white" : "text-gray-900",
														"relative cursor-default select-none py-2 pl-3 pr-9"
													)
												}
												value={minute}
											>
												{({ selected, active }) => (
													<>
														<div className={classNames(selected ? "font-semibold" : "font-normal", "truncate")}>
															{minute}
														</div>
														{selected ? (
															<span
																className={classNames(
																	active ? "text-white" : "text-red-500",
																	"absolute inset-y-0 right-0 flex items-center pr-4"
																)}
															>
																<CheckIcon className="h-5 w-5" aria-hidden="true" />
															</span>
														) : null}
													</>
												)}
											</Listbox.Option>
										))}
									</Listbox.Options>
								</Transition>
							</div>
						</Listbox>
					</div>
				</div>
			</div>
		</div>
	)
}
