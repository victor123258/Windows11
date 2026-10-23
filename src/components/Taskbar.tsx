import { useState } from "react";
import { useOS, useNow, TASKBAR_H } from "../os/os";
import { APPS, PINNED } from "../os/registry";
import { WinLogo, SearchIcon, TaskViewIcon, WifiGlyph, VolGlyph, BatteryGlyph } from "../os/icons";
import { ChevronUp } from "lucide-react";

export default function Taskbar() {
  const os = useOS();
  const now = useNow(1000);
  const dk = os.dark;
  const [peeked, setPeeked] = useState(false);

  const runningApps = os.wins.map((w) => w.app);
  const extraApps = [...new Set(runningApps)].filter((a) => !PINNED.includes(a));

  const clickApp = (app: string) => {
    os.playSfx("click");
    const w = os.wins.find((x) => x.app === app);
    if (!w) { os.openApp(app); return; }
    if (w.min) os.focusWin(w.id);
    else if (os.activeId === w.id) os.minimizeWin(w.id);
    else os.focusWin(w.id);
  };

  const showDesktop = () => {
    if (!peeked) {
      os.wins.filter((w) => !w.min).forEach((w) => os.minimizeWin(w.id));
      setPeeked(true);
    } else {
      os.wins.filter((w) => w.min).forEach((w) => os.focusWin(w.id));
      setPeeked(false);
    }
    os.closePanels();
  };

  const time = now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  const date = now.toLocaleDateString([], { month: "numeric", day: "numeric", year: "numeric" });

  const tbBtn = `relative w-[40px] h-[40px] grid place-items-center rounded-[4px] transition-colors ${dk ? "hover:bg-white/[.08]" : "hover:bg-black/[.04]"}`;

  return (
    <div
      className={`fixed mica inset-x-0 bottom-0 z-[400] flex items-center ${dk ? "bg-[#1c1c1c]/80 border-white/[.06] text-white/90" : "bg-[#eff4f9]/80 border-black/[.05] text-[#1a1a1a]"} backdrop-blur-[20px] backdrop-saturate-[1.8]`}
      style={{ height: TASKBAR_H }}
    >
      {/* centered group */}
      <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-0.5 h-full">
        {/* Start */}
        <button title="Start" onClick={() => os.togglePanel("start")}
          className={`${tbBtn} ${os.panel === "start" ? (dk ? "bg-white/[.1]" : "bg-black/[.06]") : ""}`}>
          <WinLogo size={20} />
        </button>

        {/* Search */}
        <button
          title="Search"
          onClick={() => os.togglePanel("search")}
          className={`hidden sm:flex items-center gap-2.5 h-[32px] w-[220px] lg:w-[280px] pl-3 pr-2 rounded-full border text-left transition-shadow
            ${dk ? "bg-[#2c2c2c] hover:bg-[#333] border-white/[.1]" : "bg-white/95 hover:bg-white border-black/[.08] shadow-sm"} ${os.panel === "search" ? "ring-1 ring-[var(--acc)]" : ""}`}
        >
          <SearchIcon size={14} className="opacity-60" />
          <span className={`text-[12.5px] flex-1 ${dk ? "text-white/60" : "text-black/55"}`}>Search</span>
        </button>

        {/* Task view */}
        <button title="Task view" onClick={() => os.togglePanel("taskview")} className={tbBtn}>
          <TaskViewIcon size={20} />
        </button>

        {/* Separator */}
        <div className={`w-px h-5 mx-0.5 ${dk ? "bg-white/[.1]" : "bg-black/[.08]"}`} />

        {/* Pinned apps */}
        {PINNED.map((id) => {
          const running = runningApps.includes(id);
          const isActive = os.wins.some((w) => w.app === id && w.id === os.activeId);
          return (
            <button key={id} title={APPS[id]?.name} onClick={() => clickApp(id)}
              className={`${tbBtn} ${running ? (isActive ? "tb-active" : "tb-active-min") : ""}`}>
              {APPS[id].icon(22)}
            </button>
          );
        })}

        {/* Extra running apps */}
        {extraApps.length > 0 && <div className={`w-px h-5 mx-0.5 ${dk ? "bg-white/[.1]" : "bg-black/[.08]"}`} />}
        {extraApps.map((id) => (
          <button key={id} title={APPS[id]?.name} onClick={() => clickApp(id)}
            className={`${tbBtn} tb-active${os.wins.some((w) => w.app === id && w.id === os.activeId) ? "" : "-min"}`}>
            {APPS[id].icon(22)}
          </button>
        ))}
      </div>

      {/* system tray (right) */}
      <div className="absolute right-1 flex items-center gap-0 h-full">
        <button title="Show hidden icons" onClick={() => os.togglePanel("tray")}
          className={`w-6 h-[34px] grid place-items-center rounded-[4px] ${dk ? "hover:bg-white/[.08]" : "hover:bg-black/[.04]"}`}>
          <ChevronUp size={12} />
        </button>

        <button title="Quick settings" onClick={() => os.togglePanel("quick")}
          className={`flex items-center gap-1 h-[34px] px-1.5 rounded-[4px] ${dk ? "hover:bg-white/[.08]" : "hover:bg-black/[.04]"} ${os.panel === "quick" ? (dk ? "bg-white/[.08]" : "bg-black/[.06]") : ""}`}>
          <WifiGlyph size={14} className={os.wifi ? "" : "opacity-35"} />
          <VolGlyph size={14} className={os.volume === 0 ? "opacity-35" : ""} />
          <BatteryGlyph size={15} />
        </button>

        <button title="Calendar and notifications" onClick={() => os.togglePanel("cal")}
          className={`h-[34px] px-1.5 rounded-[4px] text-right leading-tight ${dk ? "hover:bg-white/[.08]" : "hover:bg-black/[.04]"} ${os.panel === "cal" ? (dk ? "bg-white/[.08]" : "bg-black/[.06]") : ""}`}>
          <span className="block text-[11px]" style={{ fontVariantNumeric: "tabular-nums" }}>{time}</span>
          <span className="block text-[11px]">{date}</span>
        </button>

        {/* show desktop sliver */}
        <div className={`w-[5px] h-full ml-1 cursor-pointer ${dk ? "hover:bg-white/[.08]" : "hover:bg-black/[.06]"}`}
          onClick={showDesktop} title="Show desktop" />
      </div>
    </div>
  );
}
