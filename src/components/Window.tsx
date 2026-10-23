import { useRef, useState, useCallback } from "react";
import type { Win, Rect } from "../os/os";
import { useOS, TASKBAR_H } from "../os/os";
import { APPS } from "../os/registry";

const MIN_W = 340, MIN_H = 220;

interface Zone { x: number; y: number; w: number; h: number }
const LAYOUTS: Zone[][] = [
  [{ x: 0, y: 0, w: 0.5, h: 1 }, { x: 0.5, y: 0, w: 0.5, h: 1 }],
  [{ x: 0, y: 0, w: 0.7, h: 1 }, { x: 0.7, y: 0, w: 0.3, h: 0.5 }, { x: 0.7, y: 0.5, w: 0.3, h: 0.5 }],
  [{ x: 0, y: 0, w: 1 / 3, h: 1 }, { x: 1 / 3, y: 0, w: 1 / 3, h: 1 }, { x: 2 / 3, y: 0, w: 1 / 3, h: 1 }],
  [{ x: 0, y: 0, w: 0.5, h: 0.5 }, { x: 0.5, y: 0, w: 0.5, h: 0.5 }, { x: 0, y: 0.5, w: 0.5, h: 0.5 }, { x: 0.5, y: 0.5, w: 0.5, h: 0.5 }],
  [{ x: 0, y: 0, w: 0.5, h: 0.5 }, { x: 0.5, y: 0, w: 0.5, h: 0.5 }, { x: 0, y: 0.5, w: 1, h: 0.5 }],
  [{ x: 0, y: 0, w: 0.125, h: 1 }, { x: 0.125, y: 0, w: 0.75, h: 1 }, { x: 0.875, y: 0, w: 0.125, h: 1 }],
];

function GlyphMin() { return <svg width="10" height="10" viewBox="0 0 10 10"><rect x="0" y="4.6" width="10" height="1" fill="currentColor" /></svg>; }
function GlyphMax() { return <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><rect x="0.5" y="0.5" width="9" height="9" stroke="currentColor" /></svg>; }
function GlyphRestore() { return <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><rect x="0.5" y="2.5" width="7" height="7" stroke="currentColor" /><path d="M2.5 2.5V0.5H9.5V7.5H7.5" stroke="currentColor" /></svg>; }
function GlyphClose() { return <svg width="10" height="10" viewBox="0 0 10 10"><path d="M0.6 0.6L9.4 9.4M9.4 0.6L0.6 9.4" stroke="currentColor" strokeWidth="1" /></svg>; }

