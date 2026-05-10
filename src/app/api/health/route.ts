import { NextResponse } from "next/server";

/**
 * Health probe used by Render (and any other uptime monitor).
 *
 * Stays deliberately trivial: no DB round-trip, no auth lookup, no
 * locale cookie parsing. The landing page already does all of that
 * and costs a hot path that `pnpm start` can't always serve within
 * Render's health-check timeout window.
 *
 * Returning 200 with a tiny JSON body is enough for Render to mark
 * the instance healthy, and the `x-health-check: ok` header gives
 * log scrapers something to grep for.
 */

// Explicitly keep this out of any static optimisation / caching.
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export function GET() {
  return NextResponse.json(
    {
      status: "ok",
      service: "coaching-platform",
      timestamp: new Date().toISOString(),
    },
    {
      status: 200,
      headers: {
        "x-health-check": "ok",
        "cache-control": "no-store",
      },
    },
  );
}

// Render occasionally issues HEAD probes — answer them the same way but
// without a body so the transport stays cheap.
export function HEAD() {
  return new Response(null, {
    status: 200,
    headers: { "x-health-check": "ok", "cache-control": "no-store" },
  });
}
