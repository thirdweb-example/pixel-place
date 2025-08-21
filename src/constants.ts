// Grid Configuration
export const GRID_COLUMNS = 165; // 200 columns
export const GRID_ROWS = 100; // 50 rows
export const CELL_SIZE = 8; // 8px per cell for better fit

// Canvas Colors - Theme-specific
export const CANVAS_COLORS = {
  light: {
    background: "#ffffff",
    gridArea: "#f8f9fa",
    gridOutline: "#e9ecef",
    gridLines: "rgba(0, 0, 0, 0.2)",
    highlight: {
      labelBackground: "#ffffff",
      labelBorder: "#e5e7eb",
      labelText: "#000000",
      bracketOutline: "#000000",
      bracketInner: "#000000",
      chevron: "#000000",
    },
  },
  dark: {
    background: "#111111",
    gridArea: "#000000",
    gridOutline: "#333",
    gridLines: "rgba(255, 255, 255, 0.2)",
    highlight: {
      labelBackground: "#ffffff",
      labelBorder: "#e5e7eb",
      labelText: "#000000",
      bracketOutline: "#ffffff",
      bracketInner: "#ffffff",
      chevron: "#ffffff",
    },
  },
} as const;

// Zoom Configuration
export const MIN_ZOOM = 1; // Minimum zoom is 100%
export const MAX_ZOOM = 4; // Maximum zoom is 400%
export const ZOOM_STEP = 0.25; // Zoom increment/decrement step

// Color Palette - 32 colors sorted by HSL hue
export const COLOR_PALETTE = [
  // Dark red first, then ordered by hue (ascending), black/white at end
  "hsl(343.26deg 98.96% 37.65%)", // dark red
  "hsl(16deg 100% 50%)", // red
  "hsl(24.18deg 43.79% 30%)", // dark brown
  "hsl(29.37deg 100% 71.96%)", // beige
  "hsl(35.24deg 66.32% 37.25%)", // brown
  "hsl(39.52deg 100% 50.59%)", // orange
  "hsl(48.59deg 100% 59.8%)", // yellow
  "hsl(54deg 100% 86.27%)", // pale yellow
  "hsl(103.42deg 81.72% 63.53%)", // light green
  "hsl(154.93deg 96.17% 40.98%)", // green
  "hsl(157.91deg 98.79% 32.35%)", // dark green
  "hsl(176.44deg 100% 23.14%)", // dark teal
  "hsl(176.72deg 96.17% 40.98%)", // light teal
  "hsl(183.66deg 88.17% 63.53%)", // light blue
  "hsl(184.21deg 100% 33.53%)", // teal
  "hsl(209.51deg 82.06% 56.27%)", // blue
  "hsl(218.67deg 68.53% 38.63%)", // dark blue
  "hsl(221.89deg 100% 79.22%)", // lavender
  "hsl(245.49deg 100% 67.84%)", // periwinkle
  "hsl(247.34deg 55.82% 48.82%)", // indigo
  "hsl(280.98deg 100% 83.92%)", // pale purple
  "hsl(286.42deg 74.05% 36.27%)", // dark purple
  "hsl(293.61deg 50% 52.16%)", // purple
  "hsl(326.11deg 94.74% 44.71%)", // magenta
  "hsl(337.31deg 100% 60.59%)", // pink
  "hsl(349.64deg 100% 21.57%)", // burgundy
  "hsl(349.9deg 100% 80.2%)", // light pink

  // Neutral colors at the end
  "hsl(0deg 0% 100%)", // white
  "hsl(210deg 5.13% 84.71%)", // light gray
  "hsl(205.71deg 3.08% 55.49%)", // gray
  "hsl(0deg 0.62% 31.57%)", // dark gray
  "hsl(0deg 0% 0%)", // black
];

// Grid cell data structure
export interface GridCell {
  colorId: number;
  username: string;
}

// Helper function to get color by ID
export function getColorById(colorId: number | null): string {
  if (colorId === null || colorId === undefined) {
    return "transparent"; // uncolored pixels
  }
  if (colorId >= 0 && colorId < COLOR_PALETTE.length) {
    return COLOR_PALETTE[colorId];
  }
  return "transparent"; // fallback for invalid IDs
}

// Helper function to get color ID by color value
export function getColorIdByValue(color: string): number {
  const index = COLOR_PALETTE.indexOf(color);
  return index >= 0 ? index : -1;
}

// Highlight Configuration
export const HIGHLIGHT_BRACKET_SIZE_RATIO = 0.6; // Proportional to cell size - increased for visibility
export const HIGHLIGHT_LINE_WIDTH_RATIO = 0.08; // Thinner lines, proportional to cell size
export const HIGHLIGHT_LABEL_WIDTH = 60; // Width of user label background
export const HIGHLIGHT_LABEL_HEIGHT = 20; // Height of user label background
export const HIGHLIGHT_FONT_SIZE = 12; // Font size for user label text

// Mouse Wheel Configuration
export const ZOOM_IN_FACTOR = 1.1; // Zoom in multiplier
export const ZOOM_OUT_FACTOR = 0.9; // Zoom out multiplier

// Cooldown Configuration
export const COOLDOWN_TIMER = 5000; // 5 seconds
