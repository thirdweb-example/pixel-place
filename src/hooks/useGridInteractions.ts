import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { updateGridCell } from "@/actions/grid";
import {
  COOLDOWN_TIMER,
  GRID_COLUMNS,
  GRID_ROWS,
  getColorIdByValue,
} from "@/constants";
import type { User } from "@/lib/get-user";
import { playPixelPlaceSound } from "@/utils/sound";

interface UseGridInteractionsProps {
  user: User | null;
}

export function useGridInteractions({ user }: UseGridInteractionsProps) {
  const queryClient = useQueryClient();
  const [highlightedCell, setHighlightedCell] = useState<{
    row: number;
    col: number;
  } | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);

  const updateGridCellMutation = useMutation({
    mutationFn: (params: {
      row: number;
      col: number;
      colorId: number | null;
    }) => updateGridCell(params.row, params.col, params.colorId),
  });

  const moveHighlightedCell = useCallback(
    (direction: "up" | "down" | "left" | "right") => {
      if (!highlightedCell) return;

      let newRow = highlightedCell.row;
      let newCol = highlightedCell.col;

      switch (direction) {
        case "up":
          newRow = Math.max(0, newRow - 1);
          break;
        case "down":
          newRow = Math.min(GRID_ROWS - 1, newRow + 1);
          break;
        case "left":
          newCol = Math.max(0, newCol - 1);
          break;
        case "right":
          newCol = Math.min(GRID_COLUMNS - 1, newCol + 1);
          break;
      }

      setHighlightedCell({ row: newRow, col: newCol });
    },
    [highlightedCell],
  );

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!highlightedCell) return;

      switch (event.key) {
        case "ArrowUp":
          event.preventDefault();
          moveHighlightedCell("up");
          break;
        case "ArrowDown":
          event.preventDefault();
          moveHighlightedCell("down");
          break;
        case "ArrowLeft":
          event.preventDefault();
          moveHighlightedCell("left");
          break;
        case "ArrowRight":
          event.preventDefault();
          moveHighlightedCell("right");
          break;
        case "Escape":
          event.preventDefault();
          setHighlightedCell(null);
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [highlightedCell, moveHighlightedCell]);

  const confirmCellFill: (type: "place" | "clear") => Promise<boolean> =
    useCallback(
      async (type) => {
        if (type === "place" && !selectedColor) {
          toast.error("Please select a color");
          return false;
        }

        if (highlightedCell && user) {
          try {
            const colorId =
              type === "place" && selectedColor
                ? getColorIdByValue(selectedColor)
                : null;

            if (colorId === -1) {
              console.error("Invalid color selected");
              return false;
            }

            const result = await updateGridCellMutation.mutateAsync({
              row: highlightedCell.row,
              col: highlightedCell.col,
              colorId: type === "place" ? colorId : null,
            });

            if (result.success) {
              if (result.tokenReward) {
                playPixelPlaceSound();
                toast.success("Pixel Placed", {
                  description: `+${result.tokenReward.amount} PXP Token${
                    result.tokenReward.amount
                      ? result.tokenReward.amount > 1
                        ? "s"
                        : ""
                      : ""
                  } Earned`,
                });
                queryClient.invalidateQueries({
                  queryKey: ["tokenBalance", user?.walletAddress],
                });
              } else if (result.tokenError) {
                playPixelPlaceSound();
                toast.success("Pixel Placed");
                toast.error("Failed to send token reward", {
                  description: result.tokenError,
                });
              } else {
                playPixelPlaceSound();
                toast.success("Pixel Placed");
              }

              return true;
            } else {
              // Show error toast
              toast.error("Failed to place pixel", {
                description: result.error?.toLowerCase().includes("rate limit")
                  ? `Try again after ${Math.ceil(COOLDOWN_TIMER / 1000)} seconds`
                  : result.error,
              });

              return false;
            }
          } catch (error) {
            console.error("Failed to update cell:", error);

            toast.error("Failed to place pixel", {
              description:
                error instanceof Error
                  ? error.message
                  : "Network error occurred",
              position: "top-center",
            });
          }
        }

        return false;
      },
      [
        highlightedCell,
        selectedColor,
        user,
        updateGridCellMutation,
        queryClient,
      ],
    );

  return {
    highlightedCell,
    selectedColor,
    isUpdating: updateGridCellMutation.isPending,
    setSelectedColor,
    setHighlightedCell,
    moveHighlightedCell,
    confirmCellFill,
  };
}
