import { Position, Rect } from "@/types/desktop";

export const VIEWPORT_PADDING = 6;
export const COLLISION_GAP = 12;

/**
 * Clamps a rectangular desktop item inside the container boundaries.
 * Guarantees that the entire item (icon + label + padding) stays inside the viewport.
 */
export function clampToBounds(
  x: number,
  y: number,
  width: number,
  height: number,
  containerWidth: number,
  containerHeight: number,
  padding = VIEWPORT_PADDING
): Position {
  const minX = padding;
  const minY = padding;
  const maxX = Math.max(minX, containerWidth - width - padding);
  const maxY = Math.max(minY, containerHeight - height - padding);

  return {
    x: Math.min(Math.max(x, minX), maxX),
    y: Math.min(Math.max(y, minY), maxY),
  };
}

/**
 * Checks if two bounding boxes overlap, including an optional buffer gap.
 */
export function checkOverlap(rectA: Rect, rectB: Rect, gap = COLLISION_GAP): boolean {
  return (
    rectA.x < rectB.x + rectB.width + gap &&
    rectA.x + rectA.width + gap > rectB.x &&
    rectA.y < rectB.y + rectB.height + gap &&
    rectA.y + rectA.height + gap > rectB.y
  );
}

/**
 * Checks if a target rectangle collides with any other rectangles in the list.
 */
export function hasAnyCollision(target: Rect, obstacles: Rect[], gap = COLLISION_GAP): boolean {
  return obstacles.some((obstacle) => checkOverlap(target, obstacle, gap));
}

/**
 * Finds the nearest non-overlapping position if a collision occurs.
 * If no non-overlapping position is found nearby, falls back to fallbackPos or clamped position.
 */
export function resolveNonOverlappingPosition(
  target: Rect,
  obstacles: Rect[],
  containerWidth: number,
  containerHeight: number,
  fallbackPos?: Position,
  padding = VIEWPORT_PADDING
): Position {
  const clamped = clampToBounds(
    target.x,
    target.y,
    target.width,
    target.height,
    containerWidth,
    containerHeight,
    padding
  );

  const testRect: Rect = { ...target, ...clamped };

  if (!hasAnyCollision(testRect, obstacles)) {
    return clamped;
  }

  // If there is a collision, search in concentric spirals for the nearest free position
  const step = 16;
  const maxSearchRadius = 300;

  for (let r = step; r <= maxSearchRadius; r += step) {
    const angleSteps = Math.max(8, Math.floor((2 * Math.PI * r) / step));
    for (let i = 0; i < angleSteps; i++) {
      const angle = (i * 2 * Math.PI) / angleSteps;
      const candidateX = clamped.x + Math.round(r * Math.cos(angle));
      const candidateY = clamped.y + Math.round(r * Math.sin(angle));

      const candidateClamped = clampToBounds(
        candidateX,
        candidateY,
        target.width,
        target.height,
        containerWidth,
        containerHeight,
        padding
      );

      const candidateRect: Rect = {
        x: candidateClamped.x,
        y: candidateClamped.y,
        width: target.width,
        height: target.height,
      };

      if (!hasAnyCollision(candidateRect, obstacles)) {
        return candidateClamped;
      }
    }
  }

  // Fallback to previous position or clamped position
  return fallbackPos || clamped;
}
