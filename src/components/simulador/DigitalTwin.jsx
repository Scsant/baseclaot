import { useState } from "react";
import { Cpu, Play, AlertTriangle, TrendingDown, TrendingUp, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis } from "recharts";
import { PREVISAO } from "./data/mockData";
import { toast } from "sonner";

const CENARIOS = [
  { id: "normal", label: "Operação Normal", icon: "✅", color: "border-emerald-400 bg-emerald-50 dark:bg-emerald-950/20" },
  { id: "quebra_caminhao", label: "Quebra de Caminhão", icon: "🚛", color: "border-amber-400 bg-amber-50 dark:bg-amber-950/20" },
  { id: "quebra_grua", label: "Quebra de Grua", icon: "🏗️", color: "border-orange-400 bg-orange-50 dark:bg-orange-950/20" },
  { id: "interdicao", label: "Interdição de Estrada", icon: "🚧", color: "border-red-400 bg-red-50 dark:bg-red-950/20" },
  { id: "chuva", label: "Chuvas Intensas", icon: "🌧️", color: "border-blue-400 bg-blue-50 dark:bg-blue-950/20" },
  { id: "aumento_demanda", label: "Aumento de Demanda", icon: "📈", color: "border-purple-400 bg-purple-50 dark:bg-purple-950/20" },
];

const IMPACTOS = {
  normal: { tonPerdidas: 0, frotaExtra: 0, risco: "Baixo", novaProd: 102.5, cor: "emerald" },
  quebra_caminhao: { tonPerdidas: 420, frotaExtra: 2, risco: "Médio", novaProd: 94.2, cor: "amber" },
  quebra_grua: { tonPerdidas: 1200, frotaExtra: 0, risco: "Alto", novaProd: 81.4, cor: "orange" },
  interdicao: { tonPerdidas: 890, frotaExtra: 3, risco: "Alto", novaProd: 78.9, cor: "red" },
  chuva: { tonPerdidas: 1800, frotaExtra: 5, risco: "Crítico", novaProd: 68.3, cor: "red" },
  aumento_demanda: { tonPerdidas: 0, frotaExtra: 8, risco: "Médio", novaProd: 98.1, cor: "blue" },
};

const HORIZONTES = ["1h", "2h", "4h", "Turno", "24h"];

