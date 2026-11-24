import fs from "fs/promises";
import path from "path";

const filePath = path.join(process.cwd(), "data", "courses.json");

async function readAll() {
  try {
    const raw = await fs.readFile(filePath, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    if (error.code === "ENOENT") return [];
    throw error;
  }
}

async function writeAll(courses) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(courses, null, 2));
}

function toSummary(record) {
  return {
    id: record.id,
    email: record.email,
    createdAt: record.createdAt,
    courseName: record.course?.courseName || "Untitled course",
    description: record.course?.description || "",
    chapterCount: record.course?.chapters?.length || 0,
    level: record.input?.level || "",
    category: record.input?.category || "",
    duration: record.input?.duration || "",
    topic: record.input?.topic || "",
  };
}

export async function listCourses(userId) {
  const courses = await readAll();
  return courses
    .filter((course) => course.userId === userId)
    .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))
    .map(toSummary);
}

export async function getCourse(userId, id) {
  const courses = await readAll();
  return (
    courses.find((course) => course.userId === userId && course.id === id) ||
    null
  );
}

export async function saveCourse({ userId, email, course, input }) {
  const courses = await readAll();
  const saved = {
    id: crypto.randomUUID(),
    userId,
    email,
    createdAt: new Date().toISOString(),
    course,
    input: input || {},
  };
  courses.push(saved);
  await writeAll(courses);
  return saved;
}
