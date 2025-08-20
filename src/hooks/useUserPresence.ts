import { useCallback, useEffect, useState } from "react";
import { supabase, type UserSession } from "@/lib/supabase";

export function useUserPresence() {
  const [onlineUsers, setOnlineUsers] = useState<UserSession[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadOnlineUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Direct client-side query for reading (this is still public)
      const { data: onlineUsers, error } = await supabase
        .from("user_sessions")
        .select("*")
        .eq("is_online", true)
        .gte("last_active", new Date(Date.now() - 2 * 60 * 1000).toISOString()) // Last 2 minutes
        .order("last_active", { ascending: false });

      if (error) {
        setError(error.message);
        return;
      }

      setOnlineUsers(onlineUsers || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load online users",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Subscribe to realtime changes
  useEffect(() => {
    const channel = supabase
      .channel("user-presence")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "user_sessions" },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const newUser = payload.new as UserSession;
            if (newUser.is_online) {
              setOnlineUsers((prev) => [...prev, newUser]);
            }
          } else if (payload.eventType === "UPDATE") {
            const updatedUser = payload.new as UserSession;
            setOnlineUsers((prev) => {
              if (updatedUser.is_online) {
                // User is online, add or update them
                const existingIndex = prev.findIndex(
                  (u) => u.user_id === updatedUser.user_id,
                );
                if (existingIndex >= 0) {
                  const newUsers = [...prev];
                  newUsers[existingIndex] = updatedUser;
                  return newUsers;
                } else {
                  return [...prev, updatedUser];
                }
              } else {
                // User is offline, remove them
                return prev.filter((u) => u.user_id !== updatedUser.user_id);
              }
            });
          } else if (payload.eventType === "DELETE") {
            const deletedUser = payload.old as UserSession;
            setOnlineUsers((prev) =>
              prev.filter((user) => user.user_id !== deletedUser.user_id),
            );
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Initial load
  useEffect(() => {
    loadOnlineUsers();
  }, [loadOnlineUsers]);

  return {
    onlineUsers,
    isLoading,
    error,
  };
}
