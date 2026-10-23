import { useEffect, useState, useCallback } from "react";
import { useOS, useNow } from "../os/os";
import { LOCKSCREEN_SRC } from "../os/media";
import { AvatarIcon, WifiGlyph, BatteryGlyph } from "../os/icons";

export default function Lock() {
  const os = useOS();
  const now = useNow(1000);
  const [leaving, setLeaving] = useState(false);
  const [signingIn, setSigningIn] = useState(false);
  const unlock = useCallback(() => {
    if (os.phase !== "lock" || leaving) return;
    setLeaving(true);
    setTimeout(() => { os.setPhase("signin"); setLeaving(false); }, 450);
  }, [os, leaving]);

  useEffect(() => {
    const onKey = () => unlock();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [unlock]);

  const signIn = () => {
    if (signingIn) return;
    setSigningIn(true);
    os.playSfx("startup");
    setTimeout(() => { os.setPhase("on"); setSigningIn(false); }, 1400);
  };

  const hours = now.getHours();
  const mins = now.getMinutes().toString().padStart(2, "0");
  const h12 = hours % 12 || 12;
  const time = `${h12}:${mins}`;
  const date = now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  const bgStyle = {
    backgroundImage: `url(${LOCKSCREEN_SRC})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundColor: "#000",
  };

  return (
    <div className="fixed inset-0 z-[900]">
      {/* ═══ LOCK SCREEN ═══ */}
      {os.phase === "lock" && (
        <div
          className="absolute inset-0 flex flex-col text-white select-none cursor-pointer"
          style={{
            ...bgStyle,
            transform: leaving ? "translateY(-105%)" : "translateY(0)",
            transition: "transform .5s cubic-bezier(.4,0,.1,1)",
          }}
          onPointerDown={(e) => { e.preventDefault(); unlock(); }}
        >
          {/* Clock – vertically centered */}
          <div className="flex-1 flex flex-col items-center justify-center lock-clock">
            <div
              className="text-white font-semibold leading-none drop-shadow-[0_4px_30px_rgba(0,0,0,.5)]"
              style={{ fontSize: "clamp(80px, 12vw, 160px)", fontVariantNumeric: "tabular-nums", letterSpacing: "-0.02em" }}
            >
              {time}
            </div>
            <div
              className="text-white/95 mt-3 drop-shadow-[0_2px_12px_rgba(0,0,0,.5)]"
              style={{ fontSize: "clamp(16px, 2.2vw, 28px)" }}
            >
              {date}
            </div>
          </div>

          {/* Bottom bar */}
          <div className="flex items-end justify-between px-10 pb-8 lock-bottom">
            {/* Network / battery */}
            <div className="flex items-center gap-3 text-white/90">
              <WifiGlyph size={18} />
              <BatteryGlyph size={18} />
            </div>

            {/* Swipe hint */}
            <div className="flex flex-col items-center gap-1 text-white/80 text-[13px]"
              style={{ animation: "breathe 2.5s ease-in-out infinite" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="rotate-180">
                <path d="M12 5v14M5 12l7-7 7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>Swipe up to unlock</span>
            </div>

            {/* Accessibility */}
            <div className="w-16" />
          </div>
        </div>
      )}

      {/* ═══ SIGN-IN SCREEN ═══ */}
      {os.phase === "signin" && (
        <div className="absolute inset-0 overflow-hidden" style={bgStyle}>
          {/* Blurred overlay layer */}
          <div className="absolute inset-0"
            style={{
              backgroundImage: `url(${LOCKSCREEN_SRC})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              filter: "blur(60px) brightness(.6)",
              transform: "scale(1.15)",
            }}
          />
          <div className="absolute inset-0 bg-black/30" />

          {/* Content */}
          <div className="relative z-10 h-full flex flex-col items-center justify-center anim-fade">
            <AvatarIcon size={140} className="drop-shadow-[0_8px_40px_rgba(0,0,0,.5)] mb-4" />
            <div className="text-white text-[28px] font-medium mb-2 drop-shadow-lg">User</div>

            {signingIn ? (
              <div className="flex flex-col items-center gap-5 mt-6">
                <svg width="32" height="32" viewBox="0 0 40 40" className="boot-ring">
                  <circle cx="20" cy="20" r="16" />
                </svg>
                <div className="text-white/80 text-[15px] font-light">Welcome</div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4 mt-4">
                {/* Password field (fake) */}
                <div className="w-[280px] h-[36px] bg-black/30 border border-white/40 rounded-[4px] flex items-center px-3 backdrop-blur-sm">
                  <span className="text-white/50 text-[14px]">Password</span>
                  <button
                    onClick={signIn}
                    className="ml-auto w-[30px] h-[26px] bg-white/20 hover:bg-white/30 border border-white/30 rounded-[3px] flex items-center justify-center transition"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path d="M5 12h14M13 6l6 6-6 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </div>

                {/* Sign-in options */}
                <button className="text-white/70 text-[13px] hover:text-white/90 hover:underline transition" onClick={signIn}>
                  Sign-in options
                </button>
              </div>
            )}
          </div>

          {/* Bottom controls */}
          <div className="absolute bottom-6 right-8 z-10 flex items-center gap-4">
            <button className="text-white/70 hover:text-white transition">
              <WifiGlyph size={18} />
            </button>
            <button className="text-white/70 hover:text-white transition">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
                <path d="M12 8v5l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
            <button className="text-white/70 hover:text-white transition">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.36 6.64a9 9 0 11-12.73 0 1 1 0 011.42 1.42 7 7 0 1010 0 1 1 0 011.41-1.42zM12 2a1 1 0 011 1v4a1 1 0 01-2 0V3a1 1 0 011-1z" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
