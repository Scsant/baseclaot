import { useState, useEffect, useRef, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Truck, Clock, Filter, ShieldAlert, MapPin } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";

const STORAGE_KEY = "distribuicao_fazendas";
const BTFs = Array.from({ length: 9 }, (_, i) => `BTF ${i + 1}`);

function useDistribuicao() {
  const [dist, setDist] = useState(null);
  useEffect(() => {
    function load() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        setDist(raw ? JSON.parse(raw) : {});
      } catch { setDist({}); }
    }
    load();
    window.addEventListener("storage", load);
    return () => window.removeEventListener("storage", load);
  }, []);
  return dist;
}

function useCurrentTime() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return now;
}

export default function PainelMotoristasEmbed() {
  const now = useCurrentTime();
  const distribuicao = useDistribuicao();
  const [filter, setFilter] = useState(24);
  const [newIds, setNewIds] = useState(new Set());
  const prevIdsRef = useRef(new Set());
  const audioRef = useRef(null);

  const { data: solicitacoes = [] } = useQuery({
    queryKey: ["painel-motoristas"],
    queryFn: () => base44.entities.SolicitacaoOT.filter({ status: "liberada" }, "-data_liberacao", 100),
    refetchInterval: 5000,
  });

  const { data: pendentes = [] } = useQuery({
    queryKey: ["painel-pendentes"],
    queryFn: () => base44.entities.SolicitacaoOT.filter({ status: "pendente" }, "-data_solicitacao", 50),
    refetchInterval: 5000,
  });

  const filtered = useMemo(() => {
    const cutoff = new Date(Date.now() - filter * 60 * 60 * 1000);
    const trinta = new Date(Date.now() - 30 * 60 * 1000);
    return solicitacoes.filter((s) => {
      if (!s.data_liberacao) return false;
      const dt = new Date(s.data_liberacao);
      // Remove do painel após 30 minutos da liberação
      if (dt < trinta) return false;
      return dt >= cutoff;
    });
  }, [solicitacoes, filter, now]);

  const finalFiltered = useMemo(() => {
    if (filter === 0) {
      const todayStr = new Date().toDateString();
      return filtered.filter((s) => s.data_liberacao && new Date(s.data_liberacao).toDateString() === todayStr);
    }
    return filtered;
  }, [filtered, filter]);

  useEffect(() => {
    const currentIds = new Set(filtered.map((s) => s.id));
    const justAdded = new Set();
    currentIds.forEach((id) => {
      if (!prevIdsRef.current.has(id)) justAdded.add(id);
    });
    if (justAdded.size > 0 && prevIdsRef.current.size > 0) {
      setNewIds(justAdded);
      try {
        if (!audioRef.current) {
          audioRef.current = new Audio("data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVggoqMd2BRU3eQo6KNcFRHUXiGkpOLfHRxdoKMkIyFfXl5fYWKjIqGgn59gIOGiIiHhYOBgIGDhYaHh4aFhIKBgIGChIWGhoaFhIOCgYGBg4SFhoaGhYSDgoGBgoOEhYaGhYWEg4KBgYKDhIWFhoWFhIOCgYGCg4SFhYaFhYSDgoKBgoOEhYWGhYWEg4KBgYKDhIWFhYWFhIOCgoGCg4SFhYWFhYSDgoKCgoOEhIWFhYWEhIOCgoKCg4SEhYWFhISDgoKCgoOEhIWFhYSEg4KCgoKDhISFhYWEhIOCgoKCg4SEhIWFhISDgoKCgoOEhISEhISEg4KCgoKDhISEhISEg4OCgoKCg4OEhISEhIODgoKCgoODhISEhISDg4KCgoKDg4SEhISEg4OCgoKCg4OEhISEhIODgoKC");
          audioRef.current.volume = 0.5;
        }
        audioRef.current.play().catch(() => {});
      } catch {}
      setTimeout(() => setNewIds(new Set()), 10000);
    }
    prevIdsRef.current = currentIds;
  }, [filtered]);

  const filterOptions = [
    { label: "6h", value: 6 },
    { label: "12h", value: 12 },
    { label: "24h", value: 24 },
    { label: "Hoje", value: 0 },
  ];

  return (
    <div className="rounded-2xl overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white shadow-xl">
      {/* Header */}
      <div className="border-b border-white/10 bg-black/30 px-5 py-4 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-xl">
            <Truck className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-base font-bold tracking-tight">PAINEL DE LIBERAÇÃO DE VIAGENS</h2>
            <p className="text-[10px] text-white/50 uppercase tracking-widest">Motoristas</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {distribuicao?.btfs && Object.values(distribuicao.btfs).some(Boolean) && (
            <div className="hidden lg:block bg-white/5 border border-white/10 rounded-xl px-4 py-2 min-w-[200px]">
              <div className="flex items-center gap-1.5 mb-1.5">
                <MapPin className="w-3 h-3 text-blue-400" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-blue-400">Distribuição BTFs</span>
              </div>
              <div className="space-y-0.5">
                {BTFs.map((btf) => {
                  const entry = distribuicao.btfs?.[btf];
                  const fazenda = entry?.fazenda || (typeof entry === "string" ? entry : "");
                  const modulo = entry?.modulo || "";
                  if (!fazenda && !modulo) return null;
                  return (
                    <div key={btf} className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold font-mono text-white/40 w-10 shrink-0">{btf}</span>
                      <span className="text-[10px] font-semibold text-white/80 truncate flex-1">{fazenda}</span>
                      {modulo && <span className="text-[10px] font-mono text-blue-300 shrink-0">{modulo}</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          <div className="text-right">
            <p className="text-xl font-bold font-mono tabular-nums">{format(now, "HH:mm:ss")}</p>
            <p className="text-[10px] text-white/50">{format(now, "dd 'de' MMMM", { locale: ptBR })}</p>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-white/40" />
          <span className="text-[10px] text-white/40 uppercase tracking-wider mr-1">Período:</span>
          {filterOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setFilter(opt.value)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                filter === opt.value
                  ? "bg-emerald-500 text-white shadow-lg"
                  : "bg-white/10 text-white/60 hover:bg-white/20"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <p className="text-xs text-white/40">
          {finalFiltered.length} liberações{pendentes.length > 0 ? ` · ${pendentes.length} com pendência` : ""}
        </p>
      </div>

      {/* Pendentes */}
      {pendentes.length > 0 && (
        <div className="px-5 pb-3">
          <div className="flex items-center gap-2 mb-2">
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            <span className="text-xs font-bold uppercase tracking-widest text-rose-400">Caminhões com Pendência</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            <AnimatePresence>
              {pendentes.map((s) => (
                <motion.div
                  key={s.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="rounded-xl p-4 border-2 bg-rose-900/70 border-rose-500 shadow-xl"
                >
                  <div className="flex items-center gap-1.5 mb-2">
                    <ShieldAlert className="w-3.5 h-3.5 text-rose-300" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-rose-300">Pendência</span>
                  </div>
                  <p className="text-3xl font-black font-mono text-center">{s.cm}</p>
                  {s.motivo_pendencia && (
                    <p className="mt-2 text-xs text-white/70 text-center leading-snug">{s.motivo_pendencia}</p>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Liberadas */}
      <div className="px-5 pb-5">
        {finalFiltered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Truck className="w-12 h-12 text-white/10 mb-3" />
            <p className="text-white/30">Nenhuma liberação no período</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            <AnimatePresence>
              {finalFiltered.map((s) => {
                const isNew = newIds.has(s.id);
                return (
                  <motion.div
                    key={s.id}
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className={`rounded-xl p-4 border-2 transition-all duration-500 ${
                      isNew
                        ? "bg-amber-500/90 border-amber-300 animate-blink shadow-2xl shadow-amber-500/30"
                        : "bg-emerald-600/90 border-emerald-400/50 shadow-xl"
                    }`}
                  >
                    <div className="text-center space-y-2">
                      <div>
                        <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/60">CM</p>
                        <p className="text-3xl font-black font-mono leading-none mt-0.5">{s.cm}</p>
                      </div>
                      <div className="h-px bg-white/20" />
                      <div>
                        <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/60">OT</p>
                        <p className="text-2xl font-black font-mono leading-none mt-0.5">{s.numero_ot}</p>
                      </div>
                      <div className="h-px bg-white/20" />
                      <div className="flex items-center justify-between pt-0.5">
                        <div>
                          <p className="text-[9px] text-white/50 uppercase">Conjunto</p>
                          <p className="text-sm font-bold font-mono">{s.placa || "—"}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[9px] text-white/50 uppercase">Hora</p>
                          <div className="flex items-center gap-1 justify-end">
                            <Clock className="w-3 h-3 text-white/60" />
                            <p className="text-sm font-bold font-mono">
                              {s.data_liberacao ? format(new Date(s.data_liberacao), "HH:mm") : "—"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}