import { useEffect, useRef, useState } from "react";
import { Brush, Eraser, Trash2, Save } from "lucide-react";
import { useOS } from "../os/os";

const COLORS = ["#000000", "#7f7f7f", "#880015", "#ed1c24", "#ff7f27", "#fff200", "#22b14c", "#00a2e8", "#3f48cc", "#a349a4", "#ffffff", "#b97a57"];

export default function Paint() {
  const os = useOS();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const drawing = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);
  const [color, setColor] = useState("#1b6bd6");
  const [size, setSize] = useState(5);
  const [tool, setTool] = useState<"brush" | "eraser">("brush");

  // init canvas + observe resize (preserve bitmap)
  useEffect(() => {
    const cv = canvasRef.current!, wrap = wrapRef.current!;
    const ctx = cv.getContext("2d")!;
    const fit = () => {
      const tmp = document.createElement("canvas");
      if (cv.width && cv.height) { tmp.width = cv.width; tmp.height = cv.height; tmp.getContext("2d")!.drawImage(cv, 0, 0); }
      cv.width = wrap.clientWidth; cv.height = wrap.clientHeight;
      ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, cv.width, cv.height);
      if (tmp.width) ctx.drawImage(tmp, 0, 0);
      ctx.lineCap = "round"; ctx.lineJoin = "round";
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(wrap);
    return () => ro.disconnect();
  }, []);

  const pos = (e: React.PointerEvent) => {
    const r = canvasRef.current!.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  const down = (e: React.PointerEvent) => { drawing.current = true; last.current = pos(e); (e.target as HTMLElement).setPointerCapture(e.pointerId); };
  const move = (e: React.PointerEvent) => {
    if (!drawing.current || !last.current) return;
    const ctx = canvasRef.current!.getContext("2d")!;
    const p = pos(e);
    ctx.strokeStyle = tool === "eraser" ? "#ffffff" : color;
    ctx.lineWidth = tool === "eraser" ? size * 3 : size;
    ctx.beginPath(); ctx.moveTo(last.current.x, last.current.y); ctx.lineTo(p.x, p.y); ctx.stroke();
    last.current = p;
  };
  const up = () => { drawing.current = false; last.current = null; };

  const clear = () => {
    const cv = canvasRef.current!, ctx = cv.getContext("2d")!;
    ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, cv.width, cv.height);
  };

  const save = () => {
    const data = canvasRef.current!.toDataURL("image/png");
    os.addNode("pics", { id: os.uid(), name: `Drawing ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}.png`, type: "file", kind: "img", src: data });
    os.notify("Saved to Pictures — open it in Photos");
  };

  const tb = (active: boolean) => `flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[12.5px] transition-colors ${active ? "bg-[var(--acc)]/15 text-[var(--acc)]" : os.dark ? "hover:bg-white/10" : "hover:bg-black/[.05]"}`;

  return (
    <div className={`h-full flex flex-col ${os.dark ? "bg-[#202020]" : "bg-[#f5f5f5]"}`}>
      <div className={`h-12 flex items-center gap-1.5 px-3 flex-none border-b ${os.dark ? "border-white/10" : "border-black/[.07]"}`}>
        <button className={tb(tool === "brush")} onClick={() => setTool("brush")}><Brush size={15} /> Brush</button>
        <button className={tb(tool === "eraser")} onClick={() => setTool("eraser")}><Eraser size={15} /> Eraser</button>
        <button className={tb(false)} onClick={clear}><Trash2 size={15} /> Clear</button>
        <div className={`w-px h-6 mx-1.5 ${os.dark ? "bg-white/15" : "bg-black/15"}`} />
        <span className="text-[12px] opacity-70 mr-1">Size</span>
        <input type="range" min={1} max={30} value={size} onChange={(e) => setSize(+e.target.value)} className="wslider w-24" style={{ ["--fill" as string]: `${(size / 30) * 100}%` }} />
        <button className="ml-auto flex items-center gap-2 px-3.5 py-1.5 rounded-md text-[12.5px] text-white hover:brightness-110 transition" style={{ background: "var(--acc)" }} onClick={save}>
          <Save size={14} /> Save to Pictures
        </button>
      </div>
      <div className={`h-11 flex items-center gap-1.5 px-3 flex-none border-b ${os.dark ? "border-white/10" : "border-black/[.07]"}`}>
        <span className="text-[12px] opacity-70 mr-1">Colors</span>
        {COLORS.map((c) => (
          <button key={c} onClick={() => { setColor(c); setTool("brush"); }}
            className={`w-6 h-6 rounded-md border transition-transform hover:scale-110 ${color === c && tool === "brush" ? "ring-2 ring-[var(--acc)] ring-offset-1 scale-110" : ""}`}
            style={{ background: c, borderColor: "rgba(0,0,0,.25)" }} />
        ))}
        <input type="color" value={color} onChange={(e) => { setColor(e.target.value); setTool("brush"); }}
          className="w-7 h-7 rounded-md cursor-pointer bg-transparent border border-black/20 ml-1" title="Custom color" />
      </div>
      <div ref={wrapRef} className="flex-1 min-h-0 m-3 rounded-md shadow-[0_1px_4px_rgba(0,0,0,.2)] overflow-hidden bg-white relative">
        <canvas ref={canvasRef} className="absolute inset-0 cursor-crosshair touch-none" onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerLeave={up} />
      </div>
    </div>
  );
}
