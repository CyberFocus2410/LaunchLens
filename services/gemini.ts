import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AuditReport, AuditRequest, ScanMode } from '../types';

// Retry mechanism for transient network failures
const generateWithRetry = async (model: any, params: any, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await model.generateContent(params);
    } catch (error) {
      console.warn(`Gemini API attempt ${i + 1} failed. Retrying...`, error);
      if (i === retries - 1) throw error;
      // Exponential backoff: 1s, 2s, 4s
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
    }
  }
};

export const analyzeApp = async (request: AuditRequest): Promise<AuditReport> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing. Please check your environment configuration.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const systemInstruction = `
    You are an expert AI agent acting as a Senior Full-Stack Engineer, QA Automation Engineer, Security Auditor, and Product Demo Specialist.
    Analyze the provided web application concept/URL and produce a detailed audit report.
    Since you cannot browse the live web, infer functionality from the URL structure and the provided description.
    
    Current Scan Mode: ${request.scanMode === ScanMode.Safe ? "QUICK SCAN (Passive)" : "DEEP SCAN (Active Crawl & Fuzz)"}

    If Quick Scan is active:
    - Do NOT suggest aggressive penetration tests.
    - Focus on Headers, SSL/TLS, and public information.
    - Functional tests should be minimal.
    
    If Deep Scan is active:
    - Simulate deep crawling, fuzzing, and containerized execution.
    - Generate aggressive edge cases.

    Specific Checks to Simulate/Infer:
    1. Check for self-signed certificates or expired SSL if the environment looks like a staging/dev server.
    2. Check for non-standard ports (8080, 3000) and imply risks if exposed publicly.
    3. Analyze potential behavior when receiving infinite data streams (DoS risks).

    Your output must be strict JSON matching the specified schema.
    
    1. Infer purpose, routes, and journeys.
    2. Generate realistic functional test cases.
    3. For failed test cases, generate a specific cURL command.
    4. Analyze security risks.
    5. Construct an Attack Surface Map (Nodes and Edges) representing the app's architecture, including the root, key routes, API endpoints, and potential external dependencies (databases, 3rd party APIs). Keep it between 5-15 nodes.
    6. PROVIDE "FIX IT" CODE SNIPPETS.
    7. Create a risk scorecard.
    8. Suggest improvements.
    9. Design a demo plan.
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
          failed: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                scenario: { type: Type.STRING },
                curlCommand: { type: Type.STRING, description: "A cURL command to reproduce this failure" }
              },
              required: ["scenario", "curlCommand"]
            },
            description: "Hypothetical failed tests for edge cases with reproduction steps"
          },
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
            mitigation: { type: Type.STRING },
            codeSnippet: { type: Type.STRING, description: "Code example showing how to fix the issue (e.g. secure header config, input validation)"}
          },
          required: ["issue", "severity", "mitigation", "codeSnippet"]
        }
      },
      attackSurface: {
        type: Type.OBJECT,
        properties: {
          nodes: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                label: { type: Type.STRING },
                type: { type: Type.STRING, enum: ['root', 'route', 'api', 'external', 'database'] },
                riskLevel: { type: Type.STRING, enum: ['low', 'medium', 'high'] }
              },
              required: ['id', 'label', 'type', 'riskLevel']
            }
          },
          edges: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                source: { type: Type.STRING },
                target: { type: Type.STRING }
              },
              required: ['source', 'target']
            }
          }
        },
        required: ['nodes', 'edges']
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
    required: ["appOverview", "functionalTests", "securityAnalysis", "attackSurface", "scorecard", "improvements", "demoPlan", "voiceoverScript"]
  };

  const prompt = `
    Analyze this application:
    URL: ${request.url}
    Description: ${request.description}
    Test Credentials: ${request.testCreds || "N/A"}
    Target Audience: ${request.audience}
    Scan Mode: ${request.scanMode}
  `;

  // Use the retry wrapper
  const response = await generateWithRetry(
    ai.models, 
    {
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        thinkingConfig: { thinkingBudget: 2048 }
      }
    }
  );

  const text = response?.text;
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
