import { useMemo, useState } from "react";
import { useOS } from "../os/os";
import { APPS, START_PINNED } from "../os/registry";
import { SearchIcon, AvatarIcon, FileTxtIcon, FileImgIcon, EdgeIcon } from "../os/icons";
import { Power, Moon, RotateCw, ChevronRight, ArrowLeft } from "lucide-react";

export default function StartMenu() {
  const os = useOS();
  const dk = os.dark;
  const [q, setQ] = useState("");
  const [allApps, setAllApps] = useState(false);
  const [powerMenu, setPowerMenu] = useState(false);

  const panelBg = dk ? "bg-[#2c2c2c]/[.9] border-white/[.06] text-white/90" : "bg-[#f9f9f9]/[.9] border-black/[.05] text-[#1a1a1a]";
  const hover = dk ? "hover:bg-white/[.06]" : "hover:bg-black/[.04]";

  const results = useMemo(() => {
    if (!q.trim()) return [];
    return Object.values(APPS).filter((a) => a.name.toLowerCase().includes(q.toLowerCase()));
  }, [q]);

  const openNode = (id: string) => {
    const n = os.nodeMap.get(id);
    if (n) os.openFile(n);
    else os.notify("The file was moved to the Recycle Bin");
  };

  const recommended = [
    { icon: <FileTxtIcon size={22} />, name: "Welcome.txt", sub: "Recently added", open: () => openNode("welcome") },
    { icon: <FileTxtIcon size={22} />, name: "Shopping List.txt", sub: "2h ago", open: () => openNode("todo") },
    { icon: <FileImgIcon size={22} />, name: "Captured Motion.jpg", sub: "Yesterday", open: () => openNode("wp3") },
    { icon: <FileImgIcon size={22} />, name: "Bloom Dark.jpg", sub: "Yesterday", open: () => openNode("wp2") },
    { icon: <EdgeIcon size={22} />, name: "Get to know Windows 11", sub: "Suggested", open: () => os.openApp("edge", { url: "https://www.google.com/search?q=Windows%2011%20features" }) },
    { icon: <FileImgIcon size={22} />, name: "Windows Bloom.jpg", sub: "Last week", open: () => openNode("wp1") },
  ];

  const launch = (fn: () => void) => { fn(); os.closePanels(); setQ(""); };

  const letters = useMemo(() => {
    const groups: Record<string, typeof APPS[string][]> = {};
    Object.values(APPS).sort((a, b) => a.name.localeCompare(b.name)).forEach((a) => {
      const L = a.name[0].toUpperCase(); (groups[L] ||= []).push(a);
    });
    return groups;
  }, []);

  return (
    <div
      className={`fixed left-1/2 -translate-x-1/2 bottom-[46px] z-[390] w-[640px] max-w-[96vw] rounded-[8px] border backdrop-blur-[40px] backdrop-saturate-[1.8] shadow-[0_8px_32px_rgba(0,0,0,.32)] anim-pop flex flex-col ${panelBg}`}
      style={{ height: "min(716px, calc(100vh - 52px))" }}
      onPointerDown={(e) => e.stopPropagation()}
    >
      {/* search */}
      <div className="px-9 pt-7 pb-5 flex-none">
        <div className={`relative flex items-center h-[38px] rounded-full pl-10 pr-3 transition-shadow
          ${dk ? "bg-[#3a3a3a] border border-white/[.08]" : "bg-white border border-black/[.08] shadow-[0_1px_2px_rgba(0,0,0,.04)]"}`}>
          <SearchIcon size={14} className={`absolute left-4 ${dk ? "text-white/65" : "text-black/55"}`} />
          <input
            value={q}
            onChange={(e) => { setQ(e.target.value); setAllApps(false); }}
            onKeyDown={(e) => { if (e.key === "Enter" && results[0]) launch(() => os.openApp(results[0].id)); }}
            placeholder="Type here to search"
            className="w-full bg-transparent outline-none text-[13px] placeholder:opacity-60"
          />
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto winscroll px-9">
        {q.trim() ? (
          <div className="anim-fade">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[13px] font-semibold">Best match</span>
            </div>
            {results.length === 0 ? (
              <div>
                <div className="text-[13px] opacity-60 mb-3">No apps found. Search the web instead:</div>
                <button className={`flex items-center gap-3 p-2 rounded-[4px] ${hover} w-full text-left`}
                  onClick={() => launch(() => os.openApp("edge", { url: `https://www.google.com/search?q=${encodeURIComponent(q)}` }))}>
                  <EdgeIcon size={24} /><span className="text-[13px]">Search the web for “{q}”</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-6 gap-x-2 gap-y-1.5">
                {results.map((a) => (
                  <button key={a.id} onClick={() => launch(() => os.openApp(a.id))} className={`flex flex-col items-center gap-1 py-3 rounded-[4px] ${hover}`}>
                    {a.icon(30)}<span className="text-[11px] text-center leading-tight line-clamp-2 px-0.5">{a.name}</span>
                  </button>
                ))}
                <button onClick={() => launch(() => os.openApp("edge", { url: `https://www.google.com/search?q=${encodeURIComponent(q)}` }))}
                  className={`flex flex-col items-center gap-1 py-3 rounded-[4px] ${hover}`}>
                  <EdgeIcon size={30} /><span className="text-[11px] text-center leading-tight px-0.5">Search web</span>
                </button>
              </div>
            )}
          </div>
        ) : allApps ? (
          <div className="anim-fade pb-6">
            <div className="flex items-center gap-2 mb-3 sticky top-0 py-1 backdrop-blur-xl z-10">
              <button onClick={() => setAllApps(false)} className={`p-1.5 rounded-[4px] ${hover}`}><ArrowLeft size={14} /></button>
              <span className="text-[13px] font-semibold">All apps</span>
            </div>
            {Object.entries(letters).map(([L, apps]) => (
              <div key={L} className="mb-2">
                <div className="text-[12px] font-semibold opacity-60 px-2 py-1">{L}</div>
                {apps.map((a) => (
                  <button key={a.id} onClick={() => launch(() => os.openApp(a.id))} className={`w-full flex items-center gap-3 px-2.5 py-[7px] rounded-[4px] ${hover} text-left`}>
                    {a.icon(20)}<span className="text-[12.5px]">{a.name}</span>
                  </button>
                ))}
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-3 px-2">
              <span className="text-[13.5px] font-semibold">Pinned</span>
              <button onClick={() => setAllApps(true)} className={`flex items-center gap-0.5 text-[11.5px] px-2 py-1 rounded-[4px] ${hover}`}>
                All apps <ChevronRight size={13} />
              </button>
            </div>
            <div className="grid grid-cols-6 gap-x-2 gap-y-1.5 px-2">
              {START_PINNED.map((id) => {
                const a = APPS[id];
                return (
                  <button key={id} onClick={() => launch(() => os.openApp(id))} className={`flex flex-col items-center gap-1.5 py-3 rounded-[4px] ${hover} active:scale-95 transition`}>
                    {a.icon(32)}<span className="text-[11.5px] text-center leading-tight line-clamp-2 px-1">{a.name}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between mt-7 mb-3">
              <span className="text-[13px] font-semibold">Recommended</span>
              <span className="text-[11.5px] px-2 py-1 rounded-[4px] opacity-70">More</span>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 pb-7">
              {recommended.map((r) => (
                <button key={r.name} onClick={() => launch(r.open)} className={`flex items-center gap-3 p-2 rounded-[4px] text-left ${hover}`}>
                  <span className="flex-none">{r.icon}</span>
                  <span className="min-w-0">
                    <span className="block text-[12.5px] truncate">{r.name}</span>
                    <span className="block text-[11px] opacity-55">{r.sub}</span>
                  </span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* footer */}
      <div className={`h-[52px] flex-none flex items-center justify-between px-9 border-t ${dk ? "border-white/[.06] bg-white/[.03]" : "border-black/[.05] bg-black/[.02]"} rounded-b-[8px]`}>
        <button className={`flex items-center gap-2.5 px-2 py-1.5 rounded-[4px] ${hover}`} onClick={() => launch(() => os.openApp("settings", { page: "accounts" }))}>
          <AvatarIcon size={28} /><span className="text-[12.5px] font-medium">User</span>
        </button>
        <div className="relative">
          <button title="Power" className={`p-2 rounded-[4px] ${hover} ${powerMenu ? (dk ? "bg-white/[.08]" : "bg-black/[.06]") : ""}`}
            onClick={(e) => { e.stopPropagation(); setPowerMenu(!powerMenu); }}>
            <Power size={15} />
          </button>
          {powerMenu && (
            <div className={`absolute bottom-11 right-0 w-52 rounded-[8px] border shadow-[0_8px_24px_rgba(0,0,0,.24)] p-1 anim-pop backdrop-blur-[32px] z-50
              ${dk ? "bg-[#2b2b2b]/95 border-white/[.08]" : "bg-[#f9f9f9]/95 border-black/[.08]"}`}>
              {[
                { icon: <Moon size={14} />, label: "Sleep", fn: os.sleep },
                { icon: <RotateCw size={14} />, label: "Restart", fn: os.restart },
                { icon: <Power size={14} />, label: "Shut down", fn: os.shutdown },
              ].map((p) => (
                <button key={p.label} onClick={p.fn} className={`w-full flex items-center gap-3 px-3 py-2 rounded-[4px] text-[12px] ${hover}`}>
                  {p.icon}{p.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
