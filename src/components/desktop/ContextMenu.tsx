"use client";

import React, { useEffect, useRef, useState } from "react";
import { FolderColor } from "@/types/desktop";
import { FOLDER_PALETTES } from "./FolderIcon";

export interface ContextMenuProps {
  x: number;
  y: number;
  currentColor: FolderColor;
  onClose: () => void;
  onOpen: () => void;
  onChangeColor: (color: FolderColor) => void;
  onResetPosition: () => void;
  onGetInfo: () => void;
}

const COLOR_OPTIONS: { id: FolderColor; label: string }[] = [
  { id: "blue", label: "Blue" },
  { id: "green", label: "Green" },
  { id: "purple", label: "Purple" },
  { id: "yellow", label: "Yellow" },
  { id: "orange", label: "Orange" },
  { id: "red", label: "Red" },
  { id: "graphite", label: "Graphite" },
];

export default function ContextMenu({
  x,
  y,
  currentColor,
  onClose,
  onOpen,
  onChangeColor,
  onResetPosition,
  onGetInfo,
}: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [showColorSubmenu, setShowColorSubmenu] = useState(false);
  const [position, setPosition] = useState({ left: x, top: y });

  // Clamp menu coordinates inside viewport
  useEffect(() => {
    const menuEl = menuRef.current;
    const menuWidth = menuEl ? menuEl.offsetWidth : 210;
    const menuHeight = menuEl ? menuEl.offsetHeight : 180;

    const safeX = Math.max(8, Math.min(x, window.innerWidth - menuWidth - 8));
    const safeY = Math.max(8, Math.min(y, window.innerHeight - menuHeight - 8));
    setPosition({ left: safeX, top: safeY });
  }, [x, y]);

  // Close on outside click or Escape key
  useEffect(() => {
    function handleClickOutside(e: MouseEvent | TouchEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return (
    <div
      ref={menuRef}
      role="menu"
      aria-label="Projects folder context menu"
      className="fixed z-50 min-w-[200px] select-none rounded-xl border border-black/10 dark:border-white/15 bg-white/90 dark:bg-[#18181c]/90 backdrop-blur-xl shadow-2xl p-1.5 text-xs text-neutral-800 dark:text-neutral-200 transition-opacity animate-in fade-in zoom-in-95 duration-100"
      style={{
        left: `${position.left}px`,
        top: `${position.top}px`,
      }}
      onClick={(e) => e.stopPropagation()}
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* Open */}
      <button
        type="button"
        role="menuitem"
        onClick={() => {
          onOpen();
          onClose();
        }}
        className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-left hover:bg-blue-500 hover:text-white dark:hover:bg-blue-600 transition-colors cursor-pointer group"
      >
        <span className="font-medium">Open</span>
        <span className="text-[10px] opacity-50 group-hover:opacity-100">↵</span>
      </button>

      {/* Change Color with submenu */}
      <div
        className="relative"
        onMouseEnter={() => setShowColorSubmenu(true)}
        onMouseLeave={() => setShowColorSubmenu(false)}
      >
        <button
          type="button"
          role="menuitem"
          aria-haspopup="true"
          aria-expanded={showColorSubmenu}
          onClick={() => setShowColorSubmenu((prev) => !prev)}
          className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-left hover:bg-blue-500 hover:text-white dark:hover:bg-blue-600 transition-colors cursor-pointer group"
        >
          <div className="flex items-center gap-2">
            <span>Change Color</span>
            <span
              className="w-2.5 h-2.5 rounded-full inline-block border border-black/10 shadow-xs"
              style={{ backgroundColor: FOLDER_PALETTES[currentColor].frontTop }}
            />
          </div>
          <span className="text-xs opacity-60 group-hover:opacity-100">›</span>
        </button>

        {/* Submenu */}
        {showColorSubmenu && (
          <div
            className="absolute left-full top-0 ml-1 min-w-[140px] rounded-xl border border-black/10 dark:border-white/15 bg-white/95 dark:bg-[#18181c]/95 backdrop-blur-xl shadow-2xl p-1 text-xs animate-in fade-in zoom-in-95 duration-75"
            style={{
              // If submenu overflows right side, flip to left side
              transform:
                position.left + 350 > (typeof window !== "undefined" ? window.innerWidth : 1000)
                  ? "translateX(calc(-200% - 10px))"
                  : "none",
            }}
          >
            {COLOR_OPTIONS.map((item) => {
              const palette = FOLDER_PALETTES[item.id];
              const isSelected = currentColor === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onChangeColor(item.id);
                    onClose();
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left cursor-pointer transition-colors ${
                    isSelected
                      ? "bg-black/5 dark:bg-white/10 font-semibold"
                      : "hover:bg-blue-500 hover:text-white dark:hover:bg-blue-600"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full border border-black/15 shadow-2xs"
                      style={{ backgroundColor: palette.frontTop }}
                    />
                    <span>{item.label}</span>
                  </div>
                  {isSelected && <span className="text-[10px]">✓</span>}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Separator */}
      <div className="h-px my-1 bg-black/10 dark:bg-white/10" />

      {/* Reset Position */}
      <button
        type="button"
        role="menuitem"
        onClick={() => {
          onResetPosition();
          onClose();
        }}
        className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-left hover:bg-blue-500 hover:text-white dark:hover:bg-blue-600 transition-colors cursor-pointer"
      >
        <span>Reset Position</span>
      </button>

      {/* Get Info */}
      <button
        type="button"
        role="menuitem"
        onClick={() => {
          onGetInfo();
          onClose();
        }}
        className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-left hover:bg-blue-500 hover:text-white dark:hover:bg-blue-600 transition-colors cursor-pointer group"
      >
        <span>Get Info</span>
        <span className="text-[10px] opacity-50 group-hover:opacity-100">⌘I</span>
      </button>
    </div>
  );
}
