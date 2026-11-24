"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import CourseReader from "../../../_components/CourseReader";

function SavedCoursePage() {
  const params = useParams();
  const [record, setRecord] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!params?.id) return;
    fetch(`/api/courses/${params.id}`)
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) {
          setError(data.error || "Course not found");
          return;
        }
        setRecord(data.course);
      })
      .catch(() => setError("Could not load this course"));
  }, [params?.id]);

  if (error) {
    return <p className="text-sm text-red-600">{error}</p>;
  }

  if (!record) {
    return <p className="text-sm text-gray-500">Loading course...</p>;
  }

  return (
    <CourseReader
      generatedCourse={record.course}
      userCourseInput={record.input}
      backHref="/dashboard"
      backLabel="Back to dashboard"
      embedded
    />
  );
}

export default SavedCoursePage;
