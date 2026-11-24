// Input limits and output schema for AI-generated courses.
// Shared by the generator, the API routes and the tests. No dependencies.

export const LIMITS = {
  topic: 200,
  description: 1000,
  category: 100,
  minChapters: 1,
  maxChapters: 20,
};

// Must match the options in app/create-course/_components/SelectOption.jsx.
export const LEVELS = ["Beginner", "Intermediate", "Advanced"];
export const DURATIONS = ["1 Hours", "2 Hours", "More than 3 Hours"];

const REQUIRED_INPUT = ["category", "topic", "level", "duration"];

const isText = (value) => typeof value === "string" && value.trim().length > 0;

// Cleans and bounds the form input. Returns { input, errors }.
export function normalizeInput(raw) {
  const source = raw && typeof raw === "object" ? raw : {};
  const errors = [];

  for (const field of REQUIRED_INPUT) {
    if (!isText(source[field])) errors.push(`${field} is required`);
  }

  const topic = String(source.topic || "").trim();
  if (topic.length > LIMITS.topic) {
    errors.push(`topic must be ${LIMITS.topic} characters or fewer`);
  }

  const description = String(source.description || "").trim();
  if (description.length > LIMITS.description) {
    errors.push(`description must be ${LIMITS.description} characters or fewer`);
  }

  const category = String(source.category || "").trim();
  if (category.length > LIMITS.category) {
    errors.push(`category must be ${LIMITS.category} characters or fewer`);
  }

  const level = String(source.level || "").trim();
  if (level && !LEVELS.includes(level)) errors.push(`level must be one of: ${LEVELS.join(", ")}`);

  const duration = String(source.duration || "").trim();
  if (duration && !DURATIONS.includes(duration)) {
    errors.push(`duration must be one of: ${DURATIONS.join(", ")}`);
  }

  const parsed = Number.parseInt(source.chapters, 10);
  if (!Number.isFinite(parsed)) errors.push("chapters must be a number");
  const chapters = Math.min(
    LIMITS.maxChapters,
    Math.max(LIMITS.minChapters, Number.isFinite(parsed) ? parsed : LIMITS.minChapters)
  );

  return {
    input: {
      category,
      topic,
      description,
      level,
      duration,
      chapters,
      displayVideo: source.displayVideo === "Yes" ? "Yes" : "No",
    },
    errors,
  };
}

// Projects a course onto the known fields only, so extra model- or client-supplied
// keys are never shown or stored. fallback is kept only as a strict boolean.
export function toCleanCourse(course) {
  return {
    courseName: String(course.courseName).trim(),
    description: String(course.description).trim(),
    fallback: course.fallback === true,
    chapters: course.chapters.map((chapter) => ({
      chapterName: String(chapter.chapterName).trim(),
      about: String(chapter.about).trim(),
      duration: String(chapter.duration).trim(),
    })),
  };
}

// Checks a course object against the output contract in .claude/rules/ai-output.md.
// expectedChapters is optional; when given, the count must match exactly.
export function validateCourse(course, expectedChapters) {
  const errors = [];

  if (!course || typeof course !== "object" || Array.isArray(course)) {
    return { ok: false, errors: ["course must be a JSON object"] };
  }
  if (!isText(course.courseName)) errors.push("courseName must be a non-empty string");
  if (!isText(course.description)) errors.push("description must be a non-empty string");

  if (!Array.isArray(course.chapters)) {
    errors.push("chapters must be an array");
    return { ok: false, errors };
  }

  const count = course.chapters.length;
  if (expectedChapters !== undefined && count !== expectedChapters) {
    errors.push(`chapters must contain exactly ${expectedChapters} items (got ${count})`);
  } else if (count < LIMITS.minChapters || count > LIMITS.maxChapters) {
    errors.push(`chapters must contain ${LIMITS.minChapters}-${LIMITS.maxChapters} items (got ${count})`);
  }

  course.chapters.forEach((chapter, index) => {
    for (const field of ["chapterName", "about", "duration"]) {
      if (!isText(chapter?.[field])) {
        errors.push(`chapters[${index}].${field} must be a non-empty string`);
      }
    }
  });

  return { ok: errors.length === 0, errors };
}
