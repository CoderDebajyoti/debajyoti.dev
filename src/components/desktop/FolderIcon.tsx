import React from "react";
import { FolderColor } from "@/types/desktop";

interface FolderTheme {
  tabBack: string;
  frontTop: string;
  frontBottom: string;
  frontLip: string;
  shadow: string;
}

export const FOLDER_PALETTES: Record<FolderColor, FolderTheme> = {
  blue: {
    tabBack: "#1a75dc",
    frontTop: "#63cdfe",
    frontBottom: "#2483f5",
    frontLip: "rgba(255, 255, 255, 0.45)",
    shadow: "rgba(20, 80, 160, 0.35)",
  },
  green: {
    tabBack: "#1c964c",
    frontTop: "#47de87",
    frontBottom: "#20b35c",
    frontLip: "rgba(255, 255, 255, 0.45)",
    shadow: "rgba(18, 120, 55, 0.35)",
  },
  purple: {
    tabBack: "#7d26d8",
    frontTop: "#b76cfb",
    frontBottom: "#8b32e7",
    frontLip: "rgba(255, 255, 255, 0.45)",
    shadow: "rgba(100, 30, 170, 0.35)",
  },
  yellow: {
    tabBack: "#d48e00",
    frontTop: "#ffd149",
    frontBottom: "#f4a219",
    frontLip: "rgba(255, 255, 255, 0.5)",
    shadow: "rgba(160, 100, 0, 0.35)",
  },
  orange: {
    tabBack: "#d25501",
    frontTop: "#ff974b",
    frontBottom: "#f25c06",
    frontLip: "rgba(255, 255, 255, 0.45)",
    shadow: "rgba(170, 60, 0, 0.35)",
  },
  red: {
    tabBack: "#cc2a32",
    frontTop: "#ff6569",
    frontBottom: "#e2343c",
    frontLip: "rgba(255, 255, 255, 0.45)",
    shadow: "rgba(160, 25, 30, 0.35)",
  },
  graphite: {
    tabBack: "#646d7a",
    frontTop: "#b5bdc9",
    frontBottom: "#7a8492",
    frontLip: "rgba(255, 255, 255, 0.45)",
    shadow: "rgba(60, 65, 75, 0.35)",
  },
};

interface FolderIconProps {
  color?: FolderColor;
  className?: string;
  size?: number;
}

export default function FolderIcon({
  color = "blue",
  className = "",
  size = 80,
}: FolderIconProps) {
  const palette = FOLDER_PALETTES[color] || FOLDER_PALETTES.blue;
  const gradientId = `folder-grad-${color}`;
  const backGradientId = `folder-back-grad-${color}`;

  return (
    <svg
      width={size}
      height={Math.round((size * 70) / 84)}
      viewBox="0 0 84 70"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`transition-colors duration-200 select-none ${className}`}
      style={{ filter: "drop-shadow(0 6px 12px rgba(0, 0, 0, 0.14))" }}
    >
      <defs>
        {/* Back tab subtle vertical gradient */}
        <linearGradient id={backGradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={palette.tabBack} />
          <stop offset="100%" stopColor={palette.tabBack} stopOpacity="0.9" />
        </linearGradient>

        {/* Front flap vibrant gradient matching macOS reference */}
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={palette.frontTop} />
          <stop offset="100%" stopColor={palette.frontBottom} />
        </linearGradient>
      </defs>

      {/* Back flap / Tab */}
      <path
        d="M 6 12 C 6 8.5 8.5 6 12 6 L 33 6 C 36 6 38.5 7.5 41 10.5 L 43.5 13.5 C 45 15.5 47.5 16.5 50.5 16.5 L 72 16.5 C 75.5 16.5 78 19 78 22.5 L 78 57 C 78 60.5 75.5 63 72 63 L 12 63 C 8.5 63 6 60.5 6 57 Z"
        fill={`url(#${backGradientId})`}
      />

      {/* Inside Paper Crease / Liner */}
      <rect
        x="10"
        y="15"
        width="64"
        height="12"
        rx="2"
        fill="#ffffff"
        fillOpacity="0.22"
      />

      {/* Front flap body */}
      <path
        d="M 4 23 C 4 19 7 16 11 16 L 73 16 C 77 16 80 19 80 23 L 80 58 C 80 62 77 65 73 65 L 11 65 C 7 65 4 62 4 58 Z"
        fill={`url(#${gradientId})`}
      />

      {/* Top bevel / specular highlight on front flap */}
      <path
        d="M 11 16.75 L 73 16.75"
        stroke={palette.frontLip}
        strokeWidth="1.2"
        strokeLinecap="round"
      />

      {/* Subtle bottom shadow on front flap for 3D depth */}
      <path
        d="M 8 63.5 L 76 63.5"
        stroke="rgba(0, 0, 0, 0.12)"
        strokeWidth="1"
        strokeLinecap="round"
      />
    </svg>
  );
}
