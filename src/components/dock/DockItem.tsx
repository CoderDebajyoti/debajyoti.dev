"use client";

import React, { useRef, useState, useEffect } from "react";
import { DockApp } from "@/types/dock";
import { RenderDockIcon } from "./DockIcons";
import { FolderColor } from "@/types/desktop";

interface DockItemProps {
  app: DockApp;
  isRunning: boolean;
  isMinimized?: boolean;
  folderColor?: FolderColor;
  scale: number;
  isDraggingCurrent: boolean;
  isDragTarget: boolean;
  canDrag: boolean;
  onClick: () => void;
  onDragStart: (id: string) => void;
  onDragMove: (clientX: number) => void;
  onDragEnd: () => void;
}

export default function DockItem({
  app,
  isRunning,
  folderColor = "blue",
  scale,
  isDraggingCurrent,
  isDragTarget,
  canDrag,
  onClick,
  onDragStart,
  onDragMove,
  onDragEnd,
}: DockItemProps) {
  const itemRef = useRef<HTMLDivElement>(null);
  const [showTooltip, setShowTooltip] = useState(false);

  // Pointer drag state
  const dragRef = useRef<{
    isDown: boolean;
    isDragging: boolean;
    startX: number;
    startY: number;
  }>({
    isDown: false,
    isDragging: false,
    startX: 0,
    startY: 0,
  });

  // Calculate vertical offset from bottom based on magnification scale
  const baseSize = 48;
  const lift = (scale - 1) * baseSize * 0.42;

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return; // Only primary button
    e.stopPropagation();

    dragRef.current = {
      isDown: true,
      isDragging: false,
      startX: e.clientX,
      startY: e.clientY,
    };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current.isDown) return;

    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    const dist = Math.hypot(dx, dy);

    // Only start drag after intentional movement (>6px) if dragging is allowed (pinned apps)
    if (!dragRef.current.isDragging && dist > 6 && canDrag) {
      dragRef.current.isDragging = true;
      setShowTooltip(false);
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {
        // ignore
      }
      onDragStart(app.id);
    }

    if (dragRef.current.isDragging) {
      onDragMove(e.clientX);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current.isDown) return;

    const wasDragging = dragRef.current.isDragging;
    dragRef.current = {
      isDown: false,
      isDragging: false,
      startX: 0,
      startY: 0,
    };

    if (wasDragging) {
      try {
        if (e.currentTarget.hasPointerCapture(e.pointerId)) {
          e.currentTarget.releasePointerCapture(e.pointerId);
        }
      } catch {
        // ignore
      }
      onDragEnd();
    } else {
      // Intentional click/tap
      onClick();
    }
  };

  const handlePointerCancel = () => {
    if (dragRef.current.isDragging) {
      onDragEnd();
    }
    dragRef.current = {
      isDown: false,
      isDragging: false,
      startX: 0,
      startY: 0,
    };
  };

  // Close tooltip on touch or unmount
  useEffect(() => {
    return () => setShowTooltip(false);
  }, []);

  return (
    <div
      ref={itemRef}
      role="button"
      tabIndex={0}
      aria-label={`${app.name} application`}
      className={`relative flex flex-col items-center justify-end select-none transition-transform will-change-transform ${
        isDraggingCurrent ? "opacity-60 cursor-grabbing" : "cursor-pointer"
      } ${isDragTarget ? "translate-x-2" : ""}`}
      style={{
        width: `${baseSize}px`,
        height: `${baseSize + 8}px`,
        transform: `translate3d(0, -${lift}px, 0) scale(${scale})`,
        transformOrigin: "bottom center",
        transition: isDraggingCurrent ? "none" : "transform 0.16s ease-out, opacity 0.15s ease",
        touchAction: "none",
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      onMouseEnter={() => {
        if (!dragRef.current.isDragging) setShowTooltip(true);
      }}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {/* App Tooltip */}
      {showTooltip && !isDraggingCurrent && (
        <div
          role="tooltip"
          className="absolute -top-9 px-2.5 py-1 rounded-md bg-neutral-900/85 dark:bg-neutral-100/90 text-white dark:text-neutral-900 text-[11px] font-medium tracking-tight shadow-md backdrop-blur-md pointer-events-none whitespace-nowrap z-50 animate-in fade-in zoom-in-95 duration-100"
        >
          {app.name}
          <div className="absolute left-1/2 -bottom-1 -translate-x-1/2 w-2 h-2 bg-neutral-900/85 dark:bg-neutral-100/90 rotate-45" />
        </div>
      )}

      {/* App Icon */}
      <div className="flex items-center justify-center pointer-events-none">
        <RenderDockIcon id={app.id} size={baseSize} folderColor={folderColor} />
      </div>

      {/* Running indicator dot */}
      <div className="h-2 flex items-center justify-center pointer-events-none">
        {isRunning && (
          <span
            className="w-1.25 h-1.25 rounded-full bg-neutral-800/80 dark:bg-white/80 shadow-xs transition-opacity duration-200"
            aria-label="Running"
          />
        )}
      </div>
    </div>
  );
}
