import Image from "next/image"
import logo from "~/../public/logos/Logo-WoText.png"
import { api } from "../../utils/api"

export default function StreamkeyList() {
	const streamkeys = api.srt.listKeyOwners.useQuery()

	if (streamkeys.isLoading || !streamkeys.data) {
		return <div>Loading...</div>
	}

	if (streamkeys.data.length === 0) {
		return <div>No streamkeys</div>
	}

	return (
		<div className="mt-8 flow-root">
			<div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
				<div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
					<table className="min-w-full divide-y divide-gray-300">
						<thead>
							<tr>
								<th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">
									Streameureuse
								</th>
								<th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">
									URL
								</th>
								<th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-0">
									<span className="sr-only">Reset</span>
								</th>
								<th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-0">
									<span className="sr-only">Delete</span>
								</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-gray-200 bg-white">
							{streamkeys.data.map((streamkey) => (
								<tr key={streamkey.id}>
									<td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-0">
										<div className="flex items-center">
											<div className="h-10 w-10 flex-shrink-0">
												<Image
													src={streamkey.image ?? logo}
													alt=""
													className="h-10 w-10 rounded-full"
													width={64}
													height={64}
												/>
											</div>
											<div className="ml-4">
												<div className="font-medium text-gray-900">{streamkey.name}</div>
												<div className="text-gray-500">{streamkey.channel}</div>
											</div>
										</div>
									</td>
									<td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
										<div className="text-gray-900">
											<input
												type="text"
												className="block w-full rounded-md border-gray-300 shadow-sm focus:border-red-300 focus:ring-red-500 sm:text-sm"
												value={`https://piquet-stream.otterly.fr/clear/ch/${streamkey.channel}/master.m3u8`}
												readOnly
											/>
										</div>
									</td>
									<td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
										<a href="#" className="text-indigo-600 hover:text-indigo-900">
											Reset<span className="sr-only">, {streamkey.name}</span>
										</a>
									</td>
									<td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
										<a href="#" className="text-indigo-600 hover:text-indigo-900">
											Delete<span className="sr-only">, {streamkey.name}</span>
										</a>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	)
}
