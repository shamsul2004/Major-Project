import { getAuth } from "@clerk/express";
import User from "../models/User.js";
import axios from "axios";

export const syncUser = async (req, res) => {
  try {
    const { userId } = getAuth(req); //  getAuth only returns userId and sessionId

    console.log("Received userId from Clerk:", userId);

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized - No user ID" });
    }

    // Fetch from Clerk Backend API using Server Secret Key
    const clerkRes = await axios.get(`https://api.clerk.dev/v1/users/${userId}`, {
      headers: {
        Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`, //  Use backend key
      },
    });

    const data = clerkRes.data;

    //  Prepare user data for MongoDB
    const userData = {
      _id: data.id,
      clerkId: data.id,
      email: data.email_addresses[0]?.email_address || "",
      name: `${data.first_name || ""} ${data.last_name || ""}`.trim(),
      imageUrl: data.image_url || "",
    };

    //  Upsert in MongoDB
    const user = await User.findByIdAndUpdate(data.id, userData, { upsert: true, new: true });
    return res.status(200).json({ success: true, user });

  } catch (error) {
    console.error("syncUser error:", error.response?.data || error.message);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};
