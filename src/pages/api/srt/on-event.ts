import { TRPCError } from "@trpc/server"
import { getHTTPStatusCodeFromError } from "@trpc/server/http"
import { type NextApiRequest, type NextApiResponse } from "next"
import { appRouter } from "../../../server/api/root"
import { createTRPCContext } from "../../../server/api/trpc"

const srtOnEventHandler = async (req: NextApiRequest, res: NextApiResponse) => {
	// Create context and caller
	const ctx = await createTRPCContext({ req, res })
	const caller = appRouter.createCaller(ctx)
	try {
		console.log("log query", req.query)
		console.log("log body", req.body)
		let response: Record<string, unknown> = {
			code: "ok"
		}

		if ((req.body as Record<string, unknown>)["event_type"] === "connect") {
			// TODO: Check if the user is authenticated

			response = {
				code: "ok",
				message: "Success"
			}
		}
		if (
			(req.body as Record<string, unknown>)["event_type"] === "publish" ||
			(req.body as Record<string, unknown>)["event_type"] === "republish"
		) {
			response = {
				code: "ok",
				channel_id: "somechannel",
				track_id: "sometrack",
				upstreams: [
					{
						url: "kmp://127.0.0.1:8003"
					}
				]
			}
		}
		if ((req.body as Record<string, unknown>)["event_type"] === "republish") {
			response = {
				code: "ok",
				url: "kmp://127.0.0.1:8003"
			}
		}
		console.log("log response", response)
		res.status(200).json(response)
	} catch (cause) {
		if (cause instanceof TRPCError) {
			// An error from tRPC occured
			const httpCode = getHTTPStatusCodeFromError(cause)
			return res.status(httpCode).json(cause)
		}
		// Another error occured
		console.error(cause)
		res.status(500).json({ message: "Internal server error" })
	}
}

export default srtOnEventHandler
