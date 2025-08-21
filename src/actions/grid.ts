"use server";

import { createClient } from "@supabase/supabase-js";
import { COOLDOWN_TIMER } from "@/constants";
import { getUser } from "@/lib/get-user";
import { NEXT_PUBLIC_SUPABASE_URL } from "@/lib/public-envs";
import { SUPABASE_SERVICE_ROLE_KEY } from "@/lib/server-envs";
import { distributeTokens } from "@/lib/token-distribution";

const supabase_server_role = createClient(
  NEXT_PUBLIC_SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
);

export async function updateGridCell(
  row: number,
  col: number,
  colorId: number | null,
) {
  try {
    const { user } = await getUser();
    if (!user) {
      return {
        success: false,
        error: "Invalid or expired authentication token",
      };
    }

    // Check if user exists in our sessions and is online
    // eslint-disable-next-line prefer-const
    let { data: sessionUser, error: sessionError } = await supabase_server_role
      .from("user_sessions")
      .select("user_id, username, last_cell_update")
      .eq("user_id", user.id)
      .eq("is_online", true)
      .single();

    // If session doesn't exist, create it
    if (sessionError || !sessionUser) {
      const { data: newSession, error: createError } =
        await supabase_server_role
          .from("user_sessions")
          .upsert(
            {
              user_id: user.id,
              username: user.username,
              last_active: new Date().toISOString(),
              is_online: true,
              last_cell_update: null,
            },
            { onConflict: "user_id" },
          )
          .select("user_id, username, last_cell_update")
          .single();

      if (createError) {
        return {
          success: false,
          error: "Failed to create user session",
        };
      }

      sessionUser = newSession;
    }

    // Validate input
    if (typeof row !== "number" || typeof col !== "number") {
      return {
        success: false,
        error: "Invalid input: row, col, and colorId are required",
      };
    }

    // Validate color ID (0-31 for 32 colors, or null for clearing)
    if (colorId !== null && (colorId < 0 || colorId >= 32)) {
      return {
        success: false,
        error: "Invalid color ID: must be between 0 and 31, or null to clear",
      };
    }

    if (row < 0 || row >= 100 || col < 0 || col >= 165) {
      return { success: false, error: "Invalid grid position" };
    }

    // Check rate limiting (10 seconds)
    if (sessionUser.last_cell_update) {
      const lastUpdateTime = new Date(sessionUser.last_cell_update);
      const now = new Date();
      const timeDiff = now.getTime() - lastUpdateTime.getTime();

      if (timeDiff < COOLDOWN_TIMER) {
        // Cooldown timer in milliseconds
        const remainingTime = Math.ceil((COOLDOWN_TIMER - timeDiff) / 1000);
        return {
          success: false,
          error: "Rate limit exceeded",
          message: `Please wait ${remainingTime} seconds before updating another cell`,
          remainingTime,
        };
      }
    }

    // Update or insert grid cell
    const { data, error } = await supabase_server_role
      .from("grid_updates")
      .upsert(
        {
          row,
          col,
          color_id: colorId,
          user_id: user.id,
          username: user.username,
          created_at: new Date().toISOString(),
        },
        {
          onConflict: "row,col",
        },
      )
      .select()
      .single();

    if (error) {
      console.error("Grid update error:", error);
      return { success: false, error: "Failed to update grid" };
    }

    // Update user's last cell update time
    const { error: sessionUpdateError } = await supabase_server_role
      .from("user_sessions")
      .update({
        last_cell_update: new Date().toISOString(),
        last_active: new Date().toISOString(),
      })
      .eq("user_id", user.id);

    if (sessionUpdateError) {
      console.error("Session update error:", sessionUpdateError);
      // Don't fail the entire request if session update fails
    }

    // Distribute tokens for successful grid update
    const pixelCount = colorId === null ? 0.5 : 1; // Half reward for clearing, full reward for placing
    const tokenResult = await distributeTokens({
      walletAddress: user.walletAddress,
      pixelCount,
    });

    // Return success with token information
    return {
      success: true,
      data,
      message: "Grid cell updated successfully",
      tokenReward: tokenResult.success
        ? {
            amount: tokenResult.rewardAmountTokens,
            transactionHash: tokenResult.transactionHash,
          }
        : null,
      tokenError: tokenResult.success ? null : tokenResult.error,
    };
  } catch (error) {
    console.error("Grid update error:", error);
    return { success: false, error: "Internal server error" };
  }
}

export async function resetGrid() {
  try {
    const user = await getUser();
    if (!user) {
      return {
        success: false,
        error: "Invalid or expired authentication token",
      };
    }

    // Clear all grid updates
    const { error } = await supabase_server_role
      .from("grid_updates")
      .delete()
      .neq("id", 0); // Delete all rows (neq "id", 0 ensures we delete everything)

    if (error) {
      console.error("Grid reset error:", error);
      return { success: false, error: "Failed to reset grid" };
    }

    return {
      success: true,
      message: "Grid reset successfully",
    };
  } catch (error) {
    console.error("Grid reset error:", error);
    return { success: false, error: "Internal server error" };
  }
}
