"use client";

import React, { useContext, useState } from "react";
import { useRouter } from "next/navigation";
import { HiMiniSquares2X2 } from "react-icons/hi2";
import { HiLightBulb } from "react-icons/hi";
import { HiClipboardDocumentList } from "react-icons/hi2";
import { Button } from "../../components/ui/button";
import SelectCategory from "./_components/SelectCategory";
import TopicDescription from "./_components/TopicDescription";
import SelectOption from "./_components/SelectOption";
import { UserInputContext } from "../_context/UserInputContext";

function CreateCourse() {
  const router = useRouter();
  const stepperOptions = [
    {
      id: 1,
      name: "Category",
      icon: <HiMiniSquares2X2 />,
    },
    {
      id: 2,
      name: "Topic & Desc",
      icon: <HiLightBulb />,
    },
    {
      id: 3,
      name: "Options",
      icon: <HiClipboardDocumentList />,
    },
  ];

  const { userCourseInput, setUserCourseInput, setGeneratedCourse } =
    useContext(UserInputContext);

  const [activeIndex, setActiveIndex] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState("");

  // Used to check Next button is disabled or not
  const checkStatus = () => {
    if (userCourseInput?.length == 0) return true;
    if (
      activeIndex === 0 &&
      (userCourseInput?.category?.length == 0 ||
        userCourseInput?.category == undefined)
    ) {
      return true;
    }
    if (
      activeIndex === 1 &&
      (userCourseInput?.topic?.length == 0 ||
        userCourseInput?.topic == undefined)
    ) {
      return true;
    } else if (
      activeIndex == 2 &&
      (userCourseInput?.level == undefined ||
        userCourseInput?.duration == undefined ||
        userCourseInput?.displayVideo == undefined ||
        userCourseInput?.chapters == undefined)
    ) {
      return true;
    }
    return false;
  };

  const GenerateCourseLayout = async () => {
    setIsGenerating(true);
    setGenerateError("");
    try {
      // The server calls Gemini, validates the output, retries once, and falls back
      // to a labelled outline if it still fails. The API key never reaches the browser.
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: userCourseInput }),
      });
      const data = await response.json().catch(() => ({}));

      if (response.status === 401) {
        setGenerateError("Sign in before generating a course.");
        return;
      }
      if (!response.ok) {
        const details = Array.isArray(data.details) ? ` (${data.details.join(", ")})` : "";
        setGenerateError(`${data.error || "Could not build a course"}${details}`);
        return;
      }

      // Keep the cleaned input (e.g. clamped chapter count) so the saved record matches.
      if (data.input) setUserCourseInput((prev) => ({ ...prev, ...data.input }));
      setGeneratedCourse(data.course);
      router.push("/create-course/preview");
    } catch (error) {
      console.error(error);
      setGenerateError("Could not reach the server. Check your connection and try again.");
    } finally {
      setIsGenerating(false);
    }
  };
  return (
    <div>
      {/* Stepper */}
      <div className="flex flex-col justify-center items-center mt-10">
        <h2 className="text-4xl text-primary font-medium">Create Course</h2>
        <div className="flex mt-10">
          {stepperOptions.map((item, index) => {
            return (
              <div className="flex items-center">
                <div className="flex flex-col items-center w-[50px] md:w-[100px]">
                  <div
                    className={`bg-gray-200 p-3 rounded-full text-white ${activeIndex >= index && "bg-primary"}`}
                  >
                    {item.icon}
                  </div>
                  <h2 className="hidden md:block md:text-sm">{item.name}</h2>
                </div>
                {index != stepperOptions.length - 1 && (
                  <div
                    className={`h-1 w-[50px] md:w-[100px] rounded-full lg:w-[170px] bg-gray-300 ${activeIndex - 1 >= index && "bg-primary"}`}
                  ></div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="px-10 md:px-20 lg:px-44 mt-10">
        {/* Component */}
        {activeIndex === 0 ? (
          <SelectCategory />
        ) : activeIndex === 1 ? (
          <TopicDescription />
        ) : activeIndex === 2 ? (
          <SelectOption />
        ) : null}

        {/* Next previous button */}
        <div className="flex justify-between mt-10">
          <Button
            variant="outline"
            disabled={activeIndex === 0}
            onClick={() => setActiveIndex(activeIndex - 1)}
          >
            Previous
          </Button>

          {activeIndex < 2 && (
            <Button
              disabled={checkStatus()}
              onClick={() => setActiveIndex(activeIndex + 1)}
            >
              Next
            </Button>
          )}

          {activeIndex === 2 && (
            <Button
              disabled={checkStatus() || isGenerating}
              onClick={() => GenerateCourseLayout()}
            >
              {isGenerating ? "Generating..." : "Generate Course"}
            </Button>
          )}
        </div>
        {generateError && (
          <p className="mt-4 text-sm text-red-600">{generateError}</p>
        )}
      </div>
    </div>
  );
}

export default CreateCourse;
