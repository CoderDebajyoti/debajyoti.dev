"use client";

import React, { useRef, useState, useCallback } from "react";
import { useWindowManager } from "@/context/WindowManagerContext";
import DockItem from "./DockItem";
import DockSeparator from "./DockSeparator";
import { FolderColor } from "@/types/desktop";

interface DockProps {
  projectsColor?: FolderColor;
}

export default function Dock({ projectsColor = "blue" }: DockProps) {
  const {
    finderApp,
    trashApp,
    reorderableApps,
    runningUnpinnedApps,
    windows,
    toggleApp,
    reorderApps,
  } = useWindowManager();

  const dockRef = useRef<HTMLDivElement>(null);
  const [itemScales, setItemScales] = useState<Record<string, number>>({});

  // Drag and reorder state
  const [draggingAppId, setDraggingAppId] = useState<string | null>(null);
  const [dragTargetAppId, setDragTargetAppId] = useState<string | null>(null);

  // Compute magnification curve inside pointer event handler (avoid accessing refs during render)
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (draggingAppId) return;

    const mouseX = e.clientX;
    const items = e.currentTarget.querySelectorAll("[data-dock-item-id]");
    const newScales: Record<string, number> = {};
    const maxDistance = 110;
    const maxScale = 1.38;

    items.forEach((el) => {
      const id = el.getAttribute("data-dock-item-id");
      if (id) {
        const rect = el.getBoundingClientRect();
        const center = rect.left + rect.width / 2;
        const distance = Math.abs(mouseX - center);

        if (distance < maxDistance) {
          const normalized = (1 - distance / maxDistance) * (Math.PI / 2);
          const curve = Math.sin(normalized);
          newScales[id] = 1 + (maxScale - 1) * curve;
        } else {
          newScales[id] = 1;
        }
      }
    });

    setItemScales(newScales);
  };

  const handlePointerLeave = () => {
    setItemScales({});
  };

  // Reorder dragging handlers — restricted to reorderable apps only
  const handleDragStart = useCallback((id: string) => {
    if (id === "finder" || id === "trash") return;
    setDraggingAppId(id);
    setItemScales({});
  }, []);

  const handleDragMove = useCallback(
    (clientX: number) => {
      if (!dockRef.current) return;
      // Only select items that are explicitly reorderable (not Finder, not Trash)
      const children = Array.from(
        dockRef.current.querySelectorAll("[data-dock-item-id][data-reorderable='true']")
      );

      let closestId: string | null = null;
      let minDistance = Infinity;

      children.forEach((el) => {
        const id = el.getAttribute("data-dock-item-id");
        if (id && id !== draggingAppId) {
          const rect = el.getBoundingClientRect();
          const center = rect.left + rect.width / 2;
          const dist = Math.abs(clientX - center);
          if (dist < minDistance) {
            minDistance = dist;
            closestId = id;
          }
        }
      });

      setDragTargetAppId(closestId);
    },
    [draggingAppId]
  );

  const handleDragEnd = useCallback(() => {
    if (draggingAppId && dragTargetAppId && draggingAppId !== dragTargetAppId) {
      reorderApps(draggingAppId, dragTargetAppId);
    }
    setDraggingAppId(null);
    setDragTargetAppId(null);
  }, [draggingAppId, dragTargetAppId, reorderApps]);

  return (
    <nav
      ref={dockRef}
      aria-label="Desktop Dock"
      className="fixed bottom-3 sm:bottom-4.5 left-1/2 -translate-x-1/2 z-40 select-none flex items-end gap-1.5 sm:gap-2 px-3 py-1.5 sm:py-2 rounded-2xl border border-black/10 dark:border-white/15 bg-white/70 dark:bg-[#16161a]/75 backdrop-blur-2xl shadow-[0_12px_32px_rgba(0,0,0,0.12)] dark:shadow-[0_16px_36px_rgba(0,0,0,0.45)] transition-[padding,gap] duration-200"
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      {/* 1. Permanent System Item: Finder (Fixed at Left) */}
      <div key={finderApp.id} data-dock-item-id={finderApp.id}>
        <DockItem
          app={finderApp}
          isRunning={Boolean(windows[finderApp.id]?.isOpen)}
          isMinimized={Boolean(windows[finderApp.id]?.isMinimized)}
          scale={itemScales[finderApp.id] || 1}
          isDraggingCurrent={false}
          isDragTarget={false}
          canDrag={false}
          onClick={() => toggleApp(finderApp.id)}
          onDragStart={() => {}}
          onDragMove={() => {}}
          onDragEnd={() => {}}
        />
      </div>

      {/* 2. Reorderable Applications Area */}
      {reorderableApps.map((app) => {
        const isRunning = Boolean(windows[app.id]?.isOpen);
        const isMinimized = Boolean(windows[app.id]?.isMinimized);
        const isDraggingCurrent = draggingAppId === app.id;
        const isDragTarget = dragTargetAppId === app.id;
        const scale = itemScales[app.id] || 1;

        return (
          <div
            key={app.id}
            data-dock-item-id={app.id}
            data-reorderable="true"
          >
            <DockItem
              app={app}
              isRunning={isRunning}
              isMinimized={isMinimized}
              folderColor={projectsColor}
              scale={scale}
              isDraggingCurrent={isDraggingCurrent}
              isDragTarget={isDragTarget}
              canDrag={true}
              onClick={() => toggleApp(app.id)}
              onDragStart={handleDragStart}
              onDragMove={handleDragMove}
              onDragEnd={handleDragEnd}
            />
          </div>
        );
      })}

      {/* 3. Running Unpinned Applications (e.g., Projects when opened) */}
      {runningUnpinnedApps.map((app) => {
        const isRunning = Boolean(windows[app.id]?.isOpen);
        const isMinimized = Boolean(windows[app.id]?.isMinimized);
        const scale = itemScales[app.id] || 1;

        return (
          <div key={app.id} data-dock-item-id={app.id}>
            <DockItem
              app={app}
              isRunning={isRunning}
              isMinimized={isMinimized}
              folderColor={projectsColor}
              scale={scale}
              isDraggingCurrent={false}
              isDragTarget={false}
              canDrag={false}
              onClick={() => toggleApp(app.id)}
              onDragStart={() => {}}
              onDragMove={() => {}}
              onDragEnd={() => {}}
            />
          </div>
        );
      })}

      {/* 4. Dedicated Separator immediately before Trash */}
      <DockSeparator />

      {/* 5. Permanent System Item: Trash (Fixed at Right) */}
      <div key={trashApp.id} data-dock-item-id={trashApp.id}>
        <DockItem
          app={trashApp}
          isRunning={Boolean(windows[trashApp.id]?.isOpen)}
          isMinimized={Boolean(windows[trashApp.id]?.isMinimized)}
          scale={itemScales[trashApp.id] || 1}
          isDraggingCurrent={false}
          isDragTarget={false}
          canDrag={false}
          onClick={() => toggleApp(trashApp.id)}
          onDragStart={() => {}}
          onDragMove={() => {}}
          onDragEnd={() => {}}
        />
      </div>
    </nav>
  );
}
