import express from "express";
import {
    getUsersForSidebar,
    getMessages,
    sendMessage,
    deleteMessageForMe,
    deleteMessageForEveryone
} from "../controllers/message.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/users", protectRoute, getUsersForSidebar);
router.get("/:id", protectRoute, getMessages);
router.post("/send/:id", protectRoute, sendMessage);
router.delete("/delete-for-me/:messageId", protectRoute, deleteMessageForMe);
router.delete("/delete-for-everyone/:messageId", protectRoute, deleteMessageForEveryone);

export default router;