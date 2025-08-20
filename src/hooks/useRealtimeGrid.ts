import { useCallback, useEffect, useRef, useState } from "react";
import type { GridCell } from "@/constants";
import { type GridUpdate, supabase } from "@/lib/supabase";

export function useRealtimeGrid() {
  const [grid, setGrid] = useState<(GridCell | null)[][]>(() =>
    Array(100)
      .fill(null)
      .map(() => Array(165).fill(null)),
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);
  const [totalCells, setTotalCells] = useState(0);

  const updateQueue = useRef<GridUpdate[]>([]);
  const batchTimeout = useRef<NodeJS.Timeout | null>(null);

  const loadGridState = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data: gridUpdates, error: supabaseError } = await supabase
        .from("grid_updates")
        .select("*")
        .order("created_at", { ascending: false });

      if (supabaseError) {
        throw new Error(supabaseError.message || "Failed to load grid state");
      }

      const newGrid = Array(100)
        .fill(null)
        .map(() => Array(165).fill(null));

      gridUpdates?.forEach((update) => {
        if (
          update.row >= 0 &&
          update.row < 100 &&
          update.col >= 0 &&
          update.col < 165
        ) {
          newGrid[update.row][update.col] = {
            colorId: update.color_id,
            username: update.username,
          };
        }
      });

      setGrid(newGrid);
      setLastUpdate(gridUpdates?.[0]?.created_at || null);
      setTotalCells(gridUpdates?.length || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load grid");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Batch process updates
  const processUpdateQueue = useCallback(() => {
    if (updateQueue.current.length === 0) return;

    const updates = [...updateQueue.current];
    updateQueue.current = [];

    setGrid((prev) => {
      const newGrid = [...prev];

      updates.forEach((update) => {
        if (
          update.row >= 0 &&
          update.row < 100 &&
          update.col >= 0 &&
          update.col < 165 &&
          update.color_id !== null
        ) {
          newGrid[update.row] = [...newGrid[update.row]];
          newGrid[update.row][update.col] = {
            colorId: update.color_id,
            username: update.username,
          };
        } else if (
          update.row >= 0 &&
          update.row < 100 &&
          update.col >= 0 &&
          update.col < 165 &&
          update.color_id === null
        ) {
          // Clear the pixel
          newGrid[update.row] = [...newGrid[update.row]];
          newGrid[update.row][update.col] = null;
        }
      });

      return newGrid;
    });
  }, []);

  // Queue an update for processing
  const queueUpdate = useCallback(
    (update: GridUpdate) => {
      updateQueue.current.push(update);

      // Process updates in batches every 16ms (60fps)
      if (batchTimeout.current) clearTimeout(batchTimeout.current);
      batchTimeout.current = setTimeout(processUpdateQueue, 16);
    },
    [processUpdateQueue],
  );

  // Subscribe to real-time updates
  useEffect(() => {
    const channel = supabase
      .channel("grid-updates")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "grid_updates",
        },
        (payload) => {
          if (
            payload.eventType === "INSERT" ||
            payload.eventType === "UPDATE"
          ) {
            const update = payload.new as GridUpdate;
            queueUpdate(update);
            setLastUpdate(update.created_at);
            setTotalCells((prev) => prev + 1);
          }
        },
      )
      .subscribe();

    return () => {
      if (batchTimeout.current) clearTimeout(batchTimeout.current);
      supabase.removeChannel(channel);
    };
  }, [queueUpdate]);

  // Load initial state
  useEffect(() => {
    loadGridState();
  }, [loadGridState]);

  return {
    grid,
    isLoading,
    error,
    lastUpdate,
    totalCells,
    refreshGrid: loadGridState,
  };
}
