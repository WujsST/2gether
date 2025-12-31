import { GoogleGenAI, Type, Schema } from "@google/genai";
import { Step } from "../types";

const apiKey = process.env.API_KEY || '';

// We need a function to get the latest client, especially for Veo which might need a user-selected key
const getAiClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY || apiKey });

// Schema for Course Generation
const stepSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: "Short title of the step" },
    description: { type: Type.STRING, description: "Instructional text for the user" },
    type: { type: Type.STRING, enum: ['video', 'action', 'download', 'embedded', 'link', 'image', 'sop'], description: "Type of the step" },
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
    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are an expert UX and Onboarding specialist. 
      Create a structured onboarding course for: "${topic}".
      The course should be engaging, concise, and professional.
      Generate 4-6 steps. Mix video instructions, action items, downloads, embedded tools, and SOP readings.`,
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
    const ai = getAiClient();
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
    const ai = getAiClient();
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

// --- NEW ASSET GENERATION SERVICES ---

export const generateSopContent = async (topic: string): Promise<string> => {
    try {
        const ai = getAiClient();
        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: `Write a detailed Standard Operating Procedure (SOP) document for: "${topic}".
            
            Format it with clear headers using Markdown:
            - Title (H1)
            - Purpose (H2)
            - Scope (H2)
            - Responsibilities (H2)
            - Procedure (H2 with numbered lists)
            - References (H2)
            
            Keep it professional, clear, and actionable.`,
        });
        return response.text || "";
    } catch (error) {
        console.error("SOP generation failed", error);
        return "";
    }
};

export const generateAiImage = async (prompt: string): Promise<string | null> => {
  try {
    const ai = getAiClient();
    // Using gemini-2.5-flash-image for generation/editing as per prompt instructions
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: prompt,
      // No specific imageConfig for 2.5 Flash Image, it generates via generateContent
    });
    
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Image generation failed:", error);
    throw error;
  }
};

export const generateAiVideo = async (prompt: string, aspectRatio: '16:9' | '9:16' = '16:9'): Promise<string | null> => {
  try {
    // Ensure Key Selection for Veo
    // @ts-ignore
    if (window.aistudio && window.aistudio.hasSelectedApiKey) {
      // @ts-ignore
      const hasKey = await window.aistudio.hasSelectedApiKey();
      if (!hasKey) {
          // @ts-ignore
          await window.aistudio.openSelectKey();
      }
    }
    
    // Create new instance to pick up the key
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: prompt,
      config: {
        numberOfVideos: 1,
        resolution: '1080p',
        aspectRatio: aspectRatio
      }
    });

    // Polling
    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 5000));
      operation = await ai.operations.getVideosOperation({operation: operation});
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (downloadLink) {
        // We return the link with the key appended so the <video> tag can fetch it directly
        return `${downloadLink}&key=${process.env.API_KEY}`;
    }
    return null;
  } catch (error) {
    console.error("Video generation failed:", error);
    throw error;
  }
};