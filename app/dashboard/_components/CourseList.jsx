"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";

function CourseList() {
  const [courses, setCourses] = useState([]);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    let active = true;
    fetch("/api/courses")
      .then(async (response) => {
        const data = await response.json();
        if (!active) return;
        if (!response.ok) {
          setStatus("error");
          return;
        }
        setCourses(data.courses || []);
        setStatus("ready");
      })
      .catch(() => {
        if (active) setStatus("error");
      });
    return () => {
      active = false;
    };
  }, []);

  if (status === "loading") {
    return <p className="mt-8 text-sm text-gray-500">Loading your courses...</p>;
  }

  if (status === "error") {
    return (
      <p className="mt-8 text-sm text-red-600">
        Could not load the courses saved to this account.
      </p>
    );
  }

  if (courses.length === 0) {
    return (
      <p className="mt-8 text-sm text-gray-500">
        No courses saved yet. Generate one, read to the last chapter, and press
        Save course.
      </p>
    );
  }

  return (
    <div className="mt-8 grid gap-4">
      {courses.map((course) => (
        <Link
          key={course.id}
          href={`/dashboard/courses/${course.id}`}
          className="block rounded-xl border p-5 hover:border-primary hover:bg-blue-50"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold">{course.courseName}</h3>
              <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                {course.description}
              </p>
            </div>
            <span className="shrink-0 text-xs text-gray-500">
              {new Date(course.createdAt).toLocaleDateString()}
            </span>
          </div>
          <p className="mt-3 text-xs text-gray-500">
            {[course.category, course.level, course.duration]
              .filter(Boolean)
              .join(" · ")}
            {course.chapterCount
              ? ` · ${course.chapterCount} chapters`
              : ""}
          </p>
          {course.email && (
            <p className="mt-1 text-xs text-gray-400">Saved to {course.email}</p>
          )}
        </Link>
      ))}
    </div>
  );
}

export default CourseList;
