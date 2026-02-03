import Character from "../models/Character.js";
import cloudinary from "../config/cloudinary.js"; // Import your config
import { AVAILABLE_VOICES } from "../config/voiceOptions.js"; // 👈 Import validation list

/*
Create Character + Upload to Cloudinary
POST /api/characters
*/

export const createCharacter = async (req, res) => {
    try {
        const { name, description, systemPrompt, isPremium, voiceId, category } = req.body;
        const file = req.file; // ✅ Back to req.file (not req.files)

        // Validation
        if (!name || !description || !systemPrompt || !file) {
            return res.status(400).json({ message: "All fields (including Image) are required" });
        }

        // Convert Buffer to Base64
        const b64 = Buffer.from(file.buffer).toString("base64");
        const dataURI = "data:" + file.mimetype + ";base64," + b64;

        // Upload to Cloudinary
        const uploadResponse = await cloudinary.uploader.upload(dataURI, {
            folder: "ai_characters",
            resource_type: "auto"
        });

        // Validate voiceId
        if(voiceId) {
            const validVoiceIds = AVAILABLE_VOICES.map(v => v.id);
            if (!validVoiceIds.includes(voiceId)) {
                return res.status(400).json({ message: "Invalid voiceId provided" });
            }
        }

        // Validate category
        const validCategories = ['Anime', 'Game', 'Movie', 'Celebrity', 'Original'];
        if (category && !validCategories.includes(category)) {
            return res.status(400).json({ 
                message: "Invalid category. Must be one of: Anime, Game, Movie, Celebrity, Original" 
            });
        }

        // Save to Database
        const newCharacter = await Character.create({
            name,
            description,
            systemPrompt,
            avatar: uploadResponse.secure_url,
            isPremium: isPremium || false,
            voiceId: voiceId || "af_bella",
            category: category || "Original"
        });

        res.status(201).json(newCharacter);

    } catch (error) {
        console.error("Error creating character:", error);
        res.status(500).json({ message: "Failed to create character" });
    }
};


/*
Get All Characters
GET /api/characters
*/
export const getAllCharacters = async (req, res) => {
    try {
        const characters = await Character.find({});
        res.json(characters);
    } catch (error) {
        console.error("Error fetching characters:", error);
        res.status(500).json({ message: "Server Error" });
    }
};



/*
Update Character
PUT /api/characters/:id
*/
export const updateCharacter = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, systemPrompt, isPremium, voiceId, category } = req.body; // 🆕 Added category
        const file = req.file;

        // 1. Find existing character
        const character = await Character.findById(id);
        if (!character) {
            return res.status(404).json({ message: "Character not found" });
        }

        // 2. Validate voiceId if provided
        if (voiceId) {
            const validVoiceIds = AVAILABLE_VOICES.map(v => v.id);
            if (!validVoiceIds.includes(voiceId)) {
                return res.status(400).json({ message: "Invalid voiceId provided" });
            }
        }

        // 🆕 3. Validate category if provided
        const validCategories = ['Anime', 'Game', 'Movie', 'Celebrity', 'Original'];
        if (category && !validCategories.includes(category)) {
            return res.status(400).json({ message: "Invalid category. Must be one of: Anime, Game, Movie, Celebrity, Original" });
        }

        // 4. Handle new avatar upload (optional)
        let avatarUrl = character.avatar;
        
        if (file) {
            const b64 = Buffer.from(file.buffer).toString("base64");
            const dataURI = "data:" + file.mimetype + ";base64," + b64;

            const uploadResponse = await cloudinary.uploader.upload(dataURI, {
                folder: "ai_characters",
                resource_type: "auto"
            });

            avatarUrl = uploadResponse.secure_url;
        }

        // 5. Update character
        const updatedCharacter = await Character.findByIdAndUpdate(
            id,
            {
                name: name || character.name,
                description: description || character.description,
                systemPrompt: systemPrompt || character.systemPrompt,
                avatar: avatarUrl,
                isPremium: isPremium !== undefined ? isPremium : character.isPremium,
                voiceId: voiceId || character.voiceId,
                category: category || character.category // 🆕 Added category
            },
            { new: true, runValidators: true }
        );

        res.json(updatedCharacter);

    } catch (error) {
        console.error("Error updating character:", error);
        res.status(500).json({ message: "Failed to update character" });
    }
};




/*
Delete Character
DELETE /api/characters/:id
*/
export const deleteCharacter = async (req, res) => {
    try {
        const { id } = req.params;

        // 1. Find character
        const character = await Character.findById(id);
        if (!character) {
            return res.status(404).json({ message: "Character not found" });
        }

        // 2. Optional: Delete image from Cloudinary
        try {
            // Extract public_id from Cloudinary URL
            // Example URL: https://res.cloudinary.com/xxx/image/upload/v123/ai_characters/abc123.jpg
            const publicId = character.avatar
                .split('/')
                .slice(-2)
                .join('/')
                .split('.')[0]; // Gets "ai_characters/abc123"
            
            await cloudinary.uploader.destroy(publicId);
            console.log('✅ Deleted image from Cloudinary:', publicId);
        } catch (cloudinaryError) {
            console.log('⚠️ Could not delete image from Cloudinary:', cloudinaryError.message);
            // Continue anyway - don't fail the delete operation
        }

        // 3. Delete from database
        await Character.findByIdAndDelete(id);

        res.json({ message: "Character deleted successfully" });

    } catch (error) {
        console.error("Error deleting character:", error);
        res.status(500).json({ message: "Failed to delete character" });
    }
};


/*
Get Single Character by ID
GET /api/characters/:id
*/
export const getCharacterById = async (req, res) => {
    try {
        const { id } = req.params;
        
        const character = await Character.findById(id).select('+systemPrompt'); // Include systemPrompt
        if (!character) {
            return res.status(404).json({ message: "Character not found" });
        }

        res.json(character);

    } catch (error) {
        console.error("Error fetching character:", error);
        res.status(500).json({ message: "Server Error" });
    }
};


/*
Get Characters by Category
GET /api/characters/category/:category
*/
export const getCharactersByCategory = async (req, res) => {
    try {
        const { category } = req.params;
        
        // Validate category
        const validCategories = ['Anime', 'Game', 'Movie', 'Celebrity', 'Original'];
        if (!validCategories.includes(category)) {
            return res.status(400).json({ message: "Invalid category" });
        }

        const characters = await Character.find({ category });
        res.json(characters);

    } catch (error) {
        console.error("Error fetching characters by category:", error);
        res.status(500).json({ message: "Server Error" });
    }
};
