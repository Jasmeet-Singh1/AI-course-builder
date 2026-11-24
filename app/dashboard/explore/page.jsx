import React from "react";
import CourseList from "../_components/CourseList";

function ExplorePage() {
  return (
    <div>
      <h2 className="text-3xl font-bold">Explore</h2>
      <p className="mt-2 text-sm text-gray-500">
        Courses saved to the Google account you are signed in with.
      </p>
      <CourseList />
    </div>
  );
}

export default ExplorePage;
