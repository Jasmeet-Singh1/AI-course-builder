import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getCourse } from "../../../../lib/courseStore";

export async function GET(_request, { params }) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  const { id } = await params;
  const course = await getCourse(userId, id);
  if (!course) {
    return NextResponse.json({ error: "Course not found" }, { status: 404 });
  }

  return NextResponse.json({ course });
}
