"use server";

import { createClient } from "@supabase/supabase-js";
import { getUser } from "@/lib/get-user";
import { NEXT_PUBLIC_SUPABASE_URL } from "@/lib/public-envs";
import { SUPABASE_SERVICE_ROLE_KEY } from "@/lib/server-envs";

// Create server-side Supabase client with service role key
const supabase = createClient(
  NEXT_PUBLIC_SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
);

export async function showUserAsActive() {
  try {
    const { user } = await getUser();
    if (!user) {
      return {
        success: false,
        error: "Invalid or expired authentication token",
      };
    }

    // Update user activity timestamp
    const { error } = await supabase
      .from("user_sessions")
      .update({
        last_active: new Date().toISOString(),
        is_online: true,
      })
      .eq("user_id", user.id);

    if (error) {
      console.error("User session update activity error:", error);
      return { success: false, error: "Failed to update user activity" };
    }

    return { success: true, message: "User activity updated successfully" };
  } catch (error) {
    console.error("User session update activity error:", error);
    return { success: false, error: "Internal server error" };
  }
}
