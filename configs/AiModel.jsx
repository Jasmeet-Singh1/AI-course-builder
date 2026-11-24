import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey || "");

export const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
  generationConfig: {
    responseMimeType: "application/json",
  },
});
export async function generateCourse_AI(data) {
  const finalPrompt = `
  You are a course generator AI.
  
  Generate a course with the following details:
  
  Category: ${data.category}
  Topic: ${data.topic}
  Difficulty Level: ${data.level}
  Total Duration: ${data.duration}
  Number of Chapters: ${data.chapters}
  
  IMPORTANT RULES:
  - The course MUST be about "${data.topic}" only.
  - The difficulty MUST match "${data.level}".
  - Generate EXACTLY ${data.chapters} chapters.
  - Each chapter should contain a title, description, and duration.
  - Do NOT generate more or fewer chapters.
  
  Return ONLY JSON in the following format:
  
  {
    "courseName": "",
    "description": "",
    "chapters": [
      {
        "chapterName": "",
        "about": "",
        "duration": ""
      }
    ]
  }
  `;

  const result = await model.generateContent(finalPrompt);
  const response = await result.response;
  const text = response.text();

  return text;
}

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
