import React from "react";
import FolderIcon from "@/components/desktop/FolderIcon";
import { FolderColor } from "@/types/desktop";

interface AppIconProps {
  size?: number;
  className?: string;
  folderColor?: FolderColor;
}

export function FinderIcon({ size = 48, className = "" }: AppIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`select-none ${className}`}
      style={{ filter: "drop-shadow(0 4px 8px rgba(0, 0, 0, 0.18))" }}
    >
      <defs>
        <linearGradient id="finder-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4cb5f9" />
          <stop offset="100%" stopColor="#1872df" />
        </linearGradient>
      </defs>

      {/* Squircle base */}
      <rect x="2" y="2" width="44" height="44" rx="10" fill="url(#finder-bg)" />

      {/* Subtle glass reflection highlight */}
      <rect
        x="3"
        y="3"
        width="42"
        height="20"
        rx="9"
        fill="white"
        fillOpacity="0.18"
      />

      {/* Split face profile line */}
      <path
        d="M 24 10 L 24 24 C 24 27 21 29 19 29 C 17 29 16 30 16 32 C 16 34 18 35 24 35 L 24 40"
        stroke="#ffffff"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Left Eye */}
      <circle cx="16" cy="20" r="2.2" fill="#ffffff" />

      {/* Right Eye */}
      <circle cx="32" cy="20" r="2.2" fill="#ffffff" />

      {/* Smile curve */}
      <path
        d="M 14 30 C 18 36 30 36 34 30"
        stroke="#ffffff"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function CalendarIcon({ size = 48, className = "" }: AppIconProps) {
  const today = new Date();
  const monthName = today.toLocaleString("en-US", { month: "short" }).toUpperCase();
  const dayNumber = today.getDate();

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`select-none ${className}`}
      style={{ filter: "drop-shadow(0 4px 8px rgba(0, 0, 0, 0.18))" }}
    >
      <defs>
        <linearGradient id="cal-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#f0f2f5" />
        </linearGradient>
        <linearGradient id="cal-header" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ff453a" />
          <stop offset="100%" stopColor="#e02020" />
        </linearGradient>
      </defs>

      {/* Card body */}
      <rect x="2" y="2" width="44" height="44" rx="10" fill="url(#cal-bg)" />

      {/* Red header band */}
      <path
        d="M 2 12 C 2 6.5 6.5 2 12 2 L 36 2 C 41.5 2 46 6.5 46 12 L 46 15 L 2 15 Z"
        fill="url(#cal-header)"
      />

      {/* Month Label */}
      <text
        x="24"
        y="11"
        textAnchor="middle"
        fill="#ffffff"
        fontSize="8"
        fontWeight="700"
        letterSpacing="0.8"
        fontFamily="system-ui, -apple-system, sans-serif"
      >
        {monthName}
      </text>

      {/* Day Number */}
      <text
        x="24"
        y="35"
        textAnchor="middle"
        fill="#1c1c1e"
        fontSize="19"
        fontWeight="300"
        fontFamily="system-ui, -apple-system, sans-serif"
      >
        {dayNumber}
      </text>
    </svg>
  );
}

export function SettingsIcon({ size = 48, className = "" }: AppIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`select-none ${className}`}
      style={{ filter: "drop-shadow(0 4px 8px rgba(0, 0, 0, 0.18))" }}
    >
      <defs>
        <linearGradient id="gear-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8e9aa8" />
          <stop offset="100%" stopColor="#5a6470" />
        </linearGradient>
        <radialGradient id="gear-metallic" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.2" />
        </radialGradient>
      </defs>

      {/* Squircle base */}
      <rect x="2" y="2" width="44" height="44" rx="10" fill="url(#gear-bg)" />
      <rect x="2" y="2" width="44" height="44" rx="10" fill="url(#gear-metallic)" />

      {/* Gear teeth ring */}
      <g transform="translate(24, 24)" stroke="#e4e8ec" strokeWidth="2.5" strokeLinecap="round">
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
          <line
            key={angle}
            x1="0"
            y1="-11"
            x2="0"
            y2="-13.5"
            transform={`rotate(${angle})`}
          />
        ))}
        {/* Outer gear circle */}
        <circle r="10" stroke="#e4e8ec" strokeWidth="2.2" fill="none" />
        {/* Inner gear circle */}
        <circle r="4.2" stroke="#e4e8ec" strokeWidth="2" fill="#5a6470" />
      </g>
    </svg>
  );
}

