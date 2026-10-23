import { useState } from "react";
import { useOS } from "../os/os";
import { Search, Star, Download, Play, Music2, MessageCircle, Gamepad2, Film, Code2, Video } from "lucide-react";
import { EdgeIcon, NotepadIcon, CalcIcon, PaintIcon, PhotosIcon, TerminalIcon } from "../os/icons";

interface StoreApp {
  id: string; name: string; cat: string; rating: number; icon: React.ReactNode; real?: boolean; hue: string;
}

const CATALOG: StoreApp[] = [
  { id: "edge", name: "Microsoft Edge", cat: "Productivity", rating: 4.6, icon: <EdgeIcon size={30} />, real: true, hue: "" },
  { id: "notepad", name: "Notepad", cat: "Productivity", rating: 4.4, icon: <NotepadIcon size={30} />, real: true, hue: "" },
  { id: "calculator", name: "Windows Calculator", cat: "Utilities", rating: 4.5, icon: <CalcIcon size={30} />, real: true, hue: "" },
  { id: "paint", name: "Paint", cat: "Creativity", rating: 4.2, icon: <PaintIcon size={30} />, real: true, hue: "" },
  { id: "photos", name: "Microsoft Photos", cat: "Photos & video", rating: 4.1, icon: <PhotosIcon size={30} />, real: true, hue: "" },
  { id: "terminal", name: "Windows Terminal", cat: "Developer tools", rating: 4.8, icon: <TerminalIcon size={30} />, real: true, hue: "" },
  { id: "spotify", name: "Spotify Music", cat: "Music", rating: 4.5, icon: <Music2 size={17} color="#fff" />, hue: "#1DB954" },
  { id: "netflix", name: "Netflix", cat: "Entertainment", rating: 4.3, icon: <Film size={17} color="#fff" />, hue: "#E50914" },
  { id: "whatsapp", name: "WhatsApp", cat: "Social", rating: 4.1, icon: <MessageCircle size={17} color="#fff" />, hue: "#25D366" },
  { id: "discord", name: "Discord", cat: "Social", rating: 4.4, icon: <Gamepad2 size={17} color="#fff" />, hue: "#5865F2" },
  { id: "vscode", name: "Visual Studio Code", cat: "Developer tools", rating: 4.9, icon: <Code2 size={17} color="#fff" />, hue: "#007ACC" },
  { id: "zoom", name: "Zoom", cat: "Productivity", rating: 3.9, icon: <Video size={17} color="#fff" />, hue: "#2D8CFF" },
];

function Stars({ n }: { n: number }) {
  return (
    <span className="flex items-center gap-[1px]">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} size={10} className={i <= Math.round(n) ? "fill-amber-400 text-amber-400" : "fill-black/15 text-black/15"} />
      ))}
    </span>
  );
}

