import { useEffect, useRef, useState } from "react";
import type { Win } from "../os/os";
import { useOS } from "../os/os";

type Line = { text: string; cls?: string };

const BANNER = "Microsoft Windows [Version 10.0.22631.4460]\n(c) Microsoft Corporation. All rights reserved.\n";

export default function Terminal({ win }: { win: Win }) {
  const os = useOS();
  const [lines, setLines] = useState<Line[]>(BANNER.split("\n").map((t) => ({ text: t })));
  const [input, setInput] = useState("");
  const [hist, setHist] = useState<string[]>([]);
  const [hi, setHi] = useState(-1);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { scrollRef.current?.scrollTo({ top: 999999 }); }, [lines]);

  const print = (txt: string, cls?: string) => setLines((l) => [...l, ...txt.split("\n").map((t) => ({ text: t, cls }))]);

  const run = (raw: string) => {
    const cmd = raw.trim();
    print(`C:\\Users\\User>${cmd}`, "text-white");
    if (!cmd) return;
    const [c, ...args] = cmd.split(/\s+/);
    const lc = c.toLowerCase();
    if (lc === "help") print("Available commands:\n  help        Show this help\n  ver         Windows version\n  whoami      Current user\n  echo <msg>  Print a message\n  dir         List directory\n  date / time Show date and time\n  ipconfig    Network info\n  color       Change theme\n  cls         Clear screen\n  exit        Close terminal");
    else if (lc === "ver") print("\nMicrosoft Windows [Version 10.0.22631.4460]");
    else if (lc === "whoami") print("desktop-7h2k9q4\\user");
    else if (lc === "echo") print(args.join(" ") || "\nECHO is on.");
    else if (lc === "cls") setLines([]);
    else if (lc === "date") print("The current date is: " + new Date().toDateString());
    else if (lc === "time") print("The current time is: " + new Date().toLocaleTimeString());
    else if (lc === "ipconfig") print("\nWindows IP Configuration\n\nWireless LAN adapter Wi-Fi:\n   Connection-specific DNS Suffix  . : home\n   IPv4 Address. . . . . . . . . . . : 192.168.1.42\n   Subnet Mask . . . . . . . . . . . : 255.255.255.0\n   Default Gateway . . . . . . . . . : 192.168.1.1");
    else if (lc === "dir") {
      const dirs = os.nodeMap.get("userdir")?.children || [];
      print(` Volume in drive C is Windows\n Directory of C:\\Users\\User\n`);
      ["Desktop", "Documents", "Downloads", "Music", "Pictures", "Videos", ...dirs.map((d) => d.name)]
        .filter((v, i, a) => a.indexOf(v) === i)
        .forEach((d) => print(`${new Date().toLocaleDateString()}  ${new Date().toLocaleTimeString()}    <DIR>          ${d}`));
    } else if (lc === "color") print("This terminal already looks great.");
    else if (lc === "exit") { os.closeWin(win.id); return; }
    else print(`'${c}' is not recognized as an internal or external command,\noperable program or batch file.`);
  };

  return (
    <div
      className="h-full flex flex-col bg-[#0c0c0c]/95 text-[#cccccc] font-mono text-[13px] leading-[1.35] cursor-text select-ok"
      onClick={() => inputRef.current?.focus()}
    >
      <div ref={scrollRef} className="flex-1 overflow-y-auto winscroll-dk winscroll px-3 py-1.5 pb-3">
        {lines.map((l, i) => <div key={i} className={`whitespace-pre-wrap break-all ${l.cls || ""}`}>{l.text || "\u00a0"}</div>)}
        <div className="flex items-center">
          <span className="text-white whitespace-pre">C:\Users\User&gt;</span>
          <input
            ref={inputRef}
            autoFocus
            className="flex-1 bg-transparent outline-none border-none text-[#e6e6e6] caret-[#e6e6e6] ml-0"
            value={input}
            spellCheck={false}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") { run(input); if (input.trim()) setHist((h) => [input, ...h]); setInput(""); setHi(-1); }
              else if (e.key === "ArrowUp") { e.preventDefault(); if (hist.length) { const n = hi + 1 < hist.length ? hi + 1 : hi; setHi(n); setInput(hist[n]); } }
              else if (e.key === "ArrowDown") { e.preventDefault(); const n = hi - 1; setHi(Math.max(-1, n)); setInput(n >= 0 ? hist[n] : ""); }
              else if (e.key === "l" && e.ctrlKey) { e.preventDefault(); setLines([]); }
            }}
          />
        </div>
      </div>
    </div>
  );
}
