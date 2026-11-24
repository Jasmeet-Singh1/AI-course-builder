"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "../../components/ui/button";
import { Progress } from "../../components/ui/progress";

function CourseReader({
  generatedCourse,
  userCourseInput,
  onSave,
  isSaving = false,
  saveError = "",
  backHref = "/create-course",
  backLabel = "Back to Builder",
  embedded = false,
}) {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [completed, setCompleted] = useState(new Set());

  const chapters = generatedCourse?.chapters || [];
  const totalChapters = chapters.length;
  const currentChapter = chapters[currentIndex] || {};
  const onLastChapter = currentIndex >= totalChapters - 1;
  const progressValue =
    totalChapters > 0 ? ((currentIndex + 1) / totalChapters) * 100 : 0;

  const handleNext = () => {
    setCompleted((prev) => new Set(prev).add(currentIndex));
    setCurrentIndex((prev) => (prev < totalChapters - 1 ? prev + 1 : prev));
  };

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : prev));
  };

  const handleEnd = () => {
    setCompleted((prev) => new Set(prev).add(currentIndex));
    if (onSave) {
      onSave();
      return;
    }
    router.push("/dashboard");
  };

  return (
    <div className={embedded ? "mt-2" : "px-6 md:px-16 lg:px-32 mt-10"}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-semibold text-primary">
            {generatedCourse.courseName || "Your AI-Generated Course"}
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            {generatedCourse.description}
          </p>
          {generatedCourse.fallback && (
            <p className="mt-2 text-sm text-amber-700">
              Gemini did not return a course. This outline was built from your
              form so you can still preview it.
            </p>
          )}
          {userCourseInput && (
            <p className="mt-1 text-xs text-gray-500">
              {userCourseInput.level && `Level: ${userCourseInput.level} · `}
              {userCourseInput.duration &&
                `Total Duration: ${userCourseInput.duration}`}
            </p>
          )}
        </div>

        <div className="hidden md:flex flex-col items-end">
          <span className="text-sm font-medium text-gray-700 mb-2">
            Progress
          </span>
          <Progress className="w-40" value={progressValue} />
          <span className="mt-1 text-xs text-gray-500">
            Chapter {currentIndex + 1} of {totalChapters}
          </span>
        </div>
      </div>

      <div className="md:hidden mb-6">
        <span className="text-sm font-medium text-gray-700 mb-2 block">
          Progress
        </span>
        <Progress value={progressValue} />
        <span className="mt-1 text-xs text-gray-500">
          Chapter {currentIndex + 1} of {totalChapters}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-2">
          <h2 className="text-sm font-semibold text-gray-700 mb-2">Chapters</h2>
          <div className="border rounded-lg divide-y divide-gray-100 max-h-[420px] overflow-y-auto">
            {chapters.map((chapter, index) => {
              const isActive = index === currentIndex;
              const isCompleted = completed.has(index);
              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => setCurrentIndex(index)}
                  className={`w-full text-left px-4 py-3 text-sm flex items-center justify-between transition-colors ${
                    isActive
                      ? "bg-primary/10 text-primary font-medium"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <div>
                    <p className="line-clamp-1">
                      {chapter.chapterName || `Chapter ${index + 1}`}
                    </p>
                    {chapter.duration && (
                      <p className="text-xs text-gray-500 mt-0.5">
                        {chapter.duration}
                      </p>
                    )}
                  </div>
                  {isCompleted && (
                    <span className="text-[10px] font-semibold text-green-600 border border-green-200 rounded-full px-2 py-0.5">
                      Done
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-2 flex flex-col">
          <div className="border rounded-lg p-5 mb-4 bg-white shadow-sm">
            <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
              Chapter {currentIndex + 1} of {totalChapters}
            </p>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              {currentChapter.chapterName || "Chapter"}
            </h2>
            <p className="text-sm text-gray-700 mb-3">
              {currentChapter.about ||
                "No description provided for this chapter."}
            </p>
            {currentChapter.duration && (
              <p className="text-xs text-gray-500">
                Estimated Duration: {currentChapter.duration}
              </p>
            )}
          </div>

          <div className="flex justify-between items-center mt-auto gap-3">
            <Button
              variant="outline"
              disabled={currentIndex === 0}
              onClick={handlePrevious}
            >
              Previous
            </Button>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => router.push(backHref)}>
                {backLabel}
              </Button>

              <Button
                disabled={isSaving || totalChapters === 0}
                onClick={onLastChapter ? handleEnd : handleNext}
              >
                {onLastChapter
                  ? isSaving
                    ? "Saving..."
                    : onSave
                      ? "Save course"
                      : "Back to my courses"
                  : "Next Chapter"}
              </Button>
            </div>
          </div>
          {saveError && (
            <p className="mt-3 text-sm text-red-600">{saveError}</p>
          )}
          {onSave && onLastChapter && (
            <p className="mt-3 text-xs text-gray-500">
              Save course stores this outline on the Google account you used to
              sign in.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default CourseReader;
