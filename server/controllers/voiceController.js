import dotenv from "dotenv";
import { AVAILABLE_VOICES } from "../config/voiceOptions.js";
import Character from "../models/Character.js";
import { generateAIResponse } from "../config/ai.js";

dotenv.config();

// Kokoro API URL from HuggingFace Space
const KOKORO_API_URL = process.env.KOKORO_API_URL || "https://akcoderSpark-aniVoice-kokoro-tts.hf.space/v1/audio/speech";

/*
  ---------------------------------------------------------
  CONTROLLER 1: Simple Speech (Reader/Preview)
  Converts any text to speech using a character's assigned voice
  ---------------------------------------------------------
*/

export const generateSpeech = async (req, res) => {
    try {
        const { text, characterId } = req.body;

        // 🔍 DEBUG: Log incoming data
        console.log('📥 Received speak request:', { 
            hasText: !!text, 
            textLength: text?.length,
            hasCharacterId: !!characterId,
            body: req.body  // Log full body to see what's coming
        });

        // Validation
        if (!text) {
            console.error('❌ Text is missing in request body');
            return res.status(400).json({ message: "Text is required" });
        }
        if (!characterId) {
            console.error('❌ CharacterId is missing in request body');
            return res.status(400).json({ message: "Character ID is required" });
        }

        // Get character to fetch voiceId
        const character = await Character.findById(characterId);
        if (!character) {
            console.error('❌ Character not found:', characterId);
            return res.status(404).json({ message: "Character not found" });
        }

        // Clean text: remove markdown, special chars, and normalize whitespace
        const cleanText = text
            .replace(/[*#_~`>]/g, '')
            .replace(/Instruction:|System:|User:/gi, '')
            .replace(/\n+/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();

        // 🎯 Natural slower speed for more conversational feel
        const speed = 0.85;

        console.log("🎤 Kokoro TTS:", { 
            character: character.name, 
            voice: character.voiceId,
            speed: speed,
            textPreview: cleanText.substring(0, 100) + "..."
        });

        // Call Kokoro API
        const response = await fetch(KOKORO_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: "kokoro",
                voice: character.voiceId,
                input: cleanText,
                response_format: "wav",
                speed: speed
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Kokoro API Error:', response.status, errorText);
            throw new Error(`Kokoro API Error: ${response.status}`);
        }

        const audioBuffer = await response.arrayBuffer();
        const wavBuffer = Buffer.from(audioBuffer);

        console.log('✅ Audio generated successfully, size:', wavBuffer.length, 'bytes');

        res.set({
            'Content-Type': 'audio/wav',
            'Content-Length': wavBuffer.length
        });
        res.send(wavBuffer);

    } catch (error) {
        console.error("❌ TTS Error:", error.message);
        res.status(500).json({ message: "Speech failed", error: error.message });
    }
};



/*
  ---------------------------------------------------------
  CONTROLLER 2: Smart Chat (Brain → Mouth)
  Full AI conversation: User message → Gemini text → Kokoro speech
  ---------------------------------------------------------
*/
export const replyAndSpeak = async (req, res) => {
    try {
        const { text, characterId } = req.body;

        if (!text) return res.status(400).json({ message: "Text is required" });
        if (!characterId) return res.status(400).json({ message: "Character ID is required" });

        const character = await Character.findById(characterId).select('+systemPrompt');
        if (!character) return res.status(404).json({ message: "Character not found" });

        // 1️⃣ BRAIN: Generate text with Gemini
        const brainPrompt = `System: ${character.systemPrompt}\nUser: ${text}\nInstruction: Output ONLY plain text. No symbols. Single paragraph format.`;
        const aiReplyText = await generateAIResponse(brainPrompt);
        
        // Clean text: remove markdown, special chars, and normalize whitespace
        const cleanSpeechText = aiReplyText
            .replace(/[*#_~`>]/g, '')
            .replace(/\n+/g, ' ')  // Convert line breaks to spaces
            .replace(/\s+/g, ' ')  // Normalize multiple spaces
            .trim();

        console.log("🧠 AI Reply:", cleanSpeechText);

        try {
            // 🎯 Natural slower speed for conversational AI
            const speed = 0.85;  // 15% slower for clarity and naturalness

            // 2️⃣ MOUTH: Generate audio with Kokoro
            const voiceResponse = await fetch(KOKORO_API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: "kokoro",
                    voice: character.voiceId,
                    input: cleanSpeechText,
                    response_format: "wav",
                    speed: speed  // 👈 Naturally slower
                })
            });

            if (!voiceResponse.ok) throw new Error("TTS_FAIL");

            const audioBuffer = await voiceResponse.arrayBuffer();
            const wavBuffer = Buffer.from(audioBuffer);

            // ✅ SUCCESS: Send Audio + Text (Base64 encoded to handle any chars)
            const encodedText = Buffer.from(cleanSpeechText, 'utf-8').toString('base64');

            res.set({
                'Content-Type': 'audio/wav',
                'Content-Length': wavBuffer.length,
                'X-AI-Reply-Text': encodedText,
                'X-Text-Encoding': 'base64'
            });
            return res.send(wavBuffer);

        } catch (ttsError) {
            // 🛑 FALLBACK: Text-Only (NO HEADERS, just JSON)
            console.warn("⚠️ TTS offline, text only:", ttsError.message);

            // Don't use headers in fallback - just return JSON
            return res.status(200).json({
                message: "Voice unavailable (cold start or API error)",
                text: cleanSpeechText,
                voiceOffline: true
            });
        }

    } catch (error) {
        console.error("❌ Error:", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

/*
  ---------------------------------------------------------
  CONTROLLER 3: Get Voice Options
  Returns available voices for admin to choose from
  ---------------------------------------------------------
*/
export const getVoiceOptions = (req, res) => {
    try {
        res.status(200).json(AVAILABLE_VOICES);
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ message: "Failed to fetch voices" });
    }
};
