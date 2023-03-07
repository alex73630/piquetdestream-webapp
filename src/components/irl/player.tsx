import { ArrowPathIcon } from "@heroicons/react/20/solid"
import Hls from "hls.js"
import { useMemo, useRef } from "react"
import ReactHlsPlayer from "./hls-player"
import Logo from "~/../public/logos/Logo-WoText.png"
import Image from "next/image"

interface PlayerHlsProps {
	channel: string
	className?: string
	muted?: boolean
	controls?: boolean
	reloadControl?: boolean
	onClick?: () => void
}

export default function PlayerHls({
	channel,
	className,
	muted = true,
	controls = false,
	onClick,
	reloadControl = false
}: PlayerHlsProps) {
	const hls = useMemo(() => new Hls(), [])
	const videoRef = useRef<HTMLVideoElement>(null)

	const channelHlsUrl = useMemo(() => `https://piquet-stream.otterly.fr/clear/ch/${channel}/master.m3u8`, [channel])

	const reloadPlayer = () => {
		if (videoRef.current) {
			hls.detachMedia()
			hls.loadSource(channelHlsUrl)
			hls.attachMedia(videoRef.current)
			setTimeout(() => {
				void videoRef.current?.play()
			}, 500)
		}
	}

	// return <video ref={videoRef} autoPlay={true} playsInline={true} className={className} controls muted />
	return (
		<div className="group relative flex">
			<div className="absolute top-0 left-0 h-full w-full">
				<Image src={Logo} alt="" className="h-full w-full object-contain" />
				<div className="absolute top-0 left-0 flex h-full w-full object-center text-center">
					<span className="m-auto bg-gray-900 bg-opacity-80 p-2 text-4xl">OFFLINE</span>
				</div>
			</div>
			<div className="z-10 flex w-full" onClick={onClick}>
				<ReactHlsPlayer
					playerRef={videoRef}
					src={channelHlsUrl}
					autoPlay
					controls={controls}
					muted={muted}
					width="100%"
					height="auto"
					className={className}
				/>
			</div>
			{reloadControl ? (
				<div
					className="invisible absolute top-2 right-2 z-20 h-8 w-8 cursor-pointer group-hover:visible"
					onClick={() => reloadPlayer()}
				>
					<ArrowPathIcon />
				</div>
			) : null}
		</div>
	)
}