export default function Window({ win }: { win: Win }) {
  const os = useOS();
  const meta = APPS[win.app];
  const [snapHint, setSnapHint] = useState<null | "l" | "r" | "max">(null);
  const [snapOpen, setSnapOpen] = useState(false);
  const snapT = useRef<ReturnType<typeof setTimeout>>(undefined);
  const dragState = useRef<{ dx: number; dy: number } | null>(null);

  const openSnap = () => { clearTimeout(snapT.current); snapT.current = setTimeout(() => setSnapOpen(true), 400); };
  const closeSnap = (delay = 150) => { clearTimeout(snapT.current); snapT.current = setTimeout(() => setSnapOpen(false), delay); };

  const applyZone = (z: Zone) => {
    const vw = window.innerWidth, vh = window.innerHeight - TASKBAR_H;
    const r = { x: Math.round(vw * z.x) + 4, y: Math.round(vh * z.y) + 4, w: Math.round(vw * z.w) - 8, h: Math.round(vh * z.h) - 8 };
    if (win.max) os.unmax(win.id, r);
    else os.setRect(win.id, r);
    setSnapOpen(false);
  };

  const onTitleDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest(".win-btn")) return;
    setSnapOpen(false);
    os.focusWin(win.id);
    let startRect: Rect = { x: win.x, y: win.y, w: win.w, h: win.h };
    let dx: number, dy: number;
    if (win.max) {
      // restore then continue dragging
      const prev = win.prev || { w: 900, h: 560 };
      const ratio = e.clientX / window.innerWidth;
      const nw = Math.min(prev.w, window.innerWidth - 20);
      startRect = { x: e.clientX - nw * ratio, y: 4, w: nw, h: prev.h };
      os.unmax(win.id, startRect);
      dx = nw * ratio; dy = 14;
    } else {
      dx = e.clientX - win.x; dy = e.clientY - win.y;
    }
    dragState.current = { dx, dy };
    os.setInteracting(true);
    const move = (ev: PointerEvent) => {
      const vw = window.innerWidth, vh = window.innerHeight;
      let hint: null | "l" | "r" | "max" = null;
      if (ev.clientY <= 2) hint = "max";
      else if (ev.clientX <= 2) hint = "l";
      else if (ev.clientX >= vw - 3) hint = "r";
      setSnapHint(hint);
      const nx = Math.min(vw - 80, Math.max(-startRect.w + 120, ev.clientX - dx));
      const ny = Math.min(vh - TASKBAR_H - 20, Math.max(0, ev.clientY - dy));
      os.setRect(win.id, { x: nx, y: ny, w: startRect.w, h: startRect.h });
    };
    const up = (ev: PointerEvent) => {
      document.removeEventListener("pointermove", move);
      document.removeEventListener("pointerup", up);
      os.setInteracting(false);
      const vw = window.innerWidth, vh = window.innerHeight - TASKBAR_H;
      let hint: null | "l" | "r" | "max" = null;
      if (ev.clientY <= 2) hint = "max";
      else if (ev.clientX <= 2) hint = "l";
      else if (ev.clientX >= vw - 3) hint = "r";
      setSnapHint(null);
      if (hint === "max") { os.setRect(win.id, { x: win.x, y: win.y, w: startRect.w, h: startRect.h }); os.toggleMax(win.id); }
      else if (hint === "l") os.setRect(win.id, { x: 0, y: 0, w: vw / 2, h: vh });
      else if (hint === "r") os.setRect(win.id, { x: vw / 2, y: 0, w: vw / 2, h: vh });
    };
    document.addEventListener("pointermove", move);
    document.addEventListener("pointerup", up);
  };

  const startResize = useCallback((e: React.PointerEvent, dir: string) => {
    if (win.max) return;
    e.preventDefault(); e.stopPropagation();
    os.focusWin(win.id); os.setInteracting(true);
    const sx = e.clientX, sy = e.clientY;
    const r0 = { x: win.x, y: win.y, w: win.w, h: win.h };
    const move = (ev: PointerEvent) => {
      const ddx = ev.clientX - sx, ddy = ev.clientY - sy;
      let { x, y, w, h } = r0;
      if (dir.includes("e")) w = Math.max(MIN_W, r0.w + ddx);
      if (dir.includes("s")) h = Math.max(MIN_H, r0.h + ddy);
      if (dir.includes("w")) { w = Math.max(MIN_W, r0.w - ddx); x = r0.x + r0.w - w; }
      if (dir.includes("n")) { h = Math.max(MIN_H, r0.h - ddy); y = Math.max(0, r0.y + r0.h - h); }
      os.setRect(win.id, { x, y, w, h });
    };
    const up = () => {
      document.removeEventListener("pointermove", move);
      document.removeEventListener("pointerup", up);
      os.setInteracting(false);
    };
    document.addEventListener("pointermove", move);
    document.addEventListener("pointerup", up);
  }, [win, os]);

  const Comp = meta.comp;
  const dk = os.dark;
  const active = os.activeId === win.id;

  return (
    <>
      {snapHint && (
        <div className="fixed z-[9998] rounded-xl border-2 border-[var(--acc)] bg-[var(--acc)]/20 transition-all duration-150 pointer-events-none"
          style={snapHint === "max" ? { inset: `6px 6px ${TASKBAR_H + 6}px 6px` }
            : snapHint === "l" ? { left: 6, top: 6, width: window.innerWidth / 2 - 9, bottom: TASKBAR_H + 6 }
            : { right: 6, top: 6, width: window.innerWidth / 2 - 9, bottom: TASKBAR_H + 6 }} />
      )}
      <div
        className={`fixed anim-win-in flex flex-col ${win.max ? "rounded-none" : "rounded-[8px]"} overflow-hidden
          ${dk ? "bg-[#202020] ring-1 ring-white/[.08]" : "bg-[#f3f3f3] ring-1 ring-black/[.08]"}
          ${active ? "shadow-[0_12px_48px_rgba(0,0,0,.45)]" : "shadow-[0_6px_20px_rgba(0,0,0,.22)]"}
          ${win.min ? "win-min" : ""}`}
        style={{
          left: win.x, top: win.y, width: win.w, height: win.h, zIndex: win.z,
          transition: os.interacting
            ? "opacity .16s ease, transform .16s ease"
            : "left .2s cubic-bezier(.2,.9,.3,1), top .2s cubic-bezier(.2,.9,.3,1), width .2s cubic-bezier(.2,.9,.3,1), height .2s cubic-bezier(.2,.9,.3,1), opacity .16s ease, transform .16s ease",
        }}
        onPointerDown={() => os.focusWin(win.id)}
      >
        {/* title bar - Win11 uses 32px height, Mica material */}
        <div
          className={`h-[32px] flex items-center pl-3 pr-0 flex-none select-none cursor-default
            ${dk ? "text-white/[.87]" : "text-[#1a1a1a]"} ${active ? "" : "opacity-75"}`}
          onPointerDown={onTitleDown}
          onDoubleClick={() => os.toggleMax(win.id)}
        >
          <span className="w-[16px] h-[16px] flex items-center justify-center flex-none">{meta.icon(16)}</span>
          <span className="ml-2 text-[12px] leading-none truncate pointer-events-none font-normal">{win.title}</span>
          <div className="ml-auto flex items-stretch h-[32px] flex-none" onDoubleClick={(e) => e.stopPropagation()}>
            <button className={`win-btn w-[46px] flex items-center justify-center ${dk ? "hover:bg-white/[.06]" : "hover:bg-black/[.04]"}`}
              onClick={() => os.minimizeWin(win.id)} aria-label="Minimize"><GlyphMin /></button>
            <div className="relative" onPointerEnter={openSnap} onPointerLeave={() => closeSnap()}>
              <button className={`win-btn w-[46px] h-full flex items-center justify-center ${dk ? "hover:bg-white/[.06]" : "hover:bg-black/[.04]"}`}
                onClick={() => { setSnapOpen(false); os.toggleMax(win.id); }} aria-label="Maximize">{win.max ? <GlyphRestore /> : <GlyphMax />}</button>
              {snapOpen && (
                <div
                  className={`absolute right-0 top-9 z-[99999] w-[300px] p-2 rounded-lg border shadow-2xl backdrop-blur-xl anim-pop
                    ${dk ? "bg-[#2b2b2b]/95 border-white/[.12]" : "bg-[#f6f6f6]/95 border-black/[.1]"}`}
                  onPointerDown={(e) => e.stopPropagation()}
                  onPointerEnter={() => clearTimeout(snapT.current)}
                  onPointerLeave={() => closeSnap(100)}
                >
                  <div className="grid grid-cols-3 gap-2">
                    {LAYOUTS.map((zones, i) => (
                      <div key={i} className={`relative h-[54px] rounded-[4px] overflow-hidden ${dk ? "bg-white/[.08]" : "bg-black/[.08]"}`}>
                        {zones.map((z, zi) => (
                          <button
                            key={zi}
                            onClick={() => applyZone(z)}
                            className="absolute rounded-[2px] transition-colors hover:!bg-[var(--acc)]/60"
                            style={{
                              left: `calc(${z.x * 100}% + 2px)`, top: `calc(${z.y * 100}% + 2px)`,
                              width: `calc(${z.w * 100}% - 4px)`, height: `calc(${z.h * 100}% - 4px)`,
                              background: dk ? "rgba(255,255,255,.28)" : "rgba(0,0,0,.22)",
                            }}
                          />
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <button className={`win-btn w-[46px] flex items-center justify-center hover:!bg-[#c42b1c] hover:!text-white ${win.max ? "" : "rounded-tr-[8px]"}`}
              onClick={() => os.closeWin(win.id)} aria-label="Close"><GlyphClose /></button>
          </div>
        </div>
        {/* content */}
        <div className={`flex-1 min-h-0 relative ${dk ? "text-white/90" : "text-black/85"}`}>
          <Comp win={win} />
          {os.interacting && <div className="absolute inset-0 z-[999]" />}
        </div>
        {/* resize handles */}
        {!win.max && (
          <>
            <div className="absolute -top-1 left-2 right-2 h-2 cursor-n-resize" onPointerDown={(e) => startResize(e, "n")} />
            <div className="absolute -bottom-1 left-2 right-2 h-2 cursor-s-resize" onPointerDown={(e) => startResize(e, "s")} />
            <div className="absolute -left-1 top-2 bottom-2 w-2 cursor-w-resize" onPointerDown={(e) => startResize(e, "w")} />
            <div className="absolute -right-1 top-2 bottom-2 w-2 cursor-e-resize" onPointerDown={(e) => startResize(e, "e")} />
            <div className="absolute -top-1.5 -left-1.5 w-3.5 h-3.5 cursor-nw-resize" onPointerDown={(e) => startResize(e, "nw")} />
            <div className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 cursor-ne-resize" onPointerDown={(e) => startResize(e, "ne")} />
            <div className="absolute -bottom-1.5 -left-1.5 w-3.5 h-3.5 cursor-sw-resize" onPointerDown={(e) => startResize(e, "sw")} />
            <div className="absolute -bottom-1.5 -right-1.5 w-3.5 h-3.5 cursor-se-resize" onPointerDown={(e) => startResize(e, "se")} />
          </>
        )}
      </div>
    </>
  );
}
