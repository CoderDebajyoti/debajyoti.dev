"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useRef,
  ReactNode,
} from "react";
import { DockApp, WindowState } from "@/types/dock";

const STORAGE_KEY_REORDERABLE_ORDER = "debajyoti_portfolio_dock_order";

export const DEFAULT_REORDERABLE_APP_IDS = ["calendar", "settings"];

export const ALL_APPS: Record<string, DockApp> = {
  finder: { id: "finder", name: "Finder", isPinned: true },
  calendar: { id: "calendar", name: "Calendar", isPinned: true },
  settings: { id: "settings", name: "Settings", isPinned: true },
  trash: { id: "trash", name: "Trash", isPinned: true },
  projects: { id: "projects", name: "Projects", isPinned: false, canBeClosed: true },
};

function getInitialReorderableOrder(): string[] {
  if (typeof window === "undefined") {
    return [...DEFAULT_REORDERABLE_APP_IDS];
  }
  try {
    const saved = localStorage.getItem(STORAGE_KEY_REORDERABLE_ORDER);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Sanitize: remove fixed system apps (finder, trash) from customizable order
        const validIds = parsed.filter(
          (id) =>
            ALL_APPS[id] &&
            ALL_APPS[id].isPinned &&
            id !== "finder" &&
            id !== "trash"
        );
        const missing = DEFAULT_REORDERABLE_APP_IDS.filter(
          (id) => !validIds.includes(id)
        );
        const sanitized = [...validIds, ...missing];
        // Commit sanitized order without finder or trash
        localStorage.setItem(STORAGE_KEY_REORDERABLE_ORDER, JSON.stringify(sanitized));
        return sanitized;
      }
    }
  } catch {
    // fallback
  }
  return [...DEFAULT_REORDERABLE_APP_IDS];
}

interface WindowManagerContextType {
  finderApp: DockApp;
  trashApp: DockApp;
  reorderableApps: DockApp[];
  reorderableOrder: string[];
  reorderApps: (sourceId: string, targetId: string) => void;
  windows: Record<string, WindowState>;
  activeAppId: string | null;
  openApp: (id: string) => void;
  closeApp: (id: string) => void;
  minimizeApp: (id: string) => void;
  restoreApp: (id: string) => void;
  toggleMaximizeApp: (id: string) => void;
  toggleApp: (id: string) => void;
  runningUnpinnedApps: DockApp[];
}

const WindowManagerContext = createContext<WindowManagerContextType | null>(null);

export function WindowManagerProvider({ children }: { children: ReactNode }) {
  const [reorderableOrder, setReorderableOrderState] = useState<string[]>(
    getInitialReorderableOrder
  );
  const [windows, setWindows] = useState<Record<string, WindowState>>({});
  const [activeAppId, setActiveAppId] = useState<string | null>(null);
  const zIndexRef = useRef(100);

  const finderApp = ALL_APPS.finder;
  const trashApp = ALL_APPS.trash;

  const reorderApps = useCallback((sourceId: string, targetId: string) => {
    // Neither Finder nor Trash can ever be moved or replaced
    if (
      sourceId === "finder" ||
      sourceId === "trash" ||
      targetId === "finder" ||
      targetId === "trash" ||
      sourceId === targetId
    ) {
      return;
    }

    setReorderableOrderState((prev) => {
      const current = [...prev];
      const sourceIndex = current.indexOf(sourceId);
      const targetIndex = current.indexOf(targetId);
      if (sourceIndex === -1 || targetIndex === -1) return prev;

      current.splice(sourceIndex, 1);
      current.splice(targetIndex, 0, sourceId);

      try {
        localStorage.setItem(STORAGE_KEY_REORDERABLE_ORDER, JSON.stringify(current));
      } catch {
        // ignore
      }
      return current;
    });
  }, []);

  const openApp = useCallback((id: string) => {
    zIndexRef.current += 1;
    const nextZ = zIndexRef.current;
    setWindows((prev) => ({
      ...prev,
      [id]: {
        isOpen: true,
        isMinimized: false,
        isMaximized: prev[id]?.isMaximized || false,
        zIndex: nextZ,
      },
    }));
    setActiveAppId(id);
  }, []);

  const closeApp = useCallback((id: string) => {
    setWindows((prev) => ({
      ...prev,
      [id]: {
        isOpen: false,
        isMinimized: false,
        isMaximized: false,
        zIndex: 0,
      },
    }));
    setActiveAppId((prev) => (prev === id ? null : prev));
  }, []);

  const minimizeApp = useCallback((id: string) => {
    setWindows((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        isMinimized: true,
      },
    }));
    setActiveAppId((prev) => (prev === id ? null : prev));
  }, []);

  const restoreApp = useCallback((id: string) => {
    zIndexRef.current += 1;
    const nextZ = zIndexRef.current;
    setWindows((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        isOpen: true,
        isMinimized: false,
        zIndex: nextZ,
      },
    }));
    setActiveAppId(id);
  }, []);

  const toggleMaximizeApp = useCallback((id: string) => {
    setWindows((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        isMaximized: !prev[id]?.isMaximized,
      },
    }));
  }, []);

  const toggleApp = useCallback(
    (id: string) => {
      const current = windows[id];
      if (!current || !current.isOpen) {
        openApp(id);
      } else if (current.isMinimized) {
        restoreApp(id);
      } else if (activeAppId === id) {
        minimizeApp(id);
      } else {
        restoreApp(id);
      }
    },
    [windows, activeAppId, openApp, restoreApp, minimizeApp]
  );

  const reorderableApps = useMemo(() => {
    return reorderableOrder
      .map((id) => ALL_APPS[id])
      .filter((app): app is DockApp => Boolean(app));
  }, [reorderableOrder]);

  const runningUnpinnedApps = useMemo(() => {
    return Object.entries(windows)
      .filter(([id, state]) => state.isOpen && !ALL_APPS[id]?.isPinned)
      .map(([id]) => ALL_APPS[id])
      .filter((app): app is DockApp => Boolean(app));
  }, [windows]);

  const value = useMemo(
    () => ({
      finderApp,
      trashApp,
      reorderableApps,
      reorderableOrder,
      reorderApps,
      windows,
      activeAppId,
      openApp,
      closeApp,
      minimizeApp,
      restoreApp,
      toggleMaximizeApp,
      toggleApp,
      runningUnpinnedApps,
    }),
    [
      finderApp,
      trashApp,
      reorderableApps,
      reorderableOrder,
      reorderApps,
      windows,
      activeAppId,
      openApp,
      closeApp,
      minimizeApp,
      restoreApp,
      toggleMaximizeApp,
      toggleApp,
      runningUnpinnedApps,
    ]
  );

  return (
    <WindowManagerContext.Provider value={value}>
      {children}
    </WindowManagerContext.Provider>
  );
}

export function useWindowManager() {
  const context = useContext(WindowManagerContext);
  if (!context) {
    throw new Error("useWindowManager must be used within WindowManagerProvider");
  }
  return context;
}
