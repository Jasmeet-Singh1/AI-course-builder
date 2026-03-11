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
