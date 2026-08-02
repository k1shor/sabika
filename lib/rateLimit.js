import { NextResponse } from "next/server";

const globalForRateLimit = globalThis;

if (!globalForRateLimit.__nursingNepalRateLimits) {
  globalForRateLimit.__nursingNepalRateLimits = new Map();
}

const buckets = globalForRateLimit.__nursingNepalRateLimits;

function clientIp(req) {
  const forwardedFor = req.headers.get("x-forwarded-for") || "";
  return forwardedFor.split(",")[0]?.trim()
    || req.headers.get("x-real-ip")
    || "local";
}

function cleanup(now) {
  if (buckets.size < 1000) return;
  for (const [key, bucket] of buckets.entries()) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

export function checkRateLimit(req, { name, limit, windowMs }) {
  const now = Date.now();
  cleanup(now);

  const key = `${name}:${clientIp(req)}`;
  const current = buckets.get(key);

  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1, resetAt: now + windowMs };
  }

  current.count += 1;
  buckets.set(key, current);

  if (current.count > limit) {
    return {
      ok: false,
      remaining: 0,
      resetAt: current.resetAt,
      retryAfter: Math.max(1, Math.ceil((current.resetAt - now) / 1000)),
    };
  }

  return { ok: true, remaining: limit - current.count, resetAt: current.resetAt };
}

export function rateLimitResponse(result) {
  return NextResponse.json(
    { ok: false, error: "Too many requests. Please try again later." },
    {
      status: 429,
      headers: {
        "Retry-After": String(result.retryAfter || 60),
        "X-RateLimit-Remaining": "0",
      },
    }
  );
}
