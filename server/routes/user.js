import express from "express";
import { ClerkExpressWithAuth } from "@clerk/clerk-sdk-node";
import { syncUser } from "../controllers/syncUser.js";

const router = express.Router();

router.post("/sync-user", ClerkExpressWithAuth(), syncUser);

export default router;
