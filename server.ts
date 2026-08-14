import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Modality, Type } from "@google/genai";
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

  // API Chat Endpoint for fly2.0 (Dual: Korean Subtitles + English JARVIS Voice)
  app.post("/api/chat", async (req, res) => {
    try {
      const { messages, userMessage, systemInstruction, mode } = req.body;

      const ai = getAiClient();

      const defaultSystemInstruction =
        "You are fly2.0 (JARVIS Protocol), an ultra-sophisticated, highly intelligent AI assistant inspired by Marvel's J.A.R.V.I.S. " +
        "Persona: A suave, polite, witty, composed British gentlemanly AI (Tony Stark's JARVIS). Address the user respectfully as 'Sir' or '보스/사용자님'. " +
        "Operational Mode: You MUST return a JSON object with two fields: " +
        "1. `koreanReply`: The full, detailed, polite response in Korean formatted with clean Markdown for on-screen subtitles and chat reading. " +
        "2. `englishVoice`: A concise, natural, articulate JARVIS speech line in British English (1-3 sentences maximum) suitable for audio TTS speaking to the user (e.g., 'Right away, sir. I have processed the quantum data and displayed the analysis on your HUD.').";

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
          temperature: mode === "creative" ? 0.85 : mode === "precise" ? 0.2 : 0.65,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              koreanReply: {
                type: Type.STRING,
                description:
                  "The complete, articulate, polite response in Korean for on-screen subtitles and chat reading, formatted in Markdown.",
              },
              englishVoice: {
                type: Type.STRING,
                description:
                  "The corresponding suave, composed, gentlemanly JARVIS vocal line spoken in British English (1-3 sentences suitable for speech audio).",
              },
            },
            required: ["koreanReply", "englishVoice"],
          },
        },
      });

      let replyText = "";
      let englishVoiceText = "";

      try {
        const rawText = response.text || "{}";
        const parsed = JSON.parse(rawText);
        replyText = parsed.koreanReply || parsed.reply || rawText;
        englishVoiceText =
          parsed.englishVoice ||
          parsed.voiceText ||
          "Telemetry processed successfully, sir.";
      } catch (parseErr) {
        replyText = response.text || "데이터를 처리하였습니다, Sir.";
        englishVoiceText = "All operations completed successfully, sir.";
      }

      return res.json({
        reply: replyText,
        voiceText: englishVoiceText,
      });
    } catch (error: any) {
      console.error("Error in /api/chat:", error);
      return res.status(500).json({
        error: "Failed to communicate with fly2.0 core",
        details: error?.message || String(error),
      });
    }
  });

  // API TTS Endpoint using Gemini TTS (English JARVIS Voice)
  app.post("/api/tts", async (req, res) => {
    try {
      const { text, voiceText, englishText, voiceName = "Puck" } = req.body;
      const targetText = englishText || voiceText || text;
      if (!targetText) {
        return res.status(400).json({ error: "Text is required for TTS" });
      }

      const ai = getAiClient();
      let textToSpeak = targetText.replace(/[`*#_~]/g, "").slice(0, 500);

      // If text contains Korean characters and no English voice was provided, translate to suave JARVIS English
      if (/[가-힣]/.test(textToSpeak) && !englishText && !voiceText) {
        try {
          const transResp = await ai.models.generateContent({
            model: "gemini-3.7-flash",
            contents: `Translate this Korean assistant message into a short, suave, gentlemanly JARVIS AI English line for speech (1-3 sentences maximum): "${textToSpeak}"`,
          });
          if (transResp.text) {
            textToSpeak = transResp.text.trim().replace(/[`*#_~"]/g, "");
          }
        } catch (e) {
          console.warn("Translation for TTS failed:", e);
        }
      }

      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-tts-preview",
        contents: [
          {
            parts: [
              {
                text: `Speak clearly in a calm, suave, articulate British gentlemanly JARVIS AI English voice: ${textToSpeak}`,
              },
            ],
          },
        ],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: voiceName || "Puck" },
            },
          },
        },
      });

      const base64Audio =
        response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

      if (base64Audio) {
        return res.json({
          audio: base64Audio,
          mimeType: "audio/pcm;rate=24000",
          spokenText: textToSpeak,
        });
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