export default function Store() {
  const os = useOS();
  const dk = os.dark;
  const [q, setQ] = useState("");
  const [states, setStates] = useState<Record<string, "idle" | "ing" | "done">>({});
  const [prog, setProg] = useState<Record<string, number>>({});

  const get = (a: StoreApp) => {
    if (states[a.id] === "ing") return;
    if (a.real && os.installed.has(a.id)) { os.openApp(a.id); return; }
    if (states[a.id] === "done") { a.real ? os.openApp(a.id) : os.notify(`Try that again - something happened on our end`); return; }
    setStates((s) => ({ ...s, [a.id]: "ing" }));
    let p = 0;
    const t = setInterval(() => {
      p += 8 + Math.random() * 16;
      if (p >= 100) {
        clearInterval(t);
        setStates((s) => ({ ...s, [a.id]: "done" }));
        if (a.real) { os.install(a.id); os.notify(`${a.name} installed`); }
        else os.notify(`${a.name} installed`);
      } else setProg((r) => ({ ...r, [a.id]: Math.min(99, Math.round(p)) }));
    }, 160);
  };

  const actionLabel = (a: StoreApp) => {
    if (a.real && os.installed.has(a.id)) return <><Play size={11} /> Open</>;
    const st = states[a.id];
    if (st === "ing") return <span className="tabular-nums">{prog[a.id] ?? 0}%</span>;
    if (st === "done") return a.real ? <><Play size={11} /> Open</> : "Installed";
    return <><Download size={11} /> Get</>;
  };

  const list = CATALOG.filter((a) => a.name.toLowerCase().includes(q.toLowerCase()) || a.cat.toLowerCase().includes(q.toLowerCase()));
  const hero = CATALOG.find((a) => a.id === "terminal")!;

  return (
    <div className={`h-full flex flex-col ${dk ? "bg-[#202020] text-white/90" : "bg-[#f3f3f3] text-black/85"}`}>
      <div className="h-12 flex items-center gap-6 px-5 flex-none">
        <span className="text-[13px] font-medium border-b-2 pb-3 -mb-3.5 pt-1" style={{ borderColor: "var(--acc)" }}>Home</span>
        <span className="text-[13px] opacity-60">Apps</span>
        <span className="text-[13px] opacity-60">Games</span>
        <div className={`ml-auto flex items-center gap-2 px-3 h-8 w-64 rounded-md border ${dk ? "bg-black/25 border-white/[.1]" : "bg-white border-black/[.12]"}`}>
          <Search size={13} className="opacity-50" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search apps, games, and more"
            className="bg-transparent outline-none text-[12.5px] w-full placeholder:opacity-50" />
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto winscroll px-5 pb-6">
        {!q && (
          <div className="relative mt-3 rounded-xl overflow-hidden h-44 mb-6 flex items-center bg-gradient-to-r from-[#0b3d91] via-[#1558b0] to-[#3e8fe0]">
            <div className="absolute inset-0 opacity-25" style={{ background: "radial-gradient(circle at 80% 20%, rgba(255,255,255,.5), transparent 45%)" }} />
            <div className="relative z-10 px-8 text-white">
              <div className="text-[11px] uppercase tracking-widest opacity-80 mb-1">Essential apps</div>
              <div className="text-[24px] font-semibold leading-tight">Power up your terminal</div>
              <div className="text-[13px] opacity-85 mt-1 mb-3">Windows Terminal — tabs, panes, and a real command line.</div>
              <button onClick={() => get(hero)} className="bg-white text-black text-[12.5px] font-medium px-4 py-1.5 rounded-md hover:bg-white/90 flex items-center gap-1.5">
                <Download size={12} /> Get
              </button>
            </div>
            <TerminalIcon size={120} className="absolute right-10 -bottom-4 rotate-6 drop-shadow-2xl" />
          </div>
        )}

        <h2 className="text-[16px] font-semibold mb-3">{q ? `Results for "${q}"` : "Top free apps"}</h2>
        <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))" }}>
          {list.map((a) => {
            const ing = states[a.id] === "ing";
            return (
              <div key={a.id} className={`rounded-xl border p-3.5 flex flex-col gap-2.5 transition-shadow hover:shadow-lg
                ${dk ? "bg-[#2b2b2b] border-white/[.07]" : "bg-white border-black/[.07]"}`}>
                <div className="flex items-center gap-3">
                  <span className="w-11 h-11 rounded-xl grid place-items-center flex-none overflow-hidden" style={a.hue ? { background: a.hue } : undefined}>
                    {a.icon}
                  </span>
                  <div className="min-w-0">
                    <div className="text-[13px] font-medium truncate">{a.name}</div>
                    <div className={`text-[11.5px] ${dk ? "text-white/50" : "text-black/50"} truncate`}>{a.cat}</div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5"><Stars n={a.rating} /><span className={`text-[11px] ${dk ? "text-white/50" : "text-black/50"}`}>{a.rating}</span></div>
                <button onClick={() => get(a)} disabled={ing}
                  className={`relative overflow-hidden mt-auto h-7 rounded-full text-[11.5px] font-medium flex items-center justify-center gap-1.5 transition
                    ${ing ? "bg-black/[.08] text-black/50 cursor-default" : "text-white hover:brightness-110"}`}
                  style={ing ? undefined : { background: "var(--acc)" }}>
                  {ing && <span className="absolute inset-y-0 left-0 bg-[var(--acc)]/25 transition-all" style={{ width: `${prog[a.id] ?? 0}%` }} />}
                  <span className="relative z-10 flex items-center gap-1.5">{actionLabel(a)}</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
