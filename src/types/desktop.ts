export type FolderColor =
  | "blue"
  | "green"
  | "purple"
  | "yellow"
  | "orange"
  | "red"
  | "graphite";

export interface Position {
  x: number;
  y: number;
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface DesktopItemData {
  id: string;
  name: string;
  type: "folder" | "file";
  color: FolderColor;
  defaultPosition: Position;
  position: Position;
  itemCount?: number;
}

export interface ContextMenuState {
  isOpen: boolean;
  x: number;
  y: number;
  itemId: string | null;
}
