"use client";

import React, { useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { UserInputContext } from "../../_context/UserInputContext";
import CourseReader from "../../_components/CourseReader";

function CoursePreview() {
  const router = useRouter();
  const { generatedCourse, userCourseInput } = useContext(UserInputContext);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    if (!generatedCourse) {
      router.replace("/create-course");
    }
  }, [generatedCourse, router]);

  if (!generatedCourse) {
    return null;
  }

  const handleSave = async () => {
    setIsSaving(true);
    setSaveError("");
    try {
      const response = await fetch("/api/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          course: generatedCourse,
          input: userCourseInput,
        }),
      });
      const data = await response.json();
      if (response.status === 401) {
        setSaveError("Sign in with Google before saving this course.");
        return;
      }
      if (!response.ok) {
        throw new Error(data.error || "Could not save course");
      }
      router.push("/dashboard");
    } catch (error) {
      setSaveError(error.message || "Could not save course");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <CourseReader
      generatedCourse={generatedCourse}
      userCourseInput={userCourseInput}
      onSave={handleSave}
      isSaving={isSaving}
      saveError={saveError}
    />
  );
}

export default CoursePreview;
