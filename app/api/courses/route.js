import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { listCourses, saveCourse } from "../../../lib/courseStore";
import { normalizeInput, toCleanCourse, validateCourse } from "../../../lib/courseSchema";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  const courses = await listCourses(userId);
  return NextResponse.json({ courses });
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

  const { input, errors: inputErrors } = normalizeInput(body?.input);
  if (inputErrors.length) {
    return NextResponse.json({ error: "Invalid input", details: inputErrors }, { status: 400 });
  }

  const check = validateCourse(body?.course, input.chapters);
  if (!check.ok) {
    return NextResponse.json({ error: "Invalid course", details: check.errors }, { status: 400 });
  }
  // Store only known fields; never the raw client object.
  const course = toCleanCourse(body.course);

  const user = await currentUser();
  const email =
    user?.primaryEmailAddress?.emailAddress ||
    user?.emailAddresses?.[0]?.emailAddress ||
    "";

  const saved = await saveCourse({
    userId,
    email,
    course,
    input,
  });

  return NextResponse.json({ course: saved });
}
