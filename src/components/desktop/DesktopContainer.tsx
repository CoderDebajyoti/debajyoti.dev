"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef, useSyncExternalStore } from "react";
import { DesktopItemData, FolderColor, Position, Rect } from "@/types/desktop";
import DesktopItem, { ITEM_WIDTH, ITEM_HEIGHT } from "./DesktopItem";
import ContextMenu from "./ContextMenu";
import InfoModal from "./InfoModal";
import PlaceholderWindow from "./PlaceholderWindow";
import { clampToBounds, resolveNonOverlappingPosition, VIEWPORT_PADDING } from "@/utils/collision";

const STORAGE_KEY_POS = "debajyoti_portfolio_projects_pos";
const STORAGE_KEY_COLOR = "debajyoti_portfolio_projects_color";

function getDefaultPosition(): Position {
  if (typeof window === "undefined") return { x: 48, y: 48 };
  const isMobile = window.innerWidth < 640;
  return isMobile ? { x: 24, y: 24 } : { x: 48, y: 48 };
}

function getStoredPosition(): Position {
  const defaultPos = getDefaultPosition();
  if (typeof window === "undefined") return defaultPos;
  try {
    const saved = localStorage.getItem(STORAGE_KEY_POS);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (
        typeof parsed === "object" &&
        parsed !== null &&
        typeof parsed.x === "number" &&
        typeof parsed.y === "number"
      ) {
        return clampToBounds(
          parsed.x,
          parsed.y,
          ITEM_WIDTH,
          ITEM_HEIGHT,
          window.innerWidth,
          window.innerHeight,
          VIEWPORT_PADDING
        );
      }
    }
  } catch {
    // fallback
  }
  return defaultPos;
}

function getStoredColor(): FolderColor {
  if (typeof window === "undefined") return "blue";
  try {
    const saved = localStorage.getItem(STORAGE_KEY_COLOR);
    if (
      saved &&
      ["blue", "green", "purple", "yellow", "orange", "red", "graphite"].includes(
        saved
      )
    ) {
      return saved as FolderColor;
    }
  } catch {
    // fallback
  }
  return "blue";
}

const emptySubscribe = () => () => {};

export default function DesktopContainer() {
  const containerRef = useRef<HTMLDivElement>(null);

  const isHydrated = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Projects folder state initialized lazily
  const [projectsPosition, setProjectsPosition] = useState<Position>(getStoredPosition);
  const [projectsColor, setProjectsColor] = useState<FolderColor>(getStoredColor);

  // Context menu state
  const [contextMenu, setContextMenu] = useState<{
    isOpen: boolean;
    x: number;
    y: number;
  }>({
    isOpen: false,
    x: 0,
    y: 0,
  });

  // Modal states
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [isPlaceholderOpen, setIsPlaceholderOpen] = useState(false);

  // Handle window resize — safely clamp folder inside container viewport
  useEffect(() => {
    function handleResize() {
      const containerEl = containerRef.current;
      const containerWidth = containerEl ? containerEl.clientWidth : window.innerWidth;
      const containerHeight = containerEl ? containerEl.clientHeight : window.innerHeight;

      setProjectsPosition((prev) =>
        clampToBounds(
          prev.x,
          prev.y,
          ITEM_WIDTH,
          ITEM_HEIGHT,
          containerWidth,
          containerHeight,
          VIEWPORT_PADDING
        )
      );
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Prepare desktop item data list for non-overlap system
  const desktopItems: DesktopItemData[] = useMemo(() => {
    return [
      {
        id: "projects",
        name: "Projects",
        type: "folder",
        color: projectsColor,
        defaultPosition: { x: 48, y: 48 },
        position: projectsPosition,
        itemCount: 0,
      },
    ];
  }, [projectsPosition, projectsColor]);

  // Handle drag updates and position persistence
  const handlePositionChange = useCallback(
    (id: string, newPos: Position, persist: boolean) => {
      if (id !== "projects") return;

      const containerEl = containerRef.current;
      const containerWidth = containerEl ? containerEl.clientWidth : window.innerWidth;
      const containerHeight = containerEl ? containerEl.clientHeight : window.innerHeight;

      // Extract obstacle rects from all other desktop items (ready for future folders)
      const otherObstacles: Rect[] = desktopItems
        .filter((item) => item.id !== id)
        .map((item) => ({
          x: item.position.x,
          y: item.position.y,
          width: ITEM_WIDTH,
          height: ITEM_HEIGHT,
        }));

      const finalPos = resolveNonOverlappingPosition(
        {
          x: newPos.x,
          y: newPos.y,
          width: ITEM_WIDTH,
          height: ITEM_HEIGHT,
        },
        otherObstacles,
        containerWidth,
        containerHeight,
        projectsPosition,
        VIEWPORT_PADDING
      );

      setProjectsPosition(finalPos);

      if (persist) {
        try {
          localStorage.setItem(STORAGE_KEY_POS, JSON.stringify(finalPos));
        } catch {
          // ignore
        }
      }
    },
    [desktopItems, projectsPosition]
  );

  // Handle color change
  const handleChangeColor = useCallback((newColor: FolderColor) => {
    setProjectsColor(newColor);
    try {
      localStorage.setItem(STORAGE_KEY_COLOR, newColor);
    } catch {
      // ignore
    }
  }, []);

  // Handle reset position
  const handleResetPosition = useCallback(() => {
    const defaultPos = getDefaultPosition();
    setProjectsPosition(defaultPos);
    try {
      localStorage.setItem(STORAGE_KEY_POS, JSON.stringify(defaultPos));
    } catch {
      // ignore
    }
  }, []);

  // Open context menu
  const handleContextMenuOpen = useCallback((x: number, y: number) => {
    setContextMenu({
      isOpen: true,
      x,
      y,
    });
  }, []);

  const handleContextMenuClose = useCallback(() => {
    setContextMenu((prev) => ({ ...prev, isOpen: false }));
  }, []);

  // Background click deselects active desktop items
  const handleBackgroundClick = () => {
    setSelectedId(null);
    if (contextMenu.isOpen) {
      handleContextMenuClose();
    }
  };

  if (!isHydrated) return null;

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full overflow-hidden select-none z-10"
      onClick={handleBackgroundClick}
      onContextMenu={() => {
        if (contextMenu.isOpen) {
          handleContextMenuClose();
        }
      }}
    >
      {/* Desktop items (Projects folder) */}
      <DesktopItem
        id="projects"
        name="Projects"
        color={projectsColor}
        position={projectsPosition}
        isSelected={selectedId === "projects"}
        onSelect={(id) => setSelectedId(id)}
        onPositionChange={handlePositionChange}
        onContextMenu={handleContextMenuOpen}
        onDoubleClick={() => setIsPlaceholderOpen(true)}
      />

      {/* Context menu */}
      {contextMenu.isOpen && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          currentColor={projectsColor}
          onClose={handleContextMenuClose}
          onOpen={() => setIsPlaceholderOpen(true)}
          onChangeColor={handleChangeColor}
          onResetPosition={handleResetPosition}
          onGetInfo={() => setIsInfoOpen(true)}
        />
      )}

      {/* Get Info Inspector */}
      <InfoModal
        isOpen={isInfoOpen}
        onClose={() => setIsInfoOpen(false)}
        color={projectsColor}
      />

      {/* Open Placeholder State */}
      <PlaceholderWindow
        isOpen={isPlaceholderOpen}
        onClose={() => setIsPlaceholderOpen(false)}
        color={projectsColor}
      />
    </div>
  );
}
