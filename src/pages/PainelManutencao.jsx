import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { STATUS_CONFIG, PRIORIDADE_CONFIG } from "@/components/manutencao/StatusBadgeMnt";
import StatusBadgeMnt from "@/components/manutencao/StatusBadgeMnt";
import KpiCard from "@/components/ui/KpiCard";
import { Clock, Wrench, RefreshCw, AlertTriangle, Timer, CheckCircle2, Filter, Loader2, History } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import HistoricoLiberados from "@/components/manutencao/HistoricoLiberados";
import DetalhesMediaAtendimento from "@/components/manutencao/DetalhesMediaAtendimento";

const STATUS_ORDER = ["aguardando", "em_manutencao", "aguardando_chamado", "desistencia", "liberado"];

const PRIORIDADE_OPTS = [
  { value: "todas", label: "Todas" },
  { value: "alta", label: "Alta" },
  { value: "media", label: "Média" },
  { value: "baixa", label: "Baixa" },
];

function elapsed(dateStr) {
  if (!dateStr) return null;
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 60000);
  if (diff < 60) return `${diff}min`;
  const h = Math.floor(diff / 60);
  return `${h}h${diff % 60 > 0 ? ` ${diff % 60}m` : ""}`;
}

function formatMin(m) {
  return m < 60 ? `${m}min` : `${Math.floor(m / 60)}h${m % 60 > 0 ? ` ${m % 60}m` : ""}`;
}

