import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp } from "lucide-react";

const CORES = {
  tpa_transporte_atual: "#3b82f6",
  tpa_prancha_atual: "#10b981",
  tpa_carregamento_atual: "#f59e0b",
  tpa_nao_apontado_atual: "#8b5cf6",
};

const LABELS = {
  tpa_transporte_atual: "Transporte",
  tpa_prancha_atual: "Prancha",
  tpa_carregamento_atual: "Carregamento",
  tpa_nao_apontado_atual: "Não Apontado",
};

export default function GraficoEvolucaoTPA() {
  const [dados, setDados] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.ReportTPA.list("-data_turno", 15)
      .then((records) => {
        // Ordena do mais antigo para o mais recente para o gráfico
        const sorted = [...records].reverse();
        const chartData = sorted.map((r) => ({
          label: `T${r.turno} ${r.data_turno ? new Date(r.data_turno + "T12:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }) : ""}`,
          tpa_transporte_atual: r.tpa_transporte_atual != null ? Number(r.tpa_transporte_atual) : null,
          tpa_prancha_atual: r.tpa_prancha_atual != null ? Number(r.tpa_prancha_atual) : null,
          tpa_carregamento_atual: r.tpa_carregamento_atual != null ? Number(r.tpa_carregamento_atual) : null,
          tpa_nao_apontado_atual: r.tpa_nao_apontado_atual != null ? Number(r.tpa_nao_apontado_atual) : null,
        }));
        setDados(chartData);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="rounded-xl border border-border bg-card p-4 flex items-center justify-center h-48">
        <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (dados.length < 2) {
    return (
      <div className="rounded-xl border border-border bg-card p-4 flex flex-col items-center justify-center h-40 gap-2 text-muted-foreground">
        <TrendingUp className="w-8 h-8 opacity-30" />
        <p className="text-sm">Salve pelo menos 2 reports para ver a evolução do TPA.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
        <div className="w-7 h-7 rounded-lg bg-blue-500 flex items-center justify-center">
          <TrendingUp className="w-4 h-4 text-white" />
        </div>
        <span className="font-semibold text-sm text-foreground">Evolução do TPA por Turno</span>
      </div>
      <div className="px-2 py-4">
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={dados} margin={{ top: 4, right: 16, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="label" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
            <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
            <Tooltip
              contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }}
              labelStyle={{ fontWeight: 600 }}
            />
            <Legend wrapperStyle={{ fontSize: "11px" }} />
            {Object.entries(LABELS).map(([key, label]) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                name={label}
                stroke={CORES[key]}
                strokeWidth={2}
                dot={{ r: 3 }}
                connectNulls
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}