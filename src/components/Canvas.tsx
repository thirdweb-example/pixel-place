"use client";

import { Minus, Plus, RotateCcw } from "lucide-react";
import { useTheme } from "next-themes";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  CANVAS_COLORS,
  CELL_SIZE,
  GRID_COLUMNS,
  GRID_ROWS,
  type GridCell,
  getColorById,
  HIGHLIGHT_BRACKET_SIZE_RATIO,
  HIGHLIGHT_FONT_SIZE,
  HIGHLIGHT_LABEL_HEIGHT,
  HIGHLIGHT_LINE_WIDTH_RATIO,
  MAX_ZOOM,
  MIN_ZOOM,
  ZOOM_STEP,
} from "@/constants";
import {
  drawCornerBrackets,
  drawRect,
  drawTooltip,
  drawTriangle,
} from "@/utils/canvas";

type Grid = (GridCell | null)[][];

interface CanvasProps {
  grid: Grid;
  onCellClick: (row: number, col: number) => void;
  highlightedCell: { row: number; col: number } | null;
  onZoomChange: (zoom: number) => void;
  onCanvasOffsetChange: (offset: { x: number; y: number }) => void;
  zoom: number;
  canvasOffset: { x: number; y: number };
}

export function Canvas({
  grid,
  onCellClick,
  highlightedCell,
  onZoomChange,
  onCanvasOffsetChange,
  zoom,
  canvasOffset,
}: CanvasProps) {
  const { theme } = useTheme();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Touch state for pinch-to-zoom
  const [touchDistance, setTouchDistance] = useState<number | null>(null);
  const [initialZoom, setInitialZoom] = useState<number>(1);
  const [isPinching, setIsPinching] = useState(false);

  // Get current theme colors with fallback to dark
  const currentTheme = theme || "dark";
  const canvasColors =
    CANVAS_COLORS[currentTheme as keyof typeof CANVAS_COLORS] ||
    CANVAS_COLORS.dark;

  // Shared pointer event handlers (works for both mouse and touch)
  const handlePointerDown = useCallback(
    (event: React.PointerEvent<HTMLCanvasElement>) => {
      event.preventDefault();

      if (event.pointerType === "mouse" && event.button !== 0) return; // Left click only for mouse

      // Don't start dragging immediately - let the click detection handle it first
      // Only start dragging if there's significant movement
      setDragStart({
        x: event.clientX - canvasOffset.x,
        y: event.clientY - canvasOffset.y,
      });
    },
    [canvasOffset],
  );

  const handlePointerMove = useCallback(
    (event: React.PointerEvent<HTMLCanvasElement>) => {
      if (!dragStart.x && !dragStart.y) return; // No drag start position

      const distance = Math.sqrt(
        (event.clientX - (dragStart.x + canvasOffset.x)) ** 2 +
          (event.clientY - (dragStart.y + canvasOffset.y)) ** 2,
      );

      // Only start dragging if there's significant movement (prevents accidental drags)
      if (distance > 10 && !isDragging) {
        setIsDragging(true);
      }

      if (isDragging) {
        const newOffset = {
          x: event.clientX - dragStart.x,
          y: event.clientY - dragStart.y,
        };
        onCanvasOffsetChange(newOffset);
      }
    },
    [dragStart, canvasOffset, isDragging, onCanvasOffsetChange],
  );

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
    setDragStart({ x: 0, y: 0 });
  }, []);

  const handlePointerLeave = useCallback(() => {
    setIsDragging(false);
    setDragStart({ x: 0, y: 0 });
  }, []);

  // Canvas drawing function
  const drawCanvas = useCallback(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Apply transformations
    ctx.save();
    ctx.translate(canvasOffset.x, canvasOffset.y);
    ctx.scale(zoom, zoom);

    // Fill entire visible area with background color
    const visibleLeft = -canvasOffset.x / zoom;
    const visibleTop = -canvasOffset.y / zoom;
    const visibleWidth = canvas.width / zoom;
    const visibleHeight = canvas.height / zoom;

    // Draw background covering the entire visible area plus some margin
    const margin = Math.max(visibleWidth, visibleHeight);
    drawRect(
      ctx,
      visibleLeft - margin,
      visibleTop - margin,
      visibleWidth + 2 * margin,
      visibleHeight + 2 * margin,
      canvasColors.background,
    );

    // Calculate grid area position to center it
    const gridWidth = GRID_COLUMNS * CELL_SIZE;
    const gridHeight = GRID_ROWS * CELL_SIZE;
    const gridX = -gridWidth / 2;
    const gridY = -gridHeight / 2;

    // Fill grid area with grid color
    drawRect(ctx, gridX, gridY, gridWidth, gridHeight, canvasColors.gridArea);

    // Draw subtle dashed grid lines
    if (zoom > 2.5) {
      ctx.strokeStyle = canvasColors.gridLines;
      ctx.lineWidth = Math.max(0.25, 0.25 / zoom);
      ctx.setLineDash([2 / zoom, 2 / zoom]); // Small dashed pattern that scales with zoom

      // Draw vertical grid lines
      for (let col = 0; col <= GRID_COLUMNS; col++) {
        const x = gridX + col * CELL_SIZE;
        ctx.beginPath();
        ctx.moveTo(x, gridY);
        ctx.lineTo(x, gridY + gridHeight);
        ctx.stroke();
      }

      // Draw horizontal grid lines
      for (let row = 0; row <= GRID_ROWS; row++) {
        const y = gridY + row * CELL_SIZE;
        ctx.beginPath();
        ctx.moveTo(gridX, y);
        ctx.lineTo(gridX + gridWidth, y);
        ctx.stroke();
      }
    }

    // Reset line dash to solid
    ctx.setLineDash([]);

    // Draw colored cells from database
    for (let row = 0; row < GRID_ROWS; row++) {
      for (let col = 0; col < GRID_COLUMNS; col++) {
        const x = gridX + col * CELL_SIZE;
        const y = gridY + row * CELL_SIZE;

        // Draw cell background from database grid
        const cell = grid[row][col];
        if (cell !== null && cell !== undefined) {
          const cellColor = getColorById(cell.colorId);
          drawRect(ctx, x, y, CELL_SIZE, CELL_SIZE, cellColor);
        }
      }
    }

    // Draw highlighted cell brackets
    if (highlightedCell) {
      const x = gridX + highlightedCell.col * CELL_SIZE;
      const y = gridY + highlightedCell.row * CELL_SIZE;
      const bracketSize = CELL_SIZE * HIGHLIGHT_BRACKET_SIZE_RATIO;
      const lineWidth = CELL_SIZE * HIGHLIGHT_LINE_WIDTH_RATIO;

      drawCornerBrackets(
        ctx,
        x,
        y,
        bracketSize,
        lineWidth,
        canvasColors.highlight.bracketOutline,
        canvasColors.highlight.bracketInner,
        CELL_SIZE,
      );

      // Only show username label if the pixel has a color (not transparent)
      const cell = grid[highlightedCell.row][highlightedCell.col];
      if (cell !== null && cell !== undefined) {
        // Calculate tooltip position relative to the cell center
        const cellCenterX = x + CELL_SIZE / 2;
        const cellCenterY = y;

        // Calculate dynamic tooltip width based on username length
        const fontSize = HIGHLIGHT_FONT_SIZE / zoom;
        ctx.font = `${fontSize}px Arial`;
        const textWidth = ctx.measureText(cell.username).width;
        const padding = 16 / zoom; // 16px padding scaled by zoom
        const tooltipWidth = textWidth + padding;
        const tooltipHeight = HIGHLIGHT_LABEL_HEIGHT / zoom;

        // Position tooltip above the cell, centered horizontally
        const tooltipX = cellCenterX - tooltipWidth / 2;
        const tooltipY = cellCenterY - tooltipHeight - 8 / zoom; // 8px gap above cell, scaled

        // Draw tooltip without chevron first
        drawTooltip(
          ctx,
          tooltipX,
          tooltipY,
          tooltipWidth,
          tooltipHeight,
          cell.username, // Show actual username instead of "User"
          canvasColors.highlight.labelBackground,
          canvasColors.highlight.labelBorder,
          canvasColors.highlight.labelText,
          canvasColors.highlight.chevron,
          fontSize,
          4 / zoom,
          0, // No chevron - we'll draw it separately
        );

        // Draw chevron separately without zoom scaling
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);

        // Convert tooltip coordinates to screen coordinates
        const screenX = (tooltipX + tooltipWidth / 2) * zoom + canvasOffset.x;
        const screenY = (tooltipY + tooltipHeight) * zoom + canvasOffset.y;

        // Draw fixed-size chevron
        drawTriangle(
          ctx,
          screenX,
          screenY,
          6, // Fixed width (4 * 1.5)
          4, // Fixed height
          canvasColors.highlight.chevron,
          "down",
        );

        ctx.restore();
      }
    }

    ctx.restore();
  }, [grid, highlightedCell, zoom, canvasOffset, canvasColors]);

  // Draw canvas whenever dependencies change
  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  // Handle canvas resize and initial setup
  useEffect(() => {
    const setupCanvas = () => {
      const canvas = canvasRef.current;
      if (canvas) {
        // Set canvas dimensions
        // calculate height of canvas using bounding client rect
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;

        // Update canvas offset
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        onCanvasOffsetChange({ x: centerX, y: centerY });
      }
    };

    // Set up canvas immediately
    setupCanvas();

    // Also listen for resize events
    window.addEventListener("resize", setupCanvas);
    return () => window.removeEventListener("resize", setupCanvas);
  }, [onCanvasOffsetChange]);

  // Handle clicks using pointer events (works for both mouse and touch)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let clickStartTime = 0;
    let clickStartPos = { x: 0, y: 0 };
    let isClick = false;

    const handlePointerDownForClick = (event: PointerEvent) => {
      if (event.pointerType === "mouse" && event.button !== 0) return; // Left click only for mouse

      clickStartTime = Date.now();
      clickStartPos = { x: event.clientX, y: event.clientY };
      isClick = true;
    };

    const handlePointerUpForClick = (event: PointerEvent) => {
      if (!isClick) return;

      const clickDuration = Date.now() - clickStartTime;
      const distance = Math.sqrt(
        (event.clientX - clickStartPos.x) ** 2 +
          (event.clientY - clickStartPos.y) ** 2,
      );

      // Check if it's a valid click
      // For mobile: longer duration allowed, more movement allowed
      const isMobile = event.pointerType === "touch";
      const maxDuration = isMobile ? 400 : 300;
      const maxDistance = isMobile ? 25 : 15;

      if (
        clickDuration < maxDuration &&
        distance < maxDistance &&
        !isPinching
      ) {
        // This is a click, handle it
        const rect = canvas.getBoundingClientRect();
        const pointerX = event.clientX - rect.left;
        const pointerY = event.clientY - rect.top;

        // Apply inverse transformations to get world coordinates
        const offsetAdjustedX = pointerX - canvasOffset.x;
        const offsetAdjustedY = pointerY - canvasOffset.y;
        const worldX = offsetAdjustedX / zoom;
        const worldY = offsetAdjustedY / zoom;

        // Calculate grid position
        const gridWidth = GRID_COLUMNS * CELL_SIZE;
        const gridHeight = GRID_ROWS * CELL_SIZE;
        const gridX = -gridWidth / 2;
        const gridY = -gridHeight / 2;

        const gridRelativeX = worldX - gridX;
        const gridRelativeY = worldY - gridY;

        const col = Math.floor(gridRelativeX / CELL_SIZE);
        const row = Math.floor(gridRelativeY / CELL_SIZE);

        // Check if click is within grid bounds
        if (col >= 0 && col < GRID_COLUMNS && row >= 0 && row < GRID_ROWS) {
          onCellClick(row, col);
        }
      }

      isClick = false;
    };

    canvas.addEventListener("pointerdown", handlePointerDownForClick);
    canvas.addEventListener("pointerup", handlePointerUpForClick);

    return () => {
      canvas.removeEventListener("pointerdown", handlePointerDownForClick);
      canvas.removeEventListener("pointerup", handlePointerUpForClick);
    };
  }, [canvasOffset, zoom, onCellClick, isPinching]);

  // Handle wheel zoom
  const handleWheel = useCallback(
    (event: React.WheelEvent<HTMLCanvasElement>) => {
      event.preventDefault();

      const delta = event.deltaY > 0 ? -1 : 1;
      const newZoom = Math.max(
        MIN_ZOOM,
        Math.min(MAX_ZOOM, zoom + delta * ZOOM_STEP),
      );

      if (newZoom !== zoom) {
        onZoomChange(newZoom);
      }
    },
    [zoom, onZoomChange],
  );

  // Unified touch handlers for pinch-to-zoom (works alongside pointer events)
  const handleTouchStart = useCallback(
    (event: React.TouchEvent<HTMLCanvasElement>) => {
      if (event.touches.length === 2) {
        // Two touches - start pinch to zoom
        setIsPinching(true);
        setInitialZoom(zoom);

        const touch1 = event.touches[0];
        const touch2 = event.touches[1];
        const distance = Math.sqrt(
          (touch2.clientX - touch1.clientX) ** 2 +
            (touch2.clientY - touch1.clientY) ** 2,
        );
        setTouchDistance(distance);
      }
    },
    [zoom],
  );

  const handleTouchMove = useCallback(
    (event: React.TouchEvent<HTMLCanvasElement>) => {
      if (event.touches.length === 2 && isPinching && touchDistance) {
        // Pinch to zoom
        const touch1 = event.touches[0];
        const touch2 = event.touches[1];
        const currentDistance = Math.sqrt(
          (touch2.clientX - touch1.clientX) ** 2 +
            (touch2.clientY - touch1.clientY) ** 2,
        );

        const scale = currentDistance / touchDistance;
        const newZoom = Math.max(
          MIN_ZOOM,
          Math.min(MAX_ZOOM, initialZoom * scale),
        );

        if (newZoom !== zoom) {
          onZoomChange(newZoom);
        }
      }
    },
    [isPinching, touchDistance, initialZoom, zoom, onZoomChange],
  );

  const handleTouchEnd = useCallback(
    (event: React.TouchEvent<HTMLCanvasElement>) => {
      if (event.touches.length < 2) {
        // Less than 2 touches - stop pinching
        setIsPinching(false);
        setTouchDistance(null);
      }
    },
    [],
  );

  return (
    <div className="relative w-full flex flex-col grow overflow-hidden">
      <canvas
        ref={canvasRef}
        className={`w-full flex-1 cursor-crosshair bg-black ${
          isDragging ? "cursor-grabbing" : "cursor-crosshair"
        }`}
        style={{
          touchAction: "none",
          userSelect: "none",
          WebkitUserSelect: "none",
          WebkitTouchCallout: "none",
          WebkitTapHighlightColor: "transparent",
          msTouchAction: "none",
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerLeave}
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
      />

      {/* Zoom controls */}
      <div className="absolute top-4 left-4 flex gap-2 z-10">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            if (!canvasRef.current) return;
            const canvasWidth = canvasRef.current.width;
            const canvasHeight = canvasRef.current.height;

            onZoomChange(1);
            onCanvasOffsetChange({
              x: canvasWidth / 2,
              y: canvasHeight / 2,
            });
          }}
          title="Reset Zoom"
        >
          <RotateCcw className="size-3" />
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            const newZoom = Math.max(MIN_ZOOM, zoom - ZOOM_STEP);
            onZoomChange(newZoom);
          }}
          title="Zoom Out"
        >
          <Minus className="size-3" />
        </Button>

        <Button asChild variant="outline" size="sm">
          <span className="text-sm font-mono">{Math.round(zoom * 100)}%</span>
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            const newZoom = Math.min(MAX_ZOOM, zoom + ZOOM_STEP);
            onZoomChange(newZoom);
          }}
          title="Zoom In"
        >
          <Plus className="size-3" />
        </Button>
      </div>
    </div>
  );
}
