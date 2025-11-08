
import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";

let chat: Chat | null = null;

const initializeChat = () => {
    if (!process.env.API_KEY) {
        console.error("API_KEY environment variable not set.");
        return;
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    chat = ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
            systemInstruction: `You are a helpful and encouraging assistant for the 'Komani Progress Action (KPA)' political organization.
            Your role is to answer questions potential applicants might have about the joining process, the party's values, and how to get involved.
            Keep your answers concise, positive, and clear.
            Do not engage in political debates or express personal opinions. Stick to factual information about the party membership process.`,
        },
    });
};

export const sendMessageToBot = async (message: string): Promise<AsyncGenerator<GenerateContentResponse>> => {
    if (!chat) {
        initializeChat();
    }
    if (!chat) {
        throw new Error("Chat initialization failed. Check API key.");
    }
    
    try {
        const result = await chat.sendMessageStream({ message });
        return result;
    } catch (error) {
        console.error("Error sending message to Gemini:", error);
        throw error;
    }
};
