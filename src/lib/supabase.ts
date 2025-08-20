"use client";

import { createClient } from "@supabase/supabase-js";
import {
  NEXT_PUBLIC_SUPABASE_ANON_KEY,
  NEXT_PUBLIC_SUPABASE_URL,
} from "./public-envs";

export const supabase = createClient(
  NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY,
  {
    realtime: {
      params: {
        eventsPerSecond: 100, // Handle high update frequency
      },
    },
  },
);

// Database types
export interface GridUpdate {
  id: number;
  row: number;
  col: number;
  color_id: number | null; // Updated to match new schema
  user_id: string;
  username: string;
  created_at: string;
  session_id: string;
}

export interface UserSession {
  id: string;
  user_id: string;
  username: string;
  last_active: string;
  current_row?: number;
  current_col?: number;
  is_online: boolean;
  last_cell_update: string;
}

export interface GridCell {
  row: number;
  col: number;
  color_id: number | null; // Updated to match new schema
  user_id: string;
  username: string;
  updated_at: string;
}
