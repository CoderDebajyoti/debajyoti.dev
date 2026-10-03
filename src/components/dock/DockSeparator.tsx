import React from "react";

export default function DockSeparator() {
  return (
    <div
      aria-hidden="true"
      className="w-px h-8 mx-1 bg-black/15 dark:bg-white/15 rounded-full select-none pointer-events-none transition-colors duration-200"
    />
  );
}
