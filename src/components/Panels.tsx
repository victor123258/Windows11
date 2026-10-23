import { useState } from "react";
import { useOS, useNow } from "../os/os";
import { APPS } from "../os/registry";
import { WifiGlyph, VolGlyph, BatteryGlyph, CloudGlyph, ShieldGlyph, SearchIcon, EdgeIcon, WeatherIcon } from "../os/icons";
import { Bluetooth, Plane, X, BellOff, ChevronLeft, ChevronRight, Zap, SunMoon, Accessibility, Check } from "lucide-react";
import { STOCK } from "../os/media";

/* Click-away layer that closes any open panel */
export function ClickAway() {
  const os = useOS();
  if (!os.panel) return null;
  return <div className="fixed inset-0 z-[380]" onPointerDown={os.closePanels} />;
}

const shell = (dk: boolean) =>
  `fixed mica z-[390] rounded-[8px] border backdrop-blur-[40px] backdrop-saturate-[1.8] shadow-[0_8px_32px_rgba(0,0,0,.28)] anim-pop ${
    dk ? "bg-[#2c2c2c]/[.88] border-white/[.06] text-white/90" : "bg-[#f9f9f9]/[.88] border-black/[.05] text-[#1a1a1a]"}`;

/* ------------------------------ Quick Settings ------------------------------ */
export function QuickSettings() {
  const os = useOS();
  const dk = os.dark;
  const [saver, setSaver] = useState(false);
  const [night, setNight] = useState(false);
  const [access, setAccess] = useState(false);

  const tiles = [
    { icon: <WifiGlyph size={17} />, label: "Wi-Fi", on: os.wifi, set: () => os.setWifi(!os.wifi), sub: os.wifi ? "HomeNet 5G" : "Off", dis: os.airplane },
    { icon: <Bluetooth size={16} />, label: "Bluetooth", on: os.bt, set: () => os.setBt(!os.bt), sub: os.bt ? "On" : "Off", dis: os.airplane },
    { icon: <Plane size={16} className="-rotate-45" />, label: "Airplane mode", on: os.airplane, set: () => os.setAirplane(!os.airplane) },
    { icon: <Zap size={16} />, label: "Battery saver", on: saver, set: () => setSaver(!saver) },
    { icon: <SunMoon size={16} />, label: "Night light", on: night, set: () => setNight(!night) },
    { icon: <Accessibility size={16} />, label: "Accessibility", on: access, set: () => setAccess(!access) },
  ];

  return (
    <div className={`${shell(dk)} right-2 bottom-[46px] w-[360px] p-4`} onPointerDown={(e) => e.stopPropagation()}>
      <div className="grid grid-cols-3 gap-2.5 mb-5">
        {tiles.map((t) => (
          <button key={t.label} disabled={t.dis} onClick={t.set}
            className={`relative rounded-lg border px-2.5 py-3 text-left transition disabled:opacity-40
              ${t.on ? "border-transparent text-white" : dk ? "bg-[#3b3b3b] border-white/[.08] hover:border-white/20" : "bg-white border-black/[.08] hover:border-black/25 shadow-sm"}`}
            style={t.on ? { background: "var(--acc)" } : undefined}>
            {!t.on && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-0" />}
            <span className="flex items-center gap-2 flex-wrap">
              {t.icon}
              <span className="w-full text-[11.5px] font-medium leading-tight">{t.label}</span>
              {t.sub && <span className={`w-full text-[10.5px] ${t.on ? "text-white/80" : "opacity-50"}`}>{t.sub}</span>}
            </span>
          </button>
        ))}
      </div>
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <span className={dk ? "text-white/70" : "text-black/60"}><svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor"><circle cx="10" cy="10" r="4" /><g stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M10 1.8V4M10 16V18.2M1.8 10H4M16 10h2.2M4.2 4.2L5.8 5.8M14.2 14.2l1.6 1.6M15.8 4.2l-1.6 1.6M5.8 14.2l-1.6 1.6" /></g></svg></span>
          <input type="range" min={25} max={100} value={os.brightness} onChange={(e) => os.setBrightness(+e.target.value)} className="wslider flex-1" style={{ ["--fill" as string]: `${os.brightness}%` }} />
          <span className="text-[11px] w-7 text-right opacity-60">{os.brightness}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className={dk ? "text-white/70" : "text-black/60"}><VolGlyph size={16} /></span>
          <input type="range" min={0} max={100} value={os.volume} onChange={(e) => os.setVolume(+e.target.value)} className="wslider flex-1" style={{ ["--fill" as string]: `${os.volume}%` }} />
          <span className="text-[11px] w-7 text-right opacity-60">{os.volume}</span>
        </div>
      </div>
      <div className="mt-4 pt-3 border-t flex items-center justify-between text-[12px]" style={{ borderColor: dk ? "rgba(255,255,255,.09)" : "rgba(0,0,0,.08)" }}>
        <span className="flex items-center gap-1.5 opacity-75"><BatteryGlyph size={15} /> 80%</span>
        <button className="opacity-60 hover:opacity-100 hover:underline" onClick={() => { os.openApp("settings", { page: "system" }); }}>All settings</button>
      </div>
    </div>
  );
}

/* ------------------------------ Calendar ------------------------------ */
export function CalendarFlyout() {
  const os = useOS();
  const dk = os.dark;
  const now = new Date();
  const [off, setOff] = useState(0);
  const view = new Date(now.getFullYear(), now.getMonth() + off, 1);
  const first = new Date(view.getFullYear(), view.getMonth(), 1).getDay();
  const days = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate();
  const cells: (number | null)[] = [...Array<null>(first).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)];
  while (cells.length % 7) cells.push(null);
  const isToday = (d: number | null) => d !== null && off === 0 && d === now.getDate();

  const notifs = [
    { app: "Microsoft Store", msg: "Windows Terminal was installed successfully", time: "9:41 AM" },
    { app: "Tips", msg: "Did you know? Drag a window to the screen edge to snap it", time: "8:15 AM" },
  ];

  return (
    <div className={`${shell(dk)} right-2 bottom-[46px] w-[360px] max-h-[calc(100vh-64px)] overflow-hidden flex flex-col`} onPointerDown={(e) => e.stopPropagation()}>
      <div className="flex items-center justify-between px-4 pt-3.5 pb-2 flex-none">
        <span className="text-[15px] font-semibold">Notifications</span>
        <button className="text-[11.5px] opacity-60 hover:opacity-100 hover:underline" onClick={() => os.notify("All caught up")}>Clear all</button>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto winscroll px-2.5 pb-2 space-y-1.5">
        {notifs.map((n, i) => (
          <div key={i} className={`rounded-lg border p-3 ${dk ? "bg-white/[.05] border-white/[.07]" : "bg-white border-black/[.07] shadow-sm"}`}>
            <div className="flex items-center justify-between text-[11px] opacity-60 mb-1"><span>{n.app}</span><span>{n.time}</span></div>
            <div className="text-[12.5px] leading-snug">{n.msg}</div>
          </div>
        ))}
      </div>
      <div className="flex-none px-4 py-3 border-t" style={{ borderColor: dk ? "rgba(255,255,255,.09)" : "rgba(0,0,0,.08)" }}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[13.5px] font-semibold">{view.toLocaleDateString([], { month: "long", year: "numeric" })}</span>
          <span className="flex gap-1">
            <button className={`p-1 rounded ${dk ? "hover:bg-white/10" : "hover:bg-black/[.06]"}`} onClick={() => setOff(off - 1)}><ChevronLeft size={14} /></button>
            <button className={`p-1 rounded ${dk ? "hover:bg-white/10" : "hover:bg-black/[.06]"}`} onClick={() => setOff(0)}><span className="text-[11px] px-1">Today</span></button>
            <button className={`p-1 rounded ${dk ? "hover:bg-white/10" : "hover:bg-black/[.06]"}`} onClick={() => setOff(off + 1)}><ChevronRight size={14} /></button>
          </span>
        </div>
        <div className="grid grid-cols-7 text-center text-[10.5px] opacity-55 mb-1">
          {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => <span key={d}>{d}</span>)}
        </div>
        <div className="grid grid-cols-7 gap-[2px] text-center text-[12px]">
          {cells.map((d, i) => (
            <span key={i} className={`py-[3px] rounded-full ${d === null ? "" : dk ? "hover:bg-white/[.09]" : "hover:bg-black/[.06]"}
              ${isToday(d) ? "text-white font-semibold" : ""}`}
              style={isToday(d) ? { background: "var(--acc)" } : undefined}>{d ?? ""}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------ Widgets ------------------------------ */
export function Widgets() {
  const os = useOS();
  const dk = os.dark;
  const now = useNow(60000);
  const card = `rounded-xl border overflow-hidden ${dk ? "bg-[#2d2d2d] border-white/[.08]" : "bg-white/85 border-black/[.07] shadow-sm"}`;
  const news = [
    { img: STOCK.tian, t: "Stunning new photos reveal Earth's most remote peaks", s: "National Geo", url: "https://www.google.com/search?q=mountain+photography" },
    { img: STOCK.alps, t: "Autumn in the Alps: the season's best light", s: "Travel Weekly", url: "https://www.google.com/search?q=alps+autumn+travel" },
    { img: STOCK.forest, t: "Why everyone is talking about the new web", s: "The Verge", url: "https://www.google.com/search?q=tech+news" },
  ];
  return (
    <div
      className={`fixed left-0 top-0 bottom-11 z-[390] w-[680px] max-w-[94vw] anim-pop-l backdrop-blur-3xl border-r overflow-y-auto winscroll p-6
        ${dk ? "bg-[#1e1e1e]/90 border-white/[.09] text-white/90" : "bg-[#eef3f8]/92 border-black/[.08] text-black/85"}`}
      onPointerDown={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between mb-5">
        <span className="text-[20px] font-semibold">Good afternoon</span>
        <span className="text-[13px] opacity-60">{now.toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" })}</span>
      </div>
      <div className="grid grid-cols-2 gap-3.5">
        {/* weather */}
        <div className={`${card} col-span-2 p-4 flex items-center gap-5`}>
          <WeatherIcon size={64} />
          <div>
            <div className="text-[34px] font-semibold leading-none">72°F</div>
            <div className="text-[12.5px] opacity-60 mt-1">Mostly sunny · Redmond, WA</div>
          </div>
          <div className="ml-auto grid grid-cols-5 gap-4 text-center text-[11.5px]">
            {["Now", "1 PM", "2 PM", "3 PM", "4 PM"].map((h, i) => (
              <div key={h} className="flex flex-col items-center gap-1">
                <span className="opacity-60">{h}</span><WeatherIcon size={20} /><span className="font-medium">{72 + [0, 2, 3, 1, -1][i]}°</span>
              </div>
            ))}
          </div>
        </div>
        {/* markets */}
        <div className={`${card} p-4`}>
          <div className="text-[13.5px] font-semibold mb-2.5">Watchlist</div>
          {[
            ["MSFT", "Microsoft", "+1.42%", true], ["AAPL", "Apple", "+0.68%", true], ["NVDA", "NVIDIA", "-0.35%", false],
          ].map(([s, n, ch, upP]) => (
            <div key={s as string} className="flex items-center justify-between py-1.5 text-[12.5px]">
              <span><b>{s}</b> <span className="opacity-55">{n}</span></span>
              <span className={upP ? "text-green-500" : "text-red-400"}>{ch}</span>
            </div>
          ))}
        </div>
        {/* tip card */}
        <div className={`${card} p-4 flex flex-col`}>
          <span className="text-[11px] uppercase tracking-wider font-semibold" style={{ color: "var(--acc)" }}>Tip of the day</span>
          <p className="text-[12.5px] mt-2 leading-relaxed opacity-80 flex-1">Drag any window to the left or right edge of the screen to snap it into place.</p>
          <button className="text-[12px] text-left hover:underline mt-2" style={{ color: "var(--acc)" }}
            onClick={() => { os.closePanels(); os.openApp("settings", { page: "personalization" }); }}>Personalize Windows</button>
        </div>
        {/* news */}
        {news.map((n, i) => (
          <button key={i} className={`${card} text-left group ${i === 0 ? "col-span-2 flex" : ""}`}
            onClick={() => { os.closePanels(); os.openApp("edge", { url: n.url }); }}>
            <img src={n.img} className={`${i === 0 ? "w-1/2 h-36" : "w-full h-24"} object-cover group-hover:opacity-95`} alt="" />
            <div className="p-3">
              <span className="text-[10.5px] uppercase tracking-wide opacity-50">{n.s}</span>
              <div className="text-[13px] font-medium leading-snug mt-0.5">{n.t}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------ Search ------------------------------ */
export function SearchPanel() {
  const os = useOS();
  const dk = os.dark;
  const [q, setQ] = useState("");
  const apps = Object.values(APPS).filter((a) => a.name.toLowerCase().includes(q.toLowerCase()));
  const hover = dk ? "hover:bg-white/[.08]" : "hover:bg-white/80";

  return (
    <div className={`${shell(dk)} left-1/2 -translate-x-1/2 bottom-[46px] w-[620px] max-w-[94vw] h-[560px] max-h-[calc(100vh-64px)] flex flex-col`}
      onPointerDown={(e) => e.stopPropagation()}>
      <div className={`flex items-center gap-2.5 mx-5 mt-5 h-10 rounded-full border px-4 flex-none
        ${dk ? "bg-white/[.08] border-white/[.15]" : "bg-white border-black/[.15]"} focus-within:ring-1 ring-[var(--acc)]`}>
        <SearchIcon size={15} className="opacity-70" />
        <input autoFocus value={q} onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && apps[0]) { os.openApp(apps[0].id); setQ(""); } }}
          placeholder="Apps, documents, and web"
          className="w-full bg-transparent outline-none text-[13.5px] placeholder:opacity-55" />
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto winscroll p-5 pt-3">
        {q.trim() ? (
          <div className="anim-fade">
            <div className="text-[12px] font-semibold opacity-60 mb-1.5 px-1">Apps</div>
            {apps.length === 0 && <div className="text-[13px] opacity-55 px-1 py-2">No apps found</div>}
            {apps.map((a) => (
              <button key={a.id} onClick={() => { os.openApp(a.id); setQ(""); }} className={`w-full flex items-center gap-3.5 px-2 py-2 rounded-md ${hover} text-left`}>
                {a.icon(30)}<span className="text-[13.5px]">{a.name}</span>
              </button>
            ))}
            <div className="text-[12px] font-semibold opacity-60 mt-4 mb-1.5 px-1">Web</div>
            <button onClick={() => { os.openApp("edge", { url: `https://www.google.com/search?q=${encodeURIComponent(q)}` }); setQ(""); }}
              className={`w-full flex items-center gap-3.5 px-2 py-2 rounded-md ${hover} text-left`}>
              <EdgeIcon size={30} /><span className="text-[13.5px]">Search the web for “{q}”</span>
            </button>
          </div>
        ) : (
          <>
            <div className="text-[12px] font-semibold opacity-60 mb-2">Top apps</div>
            <div className="grid grid-cols-5 gap-1">
              {["edge", "explorer", "store", "settings", "terminal"].map((id) => (
                <button key={id} onClick={() => os.openApp(id)} className={`flex flex-col items-center gap-1.5 py-2.5 rounded-md ${hover}`}>
                  {APPS[id].icon(30)}<span className="text-[10.5px] text-center leading-tight line-clamp-2 px-1">{APPS[id].name}</span>
                </button>
              ))}
            </div>
            <div className="text-[12px] font-semibold opacity-60 mt-5 mb-2">Quick searches</div>
            {["Windows 11 features", "Weather today", "Mountain wallpapers"].map((s) => (
              <button key={s} onClick={() => os.openApp("edge", { url: `https://www.google.com/search?q=${encodeURIComponent(s)}` })}
                className={`w-full flex items-center gap-3 px-2 py-2 rounded-md ${hover} text-left`}>
                <SearchIcon size={14} className="opacity-55" /><span className="text-[13px]">{s}</span>
              </button>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

/* ------------------------------ Tray flyout ------------------------------ */
export function TrayFlyout() {
  const os = useOS();
  const dk = os.dark;
  const items = [
    { icon: <CloudGlyph size={17} />, name: "OneDrive — up to date" },
    { icon: <ShieldGlyph size={17} />, name: "Windows Security — no actions needed" },
    { icon: <BellOff size={15} />, name: "Focus assist — off" },
  ];
  return (
    <div className={`${shell(dk)} right-[70px] bottom-[46px] p-2 w-64`} onPointerDown={(e) => e.stopPropagation()}>
      <div className="grid grid-cols-3 gap-1">
        {items.map((it) => (
          <button key={it.name} title={it.name} className={`h-10 grid place-items-center rounded-md ${dk ? "hover:bg-white/[.09]" : "hover:bg-white/80"}`}>{it.icon}</button>
        ))}
      </div>
      <div className="px-2 pt-2 text-[10.5px] opacity-55">3 hidden icons</div>
    </div>
  );
}

/* ------------------------------ Task view ------------------------------ */
export function TaskView() {
  const os = useOS();
  const dk = os.dark;
  return (
    <div className="fixed inset-0 z-[390] bg-black/45 backdrop-blur-md flex flex-col items-center justify-center anim-fade" onPointerDown={os.closePanels}>
      <div className="flex gap-4 items-end flex-wrap justify-center px-8">
        {os.wins.length === 0 && <div className="text-white/85 text-[15px]">No open windows — press Esc to go back</div>}
        {os.wins.map((w) => (
          <button key={w.id}
            onClick={(e) => { e.stopPropagation(); os.focusWin(w.id); os.closePanels(); }}
            className="group relative w-56 rounded-xl overflow-hidden border border-white/20 bg-gradient-to-br from-[#2b4a6b] to-[#182736] shadow-2xl transition-transform hover:-translate-y-1.5 hover:scale-[1.02] anim-pop">
            <div className="h-7 flex items-center px-2 gap-1.5 bg-black/25">
              {APPS[w.app]?.icon(13)}
              <span className="text-[11px] text-white/85 truncate">{w.title}</span>
              <span role="button" tabIndex={-1} className="ml-auto w-4.5 h-4.5 p-0.5 grid place-items-center rounded-full hover:bg-white/20 text-white/70"
                onClick={(e) => { e.stopPropagation(); os.closeWin(w.id); }}>
                <X size={11} />
              </span>
            </div>
            <div className="h-32 grid place-items-center">{APPS[w.app]?.icon(44)}</div>
          </button>
        ))}
        <button onClick={(e) => { e.stopPropagation(); os.notify("Virtual desktops are not supported on this device"); }}
          className="w-40 h-[164px] rounded-xl border-2 border-dashed border-white/30 grid place-items-center text-white/60 hover:border-white/60 hover:text-white/85 transition">
          <span className="text-[12.5px]">+ New desktop</span>
        </button>
      </div>
      <div className={`mt-8 px-4 py-2 rounded-full text-[12px] ${dk ? "text-white/70" : "text-white/80"}`}>Desktop 1</div>
    </div>
  );
}

/* ------------------------------ Toast ------------------------------ */
export function Toast() {
  const os = useOS();
  const dk = os.dark;
  if (!os.toast) return null;
  return (
    <div
      className={`fixed right-3 bottom-[46px] z-[500] flex items-center gap-3 pl-3 pr-4 py-3 rounded-lg border shadow-2xl max-w-[340px]
        ${dk ? "bg-[#2b2b2b] border-white/[.1] text-white/90" : "bg-[#f9f9f9] border-black/[.1] text-black/85"}`}
      style={{ animation: "toastIn .25s cubic-bezier(.2,.9,.3,1.15) both" }}
    >
      <span className="w-7 h-7 rounded-full grid place-items-center text-white flex-none" style={{ background: "var(--acc)" }}><Check size={14} /></span>
      <span className="text-[12.5px] leading-snug">{os.toast.msg}</span>
    </div>
  );
}
