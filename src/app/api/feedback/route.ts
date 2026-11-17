import { NextResponse } from "next/server";
import { createRateLimiter } from "@/lib/askApi";
import { validateFeedback } from "@/lib/feedback";
import { getFeedbackRepository } from "@/server/feedbackRepository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const headers = { "Cache-Control": "no-store" };
const allow = createRateLimiter();
const maxBytes = 2048;

function error(status: number, code: string) {
  return NextResponse.json({ code }, { status, headers });
}

export async function GET() {
  try { return NextResponse.json(getFeedbackRepository().summary(), { headers }); }
  catch { return error(503, "FEEDBACK_UNAVAILABLE"); }
}

export async function POST(request: Request) {
  if (request.headers.get("content-type")?.split(";")[0].trim() !== "application/json") return error(415, "UNSUPPORTED_MEDIA");
  if (Number(request.headers.get("content-length")) > maxBytes) return error(413, "TOO_LARGE");
  let input: unknown;
  try {
    const text = await request.text();
    if (new TextEncoder().encode(text).length > maxBytes) return error(413, "TOO_LARGE");
    input = JSON.parse(text);
  } catch { return error(400, "INVALID_JSON"); }
  if (!validateFeedback(input)) return error(400, "INVALID_FEEDBACK");
  const address = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (!allow(address, 60)) return error(429, "RATE_LIMITED");
  try {
    const result = getFeedbackRepository().save(input);
    return NextResponse.json({ saved: true, ...result }, { status: result.created ? 201 : 200, headers });
  } catch { return error(503, "FEEDBACK_UNAVAILABLE"); }
}
