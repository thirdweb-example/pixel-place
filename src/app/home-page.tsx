"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AppHeader } from "@/components/AppHeader";
import { Canvas } from "@/components/Canvas";
import { ColorPicker } from "@/components/ColorPicker";
import { ErrorState } from "@/components/ErrorState";
import { GridInfoOverlay } from "@/components/GridInfoOverlay";
import { LoadingState } from "@/components/LoadingState";
import { useGridInteractions } from "@/hooks/useGridInteractions";
import { useRealtimeGrid } from "@/hooks/useRealtimeGrid";
import { useUserPresence } from "@/hooks/useUserPresence";
import { logout } from "../actions/logout";
import { showUserAsActive } from "../actions/user-session";
import type { User } from "../lib/get-user";

export function HomePage(props: { user: User | null }) {
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.refresh();
  };

  // Use realtime grid from database
  const { grid, isLoading, error } = useRealtimeGrid();

  // User presence tracking
  const {
    onlineUsers,
    isLoading: usersLoading,
    error: usersError,
  } = useUserPresence();

  // Grid interactions (cell highlighting, keyboard navigation, pixel placement)
  const {
    highlightedCell,
    selectedColor,
    isUpdating,
    setHighlightedCell,
    setSelectedColor,
    confirmCellFill,
  } = useGridInteractions({ user: props.user });

  // Canvas state (zoom, offset)
  const [zoom, setZoom] = useState(2.75);
  const [canvasOffset, setCanvasOffset] = useState({ x: 0, y: 0 });

  // show current user as active by sending request every 90 seconds
  useEffect(() => {
    if (!props.user) {
      return;
    }

    showUserAsActive();

    const activityInterval = setInterval(() => {
      showUserAsActive();
    }, 90000); // 90 seconds

    return () => {
      clearInterval(activityInterval);
    };
  }, [props.user]);

  // Show loading state
  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState error={error} />;
  }

  const highlightedCellColor = highlightedCell
    ? grid[highlightedCell.row][highlightedCell.col]?.colorId
    : null;

  return (
    <div className="h-dvh overflow-hidden bg-background text-foreground flex flex-col">
      <AppHeader user={props.user} onLogout={handleLogout} />

      {grid && !isLoading ? (
        <div className="flex-1 overflow-hidden relative flex flex-col">
          <Canvas
            grid={grid}
            onCellClick={(row, col) => setHighlightedCell({ row, col })}
            highlightedCell={highlightedCell}
            onZoomChange={setZoom}
            onCanvasOffsetChange={setCanvasOffset}
            zoom={zoom}
            canvasOffset={canvasOffset}
          />

          <GridInfoOverlay
            onlineUsers={onlineUsers}
            isLoading={usersLoading}
            error={usersError}
          />
        </div>
      ) : (
        <div className="flex items-center justify-center grow">
          <div className="text-center">
            {isLoading ? (
              <div className="text-lg">Loading</div>
            ) : error ? (
              <div className="text-lg text-red-500">Error: {error}</div>
            ) : (
              <div className="text-lg">No data available</div>
            )}
          </div>
        </div>
      )}

      <ColorPicker
        user={props.user}
        highlightedCell={highlightedCell}
        selectedColor={selectedColor}
        isUpdating={isUpdating}
        highlightedCellColorId={highlightedCellColor}
        onColorSelect={setSelectedColor}
        onPlacePixel={confirmCellFill}
      />
    </div>
  );
}
