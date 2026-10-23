import type { Win } from "./os";
import { WinLogo, EdgeIcon, ExplorerIcon, SettingsIcon, StoreIcon, NotepadIcon, CalcIcon, PhotosIcon, TerminalIcon, PaintIcon } from "./icons";
import Edge from "../apps/Edge";
import Explorer from "../apps/Explorer";
import Notepad from "../apps/Notepad";
import Calculator from "../apps/Calculator";
import Settings from "../apps/Settings";
import Photos from "../apps/Photos";
import Paint from "../apps/Paint";
import Terminal from "../apps/Terminal";
import Store from "../apps/Store";

export interface AppMeta {
  id: string;
  name: string;
  icon: (size?: number) => React.ReactNode;
  comp: React.ComponentType<{ win: Win }>;
  w: number; h: number;
  pinned?: boolean;      // on taskbar
  startPinned?: boolean; // in start menu
}

export const TITLES: Record<string, string> = {
  edge: "Microsoft Edge", explorer: "File Explorer", notepad: "Notepad", calculator: "Calculator",
  settings: "Settings", store: "Microsoft Store", photos: "Photos", paint: "Paint", terminal: "Terminal",
};

export const APPS: Record<string, AppMeta> = {
  edge: { id: "edge", name: "Microsoft Edge", icon: (s = 24) => <EdgeIcon size={s} />, comp: Edge, w: 1080, h: 680, pinned: true, startPinned: true },
  explorer: { id: "explorer", name: "File Explorer", icon: (s = 24) => <ExplorerIcon size={s} />, comp: Explorer, w: 980, h: 620, pinned: true, startPinned: true },
  store: { id: "store", name: "Microsoft Store", icon: (s = 24) => <StoreIcon size={s} />, comp: Store, w: 1020, h: 640, pinned: true, startPinned: true },
  notepad: { id: "notepad", name: "Notepad", icon: (s = 24) => <NotepadIcon size={s} />, comp: Notepad, w: 760, h: 540, startPinned: true },
  calculator: { id: "calculator", name: "Calculator", icon: (s = 24) => <CalcIcon size={s} />, comp: Calculator, w: 380, h: 560, startPinned: true },
  paint: { id: "paint", name: "Paint", icon: (s = 24) => <PaintIcon size={s} />, comp: Paint, w: 940, h: 620, startPinned: true },
  terminal: { id: "terminal", name: "Terminal", icon: (s = 24) => <TerminalIcon size={s} />, comp: Terminal, w: 860, h: 540, startPinned: true },
  settings: { id: "settings", name: "Settings", icon: (s = 24) => <SettingsIcon size={s} />, comp: Settings, w: 1000, h: 640, pinned: true, startPinned: true },
  photos: { id: "photos", name: "Photos", icon: (s = 24) => <PhotosIcon size={s} />, comp: Photos, w: 1020, h: 660, startPinned: true },
};

export const PINNED = Object.values(APPS).filter((a) => a.pinned).map((a) => a.id);
export const START_PINNED = Object.values(APPS).filter((a) => a.startPinned).map((a) => a.id);
export { WinLogo };
