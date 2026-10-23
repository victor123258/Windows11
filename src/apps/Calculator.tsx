import { useState } from "react";
import { Delete } from "lucide-react";

export default function Calculator() {
  const [disp, setDisp] = useState("0");
  const [acc, setAcc] = useState<number | null>(null);
  const [op, setOp] = useState<string | null>(null);
  const [fresh, setFresh] = useState(true);
  const [hist, setHist] = useState("");

  const fmt = (n: number) => {
    if (!isFinite(n) || isNaN(n)) return "Cannot divide by zero";
    const s = Math.abs(n) >= 1e15 || (Math.abs(n) < 1e-9 && n !== 0) ? n.toExponential(8) : String(+n.toFixed(10));
    return s;
  };

  const inputDigit = (d: string) => {
    if (disp === "Cannot divide by zero") { setDisp(d); setFresh(false); return; }
    if (fresh) { setDisp(d === "." ? "0." : d); setFresh(false); }
    else setDisp(disp === "0" && d !== "." ? d : disp + d);
  };

  const compute = (a: number, b: number, o: string) =>
    o === "+" ? a + b : o === "−" ? a - b : o === "×" ? a * b : b === 0 ? NaN : a / b;

  const applyOp = (o: string) => {
    const cur = parseFloat(disp);
    if (acc !== null && op && !fresh) {
      const r = compute(acc, cur, op);
      setAcc(r); setDisp(fmt(r));
    } else setAcc(cur);
    setOp(o); setHist(`${fmt(acc !== null && op && !fresh ? compute(acc, cur, op) : cur)} ${o}`); setFresh(true);
  };

  const equals = () => {
    if (op === null || acc === null) return;
    const cur = parseFloat(disp);
    const r = compute(acc, cur, op);
    setHist(`${fmt(acc)} ${op} ${fmt(cur)} =`);
    setDisp(fmt(r)); setAcc(null); setOp(null); setFresh(true);
  };

  const fn = (f: string) => {
    const cur = parseFloat(disp);
    if (f === "C") { setDisp("0"); setAcc(null); setOp(null); setHist(""); setFresh(true); }
    else if (f === "CE") { setDisp("0"); setFresh(true); }
    else if (f === "⌫") setDisp(fresh || disp.length <= 1 ? "0" : disp.slice(0, -1));
    else if (f === "±") setDisp(fmt(-cur));
    else if (f === "%") setDisp(fmt(acc ? (acc * cur) / 100 : 0));
    else if (f === "1/x") setDisp(fmt(1 / cur));
    else if (f === "x²") { setHist(`sqr(${fmt(cur)})`); setDisp(fmt(cur * cur)); setFresh(true); }
    else if (f === "√x") { setHist(`√(${fmt(cur)})`); setDisp(fmt(Math.sqrt(Math.abs(cur)))); setFresh(true); }
  };

  const Key = ({ label, onClick, cls = "" }: { label: React.ReactNode; onClick: () => void; cls?: string }) => (
    <button
      className={`rounded-[5px] h-12 text-[15px] flex items-center justify-center transition-colors active:scale-[.97]
        bg-white border border-black/[.06] shadow-[0_1px_2px_rgba(0,0,0,.08)] hover:bg-[#f6f6f6] active:bg-[#ededed] ${cls}`}
      onClick={onClick}
    >{label}</button>
  );
  const Ghost = ({ label, onClick }: { label: React.ReactNode; onClick: () => void }) => (
    <button className="rounded-[5px] h-12 text-[14px] text-black/70 hover:bg-black/[.05] active:bg-black/[.09] transition-colors" onClick={onClick}>{label}</button>
  );

  return (
    <div className="h-full flex flex-col bg-[#f3f3f3] text-black select-none">
      <div className="flex items-center gap-3 px-4 h-11 flex-none">
        <svg width="15" height="15" viewBox="0 0 20 20" className="text-black/80"><path d="M2 4h16M2 10h16M2 16h16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
        <span className="font-semibold text-[15px]">Standard</span>
      </div>
      <div className="flex-1 flex flex-col items-end justify-end px-5 pb-2 min-h-0">
        <div className="text-[13px] text-black/45 h-5 select-ok">{hist || "\u00a0"}</div>
        <div className="text-[44px] font-semibold leading-tight truncate max-w-full select-ok">{disp}</div>
      </div>
      <div className="grid grid-cols-4 gap-[3px] px-2.5 pb-1">
        <Ghost label="%" onClick={() => fn("%")} />
        <Ghost label="CE" onClick={() => fn("CE")} />
        <Ghost label="C" onClick={() => fn("C")} />
        <Ghost label={<Delete size={17} className="inline" />} onClick={() => fn("⌫")} />
      </div>
      <div className="grid grid-cols-4 gap-1.5 px-2.5 pb-2.5">
        <Key label="¹⁄ₓ" onClick={() => fn("1/x")} cls="bg-[#fafafa]" />
        <Key label="x²" onClick={() => fn("x²")} cls="bg-[#fafafa]" />
        <Key label="√x" onClick={() => fn("√x")} cls="bg-[#fafafa]" />
        <Key label="÷" onClick={() => applyOp("÷")} cls="bg-[#fafafa] text-[17px]" />
        {["7", "8", "9"].map((d) => <Key key={d} label={d} onClick={() => inputDigit(d)} cls="font-semibold" />)}
        <Key label="×" onClick={() => applyOp("×")} cls="bg-[#fafafa] text-[17px]" />
        {["4", "5", "6"].map((d) => <Key key={d} label={d} onClick={() => inputDigit(d)} cls="font-semibold" />)}
        <Key label="−" onClick={() => applyOp("−")} cls="bg-[#fafafa] text-[17px]" />
        {["1", "2", "3"].map((d) => <Key key={d} label={d} onClick={() => inputDigit(d)} cls="font-semibold" />)}
        <Key label="+" onClick={() => applyOp("+")} cls="bg-[#fafafa] text-[17px]" />
        <Key label="±" onClick={() => fn("±")} />
        <Key label="0" onClick={() => inputDigit("0")} cls="font-semibold" />
        <Key label="." onClick={() => !disp.includes(".") && inputDigit(".")} />
        <button
          className="rounded-[5px] h-12 text-[17px] text-white transition-all active:scale-[.97] border border-black/[.06] shadow-[0_1px_2px_rgba(0,0,0,.15)] hover:brightness-110"
          style={{ background: "var(--acc, #0067c0)" }}
          onClick={equals}
        >=</button>
      </div>
    </div>
  );
}
