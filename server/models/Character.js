import mongoose from "mongoose";

const characterSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true 
    },
    description: { 
        type: String, 
        required: true 
    },
    systemPrompt: { 
        type: String, 
        required: true,
        select: false
    },
   
    // 🆕 ADD THIS - Category field
    category: {
        type: String,
        enum: ['Anime', 'Game', 'Movie', 'Celebrity', 'Original'],
        default: 'Original'
    },

    // Kokoro Voice ID (e.g., "af_bella", "am_adam")
    voiceId: {
        type: String,
        required: true,
        default: "af_bella" // 👈 Kokoro default
    },

    avatar: { 
        type: String, 
        required: true 
    },

    isPremium: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

const Character = mongoose.model("Character", characterSchema);
export default Character;
