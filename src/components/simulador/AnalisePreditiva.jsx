import { TrendingUp, Clock, AlertTriangle, BarChart2 } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, AreaChart, Area } from "recharts";
import { PREVISAO, HISTORICO_HORAS } from "./data/mockData";

const PREVISOES_DETALHADAS = [
  {
    horizonte: "1h",
    quebra: 4, atraso: 12, fila: 15, baixaProd: 8, faltaMadeira: 2, frotaNecessaria: 0,
  },
  {
    horizonte: "2h",
    quebra: 7, atraso: 18, fila: 22, baixaProd: 12, faltaMadeira: 5, frotaNecessaria: 0,
  },
  {
    horizonte: "4h",
    quebra: 12, atraso: 28, fila: 35, baixaProd: 20, faltaMadeira: 15, frotaNecessaria: 2,
  },
  {
    horizonte: "8h",
    quebra: 18, atraso: 42, fila: 51, baixaProd: 31, faltaMadeira: 34, frotaNecessaria: 4,
  },
  {
    horizonte: "24h",
    quebra: 28, atraso: 67, fila: 44, baixaProd: 45, faltaMadeira: 72, frotaNecessaria: 8,
  },
];

const riscoColor = (r) => {
  if (r === "alto" || r === "critico") return "text-red-500";
  if (r === "medio") return "text-amber-500";
  return "text-emerald-500";
};

const riscoLabel = { baixo: "Baixo", medio: "Médio", alto: "Alto", critico: "Crítico" };

export default function AnalisePreditiva() {
  const areaData = HISTORICO_HORAS.map((h, i) => ({
    ...h,
    previsto: i >= 18 ? Math.round(1600 + Math.random() * 300) : null,
    limite: 1710,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-cyan-600 to-blue-700 rounded-2xl p-5 text-white">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-black text-lg">Análise Preditiva</h2>
            <p className="text-cyan-200 text-xs">Previsão de ocorrências com base em histórico operacional</p>
          </div>
        </div>
      </div>

      {/* Gráfico histórico + previsão */}
      <div className="bg-card rounded-2xl border border-border p-5">
        <h3 className="font-bold text-sm text-foreground mb-4 flex items-center gap-2">
          <BarChart2 className="w-4 h-4 text-blue-500" /> Produção Histórica + Previsão
        </h3>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={areaData}>
            <XAxis dataKey="hora" tick={{ fontSize: 9 }} interval={3} />
            <YAxis tick={{ fontSize: 9 }} />
            <Tooltip contentStyle={{ fontSize: 11 }} />
            <ReferenceLine y={1710} stroke="#ef4444" strokeDasharray="4 4" label={{ value: "Meta", fontSize: 9 }} />
            <Area type="monotone" dataKey="ton" stroke="#3b82f6" fill="#3b82f610" strokeWidth={2} name="Realizado" />
            <Area type="monotone" dataKey="previsto" stroke="#8b5cf6" fill="#8b5cf610" strokeWidth={2} strokeDasharray="6 3" name="Previsto" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Probabilidades por horizonte */}
      <div>
        <h3 className="font-bold text-sm text-foreground mb-3 flex items-center gap-2">
          <Clock className="w-4 h-4 text-indigo-500" /> Probabilidade de Ocorrências (%)
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-muted">
                <th className="text-left px-4 py-2.5 font-bold text-muted-foreground">Evento</th>
                {PREVISOES_DETALHADAS.map(p => (
                  <th key={p.horizonte} className="text-center px-3 py-2.5 font-bold text-muted-foreground">{p.horizonte}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { key: "quebra", label: "🔧 Quebra de Caminhão", threshold: 20 },
                { key: "atraso", label: "⏱️ Atraso Operacional", threshold: 35 },
                { key: "fila", label: "🚦 Fila Excessiva", threshold: 30 },
                { key: "baixaProd", label: "📉 Baixa Produtividade", threshold: 25 },
                { key: "faltaMadeira", label: "🌲 Risco Falta Madeira", threshold: 40 },
              ].map((evento, i) => (
                <tr key={evento.key} className={i % 2 === 0 ? "bg-card" : "bg-muted/30"}>
                  <td className="px-4 py-2.5 font-medium text-foreground">{evento.label}</td>
                  {PREVISOES_DETALHADAS.map(p => {
                    const val = p[evento.key];
                    return (
                      <td key={p.horizonte} className="px-3 py-2.5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <div className="w-12 bg-muted rounded-full h-1.5">
                            <div
                              className={`h-1.5 rounded-full ${val >= evento.threshold ? "bg-red-500" : val >= evento.threshold * 0.6 ? "bg-amber-400" : "bg-emerald-500"}`}
                              style={{ width: `${val}%` }}
                            />
                          </div>
                          <span className={`font-bold ${val >= evento.threshold ? "text-red-500" : val >= evento.threshold * 0.6 ? "text-amber-500" : "text-emerald-500"}`}>
                            {val}%
                          </span>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
              {/* Frota necessária */}
              <tr className="bg-indigo-50 dark:bg-indigo-950/20">
                <td className="px-4 py-2.5 font-bold text-indigo-700 dark:text-indigo-300">🚛 Frota Adicional Necessária</td>
                {PREVISOES_DETALHADAS.map(p => (
                  <td key={p.horizonte} className="px-3 py-2.5 text-center font-black text-indigo-600 dark:text-indigo-400">
                    {p.frotaNecessaria > 0 ? `+${p.frotaNecessaria}` : "—"}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Cards de previsão */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {PREVISAO.map(p => (
          <div key={p.horizonte} className={`rounded-xl border p-3 text-center ${
            p.risco === "alto" || p.ruptura ? "border-red-300 bg-red-50 dark:bg-red-950/20" :
            p.risco === "medio" ? "border-amber-300 bg-amber-50 dark:bg-amber-950/20" :
            "border-emerald-300 bg-emerald-50 dark:bg-emerald-950/20"
          }`}>
            <div className="text-xs font-black text-muted-foreground mb-1">{p.horizonte}</div>
            <div className="text-lg font-black text-foreground">{(p.ton / 1000).toFixed(1)}k<span className="text-xs font-normal">t</span></div>
            <div className={`text-[10px] font-bold mt-1 ${riscoColor(p.risco)}`}>{riscoLabel[p.risco]}</div>
            {p.ruptura && <div className="text-[10px] text-red-600 font-bold mt-1 bg-red-100 dark:bg-red-900/40 rounded px-1">RUPTURA</div>}
            <div className="text-[10px] text-muted-foreground mt-1">Fila: {p.fila} un</div>
          </div>
        ))}
      </div>
    </div>
  );
}