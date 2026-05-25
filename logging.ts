import type { BunRequest } from "bun";
import type { LogRequest, RawLogRequest, ProcessedAddRequest } from "./types";

const headers = new Headers({
  "Access-Control-Allow-Origin": "https://hours.westwoodrobots.org",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
});

export async function process(
  req: BunRequest,
  authKey?: string
): Promise<ProcessedAddRequest> {
  if (req.headers.get("Authorization") !== `Bearer ${authKey}`) {
    return {
      response: Response.json(
        { message: "Unauthorized" },
        { status: 401, headers }
      ),
    };
  }

  const body = (await req.json()) as RawLogRequest;

  if (
    typeof body.session !== "string" ||
    typeof body.id !== "string" ||
    typeof body.minutes !== "number" ||
    typeof body.timestamp !== "string"
  ) {
    return {
      response: Response.json(
        { message: "Invalid log format." },
        { status: 400, headers }
      ),
    };
  }

  const log: LogRequest = {
    session: body.session,
    id: body.id,
    minutes: body.minutes,
    timestamp: new Date(body.timestamp),
  };

  // @ts-ignore
  if (log.id !== req.params.id) {
    return {
      response: Response.json(
        {
          message: "ID in the body does not match the URL parameter.",
        },
        { status: 400, headers }
      ),
    };
  }

  if (log.minutes < 15 || log.minutes > 1080) {
    return {
      response: Response.json(
        { message: "Invalid minutes range. Must be between 15 and 1080." },
        { status: 400, headers }
      ),
    };
  }

  return { log: log };
}
