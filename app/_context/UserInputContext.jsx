import { createContext } from "react";

export const UserInputContext = createContext({
  userCourseInput: {},
  setUserCourseInput: () => {},
  generatedCourse: null,
  setGeneratedCourse: () => {},
});
