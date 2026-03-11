"use client";

import React, { useContext, useEffect, useState } from "react";
import { HiMiniSquares2X2 } from "react-icons/hi2";
import { HiLightBulb } from "react-icons/hi";
import { HiClipboardDocumentList } from "react-icons/hi2";
import { Button } from "../../components/ui/button";
import SelectCategory from "./_components/SelectCategory";
import TopicDescription from "./_components/TopicDescription";
import SelectOption from "./_components/SelectOption";
import { UserInputContext } from "../_context/UserInputContext";
import { generateCourse_AI } from "../../configs/AiModel";

function CreateCourse() {
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

  const { userCourseInput, setUserCourseInput } = useContext(UserInputContext);

  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    console.log("userCourseInput", userCourseInput);
  }, [userCourseInput]);

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
    // const BASIC_PROMPT =
    //   "Generate A Course Tutorial on Following Detail With field as Course Name, Description, Along with Chapter Name, about, Duration:";
    // const USER_INPUT_PROMPT = `Category: ${userCourseInput?.category}, Topic: ${userCourseInput?.topic}, Level: ${userCourseInput?.level}, Duration: ${userCourseInput?.duration}, NoOf Chapters: ${userCourseInput?.chapters}, in JSON format`;

    // const FINAL_PROMPT = BASIC_PROMPT + USER_INPUT_PROMPT;

    const response = await generateCourse_AI(userCourseInput);
    const cleaned = response.replace(/```json|```/g, "");

    const courseData = JSON.parse(cleaned);

    console.log(courseData);
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
              disabled={checkStatus()}
              onClick={() => GenerateCourseLayout()}
            >
              Generate Course
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default CreateCourse;
