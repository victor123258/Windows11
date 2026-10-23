import { useState } from "react";
import { useOS, wallpaperSrc } from "../os/os";
import { WALLPAPERS } from "../os/media";
import { ThisPCIcon, RecycleIcon, EdgeIcon, ExplorerIcon, NotepadIcon } from "../os/icons";
import { LayoutGrid, ArrowUpDown, RotateCw, Monitor, Paintbrush, Image as ImageIcon, TerminalSquare, ChevronRight, Check, ClipboardPaste } from "lucide-react";
import Window from "./Window";
import Taskbar from "./Taskbar";
import StartMenu from "./StartMenu";
import { ClickAway, QuickSettings, CalendarFlyout, Widgets, SearchPanel, TrayFlyout, TaskView, Toast } from "./Panels";

export default function Desktop() {
  const os = useOS();
  const dk = os.dark;
  const [sel, setSel] = useState<string | null>(null);
  const [menu, setMenu] = useState<{ x: number; y: number } | null>(null);
  const [sub, setSub] = useState<"view" | "sort" | null>(null);
  const [classic, setClassic] = useState(false);
  const [refreshed, setRefreshed] = useState(0);

  const icons = [
    { id: "thispc", name: "This PC", icon: <ThisPCIcon size={40} />, run: () => os.openApp("explorer", { path: ["thispc"] }, "This PC") },
    { id: "bin", name: "Recycle Bin", icon: <RecycleIcon size={40} />, run: () => os.openApp("explorer", { path: ["bin"] }, "Recycle Bin") },
    { id: "edge", name: "Microsoft Edge", icon: <EdgeIcon size={38} />, run: () => os.openApp("edge") },
    { id: "explorer", name: "File Explorer", icon: <ExplorerIcon size={38} />, run: () => os.openApp("explorer") },
    { id: "notepad", name: "Notepad", icon: <NotepadIcon size={36} />, run: () => os.openApp("notepad") },
  ];

  const closeMenu = () => { setMenu(null); setSub(null); setClassic(false); };

  const nextWallpaper = () => {
    const i = WALLPAPERS.findIndex((w) => w.id === os.wallpaper);
    const next = WALLPAPERS[(i + 1) % WALLPAPERS.length];
    os.setWallpaper(next.id);
    os.notify(`Wallpaper: ${next.name}`);
  };

  const panel = `fixed z-[600] w-56 rounded-[8px] border backdrop-blur-[40px] backdrop-saturate-[1.8] shadow-[0_8px_32px_rgba(0,0,0,.28)] p-1 anim-pop font-normal
    ${dk ? "bg-[#2c2c2c]/[.92] border-white/[.08] text-white/90" : "bg-[#f9f9f9]/[.92] border-black/[.06] text-[#1a1a1a]"}`;
  const item = `w-full flex items-center gap-2.5 px-3 py-[6px] rounded-[4px] text-[12px] text-left ${dk ? "hover:bg-white/[.06]" : "hover:bg-black/[.04]"}`;
  const sep = <div className={`my-1 border-t ${dk ? "border-white/[.09]" : "border-black/[.08]"}`} />;

  const classicPanel = `fixed z-[600] w-56 rounded-[4px] border shadow-[0_6px_24px_rgba(0,0,0,.32)] p-[2px] anim-fade
    ${dk ? "bg-[#2d2d2d] border-[#484848] text-white/90" : "bg-[#f0f0f0] border-[#ababab] text-[#1a1a1a]"}`;
  const classicItem = `w-full flex items-center gap-2 px-5 py-[5px] text-[12px] text-left ${dk ? "hover:bg-[#383838]" : "hover:bg-[#e0e8f6]"}`;

  const SubMenu = ({ id, children }: { id: "view" | "sort"; children: React.ReactNode }) => (
    sub === id ? (
      <div className={panel} style={{ position: "absolute", left: "calc(100% + 4px)", top: -5, width: 178, minWidth: 0 }}>
        {children}
      </div>
    ) : null
  );

  const dim = Math.max(0, (100 - os.brightness) / 100) * 0.72;

  return (
    <div
      className="fixed inset-0 overflow-hidden"
      style={{ background: `url(${wallpaperSrc(os.wallpaper)}) center/cover no-repeat #000` }}
      onPointerDown={() => { setSel(null); closeMenu(); }}
      onContextMenu={(e) => { e.preventDefault(); setClassic(false); setSub(null); setMenu({ x: Math.min(e.clientX, window.innerWidth - 430), y: Math.min(e.clientY, window.innerHeight - 400) }); }}
    >
      {/* desktop icons */}
      <div className="absolute left-1 top-1 bottom-12 flex flex-col flex-wrap gap-0.5 content-start" key={refreshed}>
        {icons.map((ic) => (
          <button
            key={ic.id}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => { e.stopPropagation(); setSel(ic.id); }}
            onDoubleClick={() => { ic.run(); }}
            onContextMenu={(e) => { e.stopPropagation(); e.preventDefault(); setClassic(false); setSub(null); setMenu({ x: e.clientX, y: e.clientY }); setSel(ic.id); }}
            className={`w-[76px] py-1.5 flex flex-col items-center gap-0.5 rounded-[4px] ${sel === ic.id ? "" : "border border-transparent hover:bg-white/[.12]"}`}
            style={sel === ic.id ? { background: "rgba(255,255,255,.14)", border: "1px solid rgba(255,255,255,.25)" } : undefined}
          >
            <span className="drop-shadow-[0_1px_3px_rgba(0,0,0,.6)]">{ic.icon}</span>
            <span className="text-[11px] text-white text-center leading-[1.2] px-0.5 max-w-full" style={{ textShadow: "0 1px 4px rgba(0,0,0,.8)" }}>{ic.name}</span>
          </button>
        ))}
      </div>

      {/* modern context menu */}
      {menu && !classic && (
        <div className={panel} style={{ left: menu.x, top: menu.y }} onPointerDown={(e) => e.stopPropagation()}>
          <div className="relative" onPointerEnter={() => setSub("view")} onPointerLeave={() => setSub((s) => (s === "view" ? null : s))}>
            <button className={item}><span className="opacity-75"><LayoutGrid size={14} /></span>View<ChevronRight size={13} className="ml-auto opacity-60" /></button>
            <SubMenu id="view">
              {["Large icons", "Medium icons", "Small icons"].map((o) => (
                <button key={o} className={item} onClick={() => { closeMenu(); os.notify(`View set to ${o.toLowerCase()}`); }}>
                  <span className="w-4 flex-none">{o === "Medium icons" && <Check size={13} />}</span>{o}
                </button>
              ))}
            </SubMenu>
          </div>
          <div className="relative" onPointerEnter={() => setSub("sort")} onPointerLeave={() => setSub((s) => (s === "sort" ? null : s))}>
            <button className={item}><span className="opacity-75"><ArrowUpDown size={13} /></span>Sort by<ChevronRight size={13} className="ml-auto opacity-60" /></button>
            <SubMenu id="sort">
              {["Name", "Size", "Item type", "Date modified"].map((o) => (
                <button key={o} className={item} onClick={() => { closeMenu(); os.notify(`Sorted by ${o.toLowerCase()}`); }}>
                  <span className="w-4 flex-none">{o === "Name" && <Check size={13} />}</span>{o}
                </button>
              ))}
            </SubMenu>
          </div>
          <button className={item} onClick={() => { setRefreshed((r) => r + 1); closeMenu(); }}><span className="opacity-75"><RotateCw size={13} /></span>Refresh</button>
          {sep}
          <button className={item} onClick={() => { closeMenu(); nextWallpaper(); }}><span className="opacity-75"><ImageIcon size={14} /></span>Next wallpaper</button>
          <button className={item} onClick={() => { closeMenu(); os.openApp("terminal"); }}><span className="opacity-75"><TerminalSquare size={14} /></span>Open in Terminal</button>
          {sep}
          <button className={item} onClick={() => { closeMenu(); os.openApp("settings", { page: "display" }); }}><span className="opacity-75"><Monitor size={14} /></span>Display settings</button>
          <button className={item} onClick={() => { closeMenu(); os.openApp("settings", { page: "personalization" }); }}><span className="opacity-75"><Paintbrush size={14} /></span>Personalize</button>
          {sep}
          <button className={item} onClick={() => setClassic(true)}>Show more options</button>
        </div>
      )}

      {/* classic (Win10-style) menu */}
      {menu && classic && (
        <div className={classicPanel} style={{ left: menu.x, top: menu.y }} onPointerDown={(e) => e.stopPropagation()} onContextMenu={(e) => e.preventDefault()}>
          <button className={classicItem} onClick={() => { setRefreshed((r) => r + 1); closeMenu(); }}>Refresh</button>
          <div className={`my-[3px] border-t ${dk ? "border-white/[.1]" : "border-black/[.14]"}`} />
          <button className={`${classicItem} opacity-40`} disabled>   <ClipboardPaste size={13} className="mr-1 inline" /> Paste</button>
          <button className={`${classicItem} opacity-40`} disabled>Paste shortcut</button>
          <button className={`${classicItem} opacity-40`} disabled>Undo&nbsp;&nbsp;&nbsp;&nbsp;Ctrl+Z</button>
          <div className={`my-[3px] border-t ${dk ? "border-white/[.1]" : "border-black/[.14]"}`} />
          <button className={classicItem} onClick={() => { closeMenu(); os.addNode("desktop", { id: os.uid(), name: "New folder", type: "dir", children: [] }); os.notify("New folder created on Desktop"); }}>New folder</button>
          <button className={classicItem} onClick={() => { closeMenu(); os.addNode("desktop", { id: os.uid(), name: "New Text Document.txt", type: "file", kind: "txt", content: "" }); os.notify("New text document created on Desktop"); }}>New text document</button>
          <div className={`my-[3px] border-t ${dk ? "border-white/[.1]" : "border-black/[.14]"}`} />
          <button className={classicItem} onClick={() => { closeMenu(); os.openApp("settings", { page: "display" }); }}>Display settings</button>
          <button className={classicItem} onClick={() => { closeMenu(); os.openApp("settings", { page: "personalization" }); }}>Personalize</button>
          <div className={`my-[3px] border-t ${dk ? "border-white/[.1]" : "border-black/[.14]"}`} />
          <button className={classicItem} onClick={() => { closeMenu(); os.openApp("settings", { page: "system" }); }}>Properties</button>
        </div>
      )}

      {/* windows */}
      {os.wins.map((w) => <Window key={w.id} win={w} />)}

      {/* flyout panels */}
      <ClickAway />
      {os.panel === "start" && <StartMenu />}
      {os.panel === "quick" && <QuickSettings />}
      {os.panel === "cal" && <CalendarFlyout />}
      {os.panel === "widgets" && <Widgets />}
      {os.panel === "search" && <SearchPanel />}
      {os.panel === "tray" && <TrayFlyout />}
      {os.panel === "taskview" && <TaskView />}

      <Taskbar />
      <Toast />

      {/* brightness */}
      {dim > 0 && <div className="fixed inset-0 z-[800] bg-black pointer-events-none" style={{ opacity: dim }} />}
    </div>
  );
}
