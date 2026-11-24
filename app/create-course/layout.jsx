"use client";

import React, { useState } from "react";
import Header from "../dashboard/_components/Header";
import { UserInputContext } from "../_context/UserInputContext";

function CreateCourseLayout({ children }) {
  const [userCourseInput, setUserCourseInput] = useState({});
  const [generatedCourse, setGeneratedCourse] = useState(null);
  return (
    <div>
      <UserInputContext.Provider
        value={{
          userCourseInput,
          setUserCourseInput,
          generatedCourse,
          setGeneratedCourse,
        }}
      >
        <>
          <Header />
          {children}
        </>
      </UserInputContext.Provider>
    </div>
  );
}

export default CreateCourseLayout;
