import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, ChevronUp, Clock, ShieldAlert } from "lucide-react";

const estilos = {
  pendente: { titulo: "Com Pendência — Aguardar Instrução", rotulo: "Pendência", texto: "text-rose-400", barra: "bg-rose-900/60 border-rose-500/60 hover:bg-rose-900/80", selo: "bg-rose-500/40 border-rose-400/50", card: "border-rose-500/40 bg-rose-950/60", divisor: "bg-rose-500/30", borda: "border-rose-500/30" },
  aguardando: { titulo: "Aguardando Tratativa da Central", rotulo: "Em análise", texto: "text-amber-400", barra: "bg-amber-900/60 border-amber-500/60 hover:bg-amber-900/80", selo: "bg-amber-500/40 border-amber-400/50", card: "border-amber-500/40 bg-amber-950/60", divisor: "bg-amber-500/30", borda: "border-amber-500/30" }
};

export default function StatusTratativaBar({ registros, tipo }) {
  const [expanded, setExpanded] = useState(false);
  const cfg = estilos[tipo];
  const Icon = tipo === "pendente" ? ShieldAlert : Clock;
  return (
    <div className="mx-auto max-w-[120rem] px-6 pb-3"><button onClick={() => setExpanded((value) => !value)} className={`flex w-full items-center justify-between gap-3 rounded-xl border px-4 py-2.5 transition-all ${cfg.barra}`}><div className="flex flex-wrap items-center gap-2"><Icon className={`h-4 w-4 shrink-0 ${cfg.texto}`} /><span className={`text-xs font-bold uppercase tracking-widest ${cfg.texto}`}>{cfg.titulo}:</span><div className="flex flex-wrap items-center gap-2">{registros.map((item) => <span key={item.id} className={`rounded-lg border px-2.5 py-0.5 font-mono text-sm font-black text-white ${cfg.selo}`}>{item.placa || item.cm || "—"}</span>)}</div></div><div className="flex shrink-0 items-center gap-2"><span className={`text-xs font-semibold ${cfg.texto}`}>{registros.length} caminhão{registros.length > 1 ? "ões" : ""}</span>{expanded ? <ChevronUp className={`h-4 w-4 ${cfg.texto}`} /> : <ChevronDown className={`h-4 w-4 ${cfg.texto}`} />}</div></button>
      <AnimatePresence>{expanded && <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden"><div className="grid grid-cols-2 gap-3 pt-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">{registros.map((item) => <div key={item.id} className={`min-h-[144px] space-y-1.5 rounded-xl border p-3 text-center ${cfg.card}`}><div className="flex items-center justify-center gap-1.5"><Icon className={`h-3.5 w-3.5 ${cfg.texto}`} /><span className={`text-[10px] font-bold uppercase tracking-wider ${cfg.texto}`}>{cfg.rotulo}</span></div><p className="font-mono text-2xl font-black leading-none text-white">{item.placa || "—"}</p><div className="flex items-center justify-around pt-1"><div><p className={`text-[10px] font-bold uppercase ${cfg.texto}`}>Frota</p><p className="font-mono text-base font-black text-white/80">{item.frota || "—"}</p></div><div className={`h-7 w-px ${cfg.divisor}`} /><div><p className={`text-[10px] font-bold uppercase ${cfg.texto}`}>BTF</p><p className="font-mono text-base font-black text-white/80">{item.btf || "—"}</p></div></div><p className={`border-t pt-1.5 text-[10px] leading-snug text-white/70 ${cfg.borda}`}>{tipo === "pendente" ? item.motivo_pendencia || "Aguardar instrução" : "Aguardando análise da Central"}</p></div>)}</div></motion.div>}</AnimatePresence>
    </div>
  );
}