export function TrashIcon({ size = 48, className = "" }: AppIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`select-none ${className}`}
      style={{ filter: "drop-shadow(0 4px 8px rgba(0, 0, 0, 0.16))" }}
    >
      <defs>
        {/* Metallic glass gradient for trash bin body */}
        <linearGradient id="trash-body" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f5f7fa" stopOpacity="0.95" />
          <stop offset="50%" stopColor="#dce2e9" stopOpacity="0.88" />
          <stop offset="100%" stopColor="#b4becc" stopOpacity="0.95" />
        </linearGradient>
        {/* Interior cavity depth */}
        <linearGradient id="trash-inside" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#434a54" />
          <stop offset="100%" stopColor="#656f7d" />
        </linearGradient>
        {/* Rim specular highlight */}
        <linearGradient id="trash-rim" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="50%" stopColor="#dce3ec" />
          <stop offset="100%" stopColor="#ffffff" />
        </linearGradient>
      </defs>

      {/* Inside opening shadow */}
      <ellipse cx="24" cy="11.5" rx="14" ry="4.5" fill="url(#trash-inside)" />

      {/* Can body */}
      <path
        d="M 10 11.5 C 10 12.5 11 38 13.5 40.5 C 14.5 41.5 18 42 24 42 C 30 42 33.5 41.5 34.5 40.5 C 37 38 38 12.5 38 11.5 Z"
        fill="url(#trash-body)"
      />

      {/* Vertical rib lines (modern macOS style wastebasket grooves) */}
      <path
        d="M 16 15 L 17.5 39 M 21 16 L 21.5 39.8 M 27 16 L 26.5 39.8 M 32 15 L 30.5 39"
        stroke="#ffffff"
        strokeWidth="1.2"
        strokeOpacity="0.75"
        strokeLinecap="round"
      />
      <path
        d="M 17 15 L 18.5 39 M 22 16 L 22.5 39.8 M 26 16 L 25.5 39.8 M 31 15 L 29.5 39"
        stroke="#8a95a5"
        strokeWidth="0.8"
        strokeOpacity="0.45"
        strokeLinecap="round"
      />

      {/* Top Rim Ellipse */}
      <ellipse
        cx="24"
        cy="11.5"
        rx="14"
        ry="4.5"
        stroke="url(#trash-rim)"
        strokeWidth="1.6"
        fill="none"
      />

      {/* Subtle bottom base shadow ring */}
      <ellipse
        cx="24"
        cy="40.5"
        rx="10.5"
        ry="1.8"
        fill="black"
        fillOpacity="0.12"
      />
    </svg>
  );
}

export function ProjectsDockIcon({
  size = 48,
  className = "",
  folderColor = "blue",
}: AppIconProps) {
  return (
    <div
      className={`flex items-center justify-center select-none ${className}`}
      style={{ width: size, height: size }}
    >
      <FolderIcon color={folderColor} size={Math.round(size * 1.05)} />
    </div>
  );
}

export function RenderDockIcon({
  id,
  size = 48,
  folderColor = "blue",
  className = "",
}: {
  id: string;
  size?: number;
  folderColor?: FolderColor;
  className?: string;
}) {
  switch (id) {
    case "finder":
      return <FinderIcon size={size} className={className} />;
    case "calendar":
      return <CalendarIcon size={size} className={className} />;
    case "settings":
      return <SettingsIcon size={size} className={className} />;
    case "trash":
      return <TrashIcon size={size} className={className} />;
    case "projects":
      return <ProjectsDockIcon size={size} folderColor={folderColor} className={className} />;
    default:
      return <FinderIcon size={size} className={className} />;
  }
}
