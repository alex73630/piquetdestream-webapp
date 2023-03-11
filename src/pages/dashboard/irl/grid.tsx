// const GridTemplates = {
// 	"1": {
// 		container: "grid grid-cols-1 grid-rows-1",
// 		tile: "col-span-1 row-span-1",
// 		lastTile: "col-span-1 row-span-1"
// 	},
// 	"2": {
// 		container: "grid grid-cols-2 grid-rows-1",
// 		tile: "col-span-1 row-span-1",
// 		lastTile: "col-span-1 row-span-1"
// 	},
// 	"3": {
// 		container: "grid grid-cols-6 grid-rows-2",
// 		tile: "col-span-3 row-span-1",
// 		lastTile: "col-span-4 row-span-1 row-start-2"
// 	},
// 	"4": {
// 		container: "grid grid-cols-2 grid-rows-2",
// 		tile: "col-span-1 row-span-1",
// 		lastTile: "col-span-1 row-span-1"
// 	},
// 	"5": {
// 		container: "grid grid-cols-6 grid-rows-2",
// 		tile: "col-span-1 row-span-1",
// 		lastTile: "col-span-1 row-span-1"
// 	},
// 	"6": {
// 		container: "grid grid-cols-3 grid-rows-2",
// 		tile: "col-span-1 row-span-1",
// 		lastTile: "col-span-1 row-span-1"
// 	},
// 	"7": {
// 		container: "grid grid-cols-3 grid-rows-3"
// 	},
// 	"8": {
// 		container: "grid grid-cols-3 grid-rows-3"
// 	},
// 	"9": {
// 		container: "grid grid-cols-3 grid-rows-3"
// 	}
// }

import { useEffect, useMemo, useState } from "react"
import PlayerHls from "../../../components/irl/player"
import { api } from "../../../utils/api"
import { classNames } from "../../../utils/class-names"

const FlexGridContainerClassName =
	"flex flex-wrap justify-around h-screen w-screen bg-gray-900 text-white overflow-hidden"

const FlexGridTemplates = [
	{
		// 1
		container: FlexGridContainerClassName,
		tile: "w-full h-full"
	},
	{
		// 2
		container: FlexGridContainerClassName,
		tile: "w-1/2 h-full"
	},
	{
		// 3
		container: FlexGridContainerClassName,
		tile: "w-1/2 h-1/2"
	},
	{
		// 4
		container: FlexGridContainerClassName,
		tile: "w-1/2 h-1/2"
	},
	{
		// 5
		container: FlexGridContainerClassName,
		tile: "w-1/3 h-1/2"
	},
	{
		// 6
		container: FlexGridContainerClassName,
		tile: "w-1/3 h-1/2"
	},
	{
		// 7
		container: FlexGridContainerClassName,
		tile: "w-1/4 h-1/2"
	},
	{
		// 8
		container: FlexGridContainerClassName,
		tile: "w-1/3 h-1/3"
	},
	{
		// 9
		container: FlexGridContainerClassName,
		tile: "w-1/3 h-1/3"
	}
]
export default function Page() {
	const [enablePlayer, setEnablePlayer] = useState(false)
	const [selectedStream, setSelectedStream] = useState<string | null>(null)

	const streamListQuery = api.srt.listActiveKeys.useQuery()

	const [displayPlayer, setDisplayPlayer] = useState(false)

	const gridTemplate = useMemo(() => {
		if (streamListQuery.isLoading || !streamListQuery.data) return null
		if (streamListQuery.data.length === 0) return null
		if (streamListQuery.data.length > 9) return FlexGridTemplates[8]
		return FlexGridTemplates[streamListQuery.data.length - 1]
	}, [streamListQuery.data, streamListQuery.isLoading])

	useEffect(() => {
		// Trigger a refresh every 15 seconds
		const interval = setInterval(() => {
			console.log("refreshing list")
			void streamListQuery.refetch()
		}, 15000)
		return () => clearInterval(interval)
	})

	if (!enablePlayer)
		return (
			<div
				className="flex h-screen w-screen flex-wrap justify-around bg-gray-900 text-white"
				onClick={() => setEnablePlayer(true)}
			>
				<span className="m-auto text-xl">Cliquez sur l&apos;écran pour activer le player</span>
			</div>
		)

	if (streamListQuery.isLoading)
		return (
			<div className="flex h-screen w-screen flex-wrap justify-around bg-gray-900 text-white">
				<span className="m-auto text-xl">Loading...</span>
			</div>
		)

	if (!streamListQuery.data || streamListQuery.data.length === 0)
		return (
			<div className="flex h-screen w-screen flex-wrap justify-around bg-gray-900 text-white">
				<span className="m-auto text-xl">No active stream keys!</span>
			</div>
		)

	return (
		<div>
			<div className={FlexGridContainerClassName}>
				{streamListQuery.data.map((tile, index) => {
					return (
						<div
							key={index}
							className={classNames(
								gridTemplate?.tile ?? "",
								"relative flex grow justify-around border-2 border-transparent border-opacity-50 transition-colors hover:border-red-500"
							)}
						>
							<PlayerHls
								channel={tile.channel}
								className={"object-cover p-2"}
								reloadControl
								onClick={() => {
									setDisplayPlayer(true)
									setSelectedStream(tile.channel)
								}}
							/>
							<div className="pointer-events-none absolute z-20 float-left h-full w-full">
								<div className="absolute bottom-0 left-0 right-0 mx-auto mb-4 p-2 text-center text-xl">
									<span className="mx-autobg-slate-900 bg-slate-900 bg-opacity-40 p-2 text-center text-xl ">
										{tile.channel}
									</span>
								</div>
							</div>
						</div>
					)
				})}
			</div>
			<div
				className={classNames(
					"fixed top-0 left-0 z-20 h-screen w-screen bg-slate-900 bg-opacity-75",
					!displayPlayer ? "pointer-events-none hidden" : ""
				)}
			>
				<div className={classNames("relative flex h-full w-full grow justify-around text-white")}>
					{selectedStream && displayPlayer ? (
						<PlayerHls
							channel={selectedStream}
							className={""}
							muted={false}
							controls
							onClick={() => setDisplayPlayer(false)}
						/>
					) : null}
					<div className="pointer-events-none absolute z-20 float-left h-full w-full">
						<div className="absolute bottom-0 left-0 right-0 mx-auto mb-4 p-2 text-center text-xl">
							<span className="mx-autobg-slate-900 bg-slate-900 bg-opacity-40 p-2 text-center text-xl ">
								{selectedStream}
							</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
