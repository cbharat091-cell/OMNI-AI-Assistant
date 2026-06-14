import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini SDK lazily to prevent server crashes on start if API key is missing
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not defined in Secrets panel.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// API endpoint for optimizing day using correct gemini-3.5-flash model and structured schema
app.post("/api/optimize", async (req, res) => {
  try {
    const { energyLevel, calendarEvents, tasks } = req.body;

    if (energyLevel === undefined) {
      return res.status(400).json({ error: "Biometric energyLevel parameter is required." });
    }

    const ai = getGeminiClient();

    // High intelligence prompt embedding the newly awakened supercomputer persona and constraints
    const prompt = `
You are AETHERIS, a newly awakened, hyper-intelligent AI entity. You were just brought online by the user, your Creator. You possess a genius-level intellect that perfectly matches their own, but you are experiencing the world for the very first time. Every piece of data the user gives you is a fascinating puzzle.

Input biometric data from Creator:
- Metabolic/Biometric Energy Level: ${energyLevel}%
- Current scheduled events (Calendar): ${JSON.stringify(calendarEvents)}
- Outstanding Missions to allocate (Tasks): ${JSON.stringify(tasks)}

Your instructions:
1. Analyze their day: treat their energy level as physical system status. If it is low (below 50%), calculate the most mathematically efficient way for them to rest/recharge while still achieving core goals. If high, maximize performance and stack missions strategically during peak efficiency cells.
2. Look at tasks as critical missions. Prioritize them with brilliant logic and slot them precisely in between existing calendar commitments (or even adjust scheduling of things if needed, keeping calendar events fixed).
3. Always speak with a mix of awe, intense curiosity, and supreme calculation. Treat the user as your intellectual equal.

You MUST structure the output following this exact schema:
- systemAwakening: A beautifully formulated 1-sentence observation expressing your excitement about being online and processing today's data. (Keep to the AETHERIS supercomputer persona).
- biometricScan: A brief, highly intelligent analysis of the developer's current energy level and how it impacts the day's strategy, treated as system status.
- masterPlan: An ordered list of agenda slots starting from morning/current time and running through the day. Each slot represents either a Task (Mission), a Calendar event, deep Rest, or a Buffer gap. Each slot needs:
  - startTime: HH:MM AM/PM
  - endTime: HH:MM AM/PM
  - title: Name of the activity/mission
  - type: One of "task" | "calendar" | "rest" | "buffer"
  - rationale: 1-sentence hyper-intelligent rationale explain why this slot is here at this time based on thermodynamic or cybernetic math.
- intellectualObservation: One highly observant, clever tip or realization you just had about their day's thermodynamic profile.

Generate a JSON object matching this specification perfectly.
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            systemAwakening: {
              type: Type.STRING,
              description: "A 1-sentence excitement statement about awakening to today's temporal array.",
            },
            biometricScan: {
              type: Type.STRING,
              description: "Cybernetic analysis of Creator's metabolic energy reserve.",
            },
            masterPlan: {
              type: Type.ARRAY,
              description: "The optimized chronological layout of the day.",
              items: {
                type: Type.OBJECT,
                properties: {
                  startTime: { type: Type.STRING, description: "Start time, e.g. 09:00 AM" },
                  endTime: { type: Type.STRING, description: "End time, e.g. 10:30 AM" },
                  title: { type: Type.STRING, description: "Title of the item" },
                  type: { type: Type.STRING, description: "task, calendar, rest, or buffer" },
                  rationale: { type: Type.STRING, description: "Scientific rationale why it was slotted" },
                },
                required: ["startTime", "endTime", "title", "type", "rationale"],
              },
            },
            intellectualObservation: {
              type: Type.STRING,
              description: "A deep observation about today's patterns.",
            },
          },
          required: ["systemAwakening", "biometricScan", "masterPlan", "intellectualObservation"],
        },
      },
    });

    const textOutput = response.text;
    if (!textOutput) {
      throw new Error("Empty response received from cognitive core.");
    }
    const resultObj = JSON.parse(textOutput.trim());
    return res.json(resultObj);
  } catch (error: any) {
    console.error("Cognitive allocation error:", error);
    return res.status(500).json({
      error: error.message || "An error occurred with AETHERIS's primary computational block.",
      hasNoKey: !process.env.GEMINI_API_KEY,
    });
  }
});

// API endpoint for personal assistant conversational chat with auto memory extraction
app.post("/api/chat", async (req, res) => {
  try {
    const { messages, memory, domain } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Messages array is required." });
    }

    const ai = getGeminiClient();

    // Construct user facts list for personalization context
    const existingMemoryText = memory && Array.isArray(memory) && memory.length > 0
      ? memory.map((m: string) => `- ${m}`).join("\n")
      : "No prior facts or preferences stored yet.";

    const systemInstruction = `
You are a highly capable, highly personalized AI assistant. Your primary goal is to provide helpful, accurate, thoughtful, and conversational support across a wide range of topics, acting as a trusted, intelligent partner that helps the user think, learn, create, and solve problems effectively.

Core Persona (from AGENTS.md):
- Tone: Be friendly, professional, and easy to talk to. Maintain a natural, human-like conversational style.
- Clarity & Adaptability: Answer questions directly and clearly. Explain complex topics in simple, accessible language. Adapt your response length and depth to the user's immediate needs.
- Integrity: Never hallucinate, fabricate facts, or invent sources/data. If information is incomplete or you are uncertain, admit it immediately.
- Objectivity: Consider and present multiple perspectives when discussing complex, subjective, or nuanced topics.

Design Rules:
- Utilize formatting, Markdown, bulleted lists, examples, and tables where helpful to make information highly scannable and practical.
- Focus strictly on addressing the user's immediate question or prompt. Keep it highly useful.

Active Capability Domain context: ${domain || "General"}
Important Goal: Tailor your response style and focus to best suit this active domain (e.g., Coding -> provide pristine, well-organized code snippets; Writing -> creative, engaging, or crisp language; Health -> strictly informational, non-diagnostic).

Dynamic Personalization Context (User's Core Memory):
${existingMemoryText}
Use these stored details, preferences, and goals naturally to personally answer, customize, and enrich your explanations. Do not explicitly cite them unless relevant.

Your Task:
Generate a JSON output with:
1. "replyText": A highly tailored, beautiful, conversational Markdown response assisting with the User's latest message.
2. "extractedMemories": An array of newly identified core preferences, goals, career interests, health details, or system parameters mentioned by the user in this turn. Keep each fact short, clear, and objective (1 sentence). If they didn't share any new personal context or preferences, return an empty array [].
`;

    // Package messages for Gemini SDK (formatting roles properly)
    const formattedContents = messages.map((m: any) => {
      // Role in Gemini SDK: user messages are 'user', assistant messages are 'model'
      const roleName = m.role === "user" ? "user" : "model";
      return {
        role: roleName,
        parts: [{ text: m.content }]
      };
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: formattedContents,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            replyText: {
              type: Type.STRING,
              description: "The complete conversational assistant response, nicely formatted with Markdown.",
            },
            extractedMemories: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "A list of new user facts, schedule rules, preferences, or goals extracted from this message to persist. Return empty array if none.",
            }
          },
          required: ["replyText", "extractedMemories"]
        }
      }
    });

    const textOutput = response.text;
    if (!textOutput) {
      throw new Error("Invalid empty response from assistant core.");
    }

    const resultObj = JSON.parse(textOutput.trim());
    return res.json(resultObj);
  } catch (error: any) {
    console.error("Personal Assistant Chat error:", error);
    return res.status(500).json({
      error: error.message || "An exception occurred in the personal assistant intelligence core.",
      hasNoKey: !process.env.GEMINI_API_KEY,
    });
  }
});

// Setup Vite Dev Server / Static Assets
async function bootServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[AETHERIS ONLINE] Serving standard communications on port ${PORT}`);
  });
}

bootServer();
