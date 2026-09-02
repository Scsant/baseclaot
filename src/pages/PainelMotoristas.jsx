import { useState, useEffect, useRef, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Truck, Clock, Filter, MapPin } from "lucide-react";
import StatusTratativaBar from "@/components/painel-motoristas/StatusTratativaBar";

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
    // Refresh when storage changes (other tab saves)
    window.addEventListener("storage", load);
    return () => window.removeEventListener("storage", load);
  }, []);
  return dist;
}
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";

function useCurrentTime() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return now;
}

export default function PainelMotoristas() {
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

  const { data: pendentesRaw = [] } = useQuery({
    queryKey: ["painel-pendentes"],
    queryFn: () => base44.entities.SolicitacaoOT.filter({ status: "pendente" }, "-data_solicitacao", 50),
    refetchInterval: 5000,
  });

  const { data: aguardandoRaw = [] } = useQuery({
    queryKey: ["painel-aguardando-central"],
    queryFn: () => base44.entities.SolicitacaoOT.filter({ status: "aguardando" }, "-data_solicitacao", 200),
    refetchInterval: 5000,
  });

  // Remove pendências com mais de 24 horas não liberadas
  const pendentes = useMemo(() => {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return pendentesRaw.filter((s) => {
      const ref = s.data_pendencia || s.data_solicitacao;
      return ref && new Date(ref) >= twentyFourHoursAgo;
    });
  }, [pendentesRaw, now]);

  const aguardandoCentral = useMemo(() => {
    const hoje = new Date(now);
    return aguardandoRaw.filter((solicitacao) => {
      const data = new Date(solicitacao.data_solicitacao || solicitacao.created_date);
      return data.getFullYear() === hoje.getFullYear()
        && data.getMonth() === hoje.getMonth()
        && data.getDate() === hoje.getDate();
    });
  }, [aguardandoRaw, now]);

  // Filter by time + remove cards older than 1 hour
  const filtered = useMemo(() => {
    const cutoff = new Date(Date.now() - filter * 60 * 60 * 1000);
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    return solicitacoes.filter((s) =>
      s.data_liberacao &&
      new Date(s.data_liberacao) >= cutoff &&
      new Date(s.data_liberacao) >= oneHourAgo
    );
  }, [solicitacoes, filter, now]);

  // Detect new releases
  useEffect(() => {
    const currentIds = new Set(filtered.map((s) => s.id));
    const justAdded = new Set();
    currentIds.forEach((id) => {
      if (!prevIdsRef.current.has(id)) justAdded.add(id);
    });

    if (justAdded.size > 0 && prevIdsRef.current.size > 0) {
      setNewIds(justAdded);
      // Play sound
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

  const finalFiltered = useMemo(() => {
    if (filter === 0) {
      const todayStr = new Date().toDateString();
      return filtered.filter((s) => s.data_liberacao && new Date(s.data_liberacao).toDateString() === todayStr);
    }
    return filtered;
  }, [filtered, filter]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/30 backdrop-blur-md">
        <div className="max-w-[120rem] mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-xl">
              <Truck className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight">PAINEL DE LIBERAÇÃO DE VIAGENS</h1>
              <p className="text-xs text-white/50 uppercase tracking-widest">Sistema de Transporte</p>
            </div>
          </div>
          <div className="flex items-start gap-6">
            {/* Card de Distribuição BTFs */}
            {distribuicao?.btfs && Object.values(distribuicao.btfs).some(Boolean) && (
              <div className="hidden lg:block bg-white/5 border border-white/10 rounded-xl px-4 py-3 min-w-[220px]">
                <div className="flex items-center gap-1.5 mb-2">
                  <MapPin className="w-3.5 h-3.5 text-blue-400" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-blue-400">Distribuição BTFs</span>
                </div>
                <div className="space-y-1">
                  {BTFs.map((btf) => {
                    const entry = distribuicao.btfs?.[btf];
                    const fazenda = entry?.fazenda || (typeof entry === "string" ? entry : "");
                    const modulo = entry?.modulo || "";
                    if (!fazenda && !modulo) return null;
                    return (
                      <div key={btf} className="flex items-center justify-between gap-3">
                        <span className="text-[11px] font-bold font-mono text-white/50 w-12 shrink-0">{btf}</span>
                        <span className="text-[11px] font-semibold text-white/90 truncate flex-1">{fazenda}</span>
                        {modulo && <span className="text-[10px] font-mono text-blue-300 shrink-0">{modulo}</span>}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            <div className="text-right hidden sm:block">
              <p className="text-2xl font-bold font-mono tabular-nums">{format(now, "HH:mm:ss")}</p>
              <p className="text-xs text-white/50">{format(now, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Filter Bar */}
      <div className="max-w-[120rem] mx-auto px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-white/40" />
          <span className="text-xs text-white/40 uppercase tracking-wider mr-2">Período:</span>
          {filterOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setFilter(opt.value)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                filter === opt.value
                  ? "bg-emerald-500 text-white shadow-lg"
                  : "bg-white/10 text-white/60 hover:bg-white/20"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <p className="text-xs text-white/40">{finalFiltered.length} liberações{aguardandoCentral.length > 0 ? ` · ${aguardandoCentral.length} aguardando Central` : ""}{pendentes.length > 0 ? ` · ${pendentes.length} com pendência` : ""}</p>
      </div>

      {/* Caminhões aguardando tratativa e com pendência */}
      {aguardandoCentral.length > 0 && <StatusTratativaBar registros={aguardandoCentral} tipo="aguardando" />}
      {pendentes.length > 0 && <StatusTratativaBar registros={pendentes} tipo="pendente" />}

      {/* Cards Liberadas */}
      <div className="max-w-[120rem] mx-auto px-6 py-4">
        {finalFiltered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32">
            <Truck className="w-20 h-20 text-white/10 mb-4" />
            <p className="text-white/30 text-xl">Nenhuma liberação no período</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            <AnimatePresence>
              {finalFiltered.map((s) => {
                const isNew = newIds.has(s.id);
                return (
                  <motion.div
                    key={s.id}
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: -20 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className={`rounded-2xl p-6 border-2 transition-all duration-500 ${
                      isNew
                        ? "bg-amber-500/90 border-amber-300 animate-blink shadow-2xl shadow-amber-500/30"
                        : "bg-emerald-600/90 border-emerald-400/50 shadow-xl"
                    }`}
                  >
                    {(() => {
                      const elapsedMs = s.data_liberacao ? now - new Date(s.data_liberacao) : 0;
                      const elapsedMin = Math.floor(elapsedMs / 60000);
                      const elapsedSec = Math.floor((elapsedMs % 60000) / 1000);
                      const timerStr = `${String(elapsedMin).padStart(2, "0")}:${String(elapsedSec).padStart(2, "0")}`;
                      const isWarning = elapsedMin >= 45;
                      return (
                        <div className="text-center space-y-3">
                          {/* Placa - destaque principal */}
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/60">Placa</p>
                            <p className="text-4xl sm:text-5xl font-black font-mono leading-none mt-1">{s.placa || "—"}</p>
                          </div>
                          <div className="h-px bg-white/20" />
                          {/* Frota e BTF lado a lado */}
                          <div className="flex items-center justify-around">
                            <div>
                              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/60">Frota</p>
                              <p className="text-2xl font-black font-mono leading-none mt-0.5">{s.frota || "—"}</p>
                            </div>
                            <div className="w-px h-10 bg-white/20" />
                            <div>
                              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/60">BTF</p>
                              <p className="text-2xl font-black font-mono leading-none mt-0.5">{s.btf || "—"}</p>
                            </div>
                          </div>
                          <div className="h-px bg-white/20" />
                          {/* OT */}
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/60">OT</p>
                            <p className="text-3xl sm:text-4xl font-black font-mono leading-none mt-1">{s.numero_ot || "—"}</p>
                          </div>
                          <div className="h-px bg-white/20" />
                          {/* Hora liberação */}
                          <div className="flex items-center justify-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-white/50" />
                            <p className="text-[10px] text-white/50 uppercase">Liberação:</p>
                            <p className="text-sm font-bold font-mono">
                              {s.data_liberacao ? format(new Date(s.data_liberacao), "HH:mm") : "—"}
                            </p>
                          </div>
                          {/* Timer */}
                          <div className={`flex items-center justify-center gap-1.5 rounded-xl py-1.5 ${isWarning ? "bg-red-900/60 border border-red-400/50" : "bg-black/20"}`}>
                            <Clock className={`w-3.5 h-3.5 ${isWarning ? "text-red-300" : "text-white/50"}`} />
                            <span className={`text-base font-black font-mono tabular-nums ${isWarning ? "text-red-200" : "text-white/70"}`}>{timerStr}</span>
                            {isWarning && <span className="text-[10px] font-bold text-red-300 uppercase">expirando</span>}
                          </div>
                        </div>
                      );
                    })()}
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