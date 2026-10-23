import { useState, useEffect } from "react";
import type { Win } from "../os/os";
import { useOS } from "../os/os";
import { WALLPAPERS } from "../os/media";
import {
  Monitor, Paintbrush, AppWindow, UserRound, RefreshCw, Search, ChevronRight,
  Laptop, Volume2, Wifi, Check, Sun, Moon, BatteryMedium,
} from "lucide-react";
import { AvatarIcon } from "../os/icons";

type Page = "system" | "display" | "personalization" | "apps" | "accounts" | "update";

const NAV: { id: Page; name: string; icon: React.ReactNode }[] = [
  { id: "system", name: "System", icon: <Monitor size={16} /> },
  { id: "display", name: "Display", icon: <Sun size={16} /> },
  { id: "personalization", name: "Personalization", icon: <Paintbrush size={16} /> },
  { id: "apps", name: "Apps", icon: <AppWindow size={16} /> },
  { id: "accounts", name: "Accounts", icon: <UserRound size={16} /> },
  { id: "update", name: "Windows Update", icon: <RefreshCw size={16} /> },
];

const APP_LIST = [
  { name: "Microsoft Edge", size: "512 MB" }, { name: "File Explorer", size: "48 MB" },
  { name: "Notepad", size: "12 MB" }, { name: "Calculator", size: "8 MB" },
  { name: "Paint", size: "21 MB" }, { name: "Photos", size: "96 MB" },
  { name: "Microsoft Store", size: "148 MB" }, { name: "Windows Terminal", size: "32 MB" },
  { name: "Settings", size: "15 MB" },
];

const ACCENTS = ["#0067c0", "#0078d4", "#4f6bed", "#8e43e7", "#c239b3", "#e81123", "#e3008c", "#ff8c00", "#107c10", "#038387"];

