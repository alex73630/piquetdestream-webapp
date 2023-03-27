import { useRouter } from "next/router"
import PlayerHls from "../../../components/irl/player"
import { classNames } from "../../../utils/class-names"

export default function Page() {
	const { query } = useRouter()

	const streamer = query.streamer as string

	if (!streamer)
		return (
			<div className="flex h-screen w-screen flex-wrap justify-around bg-gray-900 text-white">
				<span className="m-auto text-xl">No streamer provided in url!</span>
			</div>
		)

	return (
		<div>
			<div className={classNames("fixed top-0 left-0 z-20 h-screen w-screen bg-transparent")}>
				<div className={classNames("relative flex h-full w-full grow justify-around text-white")}>
					{streamer ? <PlayerHls channel={streamer} className={""} muted={false} controls /> : null}
				</div>
			</div>
		</div>
	)
}
