import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { normalizeInput } from "../../../lib/courseSchema";
import { generateCourse } from "../../../lib/courseGenerator";

// Simple per-user limit to bound Gemini spend. In-memory: resets on restart and is
// not shared across instances (see artifacts/spec_server-side-generation.md).
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 5;
const recent = new Map();

function isRateLimited(userId) {
  const now = Date.now();
  // Evict expired entries for everyone so the map can't grow without bound.
  for (const [id, times] of recent) {
    if (times.every((t) => now - t >= WINDOW_MS)) recent.delete(id);
  }
  const hits = (recent.get(userId) || []).filter((t) => now - t < WINDOW_MS);
  if (hits.length >= MAX_PER_WINDOW) {
    recent.set(userId, hits);
    return true;
  }
  hits.push(now);
  recent.set(userId, hits);
  return false;
}

export async function POST(request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { input, errors } = normalizeInput(body?.input);
  if (errors.length) {
    return NextResponse.json({ error: "Invalid input", details: errors }, { status: 400 });
  }

  if (isRateLimited(userId)) {
    return NextResponse.json(
      { error: "Too many generations. Wait a minute and try again." },
      { status: 429 }
    );
  }

  const result = await generateCourse(input);
  if (result.fallback) {
    console.error("Course generation fell back:", result.errors);
  }

  return NextResponse.json({
    course: result.course,
    input,
    fallback: result.fallback,
    attempts: result.attempts,
  });
}
