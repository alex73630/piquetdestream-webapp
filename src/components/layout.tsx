import { useEffect, useState, type ReactElement } from "react"
import { Fragment } from "react"
import { Disclosure, Menu, Transition } from "@headlessui/react"
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline"
import { signOut, useSession } from "next-auth/react"
import Image from "next/image"

import logo from "~/../public/logos/Logo-WoText.png"
import Head from "next/head"
import Link from "next/link"
import { classNames } from "../utils/class-names"

export enum NavigationEnum {
	Dashboard = "Dashboard",
	Planning = "Planning",
	StreamRequest = "StreamRequest"
}

interface NavigationItem {
	id: NavigationEnum
	name: string
	href: string
	visible: boolean
	current: boolean
}

type LayoutProps = {
	children: ReactElement
	headerTitle: string
	navigation: NavigationEnum
}

interface UserNavigation {
	name: string
	href?: string
	onClick?: () => void
}

const userNavigation: UserNavigation[] = [
	{
		name: "Sign out",
		onClick: () => {
			void signOut({ callbackUrl: "/" })
		}
	}
]

export default function Layout({ children, headerTitle, navigation }: LayoutProps) {
	const { data: sessionData } = useSession()

	const [currentNavigation, setCurrentNavigation] = useState<NavigationEnum>(navigation)

	const [navigationList, setNavigationList] = useState<NavigationItem[]>([
		{
			id: NavigationEnum.Dashboard,
			name: "Dashboard",
			href: "/dashboard",
			visible: true,
			current: navigation === NavigationEnum.Dashboard
		},
		{
			id: NavigationEnum.Planning,
			name: "Planning",
			href: "/dashboard/planning",
			// Visble if user is admin/planning or streamer after completing OBS configuration step
			visible: true,
			current: navigation === NavigationEnum.Planning
		},
		{
			id: NavigationEnum.StreamRequest,
			name: "Stream Request",
			href: "/dashboard/planning",
			// Visble if user is streamer after completing OBS configuration step
			visible: true,
			current: navigation === NavigationEnum.StreamRequest
		}
	])

	useEffect(() => {
		if (navigation !== currentNavigation) {
			setCurrentNavigation(navigation)
			// Update navigationList current
			setNavigationList((prev) => {
				return prev.map((item) => {
					if (item.id === navigation) {
						return { ...item, current: true }
					} else {
						return { ...item, current: false }
					}
				})
			})
		}
	}, [navigationList, navigation, currentNavigation])

	return (
		<>
			<Head>
				<title>{"Piquet De Stream - " + headerTitle}</title>
			</Head>
			<div className="min-h-full">
				<Disclosure as="nav" className="bg-red-800">
					{({ open }) => (
						<>
							<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
								<div className="flex h-16 items-center justify-between">
									<div className="flex items-center">
										<div className="flex-shrink-0">
											<Image className="h-8 w-8" src={logo} alt="Your Company" />
										</div>
										<div className="hidden md:block">
											<div className="ml-10 flex items-baseline space-x-4">
												{navigationList.map(
													(item) =>
														item.visible && (
															<Link
																key={item.name}
																href={item.href}
																className={classNames(
																	item.current
																		? "bg-red-900 text-white"
																		: "text-gray-300 hover:bg-red-700 hover:text-white",
																	"rounded-md px-3 py-2 text-sm font-medium"
																)}
																aria-current={item.current ? "page" : undefined}
															>
																{item.name}
															</Link>
														)
												)}
											</div>
										</div>
									</div>
									<div className="hidden md:block">
										<div className="ml-4 flex items-center md:ml-6">
											{/* Notification button */}
											{/* <button
												type="button"
												className="rounded-full bg-red-800 p-1 text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-red-800"
											>
												<span className="sr-only">View notifications</span>
												<BellIcon className="h-6 w-6" aria-hidden="true" />
											</button> */}

											{/* Profile dropdown */}
											<Menu as="div" className="relative ml-3">
												<div>
													<Menu.Button className="flex max-w-xs items-center rounded-full bg-red-800 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-red-800">
														<span className="sr-only">Open user menu</span>
														<div className="relative h-8 w-8 rounded-full">
															<Image
																className="h-8 w-8 rounded-full"
																src={sessionData?.user.image || logo}
																fill
																alt=""
															/>
														</div>
														<span className="rounded-md px-3 py-2 text-sm font-medium text-gray-300 hover:text-white">
															{sessionData?.user.name}
														</span>
													</Menu.Button>
												</div>
												<Transition
													as={Fragment}
													enter="transition ease-out duration-100"
													enterFrom="transform opacity-0 scale-95"
													enterTo="transform opacity-100 scale-100"
													leave="transition ease-in duration-75"
													leaveFrom="transform opacity-100 scale-100"
													leaveTo="transform opacity-0 scale-95"
												>
													<Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
														{userNavigation.map((item) => (
															<Menu.Item key={item.name}>
																{({ active }) => (
																	<a
																		href={item.href}
																		onClick={item.onClick}
																		className={classNames(
																			active ? "bg-gray-100" : "",
																			"block px-4 py-2 text-sm text-gray-700"
																		)}
																	>
																		{item.name}
																	</a>
																)}
															</Menu.Item>
														))}
													</Menu.Items>
												</Transition>
											</Menu>
										</div>
									</div>
									<div className="-mr-2 flex md:hidden">
										{/* Mobile menu button */}
										<Disclosure.Button className="inline-flex items-center justify-center rounded-md bg-red-800 p-2 text-gray-400 hover:bg-red-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800">
											<span className="sr-only">Open main menu</span>
											{open ? (
												<XMarkIcon className="block h-6 w-6" aria-hidden="true" />
											) : (
												<Bars3Icon className="block h-6 w-6" aria-hidden="true" />
											)}
										</Disclosure.Button>
									</div>
								</div>
							</div>

							<Disclosure.Panel className="md:hidden">
								<div className="space-y-1 px-2 pt-2 pb-3 sm:px-3">
									{navigationList.map(
										(item) =>
											item.visible && (
												<Disclosure.Button
													key={item.name}
													as={Link}
													href={item.href}
													className={classNames(
														item.current ? "bg-red-900 text-white" : "text-gray-300 hover:bg-red-700 hover:text-white",
														"block rounded-md px-3 py-2 text-base font-medium"
													)}
													aria-current={item.current ? "page" : undefined}
												>
													{item.name}
												</Disclosure.Button>
											)
									)}
								</div>
								<div className="border-t border-red-700 pt-4 pb-3">
									<div className="flex items-center px-5">
										<div className="flex-shrink-0">
											<div className="relative h-8 w-8 rounded-full">
												<Image className="h-8 w-8 rounded-full" src={sessionData?.user.image || logo} fill alt="" />
											</div>
										</div>
										<div className="ml-3">
											<div className="text-base font-medium leading-none text-white">{sessionData?.user.name}</div>
										</div>
										{/* Notification button */}
										{/* <button
											type="button"
											className="ml-auto flex-shrink-0 rounded-full bg-red-800 p-1 text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-red-800"
										>
											<span className="sr-only">View notifications</span>
											<BellIcon className="h-6 w-6" aria-hidden="true" />
										</button> */}
									</div>
									<div className="mt-3 space-y-1 px-2">
										{userNavigation.map((item) => (
											<Disclosure.Button
												key={item.name}
												as="a"
												href={item.href}
												onClick={item.onClick}
												className="block rounded-md px-3 py-2 text-base font-medium text-gray-400 hover:bg-red-700 hover:text-white"
											>
												{item.name}
											</Disclosure.Button>
										))}
									</div>
								</div>
							</Disclosure.Panel>
						</>
					)}
				</Disclosure>

				<header className="bg-white shadow">
					<div className="mx-auto max-w-7xl py-6 px-4 sm:px-6 lg:px-8">
						<h1 className="text-3xl font-bold tracking-tight text-gray-900">{headerTitle}</h1>
					</div>
				</header>
				<main>
					<div className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">{children}</div>
				</main>
			</div>
		</>
	)
}
