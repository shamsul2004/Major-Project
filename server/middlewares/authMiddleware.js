import { clerkClient } from "@clerk/express";
import User from '../models/User.js';



// Middleware to protect educator-only routes
export const protectEducator = async (req, res, next) => {
  try {
    const userId = req.auth?.userId;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized - No user ID" });
    }

    const userDB = await User.findById(userId);

    if (!userDB || userDB.role !== 'educator') {
      return res.status(403).json({ success: false, message: 'Access denied - Educators only' });
    }

    next();
  } catch (error) {
    console.error("protectEducator error:", error);
    res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
};

export const protectAdmin = async (req, res, next) => {
  try {
    const rawAdminEmails = process.env.ADMIN_EMAILS || process.env.VITE_ADMIN_EMAILS || '';
    const adminEmails = rawAdminEmails
      .split(',')
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean);
    const adminIds = process.env.ADMIN_IDS?.split(',').map((id) => id.trim()) || [];

    const userId = req.auth?.userId;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized - No user ID" });
    }

    if (adminIds.includes(userId)) {
      return next();
    }

    const user = await clerkClient.users.getUser(userId);
    const email = user?.emailAddresses?.[0]?.emailAddress || user?.primaryEmailAddress?.emailAddress;

    if (email && adminEmails.includes(email.toLowerCase())) {
      return next();
    }

    return res.status(403).json({ success: false, message: 'Access denied - Admins only' });
  } catch (error) {
    console.error("protectAdmin error:", error);
    res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
};
