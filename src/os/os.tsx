import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { WALLPAPERS } from "./media";

export const TASKBAR_H = 40;

export interface Rect { x: number; y: number; w: number; h: number }
export interface Win extends Rect {
  id: string; app: string; title: string; z: number;
  min: boolean; max: boolean; prev?: Rect; props?: Record<string, unknown>;
}
export type Phase = "boot" | "lock" | "signin" | "on" | "restarting" | "shuttingdown" | "off";
export type Panel = "start" | "search" | "quick" | "cal" | "widgets" | "taskview" | "tray" | null;

export interface FSNode {
  id: string; name: string; type: "dir" | "file";
  kind?: "txt" | "img" | "drive" | "bin";
  src?: string; content?: string; children?: FSNode[]; sys?: boolean;
}

const TITLES: Record<string, string> = {
  edge: "Microsoft Edge", explorer: "File Explorer", notepad: "Notepad", calculator: "Calculator",
  settings: "Settings", store: "Microsoft Store", photos: "Photos", paint: "Paint", terminal: "Terminal",
};

const SIZES: Record<string, { w: number; h: number }> = {
  edge: { w: 1080, h: 680 }, explorer: { w: 980, h: 620 }, store: { w: 1020, h: 640 },
  notepad: { w: 760, h: 540 }, calculator: { w: 380, h: 560 }, paint: { w: 940, h: 620 },
  terminal: { w: 860, h: 540 }, settings: { w: 1000, h: 640 }, photos: { w: 1020, h: 660 },
};

const uid = () => Math.random().toString(36).slice(2, 10);

function makeFS(): FSNode {
  return {
    id: "thispc", name: "This PC", type: "dir", children: [
      { id: "desktop", name: "Desktop", type: "dir", children: [] },
      {
        id: "docs", name: "Documents", type: "dir", children: [
          { id: "welcome", name: "Welcome.txt", type: "file", kind: "txt", content: "Welcome to Windows 11!\n\nThings to try:\n  •  Open Microsoft Edge and search the web on Google\n  •  Browse your files in File Explorer\n  •  Draw something in Paint, then find it in Photos\n  •  Type 'help' in Windows Terminal\n  •  Change the wallpaper in Settings > Personalization\n  •  Right-click the desktop for more options\n\nEnjoy!" },
          { id: "todo", name: "Shopping List.txt", type: "file", kind: "txt", content: "Shopping list\n-------------\nMilk\nEggs\nCoffee beans\nSourdough bread\nDark chocolate\n" },
        ],
      },
      {
        id: "pics", name: "Pictures", type: "dir", children: [
          { id: "wp1", name: "Windows Bloom.jpg", type: "file", kind: "img", src: `${WALLPAPERS[1].src}` },
          { id: "wp2", name: "Bloom Dark.jpg", type: "file", kind: "img", src: `${WALLPAPERS[0].src}` },
          { id: "wp3", name: "Captured Motion.jpg", type: "file", kind: "img", src: `${WALLPAPERS[2].src}` },
        ],
      },
      { id: "dl", name: "Downloads", type: "dir", children: [
        { id: "setup", name: "Windows11_InstallationAssistant.exe", type: "file" },
        { id: "pres", name: "Q3 Report.pptx", type: "file" },
      ]},
      { id: "music", name: "Music", type: "dir", children: [] },
      { id: "videos", name: "Videos", type: "dir", children: [] },
      {
        id: "c", name: "Local Disk (C:)", type: "dir", kind: "drive", children: [
          { id: "windows", name: "Windows", type: "dir", sys: true, children: [{ id: "sys32", name: "System32", type: "dir", sys: true, children: [] }] },
          { id: "pf", name: "Program Files", type: "dir", sys: true, children: [] },
          { id: "users", name: "Users", type: "dir", sys: true, children: [{ id: "userdir", name: "User", type: "dir", children: [] }] },
        ],
      },
      { id: "d", name: "Data (D:)", type: "dir", kind: "drive", children: [] },
    ],
  };
}

