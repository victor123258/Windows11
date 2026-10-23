import { useEffect, useMemo, useRef, useState } from "react";
import type { Win, FSNode } from "../os/os";
import { useOS } from "../os/os";
import {
  ChevronLeft, ChevronRight, ChevronUp, Search, FolderPlus, Trash2, PenLine,
  LayoutGrid, List, RotateCcw, Monitor, Download, FileText, Image as ImageIcon, Music, Video,
} from "lucide-react";
import { ExplorerIcon, ThisPCIcon, RecycleIcon, DriveIcon, FileTxtIcon, FileImgIcon, FileIcon, HomeIcon } from "../os/icons";

const QUICK = [
  { id: "desktop", name: "Desktop", icon: <Monitor size={15} /> },
  { id: "dl", name: "Downloads", icon: <Download size={15} /> },
  { id: "docs", name: "Documents", icon: <FileText size={15} /> },
  { id: "pics", name: "Pictures", icon: <ImageIcon size={15} /> },
  { id: "music", name: "Music", icon: <Music size={15} /> },
  { id: "videos", name: "Videos", icon: <Video size={15} /> },
];

function NodeIcon({ node, size = 17 }: { node: FSNode; size?: number }) {
  if (node.type === "dir") {
    if (node.kind === "drive") return <DriveIcon size={size + 3} />;
    if (node.kind === "bin") return <RecycleIcon size={size + 2} />;
    return <ExplorerIcon size={size + 2} />;
  }
  if (node.kind === "img") return <FileImgIcon size={size + 1} />;
  if (node.kind === "txt") return <FileTxtIcon size={size + 1} />;
  return <FileIcon size={size + 1} />;
}

