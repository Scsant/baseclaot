import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar } from "recharts";

function MetricRow({ label, value, unit, color }) {
  const bg = color === "green" ? "bg-emerald-500" : color === "amber" ? "bg-amber-500" : color === "red" ? "bg-red-500" : "bg-blue-500";
  const pct = Math.min(100, typeof value === "number" ? value : 0);
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className="text-xs font-bold text-foreground">{typeof value === "number" && !unit ? value.toFixed(4) : value}{unit ? ` ${unit}` : ""}</span>
      </div>
      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
        <div className={`h-full ${bg} rounded-full transition-all`} style={{ width: `${Math.min(pct, 100)}%` }} />
      </div>
    </div>
  );
}

export default function ModelagemFilas({ resultado: r }) {
  const barData = [
    { name: "Chegada λ", value: parseFloat((r.lambda * 60).toFixed(3)), fill: "#6366f1" },
    { name: "Serviço μ", value: parseFloat((r.mu * 60).toFixed(3)), fill: "#10b981" },
    { name: "Fila Méd", value: r.filaMed, fill: "#f59e0b" },
    { name: "Fila Máx", value: r.filaMax, fill: "#ef4444" },
  ];

  const radarData = [
    { metric: "Saturação", value: Math.min(r.nivelSaturacao, 100) },
    { metric: "Congestionamento", value: r.probCongestion },
    { metric: "Ocupação", value: Math.min(r.rho * 100, 100) },
    { metric: "Risco Op.", value: r.riscoOp },
    { metric: "Ociosidade", value: r.probOciosidade },
    { metric: "Saturação Op", value: r.probSaturacao },
  ];

  const rhoColor = r.rho >= 1 ? "text-red-600" : r.rho >= 0.85 ? "text-amber-600" : "text-emerald-600";
  const rhoLabel = r.rho >= 1 ? "SATURADO" : r.rho >= 0.85 ? "CRÍTICO" : r.rho >= 0.65 ? "ATENÇÃO" : "ESTÁVEL";

  return (
    <div>
      <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Modelagem de Filas — Teoria M/M/c</h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Métricas */}
        <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-foreground">Parâmetros do Modelo</h3>
            <span className={`text-xs font-black px-2 py-0.5 rounded-full border ${rhoColor === "text-emerald-600" ? "bg-emerald-50 border-emerald-200 text-emerald-700" : rhoColor === "text-amber-600" ? "bg-amber-50 border-amber-200 text-amber-700" : "bg-red-50 border-red-200 text-red-700"}`}>
              ρ = {r.rho.toFixed(3)} — {rhoLabel}
            </span>
          </div>
          <MetricRow label="Taxa de Chegada (λ) cam/min" value={r.lambda} color="blue" />
          <MetricRow label="Taxa de Atendimento (μ) cam/min" value={r.mu} color="green" />
          <MetricRow label="Taxa de Ocupação (ρ)" value={r.rho} color={r.rho >= 1 ? "red" : r.rho >= 0.8 ? "amber" : "green"} />
          <MetricRow label="Prob. Congestionamento" value={r.probCongestion} unit="%" color={r.probCongestion > 50 ? "red" : "amber"} />
          <MetricRow label="Prob. Saturação" value={r.probSaturacao} unit="%" color={r.probSaturacao > 30 ? "red" : "amber"} />
          <MetricRow label="Prob. Ociosidade" value={r.probOciosidade} unit="%" color={r.probOciosidade > 40 ? "amber" : "green"} />
          <hr className="border-border" />
          <MetricRow label="Fila Média (Lq)" value={r.filaMed} unit="cam" color={r.filaMed > 5 ? "red" : r.filaMed > 2 ? "amber" : "green"} />
          <MetricRow label="Fila Máxima Prevista" value={r.filaMax} unit="cam" color={r.filaMax > 10 ? "red" : "amber"} />
          <MetricRow label="Tempo de Espera Médio" value={r.tempoEspera} unit="min" color={r.tempoEspera > 30 ? "red" : r.tempoEspera > 15 ? "amber" : "green"} />
          <MetricRow label="Tempo no Sistema" value={r.tempoSistema} unit="min" color="blue" />
        </div>

        {/* Gráfico de barras */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <h3 className="text-sm font-bold text-foreground mb-4">Taxas e Comprimentos de Fila</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={barData} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
              <Tooltip
                contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 11 }}
              />
              <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]}>
                {barData.map((entry, i) => (
                  <rect key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Radar */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <h3 className="text-sm font-bold text-foreground mb-4">Perfil Operacional</h3>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="hsl(var(--border))" />
              <PolarAngleAxis dataKey="metric" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} />
              <Radar name="Operação" dataKey="value" stroke="#6366f1" fill="#6366f1" fillOpacity={0.3} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}