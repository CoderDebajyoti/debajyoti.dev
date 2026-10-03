export interface DockApp {
  id: string;
  name: string;
  isPinned: boolean;
  canBeClosed?: boolean;
}

export interface WindowState {
  isOpen: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
}