export default function Explorer({ win }: { win: Win }) {
  const os = useOS();
  const dk = os.dark;
  const initPath = (win.props?.path as string[]) || ["thispc"];
  const startPath = initPath[0] === "bin" || initPath[0] === "thispc" ? initPath : ["home"];
  const [path, setPath] = useState<string[]>(startPath);
  const [hist, setHist] = useState<string[][]>([startPath]);
  const [hi, setHi] = useState(0);
  const isHome = path[0] === "home";
  const [sel, setSel] = useState<string | null>(null);
  const [view, setView] = useState<"details" | "grid">("details");
  const [q, setQ] = useState("");
  const [renaming, setRenaming] = useState<string | null>(null);
  const [renameVal, setRenameVal] = useState("");

  const lastPathT = useRef(0);
  useEffect(() => {
    const p = win.props?.path as string[] | undefined;
    const t = (win.props?._t as number) || 0;
    if (p && t && t !== lastPathT.current) {
      lastPathT.current = t;
      const np = p[0] === "bin" || p[0] === "thispc" ? p : ["thispc", ...p];
      if (JSON.stringify(np) !== JSON.stringify(path)) navigate(np);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [win.props]);

  const curId = path[path.length - 1];
  const cur = isHome ? { id: "home", name: "Home", type: "dir" as const } : os.nodeMap.get(curId) || os.nodeMap.get("thispc")!;
  const children = useMemo(() => {
    if (isHome) return [];
    const list = ("children" in cur && cur.children) || [];
    return q ? list.filter((c) => c.name.toLowerCase().includes(q.toLowerCase())) : list;
  }, [cur, q, isHome]);

  const navigate = (p: string[]) => {
    const node = os.nodeMap.get(p[p.length - 1]);
    if (!node) return;
    setPath(p); setSel(null); setQ("");
    setHist((h) => [...h.slice(0, hi + 1), p]); setHi((v) => v + 1);
  };

  const back = () => { if (hi > 0) { setHi(hi - 1); setPath(hist[hi - 1]); } };
  const fwd = () => { if (hi < hist.length - 1) { setHi(hi + 1); setPath(hist[hi + 1]); } };
  const up = () => { if (path.length > 1) navigate(path.slice(0, -1)); };

  const pathNodes = isHome
    ? [{ id: "home", name: "Home", type: "dir" as const }]
    : (path.map((id) => os.nodeMap.get(id)).filter(Boolean) as FSNode[]);
  const isBin = curId === "bin" || path[0] === "bin";

  const newFolder = () => {
    const id = os.addNode(curId, { id: os.uid(), name: "New folder", type: "dir", children: [] });
    setSel(id); setRenaming(id); setRenameVal("New folder");
  };

  const commitRename = () => {
    if (renaming && renameVal.trim()) os.updateNode(renaming, { name: renameVal.trim() });
    setRenaming(null);
  };

  const del = () => {
    if (!sel) return;
    if (isBin) {
      const n = os.bin.children?.find((c) => c.id === sel);
      if (n) { os.restoreNode(n.id, "docs"); setSel(null); os.notify("Restored to Documents"); }
      return;
    }
    os.deleteNode(sel); setSel(null);
    os.notify("Moved to Recycle Bin");
  };

  const openNode = (n: FSNode) => {
    if (n.type === "dir") navigate([...path, n.id]);
    else os.openFile(n);
  };

  const rowCls = (id: string) => `cursor-default ${sel === id ? (dk ? "bg-[var(--acc)]/25" : "bg-[var(--acc)]/15") : dk ? "hover:bg-white/[.06]" : "hover:bg-black/[.04]"}`;
  const sizes = (n: FSNode) => n.type === "dir" ? `${n.children?.length ?? 0} items` : n.kind === "img" ? "2.4 MB" : n.kind === "txt" ? `${Math.max(1, Math.round((n.content?.length || 8) / 1024))} KB` : "14 KB";
  const typeName = (n: FSNode) => n.type === "dir" ? (n.kind === "drive" ? "Local Disk" : "File folder") : n.kind === "img" ? "JPG/PNG Image" : n.kind === "txt" ? "Text Document" : "File";

  const ToolBtn = ({ icon, label, onClick, disabled, active }: { icon: React.ReactNode; label: string; onClick: () => void; disabled?: boolean; active?: boolean }) => (
    <button onClick={onClick} disabled={disabled}
      className={`h-8 flex items-center gap-2 px-3 rounded-[4px] text-[12px] transition-colors disabled:opacity-35
        ${active ? (dk ? "bg-white/[.08]" : "bg-black/[.06]") : dk ? "hover:bg-white/[.06]" : "hover:bg-black/[.04]"}`}>
      {icon}<span>{label}</span>
    </button>
  );

  return (
    <div className={`h-full flex flex-col ${dk ? "bg-[#1f1f1f] text-white/90" : "bg-white text-black/85"}`}>
      {/* toolbar */}
      <div className={`flex items-center gap-1 px-2 py-1.5 border-b flex-none ${dk ? "border-white/[.08]" : "border-black/[.07]"}`}>
        <ToolBtn icon={<FolderPlus size={16} />} label="New" onClick={newFolder} disabled={isBin || isHome || ("sys" in cur && !!cur.sys)} />
        <div className={`w-px h-8 mx-0.5 ${dk ? "bg-white/[.1]" : "bg-black/[.1]"}`} />
        <ToolBtn icon={<PenLine size={15} />} label="Rename" disabled={!sel} onClick={() => { if (sel) { setRenaming(sel); setRenameVal(os.nodeMap.get(sel)?.name || ""); } }} />
        {isBin && sel
          ? <ToolBtn icon={<RotateCcw size={15} />} label="Restore" onClick={del} />
          : <ToolBtn icon={<Trash2 size={15} />} label="Delete" disabled={!sel || !!os.nodeMap.get(sel || "")?.sys} onClick={del} />}
        {isBin && <ToolBtn icon={<Trash2 size={15} />} label="Empty bin" disabled={!os.bin.children?.length} onClick={() => { os.emptyBin(); os.notify("Recycle Bin emptied"); }} />}
        <div className={`w-px h-8 mx-0.5 ${dk ? "bg-white/[.1]" : "bg-black/[.1]"}`} />
        <ToolBtn icon={<List size={15} />} label="Details" active={view === "details"} onClick={() => setView("details")} />
        <ToolBtn icon={<LayoutGrid size={15} />} label="Grid" active={view === "grid"} onClick={() => setView("grid")} />
      </div>

      {/* address bar */}
      <div className={`flex items-center gap-1.5 px-2.5 py-1.5 flex-none border-b ${dk ? "border-white/[.08]" : "border-black/[.07]"}`}>
        <button className={`p-1.5 rounded-full disabled:opacity-30 ${dk ? "hover:bg-white/10" : "hover:bg-black/[.06]"}`} onClick={back} disabled={hi <= 0}><ChevronLeft size={15} /></button>
        <button className={`p-1.5 rounded-full disabled:opacity-30 ${dk ? "hover:bg-white/10" : "hover:bg-black/[.06]"}`} onClick={fwd} disabled={hi >= hist.length - 1}><ChevronRight size={15} /></button>
        <button className={`p-1.5 rounded-full disabled:opacity-30 ${dk ? "hover:bg-white/10" : "hover:bg-black/[.06]"}`} onClick={up} disabled={path.length <= 1}><ChevronUp size={15} /></button>
        <div className={`flex-1 flex items-center gap-0.5 h-8 px-2.5 rounded-md border text-[12.5px] overflow-x-auto winscroll whitespace-nowrap
          ${dk ? "bg-black/25 border-white/[.12]" : "bg-white border-black/[.14]"}`}>
          {path[0] !== "bin" && pathNodes[0]?.id !== "bin" ? null : null}
          {pathNodes.map((n, i) => (
            <span key={n.id} className="flex items-center gap-1">
              {i > 0 && <ChevronRight size={11} className="opacity-40" />}
              <button className={`px-1 py-0.5 rounded text-[12.5px] ${dk ? "hover:bg-white/10" : "hover:bg-black/[.06]"} ${i === pathNodes.length - 1 ? "font-medium" : ""}`}
                onClick={() => navigate(path.slice(0, i + 1))}>
                {n.id === "thispc" ? "This PC" : n.name}
              </button>
            </span>
          ))}
        </div>
        <div className={`flex items-center gap-1.5 h-8 px-2.5 w-56 rounded-md border ${dk ? "bg-black/25 border-white/[.12]" : "bg-white border-black/[.14]"}`}>
          <Search size={12} className="opacity-50 flex-none" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={`Search ${cur.id === "thispc" ? "This PC" : cur.name}`}
            className="bg-transparent outline-none text-[12.5px] w-full placeholder:opacity-50" />
        </div>
      </div>

      <div className="flex-1 flex min-h-0">
        {/* nav pane */}
        <div className={`w-48 flex-none overflow-y-auto winscroll px-1.5 py-2 border-r ${dk ? "border-white/[.08]" : "border-black/[.07]"}`}>
          <button onClick={() => navigate(["home"])}
            className={`w-full flex items-center gap-2.5 px-2.5 py-[5px] rounded-md text-[12.5px] ${isHome ? (dk ? "bg-white/10" : "bg-black/[.07]") : dk ? "hover:bg-white/[.06]" : "hover:bg-black/[.045]"}`}>
            <HomeIcon size={16} /> Home
          </button>
          <div className={`my-1.5 border-t ${dk ? "border-white/[.08]" : "border-black/[.08]"}`} />
          {QUICK.map((it) => (
            <button key={it.id} onClick={() => navigate(["thispc", it.id])}
              className={`w-full flex items-center gap-2.5 px-2.5 py-[5px] rounded-md text-[12.5px] ${curId === it.id ? (dk ? "bg-white/10" : "bg-black/[.07]") : dk ? "hover:bg-white/[.06]" : "hover:bg-black/[.045]"}`}>
              <span style={{ color: "var(--acc)" }}>{it.icon}</span>{it.name}
            </button>
          ))}
          <div className={`my-2 border-t ${dk ? "border-white/[.08]" : "border-black/[.08]"}`} />
          <button onClick={() => navigate(["thispc"])}
            className={`w-full flex items-center gap-2 px-2.5 py-[5px] rounded-md text-[12.5px] ${curId === "thispc" ? (dk ? "bg-white/10" : "bg-black/[.07]") : dk ? "hover:bg-white/[.06]" : "hover:bg-black/[.045]"}`}>
            <ThisPCIcon size={17} /> This PC
          </button>
          <button onClick={() => navigate(["bin"])}
            className={`w-full flex items-center gap-2 px-2.5 py-[5px] rounded-md text-[12.5px] ${curId === "bin" ? (dk ? "bg-white/10" : "bg-black/[.07]") : dk ? "hover:bg-white/[.06]" : "hover:bg-black/[.045]"}`}>
            <RecycleIcon size={17} /> Recycle Bin
          </button>
        </div>

        {/* content */}
        <div className="flex-1 min-w-0 overflow-y-auto winscroll" onClick={() => setSel(null)}>
          {isHome ? (
            <div className="p-5">
              <div className="text-[13px] font-semibold mb-3">Quick access</div>
              <div className="grid gap-1.5" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(104px, 1fr))" }}>
                {QUICK.map((it) => (
                  <button key={it.id} onDoubleClick={() => navigate(["thispc", it.id])} onClick={() => navigate(["thispc", it.id])}
                    className={`flex flex-col items-center gap-1.5 px-1 py-4 rounded-lg ${dk ? "hover:bg-white/[.06]" : "hover:bg-black/[.04]"}`}>
                    <ExplorerIcon size={42} />
                    <span className="text-[12px]">{it.name}</span>
                  </button>
                ))}
              </div>
              <div className={`text-[13px] font-semibold mt-6 mb-3 flex items-center gap-2`}><ThisPCIcon size={17} /> This PC</div>
              <div className="grid gap-2">
                {["c", "d"].map((id) => {
                  const n = os.nodeMap.get(id);
                  const free = id === "c" ? 118 : 232; const total = id === "c" ? 256 : 256;
                  return (
                    <button key={id} onClick={() => navigate(["thispc", id])}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-left ${dk ? "hover:bg-white/[.06]" : "hover:bg-black/[.04]"}`}>
                      <DriveIcon size={30} />
                      <span className="flex-1">
                        <span className="block text-[12.5px]">{n?.name}</span>
                        <span className="block h-[5px] mt-1.5 rounded-full overflow-hidden bg-black/[.12]" style={{ maxWidth: 180 }}>
                          <span className="block h-full rounded-full" style={{ width: `${(free / total) * 100}%`, background: free / total < 0.5 ? "#e81123" : "var(--acc)" }} />
                        </span>
                        <span className={`block text-[11px] mt-1 ${dk ? "text-white/50" : "text-black/50"}`}>{free} GB free of {total} GB</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : children.length === 0 ? (
            <div className="h-full grid place-items-center opacity-45">
              <div className="text-center">
                {curId === "bin" ? <RecycleIcon size={64} /> : <ExplorerIcon size={64} />}
                <div className="text-[13px] mt-3">This folder is empty</div>
              </div>
            </div>
          ) : view === "details" ? (
            <table className="w-full text-[12.5px] select-none border-collapse">
              <thead className={`sticky top-0 z-10 ${dk ? "bg-[#1f1f1f] text-white/60" : "bg-white text-black/60"}`}>
                <tr className="text-left text-[11.5px] border-b border-black/[.08]">
                  <th className="font-normal pl-4 py-[5px] w-[46%] hover:bg-black/[.04]">Name</th>
                  <th className="font-normal py-[5px] w-[20%] hover:bg-black/[.04]">Date modified</th>
                  <th className="font-normal py-[5px] w-[18%] hover:bg-black/[.04]">Type</th>
                  <th className="font-normal py-[5px] hover:bg-black/[.04]">Size</th>
                </tr>
              </thead>
              <tbody>
                {children.map((n) => (
                  <tr key={n.id} className={`${rowCls(n.id)} border-b border-transparent leading-tight`}
                    onClick={(e) => { e.stopPropagation(); setSel(n.id); }}
                    onDoubleClick={() => openNode(n)}>
                    <td className="pl-4 py-[3px] flex items-center gap-2.5 min-w-0">
                      <NodeIcon node={n} size={20} />
                      {renaming === n.id ? (
                        <input autoFocus value={renameVal} onChange={(e) => setRenameVal(e.target.value)}
                          onBlur={commitRename} onKeyDown={(e) => { if (e.key === "Enter") commitRename(); if (e.key === "Escape") setRenaming(null); }}
                          className="bg-white text-black text-[12.5px] px-1 h-5 border border-[var(--acc)] outline-none rounded-sm w-44" onClick={(e) => e.stopPropagation()} />
                      ) : <span className="truncate">{n.name}</span>}
                    </td>
                    <td className="opacity-70">{new Date(Date.now() - (n.id.charCodeAt(0) * 37 % 20 + 1) * 86400000).toLocaleDateString()}</td>
                    <td className="opacity-70">{typeName(n)}</td>
                    <td className="opacity-70">{sizes(n)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="grid gap-1 p-3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(96px, 1fr))" }}>
              {children.map((n) => (
                <button key={n.id}
                  onClick={(e) => { e.stopPropagation(); setSel(n.id); }}
                  onDoubleClick={() => openNode(n)}
                  className={`flex flex-col items-center gap-1.5 px-1 py-3 rounded-md ${rowCls(n.id)}`}>
                  {n.kind === "img" && n.src
                    ? <span className="w-20 h-14 rounded overflow-hidden border border-black/10"><img src={n.src} className="w-full h-full object-cover" draggable={false} alt="" /></span>
                    : <NodeIcon node={n} size={44} />}
                  {renaming === n.id ? (
                    <input autoFocus value={renameVal} onChange={(e) => setRenameVal(e.target.value)}
                      onBlur={commitRename} onKeyDown={(e) => { if (e.key === "Enter") commitRename(); if (e.key === "Escape") setRenaming(null); }}
                      className="bg-white text-black text-[11.5px] px-1 border border-[var(--acc)] outline-none rounded-sm w-20 text-center" onClick={(e) => e.stopPropagation()} />
                  ) : <span className="text-[11.5px] text-center leading-tight line-clamp-2 break-words w-full">{n.name}</span>}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* status bar */}
      <div className={`h-6.5 flex items-center gap-4 px-4 text-[11.5px] border-t flex-none py-1 ${dk ? "border-white/[.08] text-white/55" : "border-black/[.07] text-black/55"}`}>
        <span>{children.length} items</span>
        {sel && <span>1 item selected</span>}
        {sel && os.nodeMap.get(sel) && <span>{sizes(os.nodeMap.get(sel)!)}</span>}
      </div>
    </div>
  );
}
