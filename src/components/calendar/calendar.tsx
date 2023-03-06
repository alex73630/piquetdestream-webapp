import { Fragment, useMemo } from "react"
import { ChevronLeftIcon, ChevronRightIcon, EllipsisHorizontalIcon } from "@heroicons/react/20/solid"
import { Menu, Transition } from "@headlessui/react"
import { classNames } from "../../utils/class-names"
import Grid from "./grid"
import { type CalendarProps, CalendarProvider, useCalendarContext } from "./calendar-context"

function CalendarComponent() {
	const { currentWeek, changeWeek } = useCalendarContext()

	const currentMonth = useMemo(() => {
		const months = currentWeek
			.map((day) => day.format("MMMM YYYY"))
			.reduce((acc, month) => {
				if (acc[month]) {
					acc[month] += 1
				} else {
					acc[month] = 1
				}
				return acc
			}, {} as Record<string, number>)

		// Return the month with the most days in the current week
		return Object.keys(months).reduce((acc, month) => {
			if (!acc) {
				return month
			}
			if (!months[month] || !months[acc]) {
				return acc
			}
			// @ts-expect-error - months[month] is a number
			if (months[month] > months[acc]) {
				return month
			}
			return acc
		})
	}, [currentWeek])

	if (!currentWeek || currentWeek.length !== 7 || !currentWeek[0]) {
		return <div>Loading...</div>
	}

	return (
		<div className="flex h-full flex-col">
			<header className="flex flex-none items-center justify-between border-b border-gray-200 py-4 px-6">
				<h1 className="text-lg font-semibold text-gray-900">
					<time dateTime={currentWeek[0]?.format("YYYY-MM")} className="capitalize">
						{currentMonth}
					</time>
				</h1>
				<div className="flex items-center">
					<div className="flex items-center rounded-md shadow-sm md:items-stretch">
						<button
							type="button"
							className="flex items-center justify-center rounded-l-md border border-r-0 border-gray-300 bg-white py-2 pl-3 pr-4 text-gray-400 hover:text-gray-500 focus:relative md:w-9 md:px-2 md:hover:bg-gray-50"
							onClick={() => {
								changeWeek("previous")
							}}
						>
							<span className="sr-only">Previous week</span>
							<ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
						</button>
						<button
							type="button"
							className="hidden border-t border-b border-gray-300 bg-white px-3.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 focus:relative md:block"
							onClick={() => {
								changeWeek("today")
							}}
						>
							Aujourd&apos;hui
						</button>
						<span className="relative -mx-px h-5 w-px bg-gray-300 md:hidden" />
						<button
							type="button"
							className="flex items-center justify-center rounded-r-md border border-l-0 border-gray-300 bg-white py-2 pl-4 pr-3 text-gray-400 hover:text-gray-500 focus:relative md:w-9 md:px-2 md:hover:bg-gray-50"
							onClick={() => {
								changeWeek("next")
							}}
						>
							<span className="sr-only">Next week</span>
							<ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
						</button>
					</div>
					<div className="hidden md:ml-4 md:flex md:items-center">
						<div className="h-6 w-px bg-gray-300" />
						<button
							type="button"
							className="ml-6 rounded-md border border-transparent bg-red-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
						>
							Add event
						</button>
					</div>
					<Menu as="div" className="relative ml-6 md:hidden">
						<Menu.Button className="-mx-2 flex items-center rounded-full border border-transparent p-2 text-gray-400 hover:text-gray-500">
							<span className="sr-only">Open menu</span>
							<EllipsisHorizontalIcon className="h-5 w-5" aria-hidden="true" />
						</Menu.Button>

						<Transition
							as={Fragment}
							enter="transition ease-out duration-100"
							enterFrom="transform opacity-0 scale-95"
							enterTo="transform opacity-100 scale-100"
							leave="transition ease-in duration-75"
							leaveFrom="transform opacity-100 scale-100"
							leaveTo="transform opacity-0 scale-95"
						>
							<Menu.Items className="absolute right-0 z-10 mt-3 w-36 origin-top-right divide-y divide-gray-100 overflow-hidden rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
								<div className="py-1">
									<Menu.Item>
										{({ active }) => (
											<a
												href="#"
												className={classNames(
													active ? "bg-gray-100 text-gray-900" : "text-gray-700",
													"block px-4 py-2 text-sm"
												)}
											>
												Create event
											</a>
										)}
									</Menu.Item>
								</div>
								<div className="py-1">
									<Menu.Item>
										{({ active }) => (
											<a
												href="#"
												className={classNames(
													active ? "bg-gray-100 text-gray-900" : "text-gray-700",
													"block px-4 py-2 text-sm"
												)}
											>
												Go to today
											</a>
										)}
									</Menu.Item>
								</div>
							</Menu.Items>
						</Transition>
					</Menu>
				</div>
			</header>
			<Grid />
		</div>
	)
}

export default function Calendar(calendarProps: Partial<CalendarProps>) {
	return (
		<CalendarProvider {...calendarProps}>
			<CalendarComponent />
		</CalendarProvider>
	)
}
