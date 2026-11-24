import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { listCourses, saveCourse } from "../../../lib/courseStore";

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

  const body = await request.json();
  const course = body?.course;
  if (!course || !Array.isArray(course.chapters) || course.chapters.length === 0) {
    return NextResponse.json({ error: "Missing course" }, { status: 400 });
  }

  const user = await currentUser();
  const email =
    user?.primaryEmailAddress?.emailAddress ||
    user?.emailAddresses?.[0]?.emailAddress ||
    "";

  const saved = await saveCourse({
    userId,
    email,
    course,
    input: body.input || {},
  });

  return NextResponse.json({ course: saved });
}
