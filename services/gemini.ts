import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AuditReport, AuditRequest } from '../types';

export const analyzeApp = async (request: AuditRequest): Promise<AuditReport> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing. Please check your environment configuration.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const systemInstruction = `
    You are an expert AI agent acting as a Senior Full-Stack Engineer, QA Automation Engineer, Security Auditor, and Product Demo Specialist.
    Analyze the provided web application concept/URL and produce a detailed audit report.
    Since you cannot browse the live web, infer functionality from the URL structure and the provided description.
    
    Your output must be strict JSON matching the specified schema.
    
    1. Infer purpose, routes, and journeys.
    2. Generate realistic functional test cases (happy path vs edge cases).
    3. Analyze security risks (API keys, CORS, Auth).
    4. Create a risk scorecard (0-100).
    5. Suggest specific improvements.
    6. Design a demo video plan.
    7. Write a professional voiceover script.
  `;

  // Define the JSON Schema for the response
  const responseSchema: Schema = {
    type: Type.OBJECT,
    properties: {
      appOverview: {
        type: Type.OBJECT,
        properties: {
          purpose: { type: Type.STRING },
          routes: { type: Type.ARRAY, items: { type: Type.STRING } },
          userJourneys: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ["purpose", "routes", "userJourneys"]
      },
      functionalTests: {
        type: Type.OBJECT,
        properties: {
          passed: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Hypothetical passed tests for core flows" },
          failed: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Hypothetical failed tests for edge cases" },
          risky: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Risky user behaviors found" },
          suggested: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Recommended test cases to add" },
        },
         required: ["passed", "failed", "risky", "suggested"]
      },
      securityAnalysis: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            issue: { type: Type.STRING },
            severity: { type: Type.STRING, enum: ["Low", "Medium", "High", "Critical"] },
            mitigation: { type: Type.STRING }
          },
          required: ["issue", "severity", "mitigation"]
        }
      },
      scorecard: {
        type: Type.OBJECT,
        properties: {
          security: { type: Type.INTEGER },
          privacy: { type: Type.INTEGER },
          stability: { type: Type.INTEGER },
          bestPractices: { type: Type.INTEGER },
          productionReadiness: { type: Type.INTEGER },
          overallRisk: { type: Type.STRING, enum: ["Low", "Moderate", "High"] },
          explanation: { type: Type.STRING }
        },
        required: ["security", "privacy", "stability", "bestPractices", "productionReadiness", "overallRisk", "explanation"]
      },
      improvements: {
        type: Type.OBJECT,
        properties: {
          technical: { type: Type.ARRAY, items: { type: Type.STRING } },
          ux: { type: Type.ARRAY, items: { type: Type.STRING } },
          security: { type: Type.ARRAY, items: { type: Type.STRING } },
          performance: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ["technical", "ux", "security", "performance"]
      },
      demoPlan: {
        type: Type.OBJECT,
        properties: {
          objective: { type: Type.STRING },
          steps: { type: Type.ARRAY, items: { type: Type.STRING } },
          duration: { type: Type.STRING },
          highlight: { type: Type.STRING },
          avoid: { type: Type.STRING },
        },
        required: ["objective", "steps", "duration", "highlight", "avoid"]
      },
      voiceoverScript: { type: Type.STRING }
    },
    required: ["appOverview", "functionalTests", "securityAnalysis", "scorecard", "improvements", "demoPlan", "voiceoverScript"]
  };

  const prompt = `
    Analyze this application:
    URL: ${request.url}
    Description: ${request.description}
    Test Credentials: ${request.testCreds || "N/A"}
    Target Audience: ${request.audience}
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview', // Using Pro for deeper reasoning capabilities
    contents: prompt,
    config: {
      systemInstruction: systemInstruction,
      responseMimeType: "application/json",
      responseSchema: responseSchema,
      thinkingConfig: { thinkingBudget: 2048 } // Allow some budget for complex analysis
    }
  });

  const text = response.text;
  if (!text) {
    throw new Error("No response from AI");
  }

  try {
    return JSON.parse(text) as AuditReport;
  } catch (e) {
    console.error("Failed to parse AI response", text);
    throw new Error("AI response was not valid JSON");
  }
};
