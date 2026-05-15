import express from "express";
import { clerkWebhookHandler } from "../controllers/clerkWebhook.js";

const router = express.Router();

router.post("/clerk/webhook", express.raw({ type: "application/json" }), clerkWebhookHandler);

export default router;
