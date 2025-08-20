/**
 * Canvas drawing utility functions
 */

/**
 * Draw a rounded rectangle on the canvas
 */
export function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  fillStyle?: string,
  strokeStyle?: string,
  lineWidth: number = 1,
) {
  ctx.beginPath();

  // Top-left corner
  ctx.arc(x + radius, y + radius, radius, Math.PI, Math.PI * 1.5);
  // Top edge
  ctx.lineTo(x + width - radius, y);
  // Top-right corner
  ctx.arc(x + width - radius, y + radius, radius, Math.PI * 1.5, 0);
  // Right edge
  ctx.lineTo(x + width, y + height - radius);
  // Bottom-right corner
  ctx.arc(x + width - radius, y + height - radius, radius, 0, Math.PI * 0.5);
  // Bottom edge
  ctx.lineTo(x + radius, y + height);
  // Bottom-left corner
  ctx.arc(x + radius, y + height - radius, radius, Math.PI * 0.5, Math.PI);
  // Left edge
  ctx.lineTo(x, y + radius);

  ctx.closePath();

  // Fill if specified
  if (fillStyle) {
    ctx.fillStyle = fillStyle;
    ctx.fill();
  }

  // Stroke if specified
  if (strokeStyle) {
    ctx.strokeStyle = strokeStyle;
    ctx.lineWidth = lineWidth;
    ctx.stroke();
  }
}

/**
 * Draw a triangle on the canvas
 */
export function drawTriangle(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  fillStyle: string,
  direction: "up" | "down" | "left" | "right" = "down",
) {
  ctx.fillStyle = fillStyle;
  ctx.beginPath();

  switch (direction) {
    case "down":
      ctx.moveTo(x - width / 2, y);
      ctx.lineTo(x + width / 2, y);
      ctx.lineTo(x, y + height);
      break;
    case "up":
      ctx.moveTo(x - width / 2, y + height);
      ctx.lineTo(x + width / 2, y + height);
      ctx.lineTo(x, y);
      break;
    case "left":
      ctx.moveTo(x + width, y - height / 2);
      ctx.lineTo(x + width, y + height / 2);
      ctx.lineTo(x, y);
      break;
    case "right":
      ctx.moveTo(x, y - height / 2);
      ctx.lineTo(x, y + height / 2);
      ctx.lineTo(x + width, y);
      break;
  }

  ctx.closePath();
  ctx.fill();
}

/**
 * Draw text with centered alignment
 */
export function drawCenteredText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  font: string,
  fillStyle: string,
) {
  ctx.fillStyle = fillStyle;
  ctx.font = font;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, x, y);
}

/**
 * Draw a filled rectangle on the canvas
 */
export function drawRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  fillStyle: string,
) {
  ctx.fillStyle = fillStyle;
  ctx.fillRect(x, y, width, height);
}

/**
 * Draw a tooltip with label and chevron
 */
export function drawTooltip(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  text: string,
  backgroundColor: string,
  borderColor: string,
  textColor: string,
  chevronColor: string,
  fontSize: number,
  radius: number = 4,
  chevronSize: number = 4,
) {
  // Draw tooltip background
  drawRoundedRect(
    ctx,
    x,
    y,
    width,
    height,
    radius,
    backgroundColor,
    borderColor,
    1,
  );

  // Draw text
  drawCenteredText(
    ctx,
    text,
    x + width / 2,
    y + height / 2,
    `${fontSize}px Arial`,
    textColor,
  );

  // Draw chevron pointing down - size independent of zoom
  const chevronX = x + width / 2;
  const chevronY = y + height;

  drawTriangle(
    ctx,
    chevronX,
    chevronY,
    chevronSize * 1.5,
    chevronSize,
    chevronColor,
    "down",
  );
}

/**
 * Draw corner brackets for highlighting a cell
 */
export function drawCornerBrackets(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  lineWidth: number,
  outlineColor: string,
  innerColor: string,
  cellSize: number,
) {
  // Top-left bracket
  ctx.strokeStyle = outlineColor;
  ctx.lineWidth = lineWidth;
  ctx.beginPath();
  ctx.moveTo(x, y + size);
  ctx.lineTo(x, y);
  ctx.lineTo(x + size, y);
  ctx.stroke();

  ctx.strokeStyle = innerColor;
  ctx.lineWidth = lineWidth / 2;
  ctx.beginPath();
  ctx.moveTo(x + lineWidth / 2, y + size - lineWidth / 2);
  ctx.lineTo(x + lineWidth / 2, y + lineWidth / 2);
  ctx.lineTo(x + size - lineWidth / 2, y + lineWidth / 2);
  ctx.stroke();

  // Top-right bracket
  ctx.strokeStyle = outlineColor;
  ctx.lineWidth = lineWidth;
  ctx.beginPath();
  ctx.moveTo(x + cellSize - size, y);
  ctx.lineTo(x + cellSize, y);
  ctx.lineTo(x + cellSize, y + size);
  ctx.stroke();

  ctx.strokeStyle = innerColor;
  ctx.lineWidth = lineWidth / 2;
  ctx.beginPath();
  ctx.moveTo(x + cellSize - size + lineWidth / 2, y + lineWidth / 2);
  ctx.lineTo(x + cellSize - lineWidth / 2, y + lineWidth / 2);
  ctx.lineTo(x + cellSize - lineWidth / 2, y + size - lineWidth / 2);
  ctx.stroke();

  // Bottom-left bracket
  ctx.strokeStyle = outlineColor;
  ctx.lineWidth = lineWidth;
  ctx.beginPath();
  ctx.moveTo(x, y + cellSize - size);
  ctx.lineTo(x, y + cellSize);
  ctx.lineTo(x + size, y + cellSize);
  ctx.stroke();

  ctx.strokeStyle = innerColor;
  ctx.lineWidth = lineWidth / 2;
  ctx.beginPath();
  ctx.moveTo(x + lineWidth / 2, y + cellSize - size + lineWidth / 2);
  ctx.lineTo(x + lineWidth / 2, y + cellSize - lineWidth / 2);
  ctx.lineTo(x + size - lineWidth / 2, y + cellSize - lineWidth / 2);
  ctx.stroke();

  // Bottom-right bracket
  ctx.strokeStyle = outlineColor;
  ctx.lineWidth = lineWidth;
  ctx.beginPath();
  ctx.moveTo(x + cellSize - size, y + cellSize);
  ctx.lineTo(x + cellSize, y + cellSize);
  ctx.lineTo(x + cellSize, y + cellSize - size);
  ctx.stroke();

  ctx.strokeStyle = innerColor;
  ctx.lineWidth = lineWidth / 2;
  ctx.beginPath();
  ctx.moveTo(x + cellSize - size + lineWidth / 2, y + cellSize - lineWidth / 2);
  ctx.lineTo(x + cellSize - lineWidth / 2, y + cellSize - lineWidth / 2);
  ctx.lineTo(x + cellSize - lineWidth / 2, y + cellSize - size + lineWidth / 2);
  ctx.stroke();
}
