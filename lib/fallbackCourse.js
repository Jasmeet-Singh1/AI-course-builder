// Deterministic outline used when the model fails validation twice.
// Always marked fallback: true so the UI can tell the user (see .claude/rules/ai-output.md).

const chapterBeats = [
  (topic, level) => ({
    chapterName: `Getting started with ${topic}`,
    about: `Introduce ${topic} at a ${level} level. Define the idea, why it matters, and the terms used in the rest of the course.`,
  }),
  (topic, level) => ({
    chapterName: `Core ideas behind ${topic}`,
    about: `Walk through the main concepts of ${topic}. Keep the explanations at a ${level} pace and connect each idea to a concrete example.`,
  }),
  (topic) => ({
    chapterName: `A hands-on pass at ${topic}`,
    about: `Practice ${topic} with a small worked example. Pause after each step so the learner can try it before moving on.`,
  }),
  (topic) => ({
    chapterName: `Common mistakes in ${topic}`,
    about: `Cover the mistakes people make when learning ${topic}, how to spot them, and what to do instead.`,
  }),
  (topic) => ({
    chapterName: `Putting ${topic} together`,
    about: `Combine the earlier pieces into one complete example so the learner can see how ${topic} fits together.`,
  }),
  (topic) => ({
    chapterName: `What to learn next in ${topic}`,
    about: `Close the course with a short review of ${topic} and a few next steps the learner can take on their own.`,
  }),
];

export function buildFallbackCourse(data) {
  const topic = data.topic || "this topic";
  const level = data.level || "Beginner";
  const count = Math.max(1, Number(data.chapters) || 1);
  const hours = String(data.duration || "").startsWith("1")
    ? 1
    : String(data.duration || "").startsWith("2")
      ? 2
      : 3;
  const minutes = Math.max(10, Math.round((hours * 60) / count));

  return {
    courseName: `${topic} (${level})`,
    description:
      data.description ||
      `A ${level.toLowerCase()} course on ${topic}${data.category ? ` in ${data.category}` : ""}.`,
    fallback: true,
    chapters: Array.from({ length: count }, (_, index) => {
      const beat = chapterBeats[index % chapterBeats.length](topic, level);
      return {
        chapterName: beat.chapterName,
        about: beat.about,
        duration: `${minutes} min`,
      };
    }),
  };
}
