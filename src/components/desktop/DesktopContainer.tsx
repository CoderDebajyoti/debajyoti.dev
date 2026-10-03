"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef, useSyncExternalStore } from "react";
import { DesktopItemData, FolderColor, Position, Rect } from "@/types/desktop";
import DesktopItem, { ITEM_WIDTH, ITEM_HEIGHT } from "./DesktopItem";
import ContextMenu from "./ContextMenu";
import InfoModal from "./InfoModal";
import PlaceholderWindow from "./PlaceholderWindow";
import Dock from "@/components/dock/Dock";
import { useWindowManager } from "@/context/WindowManagerContext";
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

  const {
    windows,
    openApp,
    closeApp,
    minimizeApp,
    toggleMaximizeApp,
  } = useWindowManager();

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

  // Get Info modal state
  const [isInfoOpen, setIsInfoOpen] = useState(false);

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
        onDoubleClick={() => openApp("projects")}
      />

      {/* Context menu */}
      {contextMenu.isOpen && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          currentColor={projectsColor}
          onClose={handleContextMenuClose}
          onOpen={() => openApp("projects")}
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

      {/* Projects Window State */}
      {windows.projects?.isOpen && (
        <PlaceholderWindow
          id="projects"
          title="Projects"
          isOpen={windows.projects.isOpen}
          isMinimized={windows.projects.isMinimized}
          isMaximized={windows.projects.isMaximized}
          onClose={() => closeApp("projects")}
          onMinimize={() => minimizeApp("projects")}
          onToggleMaximize={() => toggleMaximizeApp("projects")}
          color={projectsColor}
        />
      )}

      {/* Finder Window State */}
      {windows.finder?.isOpen && (
        <PlaceholderWindow
          id="finder"
          title="Finder"
          isOpen={windows.finder.isOpen}
          isMinimized={windows.finder.isMinimized}
          isMaximized={windows.finder.isMaximized}
          onClose={() => closeApp("finder")}
          onMinimize={() => minimizeApp("finder")}
          onToggleMaximize={() => toggleMaximizeApp("finder")}
        />
      )}

      {/* Calendar Window State */}
      {windows.calendar?.isOpen && (
        <PlaceholderWindow
          id="calendar"
          title="Calendar"
          isOpen={windows.calendar.isOpen}
          isMinimized={windows.calendar.isMinimized}
          isMaximized={windows.calendar.isMaximized}
          onClose={() => closeApp("calendar")}
          onMinimize={() => minimizeApp("calendar")}
          onToggleMaximize={() => toggleMaximizeApp("calendar")}
        />
      )}

      {/* Settings Window State */}
      {windows.settings?.isOpen && (
        <PlaceholderWindow
          id="settings"
          title="Settings"
          isOpen={windows.settings.isOpen}
          isMinimized={windows.settings.isMinimized}
          isMaximized={windows.settings.isMaximized}
          onClose={() => closeApp("settings")}
          onMinimize={() => minimizeApp("settings")}
          onToggleMaximize={() => toggleMaximizeApp("settings")}
        />
      )}

      {/* Trash Window State */}
      {windows.trash?.isOpen && (
        <PlaceholderWindow
          id="trash"
          title="Trash"
          isOpen={windows.trash.isOpen}
          isMinimized={windows.trash.isMinimized}
          isMaximized={windows.trash.isMaximized}
          onClose={() => closeApp("trash")}
          onMinimize={() => minimizeApp("trash")}
          onToggleMaximize={() => toggleMaximizeApp("trash")}
        />
      )}

      {/* Step 3: Mac-Inspired Translucent Dock */}
      <Dock projectsColor={projectsColor} />
    </div>
  );
}
