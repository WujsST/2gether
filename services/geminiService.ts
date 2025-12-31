import { GoogleGenAI, Type, Schema } from "@google/genai";
import { Step } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// Schema for Course Generation
const stepSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: "Short title of the step" },
    description: { type: Type.STRING, description: "Instructional text for the user" },
    type: { type: Type.STRING, enum: ['video', 'action', 'download', 'embedded'], description: "Type of the step" },
    videoUrl: { type: Type.STRING, description: "A valid YouTube Video ID (not full URL) relevant to the topic. Use placeholder IDs like 'dQw4w9WgXcQ' if unknown." },
    embedUrl: { type: Type.STRING, description: "Full URL for embedded content (e.g. Calendly link, Google Slides embed link). Only for 'embedded' type." },
    actionLabel: { type: Type.STRING, description: "Label for the action button or input (e.g., 'Upload Brief')" },
    fileName: { type: Type.STRING, description: "Name of file to download if type is download" },
  },
  required: ["title", "description", "type"],
};

const courseSchema: Schema = {
  type: Type.ARRAY,
  items: stepSchema,
};

export const generateCourseStructure = async (topic: string): Promise<Partial<Step>[]> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are an expert UX and Onboarding specialist. 
      Create a structured onboarding course for: "${topic}".
      The course should be engaging, concise, and professional.
      Generate 4-6 steps. Mix video instructions, action items, downloads, and embedded tools (like scheduling a meeting).`,
      config: {
        responseMimeType: "application/json",
        responseSchema: courseSchema,
      },
    });

    const jsonText = response.text || "[]";
    const steps = JSON.parse(jsonText);
    
    // Enrich with IDs
    return steps.map((s: any, index: number) => ({
      ...s,
      id: `generated-${Date.now()}-${index}`,
      isCompleted: false,
    }));

  } catch (error) {
    console.error("AI Generation failed:", error);
    return [];
  }
};

export const enhanceText = async (text: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are an expert UX writer creating content for onboarding slides. 
      Rewrite the following text to be extremely concise, punchy, and easy to scan.
      
      STRICT RULES:
      1. KEEP IT SHORT. No long paragraphs or essays. Max 50-60 words.
      2. Use Markdown formatting tags to structure the text:
         - Use "## " for a short, catchy sub-headline (if applicable).
         - Use "- " for bullet points to break up instructions.
         - Use "**" to bold key terms or action verbs.
      3. Tone: Professional, encouraging, and direct.
      
      Text to rewrite: "${text}"`,
    });
    return response.text || text;
  } catch (error) {
    console.error("Enhance text failed:", error);
    return text;
  }
};

export const chatWithConcierge = async (message: string, currentStepContext: string, history: {role: string, text: string}[]): Promise<string> => {
  try {
    const systemInstruction = `You are a helpful AI Concierge for the '2gether' onboarding platform. 
    Your goal is to assist the user with their current onboarding step.
    Be polite, concise, and encouraging.
    
    Current User Context: ${currentStepContext}`;

    const contents = [
      ...history.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.text }]
      })),
      { role: 'user', parts: [{ text: message }] }
    ];

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
      }
    });

    return response.text || "I'm having trouble connecting right now. Please try again.";
  } catch (error) {
    console.error("Chat failed:", error);
    return "I am currently offline. Please contact support.";
  }
};