export default function DigitalTwin() {
  const [cenarioAtivo, setCenarioAtivo] = useState("normal");
  const [horizonteAtivo, setHorizonteAtivo] = useState("4h");
  const [simulando, setSimulando] = useState(false);
  const [resultado, setResultado] = useState(null);

  const executarSimulacao = () => {
    setSimulando(true);
    setResultado(null);
    setTimeout(() => {
      setSimulando(false);
      setResultado(IMPACTOS[cenarioAtivo]);
      toast.success("Simulação concluída!");
    }, 1800);
  };

  const impacto = resultado || (cenarioAtivo === "normal" ? IMPACTOS.normal : null);

  const radarData = [
    { subject: "Prod.", A: impacto ? impacto.novaProd : 100 },
    { subject: "Fila", A: impacto ? (100 - (impacto.tonPerdidas / 30)) : 95 },
    { subject: "Frota", A: impacto ? (100 - impacto.frotaExtra * 5) : 98 },
    { subject: "Estoque", A: impacto ? (impacto.tonPerdidas > 1000 ? 55 : 82) : 90 },
    { subject: "Gruas", A: impacto ? (cenarioAtivo === "quebra_grua" ? 40 : 92) : 95 },
    { subject: "Estradas", A: impacto ? (cenarioAtivo === "interdicao" ? 35 : 90) : 95 },
  ];

  const barData = PREVISAO.map(p => ({
    ...p,
    tonCenario: cenarioAtivo === "normal" ? p.ton : Math.round(p.ton * (IMPACTOS[cenarioAtivo].novaProd / 100)),
    meta: p.ton * 1.05,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-5 text-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center">
            <Cpu className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h2 className="font-black text-lg">Digital Twin — Gêmeo Digital da Operação</h2>
            <p className="text-slate-400 text-xs">Simulação preditiva de cenários operacionais em tempo real</p>
          </div>
        </div>
      </div>

      {/* Horizonte */}
      <div>
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Horizonte de Simulação</p>
        <div className="flex flex-wrap gap-2">
          {HORIZONTES.map(h => (
            <button
              key={h}
              onClick={() => setHorizonteAtivo(h)}
              className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                horizonteAtivo === h ? "bg-indigo-600 text-white border-indigo-600" : "border-border text-muted-foreground hover:bg-muted"
              }`}
            >
              {h}
            </button>
          ))}
        </div>
      </div>

      {/* Cenários */}
      <div>
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Selecionar Cenário</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {CENARIOS.map(c => (
            <button
              key={c.id}
              onClick={() => { setCenarioAtivo(c.id); setResultado(null); }}
              className={`rounded-xl border-2 p-3 text-left transition-all ${
                cenarioAtivo === c.id ? c.color + " ring-2 ring-indigo-500" : "border-border bg-card hover:bg-muted"
              }`}
            >
              <span className="text-xl">{c.icon}</span>
              <p className="text-xs font-bold text-foreground mt-1">{c.label}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Botão Simular */}
      <Button
        className="w-full h-12 gap-2 text-sm font-bold bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700"
        onClick={executarSimulacao}
        disabled={simulando}
      >
        {simulando ? (
          <><Cpu className="w-4 h-4 animate-spin" /> Simulando cenário...</>
        ) : (
          <><Play className="w-4 h-4" /> Executar Simulação</>
        )}
      </Button>

      {/* Resultados */}
      {impacto && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Cards impacto */}
          <div className="space-y-4">
            <h3 className="font-bold text-sm text-foreground">Impacto Operacional — {horizonteAtivo}</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className={`rounded-xl border p-4 text-center ${impacto.tonPerdidas > 0 ? "border-red-300 bg-red-50 dark:bg-red-950/20" : "border-emerald-300 bg-emerald-50 dark:bg-emerald-950/20"}`}>
                {impacto.tonPerdidas > 0 ? <TrendingDown className="w-5 h-5 text-red-500 mx-auto mb-1" /> : <TrendingUp className="w-5 h-5 text-emerald-500 mx-auto mb-1" />}
                <div className={`text-2xl font-black ${impacto.tonPerdidas > 0 ? "text-red-600" : "text-emerald-600"}`}>
                  {impacto.tonPerdidas > 0 ? `-${impacto.tonPerdidas}` : "Stable"}
                </div>
                <div className="text-[11px] text-muted-foreground">Toneladas perdidas</div>
              </div>
              <div className={`rounded-xl border p-4 text-center ${impacto.frotaExtra > 0 ? "border-amber-300 bg-amber-50 dark:bg-amber-950/20" : "border-emerald-300 bg-emerald-50 dark:bg-emerald-950/20"}`}>
                <Zap className={`w-5 h-5 mx-auto mb-1 ${impacto.frotaExtra > 0 ? "text-amber-500" : "text-emerald-500"}`} />
                <div className={`text-2xl font-black ${impacto.frotaExtra > 0 ? "text-amber-600" : "text-emerald-600"}`}>
                  {impacto.frotaExtra > 0 ? `+${impacto.frotaExtra}` : "0"}
                </div>
                <div className="text-[11px] text-muted-foreground">Frota adicional</div>
              </div>
              <div className={`rounded-xl border p-4 text-center col-span-2 ${
                impacto.risco === "Crítico" ? "border-red-400 bg-red-50 dark:bg-red-950/20" :
                impacto.risco === "Alto" ? "border-orange-400 bg-orange-50 dark:bg-orange-950/20" :
                impacto.risco === "Médio" ? "border-amber-400 bg-amber-50 dark:bg-amber-950/20" :
                "border-emerald-400 bg-emerald-50 dark:bg-emerald-950/20"
              }`}>
                <AlertTriangle className={`w-5 h-5 mx-auto mb-1 ${
                  impacto.risco === "Crítico" || impacto.risco === "Alto" ? "text-red-500" :
                  impacto.risco === "Médio" ? "text-amber-500" : "text-emerald-500"
                }`} />
                <div className="text-lg font-black text-foreground">Risco: {impacto.risco}</div>
                <div className="text-[11px] text-muted-foreground">Nova produtividade: <b>{impacto.novaProd}%</b></div>
              </div>
            </div>
          </div>

          {/* Radar */}
          <div className="bg-card rounded-2xl border border-border p-4">
            <h3 className="font-bold text-xs text-muted-foreground uppercase mb-3">Radar Operacional</h3>
            <ResponsiveContainer width="100%" height={200}>
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10 }} />
                <Radar name="Cenário" dataKey="A" stroke="#6366f1" fill="#6366f1" fillOpacity={0.3} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Previsão barras */}
          <div className="md:col-span-2 bg-card rounded-2xl border border-border p-4">
            <h3 className="font-bold text-xs text-muted-foreground uppercase mb-3">Produção Prevista por Horizonte</h3>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={barData}>
                <XAxis dataKey="horizonte" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ fontSize: 11 }} />
                <Bar dataKey="ton" name="Base" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                <Bar dataKey="tonCenario" name="Cenário" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}