function makeBin(): FSNode {
  return { id: "bin", name: "Recycle Bin", type: "dir", kind: "bin", children: [] };
}

function walk(n: FSNode, fn: (x: FSNode) => void) { fn(n); n.children?.forEach((c) => walk(c, fn)); }
function cloneTree(n: FSNode): FSNode { return { ...n, children: n.children?.map(cloneTree) }; }

interface OSValue {
  phase: Phase; setPhase: (p: Phase) => void;
  shutdown: () => void; restart: () => void; sleep: () => void;
  wins: Win[]; activeId: string | null; interacting: boolean;
  openApp: (app: string, props?: Record<string, unknown>, title?: string) => void;
  closeWin: (id: string) => void; focusWin: (id: string) => void; minimizeWin: (id: string) => void;
  toggleMax: (id: string) => void; setRect: (id: string, r: Rect) => void; unmax: (id: string, r: Rect) => void; setInteracting: (b: boolean) => void;
  panel: Panel; togglePanel: (p: Exclude<Panel, null>) => void; closePanels: () => void;
  wallpaper: string; setWallpaper: (id: string) => void;
  dark: boolean; setDark: (b: boolean) => void;
  accent: string; setAccent: (a: string) => void;
  brightness: number; setBrightness: (n: number) => void;
  volume: number; setVolume: (n: number) => void;
  wifi: boolean; setWifi: (b: boolean) => void;
  bt: boolean; setBt: (b: boolean) => void;
  airplane: boolean; setAirplane: (b: boolean) => void;
  fs: FSNode; bin: FSNode; nodeMap: Map<string, FSNode>;
  addNode: (dirId: string, node: FSNode, rename?: boolean) => string;
  deleteNode: (id: string) => void; restoreNode: (id: string, destId?: string) => void;
  emptyBin: () => void; updateNode: (id: string, patch: Partial<FSNode>) => void;
  openFile: (node: FSNode, parentPath?: string[]) => void;
  installed: Set<string>; install: (id: string) => void;
  toast: { msg: string; img?: string } | null; notify: (msg: string, img?: string) => void;
  playSfx: (type: "startup" | "notify" | "error" | "click") => void;
  uid: () => string;
}

const OSContext = createContext<OSValue>(null as unknown as OSValue);
export const useOS = () => useContext(OSContext);

export function useNow(step = 1000) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => { const t = setInterval(() => setNow(new Date()), step); return () => clearInterval(t); }, [step]);
  return now;
}