export default function Settings({ win }: { win: Win }) {
  const os = useOS();
  const dk = os.dark;
  const [page, setPage] = useState<Page>((win.props?.page as Page) || "system");
  const [q, setQ] = useState("");
  const [checking, setChecking] = useState(false);
  const [checked, setChecked] = useState(false);
  const [night, setNight] = useState(false);

  useEffect(() => { if (win.props?.page) setPage(win.props.page as Page); }, [win.props]);

  const filtered = NAV.filter((n) => n.name.toLowerCase().includes(q.toLowerCase()));

  const bg = dk ? "bg-[#262626]" : "bg-[#f3f3f3]";
  const card = dk ? "bg-[#2d2d2d] border-white/[.07]" : "bg-white border-black/[.07]";
  const hoverRow = dk ? "hover:bg-white/[.06]" : "hover:bg-black/[.04]";
  const muted = dk ? "text-white/55" : "text-black/55";

  const Row = ({ icon, title, sub, onClick, right }: { icon: React.ReactNode; title: string; sub: string; onClick?: () => void; right?: React.ReactNode }) => (
    <button onClick={onClick} className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-lg border ${card} ${onClick ? hoverRow : ""} transition-colors text-left`}>
      <span className={`w-8 h-8 grid place-items-center rounded-md ${dk ? "bg-white/[.07]" : "bg-black/[.05]"}`}>{icon}</span>
      <span className="flex-1 min-w-0">
        <span className="block text-[13.5px]">{title}</span>
        <span className={`block text-[12px] ${muted}`}>{sub}</span>
      </span>
      {right || (onClick ? <ChevronRight size={15} className={muted} /> : null)}
    </button>
  );

  return (
    <div className={`h-full flex ${bg} ${dk ? "text-white/90" : "text-black/85"}`}>
      {/* nav */}
      <div className="w-[240px] flex-none flex flex-col p-2 gap-[2px] border-r border-black/[.06] overflow-y-auto winscroll" style={dk ? { borderColor: "rgba(255,255,255,.08)" } : undefined}>
        <div className="flex items-center gap-2.5 px-2 py-3">
          <AvatarIcon size={36} />
          <div className="min-w-0"><div className="text-[13px] font-semibold truncate">User</div><div className={`text-[11.5px] ${muted} truncate`}>Local Account</div></div>
        </div>
        <div className={`flex items-center gap-2 mx-1 mb-2 px-2.5 h-8 rounded-md border ${dk ? "bg-black/25 border-white/[.1]" : "bg-white border-black/[.12]"}`}>
          <Search size={13} className={muted} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Find a setting"
            className="bg-transparent outline-none text-[12.5px] w-full placeholder:text-black/40" style={dk ? { color: "#fff" } : undefined} />
        </div>
        {(q ? filtered : NAV).map((n) => (
          <button key={n.id} onClick={() => setPage(n.id)}
            className={`relative flex items-center gap-3 px-2.5 py-[7px] rounded-md text-[13px] text-left transition-colors ${page === n.id ? (dk ? "bg-white/[.1]" : "bg-black/[.06]") + " font-medium" : hoverRow}`}>
            {page === n.id && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 rounded-full" style={{ background: "var(--acc)" }} />}
            <span style={{ color: "var(--acc)" }}>{n.icon}</span>{n.name}
          </button>
        ))}
      </div>

      {/* content */}
      <div className="flex-1 min-w-0 overflow-y-auto winscroll" key={page}>
        <div className="max-w-[700px] mx-auto px-8 py-6 anim-fade">
          {page === "system" && (
            <>
              <h1 className="text-[22px] font-semibold mb-5">System</h1>
              <div className={`rounded-xl border ${card} p-4 flex items-center gap-4 mb-4`}>
                <Laptop size={44} style={{ color: "var(--acc)" }} strokeWidth={1.2} />
                <div><div className="text-[15px] font-medium">DESKTOP-7H2K9Q4</div>
                  <button className={`text-[12.5px] ${muted} hover:underline`} onClick={() => os.notify("This action is not available right now")}>Rename this PC</button></div>
              </div>
              <div className="grid gap-2">
                <Row icon={<Sun size={16} style={{ color: "var(--acc)" }} />} title="Display" sub="Brightness, night light, scale" onClick={() => setPage("display")} />
                <Row icon={<Volume2 size={16} style={{ color: "var(--acc)" }} />} title="Sound" sub={`Volume ${os.volume}% · output device`} />
                <Row icon={<Wifi size={16} style={{ color: "var(--acc)" }} />} title="Network & internet" sub={os.wifi ? "Wi-Fi · Connected" : "Wi-Fi · Off"} />
                <Row icon={<BatteryMedium size={16} style={{ color: "var(--acc)" }} />} title="Power & battery" sub="Balanced · 80% remaining" />
              </div>
              <div className={`mt-5 rounded-xl border ${card} p-5`}>
                <h2 className="text-[15px] font-semibold mb-3">About</h2>
                {[
                  ["Processor", "13th Gen Intel(R) Core(TM) i9-13900K 3.00 GHz"],
                  ["Installed RAM", "32.0 GB (31.8 GB usable)"],
                  ["Device ID", "7F2B1A3E-4C5D-4E8F-9A0B-2C3D4E5F60"],
                  ["System type", "64-bit operating system, x64-based processor"],
                  ["Edition", "Windows 11 Pro"],
                  ["Version", "23H2 · OS build 22631.4460"],
                ].map(([k, v]) => (
                  <div key={k} className={`flex justify-between py-2 border-b last:border-0 text-[13px] ${dk ? "border-white/[.07]" : "border-black/[.06]"}`}>
                    <span className={muted}>{k}</span><span className="text-right">{v}</span>
                  </div>
                ))}
              </div>
            </>
          )}

          {page === "display" && (
            <>
              <h1 className="text-[22px] font-semibold mb-5">System &gt; Display</h1>
              <div className={`rounded-xl border ${card} p-5 mb-3`}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[13.5px]">Brightness</span><span className={`text-[12.5px] ${muted}`}>{os.brightness}%</span>
                </div>
                <div className="flex items-center gap-3">
                  <Sun size={17} className={muted} />
                  <input type="range" min={25} max={100} value={os.brightness} onChange={(e) => os.setBrightness(+e.target.value)}
                    className="wslider flex-1" style={{ ["--fill" as string]: `${os.brightness}%` }} />
                </div>
              </div>
              <div className={`rounded-xl border ${card} p-5 flex items-center justify-between`}>
                <div><div className="text-[13.5px]">Night light</div><div className={`text-[12px] ${muted}`}>Use warmer colors at night</div></div>
                <button className={`tswitch ${night ? "on" : ""} ${dk ? "tswitch-dk" : ""}`} onClick={() => setNight(!night)} />
              </div>
            </>
          )}

          {page === "personalization" && (
            <>
              <h1 className="text-[22px] font-semibold mb-5">Personalization</h1>
              <div className={`rounded-xl border ${card} p-5 mb-4`}>
                <h2 className="text-[14px] font-semibold mb-3">Background</h2>
                <div className="grid grid-cols-3 gap-3">
                  {WALLPAPERS.map((w) => (
                    <button key={w.id} onClick={() => os.setWallpaper(w.id)}
                      className={`relative aspect-video rounded-lg overflow-hidden border-2 transition ${os.wallpaper === w.id ? "border-[var(--acc)]" : "border-transparent hover:border-black/20"}`}>
                      <img src={w.src} className="w-full h-full object-cover" alt={w.name} draggable={false} />
                      {os.wallpaper === w.id && <span className="absolute top-1 right-1 w-5 h-5 rounded-full grid place-items-center text-white" style={{ background: "var(--acc)" }}><Check size={12} /></span>}
                    </button>
                  ))}
                </div>
                <div className={`text-[12px] mt-2 ${muted}`}>{WALLPAPERS.find((w) => w.id === os.wallpaper)?.name}</div>
              </div>
              <div className={`rounded-xl border ${card} p-5 mb-4`}>
                <h2 className="text-[14px] font-semibold mb-3">Theme</h2>
                <div className="flex gap-3">
                  {([["Light", false, <Sun key="s" size={20} />], ["Dark", true, <Moon key="m" size={20} />]] as const).map(([label, val, icon]) => (
                    <button key={label} onClick={() => os.setDark(val)}
                      className={`flex-1 h-16 rounded-lg border-2 flex flex-col items-center justify-center gap-1 text-[13px] transition
                        ${os.dark === val ? "border-[var(--acc)] bg-[var(--acc)]/10" : dk ? "border-white/[.1] hover:border-white/25" : "border-black/[.1] hover:border-black/25"}`}>
                      {icon}{label}
                    </button>
                  ))}
                </div>
              </div>
              <div className={`rounded-xl border ${card} p-5`}>
                <h2 className="text-[14px] font-semibold mb-3">Accent color</h2>
                <div className="flex flex-wrap gap-2.5">
                  {ACCENTS.map((a) => (
                    <button key={a} onClick={() => os.setAccent(a)}
                      className={`w-9 h-9 rounded-lg transition-transform hover:scale-110 ${os.accent === a ? "ring-2 ring-offset-2 ring-[var(--acc)]" : ""}`}
                      style={{ background: a, ["--tw-ring-offset-color" as string]: dk ? "#2d2d2d" : "#fff" }} />
                  ))}
                </div>
              </div>
            </>
          )}

          {page === "apps" && (
            <>
              <h1 className="text-[22px] font-semibold mb-1">Apps &gt; Installed apps</h1>
              <p className={`text-[12.5px] mb-5 ${muted}`}>{APP_LIST.length} apps installed</p>
              <div className="grid gap-2">
                {APP_LIST.map((a) => (
                  <div key={a.name} className={`rounded-lg border ${card} px-4 py-3 flex items-center gap-3`}>
                    <span className="w-8 h-8 rounded-lg grid place-items-center text-white text-[13px] font-semibold" style={{ background: "var(--acc)" }}>{a.name[0]}</span>
                    <span className="text-[13.5px] flex-1">{a.name}</span>
                    <span className={`text-[12px] ${muted}`}>{a.size}</span>
                  </div>
                ))}
              </div>
            </>
          )}

          {page === "accounts" && (
            <>
              <h1 className="text-[22px] font-semibold mb-5">Accounts</h1>
              <div className={`rounded-xl border ${card} p-6 flex items-center gap-5`}>
                <AvatarIcon size={72} />
                <div>
                  <div className="text-[17px] font-semibold">User</div>
                  <div className={`text-[13px] ${muted}`}>user@outlook.com</div>
                  <div className={`text-[12px] mt-1 ${muted}`}>Administrator · Local account</div>
                </div>
                <button className="ml-auto px-4 py-1.5 rounded-md text-[13px] text-white hover:brightness-110" style={{ background: "var(--acc)" }}
                  onClick={() => os.notify("Something went wrong. Try again later.")}>Sign in with Microsoft</button>
              </div>
            </>
          )}

          {page === "update" && (
            <>
              <h1 className="text-[22px] font-semibold mb-5">Windows Update</h1>
              <div className={`rounded-xl border ${card} p-6 flex flex-col items-center text-center gap-3`}>
                {checking ? (
                  <>
                    <div className="dots" style={{ color: "var(--acc)" }}><i /><i /><i /><i /><i /></div>
                    <div className="text-[14px]">Checking for updates…</div>
                  </>
                ) : (
                  <>
                    <span className="w-14 h-14 rounded-full grid place-items-center text-white" style={{ background: checked ? "#107c10" : "var(--acc)" }}>
                      {checked ? <Check size={26} /> : <RefreshCw size={24} />}
                    </span>
                    <div className="text-[15px] font-medium">{checked ? "You're up to date" : "Updates keep your PC secure"}</div>
                    <div className={`text-[12.5px] ${muted}`}>{checked ? "Last checked: Today, " + new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Check for the latest features and security fixes"}</div>
                    <button className="mt-2 px-5 py-2 rounded-md text-[13px] text-white hover:brightness-110" style={{ background: "var(--acc)" }}
                      onClick={() => { setChecking(true); setChecked(false); setTimeout(() => { setChecking(false); setChecked(true); }, 2200); }}>
                      Check for updates
                    </button>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
