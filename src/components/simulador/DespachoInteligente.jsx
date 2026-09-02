import { useState } from "react";
import { Brain, CheckCircle2, XCircle, Zap, TrendingUp, TrendingDown, AlertTriangle, ArrowRight, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SUGESTOES_IA, IPO_RANKING, FRENTES } from "./data/mockData";
import { toast } from "sonner";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

export default function DespachoInteligente() {
  const [sugestoes, setSugestoes] = useState(SUGESTOES_IA);
  const [expandido, setExpandido] = useState(null);

  const aprovar = (id) => {
    setSugestoes(prev => prev.map(s => s.id === id ? { ...s, status: "aprovada" } : s));
    toast.success("Sugestão aprovada e implementada!");
  };

  const rejeitar = (id) => {
    setSugestoes(prev => prev.map(s => s.id === id ? { ...s, status: "rejeitada" } : s));
    toast.error("Sugestão rejeitada.");
  };

  const ipoColors = (ipo) => {
    if (ipo >= 90) return "#22c55e";
    if (ipo >= 70) return "#f59e0b";
    if (ipo >= 50) return "#f97316";
    return "#ef4444";
  };

  const prioridadeConfig = {
    critica: { bg: "bg-red-50 dark:bg-red-950/30 border-red-300 dark:border-red-700", badge: "bg-red-500 text-white", label: "CRÍTICA" },
    alta: { bg: "bg-orange-50 dark:bg-orange-950/30 border-orange-300 dark:border-orange-700", badge: "bg-orange-500 text-white", label: "ALTA" },
    media: { bg: "bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-700", badge: "bg-amber-400 text-white", label: "MÉDIA" },
  };

  return (
    <div className="space-y-6">
      {/* Header IA */}
      <div className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl p-5 text-white">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-black text-lg">Motor de Despacho Inteligente</h2>
            <p className="text-violet-200 text-xs">Algoritmo IPO — Índice de Prioridade Operacional</p>
          </div>
          <div className="ml-auto text-right">
            <div className="text-2xl font-black">3</div>
            <div className="text-violet-200 text-xs">sugestões ativas</div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="bg-white/10 rounded-xl p-3 text-center">
            <div className="text-xl font-black">+300t</div>
            <div className="text-violet-200 text-[11px]">Ganho potencial</div>
          </div>
          <div className="bg-white/10 rounded-xl p-3 text-center">
            <div className="text-xl font-black">-35min</div>
            <div className="text-violet-200 text-[11px]">Redução de fila</div>
          </div>
          <div className="bg-white/10 rounded-xl p-3 text-center">
            <div className="text-xl font-black">+5.3%</div>
            <div className="text-violet-200 text-[11px]">Ganho produtividade</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Sugestões */}
        <div className="lg:col-span-3 space-y-4">
          <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-500" /> Sugestões Automáticas
          </h3>
          {sugestoes.map((s) => {
            const cfg = prioridadeConfig[s.prioridade] || prioridadeConfig.media;
            const fOrigem = FRENTES.find(f => f.id === s.frente_origem);
            const fDestino = FRENTES.find(f => f.id === s.frente_destino);
            const isExp = expandido === s.id;

            return (
              <div key={s.id} className={`rounded-2xl border p-4 ${cfg.bg} ${s.status !== "pendente" ? "opacity-60" : ""}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${cfg.badge}`}>{cfg.label}</span>
                      {s.status === "aprovada" && <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">APROVADA</span>}
                      {s.status === "rejeitada" && <span className="text-[10px] font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded-full">REJEITADA</span>}
                    </div>
                    <p className="font-bold text-sm text-foreground">{s.titulo}</p>
                    <p className="text-xs text-muted-foreground mt-1">{s.descricao}</p>
                  </div>
                  <button onClick={() => setExpandido(isExp ? null : s.id)} className="text-muted-foreground hover:text-foreground">
                    {isExp ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>

                {/* Impactos */}
                <div className="grid grid-cols-3 gap-2 mt-3">
                  <div className={`rounded-lg p-2 text-center ${s.impactoTon > 0 ? "bg-emerald-100 dark:bg-emerald-950/40" : "bg-red-100 dark:bg-red-950/40"}`}>
                    <div className={`text-sm font-black ${s.impactoTon > 0 ? "text-emerald-600" : "text-red-600"}`}>
                      {s.impactoTon > 0 ? "+" : ""}{s.impactoTon}t
                    </div>
                    <div className="text-[10px] text-muted-foreground">Toneladas</div>
                  </div>
                  <div className={`rounded-lg p-2 text-center ${s.impactoFila < 0 ? "bg-emerald-100 dark:bg-emerald-950/40" : "bg-red-100 dark:bg-red-950/40"}`}>
                    <div className={`text-sm font-black ${s.impactoFila < 0 ? "text-emerald-600" : "text-red-600"}`}>
                      {s.impactoFila > 0 ? "+" : ""}{s.impactoFila}min
                    </div>
                    <div className="text-[10px] text-muted-foreground">Fila</div>
                  </div>
                  <div className={`rounded-lg p-2 text-center ${s.impactoProd > 0 ? "bg-emerald-100 dark:bg-emerald-950/40" : "bg-red-100 dark:bg-red-950/40"}`}>
                    <div className={`text-sm font-black ${s.impactoProd > 0 ? "text-emerald-600" : "text-red-600"}`}>
                      {s.impactoProd > 0 ? "+" : ""}{s.impactoProd}%
                    </div>
                    <div className="text-[10px] text-muted-foreground">Produt.</div>
                  </div>
                </div>

                {isExp && fOrigem && fDestino && (
                  <div className="mt-3 flex items-center gap-2 text-xs bg-white/50 dark:bg-black/20 rounded-xl p-3">
                    <div className="text-center">
                      <div className="font-bold text-foreground">{fOrigem.fazenda}</div>
                      <div className="text-muted-foreground">{fOrigem.distancia}km</div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
                    <div className="text-center">
                      <div className="font-bold text-foreground">{fDestino.fazenda}</div>
                      <div className="text-muted-foreground">{fDestino.distancia}km</div>
                    </div>
                    <div className="ml-auto font-bold text-foreground">{s.caminhoes} caminhões</div>
                  </div>
                )}

                {s.status === "pendente" && (
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" className="flex-1 gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => aprovar(s.id)}>
                      <CheckCircle2 className="w-3.5 h-3.5" /> Aprovar
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1 gap-1.5 border-red-300 text-red-600 hover:bg-red-50" onClick={() => rejeitar(s.id)}>
                      <XCircle className="w-3.5 h-3.5" /> Rejeitar
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Ranking IPO */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-indigo-500" /> Ranking IPO — Prioridade
          </h3>
          <div className="bg-card rounded-2xl border border-border p-4 shadow-sm">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={IPO_RANKING} layout="vertical" margin={{ left: 0 }}>
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 9 }} />
                <YAxis type="category" dataKey="nome" tick={{ fontSize: 9 }} width={80} />
                <Tooltip formatter={(v) => [`IPO ${v}`, ""]} contentStyle={{ fontSize: 11 }} />
                <Bar dataKey="ipo" radius={[0, 4, 4, 0]}>
                  {IPO_RANKING.map((r, i) => (
                    <Cell key={i} fill={ipoColors(r.ipo)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2">
            {IPO_RANKING.map((r, i) => (
              <div key={r.frente} className="bg-card rounded-xl border border-border p-3 flex items-center gap-3">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black text-white ${
                  i === 0 ? "bg-amber-400" : i === 1 ? "bg-slate-400" : i === 2 ? "bg-amber-700" : "bg-muted"
                }`}>{i + 1}</div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-xs text-foreground truncate">{r.nome}</div>
                  <div className="text-[10px] text-muted-foreground">Fila: {r.fila} • {FRENTES.find(f => f.id === r.frente)?.distancia}km</div>
                </div>
                <div className={`text-lg font-black ${r.ipo >= 90 ? "text-emerald-500" : r.ipo >= 70 ? "text-amber-500" : r.ipo >= 50 ? "text-orange-500" : "text-red-500"}`}>
                  {r.ipo}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}