import { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ClipboardList, Search, Loader2, CheckCircle2, XCircle,
  ShieldAlert, RotateCcw, Truck, Clock, Timer, TrendingUp,
  Download, User
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { TURNOS, getTurnoAtual, filtrarPorTurno } from "@/lib/turnos";

const ACAO_CONFIG = {
  liberacao:    { label: "Liberação",    icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-200" },
  cancelamento: { label: "Cancelamento", icon: XCircle,      color: "text-red-600",     bg: "bg-red-50 border-red-200" },
  pendencia:    { label: "Pendência",    icon: ShieldAlert,  color: "text-rose-600",    bg: "bg-rose-50 border-rose-200" },
  reativacao:   { label: "Reativação",   icon: RotateCcw,    color: "text-blue-600",    bg: "bg-blue-50 border-blue-200" },
  solicitacao:  { label: "Solicitação",  icon: Truck,        color: "text-amber-600",   bg: "bg-amber-50 border-amber-200" },
};

function KpiMini({ label, value, icon: Icon, color }) {
  return (
    <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${color}`}>
        <Icon className="w-4 h-4 text-white" />
      </div>
      <div>
        <p className="text-xl font-bold text-foreground">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

function exportCSV(data) {
  const headers = ["Data/Hora", "Ação", "Usuário", "Placa", "Frota", "BTF", "Transportadora", "OT", "Tempo Espera (min)", "Motivo"];
  const rows = data.map((r) => [
    r.data_acao ? format(new Date(r.data_acao), "dd/MM/yyyy HH:mm:ss") : "",
    ACAO_CONFIG[r.acao]?.label || r.acao,
    r.usuario || "",
    r.placa || "",
    r.frota || "",
    r.btf || "",
    r.transportadora || "",
    r.numero_ot || "",
    r.tempo_espera_minutos ?? "",
    r.motivo || "",
  ]);
  const csv = [headers, ...rows]
    .map((r) => r.map((v) => `"${String(v).replace(/[\r\n]+/g, " ").replace(/"/g, '""')}"`).join(";"))
    .join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `auditoria_${format(new Date(), "yyyyMMdd_HHmm")}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function Auditoria() {
  const [search, setSearch] = useState("");
  const [acaoFilter, setAcaoFilter] = useState("all");
  const [turnoFilter, setTurnoFilter] = useState(getTurnoAtual());
  const [isExporting, setIsExporting] = useState(false);

  const handleExportAll = async () => {
    setIsExporting(true);
    try {
      const all = [];
      let skip = 0;
      while (true) {
        const batch = await base44.entities.AuditoriaLog.filter({}, "-created_date", 500, skip);
        if (!batch.length) break;
        all.push(...batch);
        if (batch.length < 500) break;
        skip += 500;
      }
      exportCSV(all);
    } catch (e) {
      console.error("Erro ao exportar todos os registros:", e);
    } finally {
      setIsExporting(false);
    }
  };

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ["auditoria-logs"],
    queryFn: async () => {
      const all = [];
      let skip = 0;
      while (true) {
        const batch = await base44.entities.AuditoriaLog.filter({}, "-created_date", 500, skip);
        if (!batch.length) break;
        all.push(...batch);
        if (batch.length < 500) break;
        skip += 500;
      }
      return all;
    },
    refetchInterval: 15000,
  });

  const filtered = useMemo(() => {
    let list = turnoFilter === 0
      ? logs
      : filtrarPorTurno(logs, turnoFilter, "data_acao");

    if (acaoFilter !== "all") list = list.filter((r) => r.acao === acaoFilter);

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (r) =>
          r.placa?.toLowerCase().includes(q) ||
          r.frota?.toLowerCase().includes(q) ||
          r.btf?.toLowerCase().includes(q) ||
          r.transportadora?.toLowerCase().includes(q) ||
          r.numero_ot?.toLowerCase().includes(q) ||
          r.usuario?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [logs, acaoFilter, turnoFilter, search]);

  const kpis = useMemo(() => {
    const base = turnoFilter === 0 ? logs : filtrarPorTurno(logs, turnoFilter, "data_acao");
    const liberacoes = base.filter((r) => r.acao === "liberacao");
    const tempoMedio = liberacoes.length
      ? Math.round(liberacoes.filter(r => r.tempo_espera_minutos).reduce((a, r) => a + r.tempo_espera_minutos, 0) / liberacoes.filter(r => r.tempo_espera_minutos).length || 0)
      : 0;
    return {
      total: base.length,
      liberacoes: liberacoes.length,
      cancelamentos: base.filter((r) => r.acao === "cancelamento").length,
      pendencias: base.filter((r) => r.acao === "pendencia").length,
      tempoMedio,
    };
  }, [logs, turnoFilter]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center shadow-lg">
            <ClipboardList className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Auditoria</h1>
            <p className="text-xs text-muted-foreground">Registro gerencial de todas as ações</p>
          </div>
        </div>
        <Button variant="outline" onClick={handleExportAll} disabled={isExporting} className="gap-2 shrink-0">
          <Download className="w-4 h-4" />
          {isExporting ? "Baixando..." : "Exportar Tudo (CSV)"}
        </Button>
      </div>

      {/* Turno Selector */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mr-1">Turno:</span>
        <button
          onClick={() => setTurnoFilter(0)}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all ${
            turnoFilter === 0
              ? "bg-foreground text-background border-foreground"
              : "border-border text-muted-foreground hover:bg-muted"
          }`}
        >
          Todos
        </button>
        {TURNOS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTurnoFilter(t.id)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all ${
              turnoFilter === t.id
                ? t.color === "blue"
                  ? "bg-blue-500 text-white border-blue-500"
                  : t.color === "amber"
                  ? "bg-amber-500 text-white border-amber-500"
                  : "bg-purple-500 text-white border-purple-500"
                : "border-border text-muted-foreground hover:bg-muted"
            }`}
          >
            {t.icon} {t.label} <span className="opacity-70 ml-1">{t.horario}</span>
          </button>
        ))}
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <KpiMini label="Total de Ações" value={kpis.total} icon={ClipboardList} color="bg-violet-500" />
        <KpiMini label="Liberações" value={kpis.liberacoes} icon={CheckCircle2} color="bg-emerald-500" />
        <KpiMini label="Cancelamentos" value={kpis.cancelamentos} icon={XCircle} color="bg-red-500" />
        <KpiMini label="Pendências" value={kpis.pendencias} icon={ShieldAlert} color="bg-rose-500" />
        <KpiMini label="Tempo Médio" value={`${kpis.tempoMedio}m`} icon={Timer} color="bg-blue-500" />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Pesquisar placa, frota, BTF, transportadora, OT, usuário..."
            className="pl-10 h-10"
          />
        </div>
        <Tabs value={acaoFilter} onValueChange={setAcaoFilter}>
          <TabsList className="flex-wrap h-auto">
            <TabsTrigger value="all">Todos</TabsTrigger>
            <TabsTrigger value="liberacao">Liberações</TabsTrigger>
            <TabsTrigger value="cancelamento">Cancelamentos</TabsTrigger>
            <TabsTrigger value="pendencia">Pendências</TabsTrigger>
            <TabsTrigger value="reativacao">Reativações</TabsTrigger>
            <TabsTrigger value="solicitacao">Solicitações</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Log Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <ClipboardList className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground">Nenhum registro encontrado</p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          {/* Table Header */}
          <div className="hidden md:grid grid-cols-[130px_100px_130px_90px_70px_70px_120px_80px_60px_1fr] gap-2 px-4 py-2.5 bg-muted/50 border-b border-border text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            <span>Data / Hora</span>
            <span>Ação</span>
            <span>Usuário</span>
            <span>Placa</span>
            <span>Frota</span>
            <span>BTF</span>
            <span>Transportadora</span>
            <span>OT</span>
            <span>Espera</span>
            <span>Motivo</span>
          </div>

          <div className="divide-y divide-border max-h-[60vh] overflow-y-auto">
            {filtered.map((log) => {
              const cfg = ACAO_CONFIG[log.acao] || ACAO_CONFIG.solicitacao;
              const Icon = cfg.icon;
              return (
                <div
                  key={log.id}
                  className="flex flex-col md:grid md:grid-cols-[130px_100px_130px_90px_70px_70px_120px_80px_60px_1fr] gap-1 md:gap-2 px-4 py-3 hover:bg-muted/30 transition-colors"
                >
                  {/* Data */}
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
                    <Clock className="w-3 h-3 shrink-0 md:hidden" />
                    {log.data_acao
                      ? format(new Date(log.data_acao), "dd/MM/yy HH:mm:ss")
                      : format(new Date(log.created_date), "dd/MM/yy HH:mm:ss")}
                  </div>

                  {/* Ação */}
                  <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold border w-fit ${cfg.bg} ${cfg.color}`}>
                    <Icon className="w-3 h-3" />
                    {cfg.label}
                  </div>

                  {/* Usuário */}
                  <div className="flex items-center gap-1.5 text-xs text-foreground font-medium truncate">
                    <User className="w-3 h-3 shrink-0 text-muted-foreground" />
                    <span className="truncate">{log.usuario || "—"}</span>
                  </div>

                  {/* Placa */}
                  <div className="text-sm font-bold font-mono text-foreground">{log.placa || "—"}</div>

                  {/* Frota */}
                  <div className="text-xs font-mono text-foreground">{log.frota || "—"}</div>

                  {/* BTF */}
                  <div className="text-xs font-mono text-foreground">{log.btf || "—"}</div>

                  {/* Transportadora */}
                  <div className="text-xs text-muted-foreground truncate">{log.transportadora || "—"}</div>

                  {/* OT */}
                  <div className="text-xs font-mono font-semibold text-foreground">{log.numero_ot || "—"}</div>

                  {/* Espera */}
                  <div className="text-xs text-muted-foreground">
                    {log.tempo_espera_minutos != null ? `${log.tempo_espera_minutos}m` : "—"}
                  </div>

                  {/* Motivo */}
                  <div className="text-xs text-muted-foreground truncate">{log.motivo || "—"}</div>
                </div>
              );
            })}
          </div>

          <div className="px-4 py-2.5 border-t border-border bg-muted/30 text-xs text-muted-foreground">
            {filtered.length} registro{filtered.length !== 1 ? "s" : ""} exibido{filtered.length !== 1 ? "s" : ""}
          </div>
        </div>
      )}
    </div>
  );
}