import { useMemo, useState } from "react"
import { classNames } from "../../utils/class-names"
import StreamerSearch from "../forms/fields/streamer-search"
import { CopyToClipboard } from "react-copy-to-clipboard"
import { api } from "../../utils/api"

export default function AddStreamKey() {
	const [streamerId, setStreamerId] = useState<string | null>(null)
	const [streamKey, setStreamKey] = useState<string | null>(null)
	const [copied, setCopied] = useState(false)
	const disabledButton = useMemo(() => !streamerId, [streamerId])

	const handleCopy = () => {
		setCopied(true)
		setTimeout(() => {
			setCopied(false)
		}, 5000)
	}

	const createStreamKeyMutate = api.srt.createKey.useMutation()

	const handleCreateStreamKey = () => {
		if (!streamerId) return
		createStreamKeyMutate
			.mutateAsync({
				user_id: streamerId
			})
			.then((data) => {
				setStreamKey(data)
				setStreamerId("clear")
			})
			.catch((err) => {
				console.log(err)
			})
	}

	return (
		<div className="mb-4">
			<div>
				<div className="block text-sm font-medium text-gray-700">Ajouter un(e) streameureuse à la liste</div>
				<div className="mt-2 sm:flex sm:items-center">
					<div className="w-full sm:max-w-xs">
						<StreamerSearch streamerId={streamerId ?? null} onChange={(streamerId) => setStreamerId(streamerId)} />
					</div>
					<div className="mx-2">
						<button
							type="button"
							className={classNames(
								"mt-3 inline-flex w-full items-center justify-center rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 sm:mt-0 sm:ml-3 sm:w-auto",
								disabledButton
									? "cursor-not-allowed bg-red-400"
									: "bg-red-600 hover:bg-red-500 focus-visible:outline-red-600"
							)}
							disabled={disabledButton}
							onClick={handleCreateStreamKey}
						>
							Ajouter
						</button>
					</div>
				</div>

				{streamKey && (
					<div className="mt-4 w-full sm:max-w-xs">
						<div>
							<label htmlFor="first-name" className="block text-sm font-medium text-gray-700">
								Clé de stream générée :
							</label>
							<div className="mt-1">
								<CopyToClipboard text={streamKey} onCopy={handleCopy}>
									<input
										type="password"
										className="block w-full rounded-md border-gray-300 bg-green-100 shadow-sm focus:border-red-300 focus:ring-red-500 sm:text-sm"
										value={streamKey}
										readOnly
									/>
								</CopyToClipboard>
							</div>
							<p className="mt-2 text-sm text-gray-500">{copied ? "Copié !" : "Cliquez sur la clé pour la copier"}</p>
						</div>
					</div>
				)}
			</div>
		</div>
	)
}
