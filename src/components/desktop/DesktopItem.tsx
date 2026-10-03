"use client";

import React, { useRef, useState, useCallback, useEffect } from "react";
import { FolderColor, Position } from "@/types/desktop";
import FolderIcon from "./FolderIcon";
import { clampToBounds, VIEWPORT_PADDING } from "@/utils/collision";

export const ITEM_WIDTH = 88;
export const ITEM_HEIGHT = 108;

export interface DesktopItemProps {
  id: string;
  name: string;
  color: FolderColor;
  position: Position;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onPositionChange: (id: string, newPos: Position, persist: boolean) => void;
  onContextMenu: (x: number, y: number) => void;
  onDoubleClick: () => void;
}

export default function DesktopItem({
  id,
  name,
  color,
  position,
  isSelected,
  onSelect,
  onPositionChange,
  onContextMenu,
  onDoubleClick,
}: DesktopItemProps) {
  const itemRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Drag tracking refs
  const isPointerDownRef = useRef(false);
  const hasMovedRef = useRef(false);
  const dragStartRef = useRef<{
    pointerX: number;
    pointerY: number;
    itemX: number;
    itemY: number;
  }>({
    pointerX: 0,
    pointerY: 0,
    itemX: 0,
    itemY: 0,
  });

  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastTapTimeRef = useRef<number>(0);

  const clearLongPress = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => clearLongPress();
  }, [clearLongPress]);

  // Safety listener: if pointer is released anywhere outside the element
  useEffect(() => {
    function handleGlobalPointerUp() {
      if (isPointerDownRef.current && !hasMovedRef.current) {
        isPointerDownRef.current = false;
        clearLongPress();
      }
    }
    window.addEventListener("pointerup", handleGlobalPointerUp);
    window.addEventListener("pointercancel", handleGlobalPointerUp);
    return () => {
      window.removeEventListener("pointerup", handleGlobalPointerUp);
      window.removeEventListener("pointercancel", handleGlobalPointerUp);
    };
  }, [clearLongPress]);

  // Measure actual rendered dimensions of folder and container
  const getMeasuredBounds = useCallback(() => {
    const itemEl = itemRef.current;
    const folderWidth = itemEl ? itemEl.offsetWidth : ITEM_WIDTH;
    const folderHeight = itemEl ? itemEl.offsetHeight : ITEM_HEIGHT;
    const containerEl = itemEl?.parentElement;
    const containerWidth = containerEl ? containerEl.clientWidth : window.innerWidth;
    const containerHeight = containerEl ? containerEl.clientHeight : window.innerHeight;

    return { folderWidth, folderHeight, containerWidth, containerHeight };
  }, []);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Only respond to primary button (left-click or touch)
    if (e.button !== 0) return;

    e.stopPropagation();
    onSelect(id);

    isPointerDownRef.current = true;
    hasMovedRef.current = false;

    dragStartRef.current = {
      pointerX: e.clientX,
      pointerY: e.clientY,
      itemX: position.x,
      itemY: position.y,
    };

    // Long-press detection for mobile touch
    if (e.pointerType === "touch") {
      clearLongPress();
      longPressTimerRef.current = setTimeout(() => {
        if (!hasMovedRef.current) {
          clearLongPress();
          isPointerDownRef.current = false;
          if (typeof navigator !== "undefined" && navigator.vibrate) {
            navigator.vibrate(40);
          }
          onContextMenu(e.clientX, e.clientY);
        }
      }, 520);
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    // BUG 1 FIX:
    // If pointer is NOT pressed down on the folder, DO NOT DO ANYTHING!
    // Moving the cursor around or toward the folder must NOT move the folder.
    if (!isPointerDownRef.current) {
      return;
    }

    const { pointerX, pointerY, itemX, itemY } = dragStartRef.current;
    const dx = e.clientX - pointerX;
    const dy = e.clientY - pointerY;
    const distance = Math.hypot(dx, dy);

    // Only initiate drag after crossing threshold (4px)
    if (!hasMovedRef.current && distance > 4) {
      hasMovedRef.current = true;
      setIsDragging(true);
      clearLongPress();
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {
        // Fallback for browsers that don't support pointer capture
      }
    }

    // Only update position while actively dragging
    if (hasMovedRef.current) {
      const rawX = itemX + dx;
      const rawY = itemY + dy;

      const { folderWidth, folderHeight, containerWidth, containerHeight } =
        getMeasuredBounds();

      // BUG 2 FIX:
      // Clamp using the actual rendered dimensions of the folder and container
      const clamped = clampToBounds(
        rawX,
        rawY,
        folderWidth,
        folderHeight,
        containerWidth,
        containerHeight,
        VIEWPORT_PADDING
      );

      onPositionChange(id, clamped, false);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    clearLongPress();

    if (!isPointerDownRef.current) {
      return;
    }

    isPointerDownRef.current = false;

    if (hasMovedRef.current) {
      hasMovedRef.current = false;
      setIsDragging(false);

      try {
        if (e.currentTarget.hasPointerCapture(e.pointerId)) {
          e.currentTarget.releasePointerCapture(e.pointerId);
        }
      } catch {
        // ignore
      }

      const dx = e.clientX - dragStartRef.current.pointerX;
      const dy = e.clientY - dragStartRef.current.pointerY;
      const rawX = dragStartRef.current.itemX + dx;
      const rawY = dragStartRef.current.itemY + dy;

      const { folderWidth, folderHeight, containerWidth, containerHeight } =
        getMeasuredBounds();

      const clamped = clampToBounds(
        rawX,
        rawY,
        folderWidth,
        folderHeight,
        containerWidth,
        containerHeight,
        VIEWPORT_PADDING
      );

      // Persist to localStorage via parent
      onPositionChange(id, clamped, true);
    } else {
      // It was a tap / click without drag
      const now = Date.now();
      if (now - lastTapTimeRef.current < 320) {
        onDoubleClick();
        lastTapTimeRef.current = 0;
      } else {
        lastTapTimeRef.current = now;
      }
    }
  };

  const handlePointerCancel = () => {
    clearLongPress();
    isPointerDownRef.current = false;
    hasMovedRef.current = false;
    setIsDragging(false);
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    clearLongPress();
    isPointerDownRef.current = false;
    hasMovedRef.current = false;
    setIsDragging(false);
    onSelect(id);
    onContextMenu(e.clientX, e.clientY);
  };

  return (
    <div
      ref={itemRef}
      role="button"
      tabIndex={0}
      aria-label={`${name} folder`}
      aria-pressed={isSelected}
      data-selected={isSelected}
      style={{
        transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
        width: `${ITEM_WIDTH}px`,
        touchAction: "none",
      }}
      className={`absolute top-0 left-0 flex flex-col items-center justify-center p-2 rounded-xl cursor-default select-none transition-transform will-change-transform ${
        isDragging
          ? "cursor-grabbing opacity-90 scale-102 z-40 transition-none"
          : "hover:scale-[1.03] active:scale-[0.98] duration-150 z-10"
      }`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      onContextMenu={handleContextMenu}
      onDoubleClick={(e) => {
        e.stopPropagation();
        onDoubleClick();
      }}
    >
      {/* Selection ring / backdrop */}
      <div
        className={`relative flex items-center justify-center p-1 rounded-xl transition-all duration-150 ${
          isSelected
            ? "bg-blue-500/15 dark:bg-blue-400/20 ring-1 ring-blue-500/30 dark:ring-blue-400/40"
            : ""
        }`}
      >
        <FolderIcon color={color} size={68} />
      </div>

      {/* Label underneath icon */}
      <div className="mt-1 flex items-center justify-center max-w-[80px]">
        <span
          className={`text-[11px] sm:text-xs font-medium tracking-tight text-center leading-snug px-1.5 py-0.5 rounded-md transition-colors duration-150 line-clamp-1 ${
            isSelected
              ? "bg-blue-500 text-white font-semibold shadow-xs"
              : "text-neutral-800 dark:text-neutral-200"
          }`}
          style={{
            textShadow: isSelected
              ? "none"
              : "0 1px 2px rgba(0, 0, 0, 0.1), 0 0 1px rgba(255, 255, 255, 0.8)",
          }}
        >
          {name}
        </span>
      </div>
    </div>
  );
}