export function OSProvider({ children }: { children: ReactNode }) {
  const [phase, setPhase] = useState<Phase>("boot");
  const [wins, setWins] = useState<Win[]>([]);
  const [interacting, setInteracting] = useState(false);
  const [panel, setPanel] = useState<Panel>(null);
  const [wallpaper, setWallpaper] = useState("bloom-dark");
  const [dark, setDark] = useState(false);
  const [accent, setAccent] = useState("#0067c0");
  const [brightness, setBrightness] = useState(100);
  const [volume, setVolume] = useState(65);
  const [wifi, setWifi] = useState(true);
  const [bt, setBt] = useState(true);
  const [airplane, setAirplane] = useState(false);
  const [fs, setFs] = useState<FSNode>(makeFS);
  const [bin, setBin] = useState<FSNode>(makeBin);
  const [installed, setInstalled] = useState<Set<string>>(() => new Set(["edge", "explorer", "notepad", "calculator", "settings", "store", "photos", "paint", "terminal"]));
  const [toast, setToast] = useState<{ msg: string; img?: string } | null>(null);
  const zCounter = useRef(100);
  const casc = useRef(0);
  const toastT = useRef<ReturnType<typeof setTimeout>>(undefined);

  const nodeMap = useMemo(() => {
    const m = new Map<string, FSNode>();
    walk(fs, (n) => m.set(n.id, n));
    walk(bin, (n) => m.set(n.id, n));
    return m;
  }, [fs, bin]);

  /* ---------- window management ---------- */
  const openApp = useCallback((app: string, props?: Record<string, unknown>, title?: string) => {
    setPanel(null);
    setWins((ws) => {
      const existing = ws.find((w) => w.app === app && !props?._new);
      if (existing) {
        return ws.map((w) => w.id === existing.id
          ? { ...w, z: ++zCounter.current, min: false, props: props ? { ...(w.props || {}), ...props, _t: Date.now() } : w.props }
          : w);
      }
      const meta = SIZES[app] || { w: 900, h: 600 };
      casc.current = (casc.current + 1) % 6;
      const vw = window.innerWidth, vh = window.innerHeight;
      const ww = Math.min(meta.w, vw - 24), wh = Math.min(meta.h, vh - TASKBAR_H - 16);
      return [...ws, {
        id: uid(), app, title: title || TITLES[app] || app, z: ++zCounter.current,
        x: Math.max(10, (vw - ww) / 2 + casc.current * 26 - 60),
        y: Math.max(6, (vh - TASKBAR_H - wh) / 2 + casc.current * 14),
        w: ww, h: wh, min: false, max: false, props,
      }];
    });
  }, []);

  const closeWin = useCallback((id: string) => setWins((ws) => ws.filter((w) => w.id !== id)), []);

  const focusWin = useCallback((id: string) => {
    setPanel(null);
    setWins((ws) => ws.map((w) => (w.id === id ? { ...w, z: ++zCounter.current, min: false } : w)));
  }, []);

  const minimizeWin = useCallback((id: string) => setWins((ws) => ws.map((w) => (w.id === id ? { ...w, min: true } : w))), []);

  const toggleMax = useCallback((id: string) => {
    setWins((ws) => ws.map((w) => {
      if (w.id !== id) return w;
      const vw = window.innerWidth, vh = window.innerHeight - TASKBAR_H;
      if (w.max) { const p = w.prev || { x: 60, y: 40, w: 900, h: 560 }; return { ...w, max: false, ...p, prev: undefined, z: ++zCounter.current }; }
      return { ...w, max: true, prev: { x: w.x, y: w.y, w: w.w, h: w.h }, x: 0, y: 0, w: vw, h: vh, z: ++zCounter.current };
    }));
  }, []);

  const setRect = useCallback((id: string, r: Rect) => setWins((ws) => ws.map((w) => (w.id === id ? { ...w, ...r } : w))), []);

  const unmax = useCallback((id: string, r: Rect) => setWins((ws) => ws.map((w) => (w.id === id ? { ...w, max: false, ...r } : w))), []);

  /* ---------- power ---------- */
  const shutdown = useCallback(() => {
    setPanel(null);
    setPhase("shuttingdown");
    setTimeout(() => { setWins([]); setPhase("off"); }, 1900);
  }, []);
  const restart = useCallback(() => {
    setPanel(null);
    setPhase("restarting");
    setTimeout(() => { setWins([]); setPhase("boot"); }, 1900);
  }, []);
  const sleep = useCallback(() => { setPanel(null); setPhase("lock"); }, []);

  /* ---------- fs ---------- */
  const addNode = useCallback((dirId: string, node: FSNode, rename = false) => {
    // ensure unique name
    const target = nodeMap.get(dirId);
    if (target?.children) {
      const base = node.name; let n = 1; let name = base;
      const dot = base.lastIndexOf(".");
      while (target.children.some((c) => c.name === name)) {
        n++;
        name = dot > 0 ? `${base.slice(0, dot)} (${n})${base.slice(dot)}` : `${base} (${n})`;
      }
      node = { ...node, name };
    }
    const final = node;
    if (dirId === "bin") {
      setBin((b) => ({ ...cloneTree(b), children: [...(b.children || []), final] }));
    } else {
      setFs((root) => {
        const t = cloneTree(root);
        walk(t, (n) => { if (n.id === dirId) n.children = [...(n.children || []), final]; });
        return t;
      });
    }
    if (rename) return final.id;
    return final.id;
  }, [nodeMap]);

  const deleteNode = useCallback((id: string) => {
    const node = nodeMap.get(id);
    if (!node) return;
    setFs((root) => {
      const t = cloneTree(root);
      walk(t, (n) => { if (n.children?.some((c) => c.id === id)) n.children = n.children.filter((c) => c.id !== id); });
      return t;
    });
    setBin((b) => ({ ...b, children: [...(b.children || []), JSON.parse(JSON.stringify(node))] }));
  }, [nodeMap]);

  const restoreNode = useCallback((id: string, destId = "docs") => {
    const node = bin.children?.find((c) => c.id === id);
    if (!node) return;
    setBin((b) => ({ ...b, children: (b.children || []).filter((c) => c.id !== id) }));
    addNode(destId, node, false);
  }, [bin, addNode]);

  const emptyBin = useCallback(() => setBin((b) => ({ ...b, children: [] })), []);

  const updateNode = useCallback((id: string, patch: Partial<FSNode>) => {
    setFs((root) => { const t = cloneTree(root); walk(t, (n) => { if (n.id === id) Object.assign(n, patch); }); return t; });
    setBin((b) => { const t = cloneTree(b); walk(t, (n) => { if (n.id === id) Object.assign(n, patch); }); return t; });
  }, []);

  const openFile = useCallback((node: FSNode) => {
    if (node.type === "dir") { openApp("explorer", { path: [node.id], _t: Date.now() }, node.name); return; }
    if (node.kind === "img") openApp("photos", { src: node.src, name: node.name, _t: Date.now() });
    else if (node.kind === "txt") openApp("notepad", { fileId: node.id, _t: Date.now() });
    else notify("Windows cannot open this file type");
  }, [openApp]);

  /* ---------- store / notifications ---------- */
  const install = useCallback((id: string) => setInstalled((s) => new Set(s).add(id)), []);

  const playSfx = useCallback((type: "startup" | "notify" | "error" | "click") => {
    const urls = {
      startup: "https://github.com/Yashash/W11-Chime/raw/main/startup.mp3",
      notify: "https://raw.githubusercontent.com/yurichandra/win11-sounds/main/Notification.mp3",
      error: "https://raw.githubusercontent.com/yurichandra/win11-sounds/main/Error.mp3",
      click: "https://raw.githubusercontent.com/yurichandra/win11-sounds/main/Navigation.mp3"
    };
    const audio = new Audio(urls[type]);
    audio.volume = 0.5;
    audio.play().catch(() => {});
  }, []);

  const notify = useCallback((msg: string, img?: string) => {
    clearTimeout(toastT.current);
    setToast({ msg, img });
    playSfx("notify");
    toastT.current = setTimeout(() => setToast(null), 3600);
  }, [playSfx]);

  const togglePanel = useCallback((p: Exclude<Panel, null>) => setPanel((cur) => (cur === p ? null : p)), []);
  const closePanels = useCallback(() => setPanel(null), []);

  useEffect(() => { if (wins.length === 0) zCounter.current = 100; }, [wins.length]);

  const activeId = useMemo(() => {
    let best: Win | null = null;
    for (const w of wins) if (!w.min && (!best || w.z > best.z)) best = w;
    return best?.id ?? null;
  }, [wins]);

  useEffect(() => {
    document.documentElement.style.setProperty("--acc", accent);
  }, [accent]);

  const value: OSValue = {
    phase, setPhase, shutdown, restart, sleep,
    wins, activeId, interacting, openApp, closeWin, focusWin, minimizeWin, toggleMax, setRect, unmax, setInteracting,
    panel, togglePanel, closePanels,
    wallpaper, setWallpaper, dark, setDark, accent, setAccent,
    brightness, setBrightness, volume, setVolume, wifi, setWifi, bt, setBt, airplane, setAirplane,
    fs, bin, nodeMap, addNode, deleteNode, restoreNode, emptyBin, updateNode, openFile,
    installed, install, toast, notify, playSfx, uid,
  };

  return <OSContext.Provider value={value}>{children}</OSContext.Provider>;
}

export const wallpaperSrc = (id: string) => WALLPAPERS.find((w) => w.id === id)?.src ?? WALLPAPERS[0].src;
export const wallpaperIsDark = (id: string) => !!WALLPAPERS.find((w) => w.id === id)?.dark;
