// server/config/ai.js
import Groq from "groq-sdk";
import dotenv from "dotenv";

dotenv.config();

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

// Helper: Wait function for retries
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const generateAIResponse = async (prompt, retries = 2) => {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            console.log(`🚀 Groq API attempt ${attempt}/${retries}`);

            const completion = await groq.chat.completions.create({
                messages: [
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                model: "llama-3.3-70b-versatile",  // Best quality model
                temperature: 0.8,  // Natural conversational tone
                max_tokens: 1024,  // ~768 words per response
                top_p: 0.9,
                stream: false
            });

            const text = completion.choices[0].message.content;

            console.log('✅ Groq response:', {
                model: completion.model,
                tokens: completion.usage?.total_tokens,
                preview: text.substring(0, 100) + '...'
            });

            return text;

        } catch (error) {
            console.error(`❌ Groq Error (attempt ${attempt}/${retries}):`, error.message);

            // Retry on rate limit (rare with Groq)
            if (error.status === 429 && attempt < retries) {
                const delayMs = 1000 * attempt;
                console.log(`⏳ Rate limited, retrying in ${delayMs}ms...`);
                await wait(delayMs);
                continue;
            }

            // Last attempt failed
            if (attempt === retries) {
                throw error;
            }
        }
    }

    throw new Error('Groq API failed after all retries');
};
