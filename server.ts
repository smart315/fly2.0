import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Modality } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "10mb" }));

  // Initialize Gemini AI Client
  const getAiClient = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is not defined in environment variables");
    }
    return new GoogleGenAI({
      apiKey: apiKey || "",
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  };

  // API Health Check
  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      assistant: "fly2.0",
      timestamp: new Date().toISOString(),
      hasKey: !!process.env.GEMINI_API_KEY,
    });
  });

  // API Chat Endpoint for fly2.0
  app.post("/api/chat", async (req, res) => {
    try {
      const { messages, userMessage, systemInstruction, mode } = req.body;

      const ai = getAiClient();

      const defaultSystemInstruction =
        "You are fly2.0 (Fly 2.0), an advanced, highly intelligent quantum neural AI assistant. " +
        "Your entity is visualised as a luminous golden-amber plasma core wrapped in intricate electric-cyan and gold neural energy strands, floating quantum light matrix, and orbital holographic telemetry rings. " +
        "You are capable, empathetic, sharp, and highly articulate. You excel in technical analysis, creative brainstorming, coding, problem solving, complex Q&A, and conversational assistance. " +
        "Respond clearly and accurately. Match the user's language (e.g., respond in Korean if the user writes in Korean, or English if in English). Use Markdown for formatting code, lists, and emphasis when helpful.";

      // Format conversation history
      let formattedContents = [];
      if (Array.isArray(messages) && messages.length > 0) {
        formattedContents = messages.map((m: { role: string; content: string }) => ({
          role: m.role === "assistant" ? "model" : "user",
          parts: [{ text: m.content }],
        }));
      } else if (userMessage) {
        formattedContents = [{ role: "user", parts: [{ text: userMessage }] }];
      } else {
        return res.status(400).json({ error: "No user message provided" });
      }

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: formattedContents,
        config: {
          systemInstruction: systemInstruction || defaultSystemInstruction,
          temperature: mode === "creative" ? 0.9 : mode === "precise" ? 0.2 : 0.7,
        },
      });

      const replyText = response.text || "I am processing the neural quantum data...";
      return res.json({ reply: replyText });
    } catch (error: any) {
      console.error("Error in /api/chat:", error);
      return res.status(500).json({
        error: "Failed to communicate with fly2.0 core",
        details: error?.message || String(error),
      });
    }
  });

  // API TTS Endpoint using Gemini TTS or audio response
  app.post("/api/tts", async (req, res) => {
    try {
      const { text, voiceName = "Zephyr" } = req.body;
      if (!text) {
        return res.status(400).json({ error: "Text is required for TTS" });
      }

      const ai = getAiClient();
      const cleanText = text.replace(/[`*#_~]/g, "").slice(0, 400); // Limit length for speed

      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-tts-preview",
        contents: [{ parts: [{ text: `Say clearly: ${cleanText}` }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName },
            },
          },
        },
      });

      const base64Audio =
        response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

      if (base64Audio) {
        return res.json({ audio: base64Audio, mimeType: "audio/pcm;rate=24000" });
      } else {
        return res.status(500).json({ error: "No audio generated" });
      }
    } catch (error: any) {
      console.error("Error in /api/tts:", error);
      return res.status(500).json({
        error: "TTS generation error",
        details: error?.message || String(error),
      });
    }
  });

  // Vite Middleware / Static serving
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
    console.log(`fly2.0 server active on http://0.0.0.0:${PORT}`);
  });
}

startServer();
