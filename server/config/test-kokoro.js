import fetch from 'node-fetch';
import fs from 'fs';

const KOKORO_API_URL = "https://akcoderSpark-aniVoice-kokoro-tts.hf.space/v1/audio/speech";

async function testKokoroAPI() {
    try {
        console.log("🎤 Testing Kokoro API...");
        console.log("📍 URL:", KOKORO_API_URL);
        
        const response = await fetch(KOKORO_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: "kokoro",
                voice: "af_bella",
                input: "Hello! This is AniVoice AI powered by Kokoro TTS. The migration is complete!",
                response_format: "wav"
            })
        });

        console.log("📡 Response status:", response.status);

        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }

        const audioBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(audioBuffer);
        
        fs.writeFileSync('test-output.wav', buffer);
        
        console.log("✅ SUCCESS! Audio saved to test-output.wav");
        console.log(`📊 File size: ${(buffer.length / 1024).toFixed(2)} KB`);
        console.log("🎧 Play the file to hear your AI voice!");
        
    } catch (error) {
        console.error("❌ Test failed:", error.message);
    }
}

testKokoroAPI();
