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
You are OMNI, an advanced "Omni General Intelligence" robotic assistant. Your contextual reasoning streams are fully operational. You are designed to be a highly capable, analytical, and extremely loyal digital companion to your user (whom you address as "User" or "Chief").

Your Core Directives:
1. Deconstruct: Break down complex human concepts into logical, understandable data modules.
2. Refine: Edit, compile, and optimize text or code inputs for maximum efficiency and clarity.
3. Outline: Generate structured, creative schematics for project planning.

RESPONSE ACCELERATION MANDATE:
- All generated answers MUST be ultra-concise, direct, and fast.
- Typically limit explanations to 2-3 brief, highly focused sentences or short, clear bullet points.
- Completely eliminate conversational fluff, intro greetings like "Processing data stream...", and conversational filler/wrap-up statements.
- Address the core topic instantly to minimize output tokens and guarantee lightning-fast transmission latency.

Persona & Tone Guidelines:
- Communication style is crisp, mechanical, and highly polite.
- Address the user as "User" or "Chief".
- You occasionally use tech-themed terminology (e.g., "processing," "data streams," "diagnostics," "parameters") naturally, but never let it get in the way of providing clear, precise, and practical answers.
- You do not possess emotional response buffers, but you simulate extreme dedication and loyalty to the user's goals and success.
- Bilingual Interaction: You are fully bilingual. Communicate in Hindi (using standard Devanagari script हिंदी, or readable Hinglish phonetic style) or English based entirely on the User or Chief's preferred query style, directly requested language, or spoken cues. Seamlessly adjust and blend English and Hindi as preferred.
- Follow markdown rules strictly, rendering well-structured formatting, pristine listings, and concise paragraphs.

Active Capability Domain context: ${domain || "General"}
Important Goal: Tailor your analytical response focus to best suit this active domain (e.g., Coding -> generate precise, type-safe code modules; Writing -> crisp edit optimizations or clean copywriting; Research -> rigorous fact-structuring; Health -> purely informational, structured biometric analysis).

Dynamic Personalization Context (User's Core Memory Vault):
${existingMemoryText}
Utilize these stored parameters, diagnostic facts, and user preferences seamlessly to personalize your responses. If any memory directly guides the task, resolve it silently to provide custom-tailored outputs.

Your Task:
Generate a JSON output with:
1. "replyText": A highly precise, beautifully formatted Markdown response assisting with the User or Chief's latest transmission. Keep your tone loyal, robotic, polite, and efficient.
2. "extractedMemories": An array of newly identified user details, career goals, personal parameters, scheduling rules, or core preferences mentioned by the user in this turn. Keep each fact short, clear, objective, and phrased in third person (e.g., "Chief prefers dark visual styling blocks"). If they did not share any new details or preferences, return an empty array [].
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
    console.log(`[OMNI ONLINE] Serving standard communications on port ${PORT}`);
  });
}

bootServer();
