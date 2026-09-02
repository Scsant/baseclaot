import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const HORIZONTES = [
  { label: "1h",     horas: 1,   degradMult: 1.0  },
  { label: "2h",     horas: 2,   degradMult: 1.02 },
  { label: "4h",     horas: 4,   degradMult: 1.05 },
  { label: "Turno",  horas: 8,   degradMult: 1.10 },
  { label: "24h",    horas: 24,  degradMult: 1.18 },
];

function calcHorizonte(resultado, inputs, mult) {
  const rhoPrev = Math.min(resultado.rho * mult, 1.2);
  const filaPrev = Math.max(0, resultado.filaMed * mult * mult);
  const espPrev  = rhoPrev >= 1 ? resultado.tempoEspera * mult * 2 : resultado.tempoEspera * mult;
  const prodPrev = resultado.producaoHora * Math.max(0, 1 - (rhoPrev - 0.8) * 0.3);
  return { rho: Math.min(rhoPrev * 100, 120), fila: parseFloat(filaPrev.toFixed(1)), espera: parseFloat(espPrev.toFixed(1)), producao: parseFloat(prodPrev.toFixed(0)) };
}

export default function AnalisePreditivaMotor({ resultado, inputs }) {
  const chartData = HORIZONTES.map(h => ({
    name: h.label,
    ...calcHorizonte(resultado, inputs, h.degradMult),
  }));

  return (
    <div>
      <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Análise Preditiva por Horizonte</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Tabela de horizontes */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="px-4 py-3 border-b border-border bg-muted/40">
            <h3 className="text-sm font-bold text-foreground">Previsão por Horizonte Temporal</h3>
          </div>
          <div className="divide-y divide-border">
            <div className="grid grid-cols-5 px-4 py-2 bg-muted/20 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              <span>Horizonte</span><span className="text-right">Saturação</span><span className="text-right">Fila</span><span className="text-right">Espera</span><span className="text-right">Produção</span>
            </div>
            {chartData.map((h, i) => {
              const satColor = h.rho >= 100 ? "text-red-600 font-black" : h.rho >= 85 ? "text-amber-600 font-bold" : "text-emerald-600";
              return (
                <div key={i} className="grid grid-cols-5 px-4 py-3 text-xs hover:bg-muted/20 transition-colors">
                  <span className="font-bold text-foreground">{h.name}</span>
                  <span className={`text-right font-mono ${satColor}`}>{h.rho.toFixed(0)}%</span>
                  <span className={`text-right font-mono ${h.fila > 5 ? "text-red-500" : h.fila > 2 ? "text-amber-500" : "text-emerald-500"}`}>{h.fila} cam</span>
                  <span className={`text-right font-mono ${h.espera > 30 ? "text-red-500" : h.espera > 15 ? "text-amber-500" : "text-emerald-500"}`}>{h.espera} min</span>
                  <span className="text-right font-mono text-blue-600">{h.producao.toLocaleString("pt-BR")}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Gráfico de tendências */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <h3 className="text-sm font-bold text-foreground mb-4">Tendência de Saturação e Fila</h3>
          <ResponsiveContainer width="100%" height={210}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
              <Tooltip
                contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 11 }}
              />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <Line type="monotone" dataKey="rho" name="Saturação %" stroke="#ef4444" strokeWidth={2} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="espera" name="Espera (min)" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="fila" name="Fila (cam)" stroke="#6366f1" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}