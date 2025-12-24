
import { GoogleGenAI, Type } from "@google/genai";

// Always initialize with process.env.API_KEY directly.
const getAIClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const generateSmartPost = async (topic: string): Promise<string> => {
  const ai = getAIClient();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Write a short, engaging campus social media post about "${topic}" specifically for Nigerian university students. Use local slang like 'Omo', 'Abeg', or 'Lamba' where appropriate. Keep it under 200 characters. No hashtags.`,
      config: {
        temperature: 0.8,
        topP: 0.9,
      }
    });
    // response.text is a getter property, not a function.
    return response.text || "Could not generate post. Try again!";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Offline mode: AI capabilities limited.";
  }
};

export const summarizeFeed = async (posts: any[]): Promise<string> => {
  const ai = getAIClient();
  const feedContent = posts.map(p => p.content).join("\n---\n");
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Summarize the current campus vibe from these posts in one catchy sentence: \n${feedContent}`,
    });
    // response.text is a getter property, not a function.
    return response.text || "Just another day on campus!";
  } catch (error) {
    return "Stay connected with your mates!";
  }
};
