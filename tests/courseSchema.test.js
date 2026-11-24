import { describe, expect, it } from "vitest";
import { LIMITS, normalizeInput, toCleanCourse, validateCourse } from "../lib/courseSchema.js";

const chapter = (n) => ({ chapterName: `Chapter ${n}`, about: "About it", duration: "20 min" });
const course = (count) => ({
  courseName: "Python Basics",
  description: "Learn Python",
  chapters: Array.from({ length: count }, (_, i) => chapter(i + 1)),
});
const validInput = {
  category: "Programming",
  topic: "Python",
  level: "Beginner",
  duration: "1 Hours",
  chapters: "5",
};

describe("validateCourse", () => {
  it("accepts a well-formed course with the requested chapter count", () => {
    expect(validateCourse(course(5), 5)).toEqual({ ok: true, errors: [] });
  });

  it("rejects the wrong chapter count", () => {
    const result = validateCourse(course(4), 5);
    expect(result.ok).toBe(false);
    expect(result.errors[0]).toMatch(/exactly 5 items \(got 4\)/);
  });

  it("rejects empty or missing chapter fields", () => {
    const bad = course(2);
    bad.chapters[1].about = "  ";
    delete bad.chapters[0].duration;
    const result = validateCourse(bad, 2);
    expect(result.ok).toBe(false);
    expect(result.errors).toContain("chapters[0].duration must be a non-empty string");
    expect(result.errors).toContain("chapters[1].about must be a non-empty string");
  });

  it("rejects non-objects and missing top-level fields", () => {
    expect(validateCourse(null).ok).toBe(false);
    expect(validateCourse([]).ok).toBe(false);
    expect(validateCourse({ chapters: [chapter(1)] }).errors).toEqual([
      "courseName must be a non-empty string",
      "description must be a non-empty string",
    ]);
  });

  it("without an expected count, still bounds chapters to the allowed range", () => {
    expect(validateCourse(course(0)).ok).toBe(false);
    expect(validateCourse(course(LIMITS.maxChapters + 1)).ok).toBe(false);
    expect(validateCourse(course(3)).ok).toBe(true);
  });
});

describe("toCleanCourse", () => {
  it("drops unknown keys and keeps fallback only as a strict boolean", () => {
    const dirty = { ...course(1), secret: "x", fallback: "yes" };
    dirty.chapters[0].extra = "y";
    const clean = toCleanCourse(dirty);
    expect(clean).not.toHaveProperty("secret");
    expect(clean.chapters[0]).not.toHaveProperty("extra");
    expect(clean.fallback).toBe(false);
    expect(toCleanCourse({ ...course(1), fallback: true }).fallback).toBe(true);
  });
});

describe("normalizeInput", () => {
  it("accepts valid input and converts chapters to a number", () => {
    const { input, errors } = normalizeInput(validInput);
    expect(errors).toEqual([]);
    expect(input.chapters).toBe(5);
  });

  it("clamps chapters to 1-20", () => {
    expect(normalizeInput({ ...validInput, chapters: "500" }).input.chapters).toBe(20);
    expect(normalizeInput({ ...validInput, chapters: "-3" }).input.chapters).toBe(1);
  });

  it("reports missing required fields and non-numeric chapters", () => {
    const { errors } = normalizeInput({ chapters: "abc" });
    expect(errors).toEqual(
      expect.arrayContaining([
        "category is required",
        "topic is required",
        "level is required",
        "duration is required",
        "chapters must be a number",
      ])
    );
  });

  // Regression tests for review findings (2026-11-24).
  it("only accepts the level and duration options the form offers", () => {
    expect(normalizeInput({ ...validInput, level: "x".repeat(5_000_000) }).errors).toContain(
      "level must be one of: Beginner, Intermediate, Advanced"
    );
    expect(normalizeInput({ ...validInput, duration: "forever" }).errors[0]).toMatch(
      /^duration must be one of/
    );
  });

  it("caps category length", () => {
    expect(normalizeInput({ ...validInput, category: "x".repeat(101) }).errors).toContain(
      "category must be 100 characters or fewer"
    );
  });

  it("coerces displayVideo to Yes/No instead of passing it through", () => {
    expect(normalizeInput({ ...validInput, displayVideo: { huge: "object" } }).input.displayVideo).toBe("No");
    expect(normalizeInput({ ...validInput, displayVideo: "Yes" }).input.displayVideo).toBe("Yes");
  });

  it("rejects an over-long topic or description", () => {
    expect(normalizeInput({ ...validInput, topic: "x".repeat(201) }).errors).toContain(
      "topic must be 200 characters or fewer"
    );
    expect(
      normalizeInput({ ...validInput, description: "x".repeat(1001) }).errors
    ).toContain("description must be 1000 characters or fewer");
  });
});
