import { useEffect, useMemo, useRef, useState } from "react";
import type { Win } from "../os/os";
import { useOS } from "../os/os";
import { Save, ChevronDown } from "lucide-react";

export default function Notepad({ win }: { win: Win }) {
  const os = useOS();
  const fileId = (win.props?.fileId as string) || null;
  const node = fileId ? os.nodeMap.get(fileId) : null;
  const [text, setText] = useState(node?.content ?? "");
  const [savedId, setSavedId] = useState<string | null>(fileId);
  const [menu, setMenu] = useState<null | "file" | "edit">(null);
  const [dirty, setDirty] = useState(false);
  const [pos, setPos] = useState({ ln: 1, col: 1 });
  const taRef = useRef<HTMLTextAreaElement>(null);
  const lastT = useRef<number>(0);

  // react to external "open file" on existing window
  useEffect(() => {
    const t = win.props?._t as number | undefined;
    if (t && t !== lastT.current) {
      lastT.current = t;
      const id = win.props?.fileId as string | null;
      const n = id ? os.nodeMap.get(id) : null;
      setText(n?.content ?? ""); setSavedId(id); setDirty(false);
    }
  }, [win.props, os]);

  const name = useMemo(() => (savedId ? os.nodeMap.get(savedId)?.name : undefined) || "Untitled.txt", [savedId, os.nodeMap]);

  const save = () => {
    if (savedId) { os.updateNode(savedId, { content: text }); }
    else {
      const id = os.addNode("docs", { id: os.uid(), name: "Untitled.txt", type: "file", kind: "txt", content: text });
      setSavedId(id);
    }
    setDirty(false);
    os.notify("Document saved to Documents");
  };

  const updatePos = () => {
    const el = taRef.current; if (!el) return;
    const upto = el.value.slice(0, el.selectionStart);
    const ln = upto.split("\n").length;
    const col = upto.length - upto.lastIndexOf("\n");
    setPos({ ln, col });
  };

  const MenuItem = ({ label, onClick }: { label: string; onClick: () => void }) => (
    <button className={`w-full text-left px-4 py-1.5 text-[13px] ${os.dark ? "hover:bg-white/10" : "hover:bg-black/[.05]"} rounded`} onClick={() => { setMenu(null); onClick(); }}>{label}</button>
  );

  return (
    <div className={`h-full flex flex-col ${os.dark ? "bg-[#2b2b2b] text-white/90" : "bg-white text-black/85"}`} onClick={() => menu && setMenu(null)}>
      <div className={`flex items-center h-9 px-1.5 gap-0.5 text-[13px] flex-none border-b ${os.dark ? "border-white/10" : "border-black/[.06]"}`}>
        <button className="px-2.5 py-1 rounded hover:bg-black/[.05] flex items-center gap-1" onClick={(e) => { e.stopPropagation(); setMenu(menu === "file" ? null : "file"); }}>
          File <ChevronDown size={12} className="opacity-60" />
        </button>
        <button className="px-2.5 py-1 rounded hover:bg-black/[.05] flex items-center gap-1" onClick={(e) => { e.stopPropagation(); setMenu(menu === "edit" ? null : "edit"); }}>
          Edit <ChevronDown size={12} className="opacity-60" />
        </button>
        <span className="ml-3 text-[12px] opacity-60">{name}{dirty ? " •" : ""}</span>
        <button className="ml-auto mr-1.5 px-3 py-1 rounded text-[12px] flex items-center gap-1.5 hover:bg-black/[.06]" onClick={save}>
          <Save size={13} /> Save
        </button>
      </div>
      {menu === "file" && (
        <div className={`absolute left-2 top-16 z-50 w-52 rounded-lg border shadow-xl p-1 anim-pop
          ${os.dark ? "bg-[#2c2c2c] border-white/10" : "bg-[#f9f9f9] border-black/10"}`} onClick={(e) => e.stopPropagation()}>
          <MenuItem label="New" onClick={() => { setText(""); setSavedId(null); setDirty(false); }} />
          <MenuItem label="Save" onClick={save} />
          <MenuItem label="Save as copy to Documents" onClick={() => { os.addNode("docs", { id: os.uid(), name: name, type: "file", kind: "txt", content: text }); os.notify("Copy saved to Documents"); setDirty(false); }} />
          <div className={`my-1 border-t ${os.dark ? "border-white/10" : "border-black/[.07]"}`} />
          <MenuItem label="Close" onClick={() => os.closeWin(win.id)} />
        </div>
      )}
      <textarea
        ref={taRef}
        value={text}
        spellCheck={false}
        onChange={(e) => { setText(e.target.value); setDirty(true); }}
        onSelect={updatePos}
        onKeyUp={updatePos}
        onClick={updatePos}
        className="flex-1 resize-none outline-none bg-transparent px-4 py-2 text-[15px] leading-relaxed select-ok winscroll"
        style={{ fontFamily: "Cascadia Code, Consolas, monospace" }}
        placeholder="Type here…"
      />
      <div className={`h-7 flex items-center justify-end gap-5 px-4 text-[12px] flex-none border-t
        ${os.dark ? "border-white/10 text-white/60" : "border-black/[.06] text-black/55"}`}>
        <span>Ln {pos.ln}, Col {pos.col}</span>
        <span>{text.length} characters</span>
        <span>100%</span>
        <span>Windows (CRLF)</span>
        <span>UTF-8</span>
      </div>
    </div>
  );
}
