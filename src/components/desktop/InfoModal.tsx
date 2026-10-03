"use client";

import React, { useEffect, useRef } from "react";
import { FolderColor } from "@/types/desktop";
import FolderIcon from "./FolderIcon";

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  color: FolderColor;
}

export default function InfoModal({ isOpen, onClose, color }: InfoModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
      }
    }
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 dark:bg-black/40 backdrop-blur-xs select-none"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        className="w-full max-w-[270px] rounded-2xl border border-black/10 dark:border-white/15 bg-white/90 dark:bg-[#1c1c20]/90 backdrop-blur-2xl shadow-2xl p-4 text-neutral-800 dark:text-neutral-100 animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with macOS window control */}
        <div className="flex items-center justify-between pb-3 border-b border-black/5 dark:border-white/10">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="w-3 h-3 rounded-full bg-[#ff5f56] hover:brightness-90 transition-all flex items-center justify-center text-[8px] text-[#4c0000] opacity-80 hover:opacity-100"
              aria-label="Close info window"
            >
              ×
            </button>
            <span className="text-xs font-semibold">Projects Info</span>
          </div>
        </div>

        {/* Folder Preview */}
        <div className="flex flex-col items-center py-4">
          <FolderIcon color={color} size={64} />
          <h3 className="mt-2 text-sm font-semibold tracking-tight">Projects</h3>
          <p className="text-[11px] text-neutral-500 dark:text-neutral-400">Desktop Folder</p>
        </div>

        {/* Details list */}
        <div className="space-y-1.5 pt-2 border-t border-black/5 dark:border-white/10 text-xs">
          <div className="flex justify-between py-0.5">
            <span className="text-neutral-500 dark:text-neutral-400">Kind:</span>
            <span className="font-medium">Folder</span>
          </div>
          <div className="flex justify-between py-0.5">
            <span className="text-neutral-500 dark:text-neutral-400">Items:</span>
            <span className="font-medium">—</span>
          </div>
          <div className="flex justify-between py-0.5">
            <span className="text-neutral-500 dark:text-neutral-400">Location:</span>
            <span className="font-medium">Desktop</span>
          </div>
        </div>
      </div>
    </div>
  );
}