export default function PainelManutencao() {
  const [chamados, setChamados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [filterPrio, setFilterPrio] = useState("todas");
  const [now, setNow] = useState(Date.now());
  const [liberados, setLiberados] = useState([]);
  const [showHistorico, setShowHistorico] = useState(false);
  const [showDetalhesMedia, setShowDetalhesMedia] = useState(false);

  const load = async () => {
    const cutoff1h = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const inicioHoje = new Date();
    inicioHoje.setHours(0, 0, 0, 0);
    const cutoffHoje = inicioHoje.toISOString();
    const [data, concluidos] = await Promise.all([
      base44.entities.ChamadoManutencao.filter(
        {
          $or: [
            { status: { $nin: ["desistencia", "liberado"] } },
            { status: "liberado", data_conclusao: { $gte: cutoffHoje } },
            { status: "desistencia", data_conclusao: { $gte: cutoff1h } }
          ]
        },
        "-updated_date",
        200
      ),
      base44.entities.ChamadoManutencao.filter({ status: "liberado" }, "-data_conclusao", 500),
    ]);
    setChamados(data);
    setLiberados(concluidos);
    setLastUpdate(new Date());
    setLoading(false);
  };

  useEffect(() => {
    load();
    const unsub = base44.entities.ChamadoManutencao.subscribe(() => load());
    return unsub;
  }, []);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(t);
  }, []);

  const dataHoje = new Date(now).toDateString();
  const visiveis = chamados.filter(c => {
    if (c.status === "liberado") return c.data_conclusao && new Date(c.data_conclusao).toDateString() === dataHoje;
    if (c.status === "desistencia") return c.data_conclusao && now - new Date(c.data_conclusao).getTime() < 60 * 60 * 1000;
    return true;
  });
  const filtered = filterPrio === "todas" ? visiveis : visiveis.filter(c => c.prioridade === filterPrio);

  const grouped = STATUS_ORDER.map(status => ({
    status,
    label: STATUS_CONFIG[status]?.label || status,
    items: filtered.filter(c => c.status === status),
  })).filter(g => g.items.length > 0);

  // KPIs
  const ativos = visiveis.filter(c => !["liberado", "desistencia"].includes(c.status)).length;
  const slaBreach = visiveis.filter(c => c.sla_estourado).length;
  const aguardandoCount = visiveis.filter(c => c.status === "aguardando").length;
  const inicioDoDia = new Date(now);
  inicioDoDia.setHours(0, 0, 0, 0);
  const hoje = inicioDoDia.toDateString();
  const liberadosHojeList = liberados.filter(c => c.data_conclusao && new Date(c.data_conclusao).toDateString() === hoje);
  const liberadosHoje = liberadosHojeList.length;
  const atendimentosEmCurso = visiveis.filter(c => c.status === "em_manutencao" && c.data_inicio_atendimento);
  const atendimentosFinalizados = liberadosHojeList.filter(c => c.data_inicio_atendimento && c.data_conclusao);
  const itensMediaAtendimento = [
    ...atendimentosEmCurso.map(c => ({ ...c, minutos: Math.max(0, (now - Math.max(new Date(c.data_inicio_atendimento).getTime(), inicioDoDia.getTime())) / 60000) })),
    ...atendimentosFinalizados.map(c => ({ ...c, minutos: Math.max(0, (new Date(c.data_conclusao).getTime() - Math.max(new Date(c.data_inicio_atendimento).getTime(), inicioDoDia.getTime())) / 60000) })),
  ];
  const tempoMedioMin = itensMediaAtendimento.length > 0
    ? Math.round(itensMediaAtendimento.reduce((sum, item) => sum + item.minutos, 0) / itensMediaAtendimento.length)
    : null;
  const aguardandoList = visiveis.filter(c => c.status === "aguardando");
  const tempoMedioAguardando = aguardandoList.length > 0
    ? Math.round(aguardandoList.reduce((sum, c) => sum + (c.data_abertura ? (now - new Date(c.data_abertura)) / 60000 : 0), 0) / aguardandoList.length)
    : null;
  const maiorEspera = aguardandoList.length > 0
    ? Math.max(...aguardandoList.map(c => c.data_abertura ? Math.floor((Date.now() - new Date(c.data_abertura)) / 60000) : 0))
    : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg">
            <Wrench className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Painel de Manutenção</h1>
            <p className="text-xs text-muted-foreground">Creare — Tempo Real</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => setShowHistorico(true)} className="gap-2">
            <History className="w-4 h-4" /> Histórico de liberados
          </Button>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{lastUpdate.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</span>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <KpiCard title="Ativos" value={ativos} icon={Wrench} color="amber" />
        <KpiCard title="Liberados hoje" value={liberadosHoje} icon={CheckCircle2} color="green" />
        <KpiCard title="Média atendimento" value={tempoMedioMin !== null ? formatMin(tempoMedioMin) : "—"} icon={Timer} color="blue" onClick={() => setShowDetalhesMedia(true)} />
        <KpiCard title="Média aguardando" value={tempoMedioAguardando !== null ? formatMin(tempoMedioAguardando) : "—"} icon={Clock} color="amber" />
        <KpiCard title="SLA Estourado" value={slaBreach} icon={AlertTriangle} color="red" />
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mr-1">Prioridade:</span>
          {PRIORIDADE_OPTS.map(opt => (
            <button
              key={opt.value}
              onClick={() => setFilterPrio(opt.value)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                filterPrio === opt.value
                  ? "bg-orange-500 text-white border-orange-500 shadow"
                  : "border-border text-muted-foreground hover:bg-muted"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span><span className="font-bold text-foreground">{aguardandoCount}</span> aguardando</span>
          {maiorEspera !== null && (
            <span className={maiorEspera > 60 ? "text-red-500 font-semibold" : ""}>
              maior espera: <span className="font-bold">{formatMin(maiorEspera)}</span>
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <Wrench className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground">Nenhuma manutenção encontrada</p>
        </div>
      ) : (
        <div className="space-y-8">
          {grouped.map(({ status, label, items }) => (
            <div key={status}>
              {/* Section Header */}
              <div className="flex items-center gap-3 mb-4">
                <StatusBadgeMnt status={status} size="md" />
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs font-bold text-muted-foreground bg-muted px-2.5 py-0.5 rounded-full">
                  {items.length} {items.length === 1 ? "atendimento" : "atendimentos"}
                </span>
              </div>

              {/* Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                <AnimatePresence>
                  {items.map(c => {
                    const prio = PRIORIDADE_CONFIG[c.prioridade];
                    const tempoAberto = elapsed(c.data_abertura);
                    const minutosRestantes = c.status === "desistencia" && c.data_conclusao
                      ? Math.max(0, Math.ceil((60 * 60 * 1000 - (now - new Date(c.data_conclusao).getTime())) / 60000))
                      : null;

                    const borderColor =
                      c.sla_estourado ? "border-red-400 dark:border-red-500" :
                      status === "aguardando" ? "border-amber-300 dark:border-amber-600" :
                      status === "em_manutencao" ? "border-orange-300 dark:border-orange-600" :
                      status === "aguardando_chamado" ? "border-violet-300 dark:border-violet-600" :
                      status === "liberado" ? "border-emerald-300 dark:border-emerald-600" :
                      "border-slate-300 dark:border-slate-600";

                    const bgColor =
                      c.sla_estourado ? "bg-red-50/60 dark:bg-red-950/30" :
                      status === "aguardando" ? "bg-amber-50/40 dark:bg-amber-950/15" :
                      status === "em_manutencao" ? "bg-orange-50/40 dark:bg-orange-950/15" :
                      status === "aguardando_chamado" ? "bg-violet-50/40 dark:bg-violet-950/15" :
                      status === "liberado" ? "bg-emerald-50/40 dark:bg-emerald-950/15" :
                      "bg-muted/20";

                    return (
                      <motion.div
                        key={c.id}
                        initial={{ opacity: 0, scale: 0.97, y: 12 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.97, y: -12 }}
                        transition={{ duration: 0.25 }}
                        className={cn("rounded-xl border-2 p-5 transition-all duration-300", borderColor, bgColor)}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">CM</p>
                            <p className="text-2xl font-bold font-mono text-foreground">{c.cm}</p>
                          </div>
                          <StatusBadgeMnt status={status} size="sm" />
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <Wrench className="w-3.5 h-3.5 shrink-0" />
                            <span className="capitalize truncate">{c.tipo_manutencao || "—"}</span>
                          </div>
                          {prio && (
                            <div className="flex items-center gap-1.5">
                              <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full", prio.color)}>{prio.label}</span>
                            </div>
                          )}
                        </div>

                        {c.descricao_problema && (
                          <p className="mt-2 text-xs text-muted-foreground leading-snug line-clamp-2">{c.descricao_problema}</p>
                        )}

                        <div className="mt-3 pt-3 border-t border-border/50 flex items-center justify-between">
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            <span>{c.numero_chamado || "—"}</span>
                          </div>
                          {minutosRestantes !== null ? (
                            <div className="flex items-center gap-1 text-xs font-bold text-muted-foreground">
                              <Timer className="w-3 h-3" /> Sai em {minutosRestantes}min
                            </div>
                          ) : tempoAberto && (
                            <div className={cn("flex items-center gap-1 text-xs font-bold", c.sla_estourado ? "text-red-500" : "text-muted-foreground")}>
                              {c.sla_estourado && <AlertTriangle className="w-3 h-3" />}
                              há {tempoAberto}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </div>
          ))}
        </div>
      )}

      <DetalhesMediaAtendimento open={showDetalhesMedia} onClose={() => setShowDetalhesMedia(false)} itens={itensMediaAtendimento} />
      <HistoricoLiberados open={showHistorico} onClose={() => setShowHistorico(false)} />
    </div>
  );
}