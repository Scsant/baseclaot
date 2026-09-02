import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { PRIORIDADE_CONFIG, STATUS_CONFIG } from "./StatusBadgeMnt";

const COLORS = ["#3b82f6", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6", "#06b6d4"];

export default function RelatorioManutencao({ chamados }) {
  const byStatus = useMemo(() => {
    const counts = {};
    chamados.forEach(c => { counts[c.status] = (counts[c.status] || 0) + 1; });
    return Object.entries(counts).map(([key, value]) => ({
      name: STATUS_CONFIG[key]?.label || key,
      value,
    }));
  }, [chamados]);

  const byPrioridade = useMemo(() => {
    const counts = { baixa: 0, media: 0, alta: 0, critica: 0 };
    chamados.forEach(c => { if (c.prioridade) counts[c.prioridade]++; });
    return Object.entries(counts).map(([key, value]) => ({
      name: PRIORIDADE_CONFIG[key]?.label || key,
      value,
    }));
  }, [chamados]);

  const byEmpresa = useMemo(() => {
    const counts = {};
    chamados.forEach(c => {
      const e = c.empresa_executora || "Não informado";
      counts[e] = (counts[e] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 8);
  }, [chamados]);

  const avgSla = useMemo(() => {
    const closed = chamados.filter(c => c.data_abertura && c.data_conclusao);
    if (!closed.length) return null;
    const total = closed.reduce((acc, c) => acc + (new Date(c.data_conclusao) - new Date(c.data_abertura)) / 3600000, 0);
    return (total / closed.length).toFixed(1);
  }, [chamados]);

  return (
    <div className="space-y-6">
      {/* KPIs rápidos */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <p className="text-3xl font-black text-foreground">{chamados.length}</p>
          <p className="text-xs text-muted-foreground">Total de Chamados</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
            {chamados.filter(c => c.status === "liberado").length}
          </p>
          <p className="text-xs text-muted-foreground">Concluídos</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <p className="text-3xl font-black text-foreground">{avgSla ? `${avgSla}h` : "—"}</p>
          <p className="text-xs text-muted-foreground">Tempo Médio</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status */}
        <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
          <h4 className="text-sm font-bold text-foreground">Chamados por Status</h4>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={byStatus} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                {byStatus.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Empresa */}
        <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
          <h4 className="text-sm font-bold text-foreground">Chamados por Empresa</h4>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={byEmpresa} layout="vertical" margin={{ left: 8, right: 16 }}>
              <XAxis type="number" tick={{ fontSize: 10 }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={80} />
              <Tooltip />
              <Bar dataKey="value" fill="#f97316" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Prioridade */}
        <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
          <h4 className="text-sm font-bold text-foreground">Chamados por Prioridade</h4>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={byPrioridade}>
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* SLA */}
        <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
          <h4 className="text-sm font-bold text-foreground">Indicadores de SLA</h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">Total com SLA Estourado</span>
              <span className="font-bold text-red-600 dark:text-red-400">{chamados.filter(c => c.sla_estourado).length}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">Taxa de Conclusão no SLA</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                {chamados.filter(c => c.status === "liberado").length > 0
                  ? `${Math.round((chamados.filter(c => c.status === "liberado" && !c.sla_estourado).length / chamados.filter(c => c.status === "liberado").length) * 100)}%`
                  : "—"}
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-muted-foreground">Chamados Críticos Ativos</span>
              <span className="font-bold text-foreground">
                {chamados.filter(c => c.prioridade === "critica" && c.status !== "liberado" && c.status !== "cancelado").length}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}