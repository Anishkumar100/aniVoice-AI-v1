import { generateAIResponse } from "../config/ai.js";
import Character from "../models/Character.js";
import User from "../models/User.js";

/*
Chat with Character
POST /api/chat
*/
export const chatWithCharacter = async (req, res) => {
    try {
        const { characterId, message } = req.body;
        const userId = req.user._id; 

        // 1. Find Character
        const character = await Character.findById(characterId).select('+systemPrompt');
        if (!character) return res.status(404).json({ message: "Character not found" });

        // 2. Check Premium for both character and our user
        const user = await User.findById(userId);
        if (character.isPremium && !user.isProMember()) {
            return res.status(403).json({ message: "Premium Character. Upgrade to Pro." });
        }

        // 3. Construct Prompt
        const contents = `
        System Instruction: ${character.systemPrompt}
        User: ${message}
        `;

        // 4. Generate Response
        const responseText = await generateAIResponse(contents);

        console.log('🧠 AI Response generated:', {
            character: character.name,
            responseLength: responseText.length,
            preview: responseText.substring(0, 100)
        });

        // 5. ✅ FIX: Change 'response' to 'reply'
        res.json({ reply: responseText });

    } catch (error) {
        console.error("❌ Chat Error:", error);
        res.status(500).json({ message: "Failed to generate response" });
    }
};
