import { useMemo, useState, useEffect } from "react";
import type { Win } from "../os/os";
import { useOS } from "../os/os";
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "lucide-react";
import { STOCK_LIST } from "../os/media";

interface Img { src: string; name: string }

export default function Photos({ win }: { win: Win }) {
  const os = useOS();
  const dk = os.dark;

  const images = useMemo<Img[]>(() => {
    const out: Img[] = [];
    os.nodeMap.forEach((n) => { if (n.kind === "img" && n.src) out.push({ src: n.src, name: n.name }); });
    STOCK_LIST.forEach((s) => out.push({ src: s.src, name: s.name }));
    return out;
  }, [os.nodeMap]);

  const propSrc = win.props?.src as string | undefined;
  const startIdx = propSrc ? Math.max(0, images.findIndex((i) => i.src === propSrc)) : -1;
  const [idx, setIdx] = useState(startIdx);
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    if (propSrc) {
      const i = images.findIndex((x) => x.src === propSrc);
      if (i >= 0) { setIdx(i); setZoom(1); }
    }
  }, [propSrc, images]);

  const cur = idx >= 0 ? images[idx] : null;

  return (
    <div className={`h-full flex flex-col ${dk ? "bg-[#1e1e1e] text-white/90" : "bg-[#f7f7f7] text-black/85"}`}>
      {cur ? (
        <>
          <div className={`h-11 flex items-center px-3 gap-1 flex-none ${dk ? "text-white/80" : "text-black/70"}`}>
            <button className="p-2 rounded hover:bg-black/[.06] disabled:opacity-30" disabled={idx <= 0} onClick={() => { setIdx(idx - 1); setZoom(1); }}><ChevronLeft size={17} /></button>
            <button className="p-2 rounded hover:bg-black/[.06] disabled:opacity-30" disabled={idx >= images.length - 1} onClick={() => { setIdx(idx + 1); setZoom(1); }}><ChevronRight size={17} /></button>
            <span className="text-[13px] ml-2 truncate">{cur.name}</span>
            <div className="ml-auto flex items-center gap-1">
              <button className="p-2 rounded hover:bg-black/[.06]" onClick={() => setZoom((z) => Math.max(.5, z - .25))}><ZoomOut size={16} /></button>
              <span className="text-[12px] w-12 text-center">{Math.round(zoom * 100)}%</span>
              <button className="p-2 rounded hover:bg-black/[.06]" onClick={() => setZoom((z) => Math.min(4, z + .25))}><ZoomIn size={16} /></button>
              <button className="ml-2 px-3 py-1 rounded text-[12.5px] hover:bg-black/[.06]" onClick={() => setIdx(-1)}>Gallery</button>
            </div>
          </div>
          <div className="flex-1 min-h-0 overflow-hidden grid place-items-center winscroll" onClick={() => zoom !== 1 && setZoom(1)}>
            <img src={cur.src} alt={cur.name} className="max-w-full max-h-full object-contain transition-transform duration-200 shadow-2xl" style={{ transform: `scale(${zoom})` }} draggable={false} />
          </div>
          <div className={`h-16 flex items-center gap-1.5 px-3 overflow-x-auto winscroll flex-none border-t ${dk ? "border-white/10" : "border-black/[.08]"}`}>
            {images.map((im, i) => (
              <button key={i} onClick={() => { setIdx(i); setZoom(1); }}
                className={`flex-none w-12 h-12 rounded overflow-hidden border-2 transition ${i === idx ? "border-[var(--acc)]" : "border-transparent opacity-60 hover:opacity-100"}`}>
                <img src={im.src} className="w-full h-full object-cover" draggable={false} alt="" />
              </button>
            ))}
          </div>
        </>
      ) : (
        <>
          <div className="px-5 pt-4 pb-3 flex items-baseline gap-3 flex-none">
            <h1 className="text-[20px] font-semibold">Photos</h1>
            <span className="text-[12.5px] opacity-60">{images.length} items</span>
          </div>
          <div className="flex-1 min-h-0 overflow-y-auto winscroll px-5 pb-5">
            <div className="grid gap-2" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))" }}>
              {images.map((im, i) => (
                <button key={i} onClick={() => setIdx(i)} className="group relative aspect-[4/3] rounded-md overflow-hidden bg-black/10">
                  <img src={im.src} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" draggable={false} alt={im.name} loading="lazy" />
                  <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent text-white text-[11px] px-2 py-1 text-left truncate opacity-0 group-hover:opacity-100 transition">{im.name}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
