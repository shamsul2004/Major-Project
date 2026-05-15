import { useEffect } from "react";
import { useUser, useAuth } from "@clerk/clerk-react";
import axios from "axios";

const SyncUser = () => {
  const { user } = useUser();
  const { getToken } = useAuth();

  useEffect(() => {
    const sync = async () => {
      try {
        const token = await getToken();
        console.log("🪪 Clerk Token:", token); // Debug

        if (!token) {
          console.log("No token found, user may not be authenticated.");
          return;
        }

        // ✅ Correct API route used
        const response = await axios.post("/api/user/sync-user", {}, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log("✅ Sync successful:", response.data);
      } catch (error) {
        console.log("❌ Sync failed:", error.message);
      }
    };

    if (user) {
      sync();
    }
  }, [user, getToken]);

  return null;
};

export default SyncUser;
