import { useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import KpiCard from "@/components/ui/KpiCard";
import {
  BarChart3,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Timer,
  TrendingUp,
  TrendingDown,
  Users,
  Loader2,
} from "lucide-react";
import { format, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import { TURNOS, getTurnoAtual, filtrarPorTurno, getTurno } from "@/lib/turnos";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

const TURNO_COLORS = {
  1: { bg: "bg-blue-500", text: "text-blue-600 dark:text-blue-400", border: "border-blue-300 dark:border-blue-700", light: "bg-blue-50 dark:bg-blue-950/30" },
  2: { bg: "bg-amber-500", text: "text-amber-600 dark:text-amber-400", border: "border-amber-300 dark:border-amber-700", light: "bg-amber-50 dark:bg-amber-950/30" },
  3: { bg: "bg-purple-500", text: "text-purple-600 dark:text-purple-400", border: "border-purple-300 dark:border-purple-700", light: "bg-purple-50 dark:bg-purple-950/30" },
};

export default function Dashboard() {
  const [turnoFiltro, setTurnoFiltro] = useState(0); // 0 = geral

  const { data: solicitacoes = [], isLoading } = useQuery({
    queryKey: ["solicitacoes-dashboard"],
    queryFn: async () => {
      const all = [];
      let skip = 0;
      while (true) {
        const batch = await base44.entities.SolicitacaoOT.filter({}, "-created_date", 500, skip);
        if (!batch.length) break;
        all.push(...batch);
        if (batch.length < 500) break;
        skip += 500;
      }
      return all;
    },
    refetchInterval: 30000,
  });

  // Tempo médio de espera por turno — histórico completo (todas as datas)
  const tempoMedioPorTurnoHistorico = useMemo(() => {
    return TURNOS.map((t) => {
      const tempos = solicitacoes
        .filter((s) => s.status === "liberada" && s.data_solicitacao && s.tempo_espera_minutos && getTurno(s.data_solicitacao) === t.id)
        .map((s) => s.tempo_espera_minutos);
      const tempoMedio = tempos.length ? Math.round(tempos.reduce((a, b) => a + b, 0) / tempos.length) : 0;
      return { turno: t.label, tempoMedio, amostras: tempos.length, color: t.color === "blue" ? "#3b82f6" : t.color === "amber" ? "#f59e0b" : "#8b5cf6" };
    });
  }, [solicitacoes]);

  // Stats por turno (para a seção de comparativo)
  const statsPorTurno = useMemo(() => {
    return TURNOS.map((t) => {
      const lista = filtrarPorTurno(solicitacoes, t.id, "data_solicitacao");
      const liberadas = lista.filter((s) => s.status === "liberada");
      const pendentes = lista.filter((s) => s.status === "aguardando").length;
      const canceladas = lista.filter((s) => s.status === "cancelada").length;
      const tempos = liberadas.filter((s) => s.tempo_espera_minutos).map((s) => s.tempo_espera_minutos);
      const tempoMedio = tempos.length ? Math.round(tempos.reduce((a, b) => a + b, 0) / tempos.length) : 0;
      return { ...t, total: lista.length, liberadas: liberadas.length, pendentes, canceladas, tempoMedio };
    });
  }, [solicitacoes]);

  const stats = useMemo(() => {
    // Se tem filtro de turno, restringe a base
    const base = turnoFiltro === 0
      ? solicitacoes
      : filtrarPorTurno(solicitacoes, turnoFiltro, "data_solicitacao");

    const liberadas = base.filter((s) => s.status === "liberada");
    const pendentes = base.filter((s) => s.status === "aguardando");
    const canceladas = base.filter((s) => s.status === "cancelada");

    const tempos = liberadas.filter((s) => s.tempo_espera_minutos).map((s) => s.tempo_espera_minutos);
    const tempoMedio = tempos.length ? Math.round(tempos.reduce((a, b) => a + b, 0) / tempos.length) : 0;
    const tempoMax = tempos.length ? Math.max(...tempos) : 0;
    const tempoMin = tempos.length ? Math.min(...tempos) : 0;

    // By day (last 7 days) — sempre geral para o gráfico de tendência
    const byDay = [];
    for (let i = 6; i >= 0; i--) {
      const day = subDays(new Date(), i);
      const dayStr = day.toDateString();
      const dayLabel = format(day, "dd/MM", { locale: ptBR });
      const all = solicitacoes.filter((s) => new Date(s.data_solicitacao).toDateString() === dayStr);
      const lib = all.filter((s) => s.status === "liberada");
      const t1 = filtrarPorTurno(all, 1).length;
      const t2 = filtrarPorTurno(all, 2).length;
      const t3 = filtrarPorTurno(all, 3).length;
      byDay.push({ day: dayLabel, solicitacoes: all.length, liberadas: lib.length, "1º": t1, "2º": t2, "3º": t3 });
    }

    // Status distribution
    const statusDist = [
      { name: "Aguardando", value: pendentes.length, color: "#f59e0b" },
      { name: "Liberadas", value: liberadas.length, color: "#10b981" },
      { name: "Canceladas", value: canceladas.length, color: "#ef4444" },
    ].filter((s) => s.value > 0);

    // Top users
    const userCounts = {};
    liberadas.forEach((s) => {
      if (s.usuario_liberacao) {
        userCounts[s.usuario_liberacao] = (userCounts[s.usuario_liberacao] || 0) + 1;
      }
    });
    const topUsers = Object.entries(userCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    // Evolução acumulada — desempenho consolidado de liberações ao longo de todo o histórico
    const porDia = {};
    solicitacoes.forEach((s) => {
      if (s.status !== "liberada" || !s.data_solicitacao) return;
      const key = format(new Date(s.data_solicitacao), "yyyy-MM-dd");
      porDia[key] = (porDia[key] || 0) + 1;
    });
    let acumulado = 0;
    const evolucaoAcumulada = Object.keys(porDia)
      .sort()
      .map((key) => {
        acumulado += porDia[key];
        return {
          day: format(new Date(key + "T12:00:00"), "dd/MM", { locale: ptBR }),
          liberadas: porDia[key],
          acumulado,
        };
      });

    return {
      total: base.length,
      liberadas: liberadas.length,
      pendentes: pendentes.length,
      canceladas: canceladas.length,
      tempoMedio,
      tempoMax,
      tempoMin,
      byDay,
      statusDist,
      topUsers,
      evolucaoAcumulada,
    };
  }, [solicitacoes, turnoFiltro]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg">
          <BarChart3 className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground">Dashboard Gerencial</h1>
          <p className="text-xs text-muted-foreground">Indicadores e métricas operacionais</p>
        </div>
      </div>

      {/* Turno filter */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mr-1">Turno:</span>
        <button
          onClick={() => setTurnoFiltro(0)}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all ${
            turnoFiltro === 0
              ? "bg-foreground text-background border-foreground"
              : "border-border text-muted-foreground hover:bg-muted"
          }`}
        >
          Geral
        </button>
        {TURNOS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTurnoFiltro(t.id)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all ${
              turnoFiltro === t.id
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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard title="Total de Solicitações" value={stats.total} icon={Clock} color="blue" />
        <KpiCard title="Liberadas" value={stats.liberadas} icon={CheckCircle2} color="green" />
        <KpiCard title="Pendentes" value={stats.pendentes} icon={AlertTriangle} color="amber" />
        <KpiCard title="Canceladas" value={stats.canceladas} icon={XCircle} color="red" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <KpiCard title="Tempo Médio" value={`${stats.tempoMedio} min`} icon={Timer} color="blue" />
        <KpiCard title="Maior Espera" value={`${stats.tempoMax} min`} icon={TrendingUp} color="red" />
        <KpiCard title="Menor Espera" value={`${stats.tempoMin} min`} icon={TrendingDown} color="green" />
      </div>

      {/* Comparativo por turno */}
      <div className="bg-card rounded-xl border border-border p-5">
        <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4" />
          Comparativo por Turno — Hoje
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {statsPorTurno.map((t) => {
            const c = TURNO_COLORS[t.id];
            return (
              <div key={t.id} className={`rounded-xl border-2 ${c.border} ${c.light} p-4`}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg">{t.icon}</span>
                  <div>
                    <p className={`text-xs font-bold uppercase tracking-wider ${c.text}`}>{t.label}</p>
                    <p className="text-[10px] text-muted-foreground">{t.horario}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase">Total</p>
                    <p className="text-xl font-bold font-mono">{t.total}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase">Liberadas</p>
                    <p className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400">{t.liberadas}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase">Pendentes</p>
                    <p className="text-xl font-bold font-mono text-amber-600 dark:text-amber-400">{t.pendentes}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase">Tempo Médio</p>
                    <p className="text-xl font-bold font-mono">{t.tempoMedio} min</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Evolução Acumulada — histórico completo */}
      <div className="bg-card rounded-xl border border-border p-5">
        <h3 className="text-sm font-semibold text-foreground mb-1">Evolução Acumulada de Liberações (Histórico Completo)</h3>
        <p className="text-xs text-muted-foreground mb-4">Desempenho consolidado de todas as datas registradas no sistema</p>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={stats.evolucaoAcumulada}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="day" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: 12,
                }}
              />
              <Line type="monotone" dataKey="acumulado" name="Total Acumulado" stroke="#10b981" strokeWidth={2.5} dot={false} />
              <Line type="monotone" dataKey="liberadas" name="Liberadas no Dia" stroke="#3b82f6" strokeWidth={1.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tempo Médio por Turno — Histórico */}
      <div className="bg-card rounded-xl border border-border p-5">
        <h3 className="text-sm font-semibold text-foreground mb-1">Tempo Médio de Espera por Turno (Histórico)</h3>
        <p className="text-xs text-muted-foreground mb-4">Média de tempo de espera das liberações, considerando todo o histórico registrado</p>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={tempoMedioPorTurnoHistorico}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="turno" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" label={{ value: "min", angle: -90, position: "insideLeft", fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: 12,
                }}
                formatter={(value, name, props) => [`${value} min (${props.payload.amostras} liberações)`, "Tempo Médio"]}
              />
              <Bar dataKey="tempoMedio" name="Tempo Médio (min)" radius={[4, 4, 0, 0]}>
                {tempoMedioPorTurnoHistorico.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart - Solicitações por turno (7 dias) */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="text-sm font-semibold text-foreground mb-1">Solicitações por Turno (7 dias)</h3>
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><span className="w-3 h-3 rounded-sm inline-block bg-blue-500"></span>🌅 1º</div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><span className="w-3 h-3 rounded-sm inline-block bg-amber-500"></span>☀️ 2º</div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><span className="w-3 h-3 rounded-sm inline-block bg-purple-500"></span>🌙 3º</div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.byDay}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="1º" fill="#3b82f6" radius={[4, 4, 0, 0]} name="1º Turno" />
                <Bar dataKey="2º" fill="#f59e0b" radius={[4, 4, 0, 0]} name="2º Turno" />
                <Bar dataKey="3º" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="3º Turno" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart - Status */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Distribuição por Status</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.statusDist}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {stats.statusDist.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: 12,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex items-center justify-center gap-6 -mt-4">
              {stats.statusDist.map((s) => (
                <div key={s.name} className="flex items-center gap-2 text-xs">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }} />
                  <span className="text-muted-foreground">{s.name}: {s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Top Users */}
      <div className="bg-card rounded-xl border border-border p-5">
        <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
          <Users className="w-4 h-4" />
          Ranking de Liberações
        </h3>
        {stats.topUsers.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">Nenhuma liberação registrada</p>
        ) : (
          <div className="space-y-3">
            {stats.topUsers.map((u, i) => (
              <div key={u.name} className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                  style={{ backgroundColor: COLORS[i % COLORS.length] }}
                >
                  {i + 1}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold">{u.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold font-mono">{u.count}</p>
                  <p className="text-[10px] text-muted-foreground">liberações</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}