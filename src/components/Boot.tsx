import { useEffect, useState } from "react";
import { useOS } from "../os/os";
import { WinLogoWhite } from "../os/icons";

export default function Boot() {
  const os = useOS();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (os.phase === "boot") {
      const t1 = setTimeout(() => setShow(true), 100);
      const t2 = setTimeout(() => os.setPhase("lock"), 2400);
      return () => { clearTimeout(t1); clearTimeout(t2); };
    }
    if (os.phase === "off") {
      const t = setTimeout(() => setShow(true), 500);
      return () => clearTimeout(t);
    }
    setShow(false);
  }, [os.phase, os]);

  if (os.phase === "off") {
    return (
      <div className="fixed inset-0 z-[1000] bg-black flex items-center justify-center cursor-pointer"
        onClick={() => { setShow(false); os.setPhase("boot"); }}>
        <div className={`text-white/60 text-[13px] tracking-wide transition-opacity duration-700 ${show ? "opacity-100" : "opacity-0"}`}>
          Press any key or click to start
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[1000] bg-black flex flex-col items-center justify-center">
      {/* Windows logo */}
      <div className={`transition-opacity duration-700 ${show ? "opacity-100" : "opacity-0"}`}>
        <WinLogoWhite size={112} />
      </div>

      {/* Loading ring spinner */}
      <div className={`mt-16 transition-opacity duration-500 ${show ? "opacity-100" : "opacity-0"}`} style={{ transitionDelay: "0.6s" }}>
        <svg width="40" height="40" viewBox="0 0 40 40" className="boot-ring">
          <circle cx="20" cy="20" r="16" />
        </svg>
      </div>

      {/* Status text for restart/shutdown */}
      {(os.phase === "restarting" || os.phase === "shuttingdown") && (
        <div className={`mt-10 text-white/80 text-[15px] font-light tracking-wide transition-opacity duration-500 ${show ? "opacity-100" : "opacity-0"}`}>
          {os.phase === "restarting" ? "Restarting" : "Shutting down"}
        </div>
      )}
    </div>
  );
}
