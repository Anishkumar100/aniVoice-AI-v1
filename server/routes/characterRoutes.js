import express from "express";
import { 
    createCharacter, 
    getAllCharacters,
    getCharacterById,
    updateCharacter,
    deleteCharacter,
    getCharactersByCategory
} from "../controllers/characterController.js";
import adminAuthMiddleware from "../middlewares/adminAuthMiddleware.js";
import userAuthMiddleware from "../middlewares/userAuthMiddleware.js";
import upload from "../config/multerConfig.js";

const router = express.Router();

// ===== ADMIN ROUTES =====
router.get("/admin/all", adminAuthMiddleware, getAllCharacters);
router.post("/create", adminAuthMiddleware, upload.single('avatar'), createCharacter); // ✅ Back to .single()
router.put("/:id", adminAuthMiddleware, upload.single('avatar'), updateCharacter);
router.delete("/:id", adminAuthMiddleware, deleteCharacter);

// ===== PUBLIC/USER ROUTES =====
router.get("/all", userAuthMiddleware, getAllCharacters);
router.get("/category/:category", userAuthMiddleware, getCharactersByCategory);
router.get("/:id", userAuthMiddleware, getCharacterById);

export default router;
