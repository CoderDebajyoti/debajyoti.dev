"use client";

import React, { useEffect } from "react";
import { FolderColor } from "@/types/desktop";
import { RenderDockIcon } from "@/components/dock/DockIcons";

interface PlaceholderWindowProps {
  id: string;
  title: string;
  isOpen: boolean;
  isMinimized?: boolean;
  isMaximized?: boolean;
  onClose: () => void;
  onMinimize?: () => void;
  onToggleMaximize?: () => void;
  color?: FolderColor;
}

export default function PlaceholderWindow({
  id,
  title,
  isOpen,
  isMinimized = false,
  isMaximized = false,
  onClose,
  onMinimize,
  onToggleMaximize,
  color = "blue",
}: PlaceholderWindowProps) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen && !isMinimized) {
        onClose();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, isMinimized, onClose]);

  if (!isOpen || isMinimized) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 dark:bg-black/50 backdrop-blur-xs select-none"
      onClick={onClose}
    >
      <div
        className={`w-full rounded-2xl border border-black/10 dark:border-white/15 bg-white/95 dark:bg-[#1a1a1e]/95 backdrop-blur-2xl shadow-2xl overflow-hidden transition-all duration-200 animate-in fade-in zoom-in-95 ${
          isMaximized ? "max-w-2xl h-[75vh]" : "max-w-sm"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Title bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-black/5 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.02]">
          <div className="flex items-center gap-2">
            {/* Close (Red) */}
            <button
              type="button"
              onClick={onClose}
              className="w-3 h-3 rounded-full bg-[#ff5f56] hover:brightness-90 transition-all cursor-pointer flex items-center justify-center text-[8px] text-[#4c0000] opacity-80 hover:opacity-100"
              aria-label="Close"
            >
              ×
            </button>
            {/* Minimize (Yellow) */}
            <button
              type="button"
              onClick={onMinimize || onClose}
              className="w-3 h-3 rounded-full bg-[#ffbd2e] hover:brightness-90 transition-all cursor-pointer flex items-center justify-center text-[8px] text-[#5c3c00] opacity-80 hover:opacity-100"
              aria-label="Minimize"
            >
              –
            </button>
            {/* Maximize (Green) */}
            <button
              type="button"
              onClick={onToggleMaximize}
              className="w-3 h-3 rounded-full bg-[#27c93f] hover:brightness-90 transition-all cursor-pointer flex items-center justify-center text-[7px] text-[#004c10] opacity-80 hover:opacity-100"
              aria-label="Maximize"
            >
              +
            </button>
          </div>
          <span className="text-xs font-medium text-neutral-600 dark:text-neutral-300">
            {title}
          </span>
          <div className="w-12" /> {/* balance spacing */}
        </div>

        {/* Content placeholder */}
        <div className="flex flex-col items-center justify-center p-8 text-center space-y-4">
          <RenderDockIcon id={id} size={64} folderColor={color} />
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">
              {title}
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-[260px]">
              Placeholder state for {title}. The full interactive application window will be implemented in the upcoming step.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {onMinimize && (
              <button
                type="button"
                onClick={onMinimize}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 transition-colors cursor-pointer"
              >
                Minimize
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg text-xs font-medium bg-neutral-200 hover:bg-neutral-300 dark:bg-neutral-700 dark:hover:bg-neutral-600 text-neutral-800 dark:text-neutral-200 transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
