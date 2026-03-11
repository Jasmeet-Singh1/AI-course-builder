import { Textarea } from "../../../components/ui/textarea";
import { Input } from "../../../components/ui/input";
import React, { useContext } from "react";
import { UserInputContext } from "../../_context/UserInputContext";

function TopicDescription() {
  const { userCourseInput, setUserCourseInput } = useContext(UserInputContext);

  const handleInputChange = (fieldName, value) => {
    setUserCourseInput((prev) => {
      return { ...prev, [fieldName]: value };
    });
  };
  return (
    <div className="mx-20 lg:mx-44">
      {/* Input Topic */}
      <div className="mx-5">
        <label>Write the topic for which you want to generate the course</label>
        <Input
          type="text"
          placeholder={"Enter the topic"}
          onChange={(e) => handleInputChange("topic", e.target.value)}
          defaultValue={userCourseInput?.topic}
        />
      </div>
      {/* Text area for description */}
      <div className="mx-5 ">
        <label>
          Tell us more about your course, what you want to cover in it?
          (Optional)
        </label>
        <Textarea
          type="text"
          placeholder={"Enter the description"}
          onChange={(e) => handleInputChange("description", e.target.value)}
          defaultValue={userCourseInput?.description}
        />
      </div>
    </div>
  );
}

export default TopicDescription;
