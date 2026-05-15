import { GoogleGenerativeAI } from "@google/generative-ai";

export const chatWithGemini = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ success: false, message: "Message is required" });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ success: false, message: "Gemini API key is missing" });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    // Use gemini-2.5-flash-lite model which is available
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

    const prompt = `You are a helpful and friendly AI assistant for Learnify, an online course platform.
Your goal is to help users find the best courses, answer their questions about programming, tech, or our platform, and provide encouraging advice.

User's message: ${message}

Provide a concise, helpful, and friendly response. Do not use overly complex markdown. Keep it easy to read for a student.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    res.json({ success: true, reply: text });
  } catch (error) {
    console.error("Chatbot error:", error);
    res.status(500).json({ success: false, message: "Failed to generate response", error: error.message });
  }
};

import Course from '../models/Course.js';

export const recommendCourses = async (req, res) => {
  try {
    const { skills, interests } = req.body;

    if (!skills && !interests) {
      return res.status(400).json({ success: false, message: "Please provide skills or interests" });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ success: false, message: "Gemini API key is missing" });
    }

    // Fetch all published courses from the DB to send to Gemini
    const allCourses = await Course.find({ isPublished: true }).select('_id courseTitle courseDescription');

    const courseCatalog = allCourses.map(c => `ID: ${c._id}\nTitle: ${c.courseTitle}\nDescription: ${c.courseDescription.replace(/<[^>]*>?/gm, '')}`).join('\n\n');

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

    const prompt = `You are an AI Course Recommender for Learnify.
The user has the following profile:
Skills: ${skills}
Interests: ${interests}

Here is the catalog of available courses:
${courseCatalog}

Analyze the user's profile and recommend the top 3 best matching courses from the catalog.
You must return the response EXCLUSIVELY as a valid JSON array of objects. Do not include any markdown formatting like \`\`\`json. Do not include any other text.
Each object must have exactly these keys:
- "courseId": the ID of the recommended course
- "matchPercentage": a number between 1 and 100 representing how well it matches (e.g., 95)
- "reason": A short 1-sentence reason why this course is a good fit.

Example output:
[
  { "courseId": "605c72efb3f1c2b1f8e4e1a1", "matchPercentage": 90, "reason": "Because you like JavaScript and want to build web apps." }
]
`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    // Parse the JSON array
    let recommendations = [];
    try {
      recommendations = JSON.parse(responseText.trim().replace(/^```json/, '').replace(/```$/, ''));
    } catch (e) {
      console.error("Failed to parse Gemini response as JSON:", responseText);
      return res.status(500).json({ success: false, message: "AI returned invalid format." });
    }

    res.json({ success: true, recommendations });
  } catch (error) {
    console.error("Recommendation error:", error);
    res.status(500).json({ success: false, message: "Failed to generate recommendations", error: error.message });
  }
};
