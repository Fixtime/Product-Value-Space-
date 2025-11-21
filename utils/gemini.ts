import { GoogleGenAI, Type } from "@google/genai";
import { ProductConfig, JourneyStage } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `
You are a Chief Product Officer and Data Scientist. 
Your goal is to create a realistic "Product Value Space" dataset for a specific product description provided by the user.
You need to generate structured data that simulates:
1. User Segments (Axis Z)
2. Contexts of Use (Axis Y)
3. Customer Jobs to be Done (Axis X)
4. Problem Clusters with specific signal templates.

Rules:
- Generate exactly 10 Segments, sorted from "Active/Young/New" to "Passive/Old/Legacy".
- Generate exactly 10 Contexts, sorted from "Low Intensity/Private" to "High Intensity/Public".
- Generate exactly 10 Customer Jobs, sorted by typical user lifecycle (Acquisition -> Retention).
- Generate 45 Problem Clusters.
- For each Cluster, provide:
  - A concise name (e.g., "Login Latency", "Payment Failure").
  - A journey stage (Awareness, Consideration, Purchase, Onboarding, Active Use, Retention, Advocacy).
  - An impact weight (1-10), where 10 is critical business failure and 1 is minor annoyance.
  - 8-12 specific "Signal Templates" (strings). These should look like real logs, tickets, search queries, or feedback. (e.g., "Ticket: Cannot find export button", "Search: how to cancel subscription").
- Output strictly valid JSON.
`;

export async function generateProductData(description: string): Promise<ProductConfig> {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `Generate a Product Value Space configuration for this product: "${description}".`,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          productName: { type: Type.STRING },
          jobs: { type: Type.ARRAY, items: { type: Type.STRING } },
          segments: { type: Type.ARRAY, items: { type: Type.STRING } },
          contexts: { type: Type.ARRAY, items: { type: Type.STRING } },
          clusters: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                journeyStage: { type: Type.STRING, enum: Object.values(JourneyStage) },
                impactWeight: { type: Type.NUMBER },
                templates: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ["name", "journeyStage", "impactWeight", "templates"]
            }
          }
        },
        required: ["productName", "jobs", "segments", "contexts", "clusters"]
      }
    }
  });

  if (!response.text) {
    throw new Error("No response from Gemini");
  }

  try {
    return JSON.parse(response.text) as ProductConfig;
  } catch (e) {
    console.error("Failed to parse Gemini response", e);
    throw new Error("Failed to parse generated data");
  }
}