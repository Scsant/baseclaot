import { useState } from "react";
import { Truck, Building2, Filter, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { CAMINHOES_BTF, TRANSPORTADORAS, GRUAS, FRENTES } from "./data/mockData";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

const STATUS_CONFIG = {
  viagem: { label: "Em Viagem", color: "bg-blue-500", text: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-950/30" },
  carregando: { label: "Carregando", color: "bg-amber-400", text: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-950/30" },
  fila: { label: "Em Fila", color: "bg-orange-500", text: "text-orange-600", bg: "bg-orange-50 dark:bg-orange-950/30" },
  disponivel: { label: "Disponível", color: "bg-emerald-500", text: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950/30" },
  manutencao: { label: "Manutenção", color: "bg-red-500", text: "text-red-600", bg: "bg-red-50 dark:bg-red-950/30" },
};

export default function GestaoFrota() {
  const [busca, setBusca] = useState("");
  const [aba, setAba] = useState("btfs");

  const btfsFiltrados = CAMINHOES_BTF.filter(c =>
    c.nome.toLowerCase().includes(busca.toLowerCase()) ||
    c.transportadora.toLowerCase().includes(busca.toLowerCase())
  );

  const transpFiltradas = TRANSPORTADORAS.filter(t =>
    t.nome.toLowerCase().includes(busca.toLowerCase())
  );

  const perfData = TRANSPORTADORAS.map(t => ({
    nome: t.nome.split(" ")[0],
    performance: t.performance,
    prod: Math.round(t.produtividade),
  }));

  return (
    <div className="space-y-6">
      {/* Abas */}
      <div className="flex gap-2 flex-wrap">
        {[
          { id: "btfs", label: "BTFs — Frota Própria", icon: Truck },
          { id: "transportadoras", label: "Transportadoras", icon: Building2 },
          { id: "gruas", label: "Gruas", icon: Filter },
        ].map(a => (
          <button
            key={a.id}
            onClick={() => setAba(a.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
              aba === a.id ? "bg-indigo-600 text-white border-indigo-600" : "border-border text-muted-foreground hover:bg-muted"
            }`}
          >
            <a.icon className="w-3.5 h-3.5" /> {a.label}
          </button>
        ))}
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input value={busca} onChange={e => setBusca(e.target.value)} placeholder="Buscar..." className="pl-9 h-9 text-xs" />
        </div>
      </div>

      {/* BTFs */}
      {aba === "btfs" && (
        <div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {btfsFiltrados.map(c => {
              const cfg = STATUS_CONFIG[c.status] || STATUS_CONFIG.disponivel;
              const frente = FRENTES.find(f => f.id === c.frente);
              return (
                <div key={c.id} className={`rounded-xl border p-3 ${cfg.bg}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-black text-sm text-foreground font-mono">{c.nome}</span>
                    <span className={`w-2.5 h-2.5 rounded-full ${cfg.color}`} />
                  </div>
                  <div className="text-[10px] text-muted-foreground space-y-0.5">
                    <div><span className="font-semibold">Status:</span> <span className={`font-bold ${cfg.text}`}>{cfg.label}</span></div>
                    <div><span className="font-semibold">DIM:</span> {c.dimN}%</div>
                    <div><span className="font-semibold">Cap:</span> {c.capacidade}t</div>
                    <div><span className="font-semibold">CM Disp:</span> {c.cmDisp}/{c.cmContratados}</div>
                    {frente && <div className="truncate"><span className="font-semibold">Frente:</span> {frente.modulo}</div>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Transportadoras */}
      {aba === "transportadoras" && (
        <div className="space-y-4">
          <div className="bg-card rounded-2xl border border-border p-4">
            <h3 className="font-bold text-xs text-muted-foreground uppercase mb-3">Performance por Transportadora</h3>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={perfData}>
                <XAxis dataKey="nome" tick={{ fontSize: 9 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 9 }} />
                <Tooltip contentStyle={{ fontSize: 11 }} />
                <Bar dataKey="performance" name="Performance %" radius={[4, 4, 0, 0]}>
                  {perfData.map((_, i) => (
                    <Cell key={i} fill={_ .performance >= 95 ? "#22c55e" : _.performance >= 85 ? "#f59e0b" : "#ef4444"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-3">
            {transpFiltradas.map((t, i) => (
              <div key={t.id} className="bg-card rounded-xl border border-border p-4 flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-xs shrink-0">{i + 1}</div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-xs text-foreground truncate">{t.nome}</div>
                  <div className="text-[10px] text-muted-foreground">CMs: {t.cmDisp}/{t.cmContratados} disp.</div>
                </div>
                <div className="grid grid-cols-3 gap-4 text-center text-xs shrink-0">
                  <div>
                    <div className={`font-black text-sm ${t.performance >= 95 ? "text-emerald-500" : t.performance >= 85 ? "text-amber-500" : "text-red-500"}`}>{t.performance}%</div>
                    <div className="text-[10px] text-muted-foreground">Perf.</div>
                  </div>
                  <div>
                    <div className="font-black text-sm text-blue-500">{t.pontualidade}%</div>
                    <div className="text-[10px] text-muted-foreground">Pont.</div>
                  </div>
                  <div>
                    <div className="font-black text-sm text-indigo-500">{t.produtividade}</div>
                    <div className="text-[10px] text-muted-foreground">t/h</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Gruas */}
      {aba === "gruas" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {GRUAS.map(g => {
            const frente = FRENTES.find(f => f.id === g.frente);
            return (
              <div key={g.id} className={`bg-card rounded-xl border p-4 ${g.status !== "operando" ? "border-red-300 dark:border-red-700" : "border-border"}`}>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-black text-sm text-foreground">{g.nome}</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${g.status === "operando" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400" : "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400"}`}>
                    {g.status === "operando" ? "OPERANDO" : "PARADA"}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground space-y-1">
                  <div className="flex justify-between"><span>Modelo</span><span className="font-semibold text-foreground">{g.modelo}</span></div>
                  <div className="flex justify-between"><span>Frente</span><span className="font-semibold text-foreground">{frente?.nome?.substring(0, 20) || "—"}</span></div>
                  <div className="flex justify-between"><span>Capacidade</span><span className="font-semibold text-foreground">{g.capacidade} t/h</span></div>
                  <div className="flex justify-between"><span>T. Carregamento</span><span className="font-semibold text-foreground">{g.tempoMedCarreg}min</span></div>
                  <div className="flex justify-between"><span>Disponibilidade</span>
                    <span className={`font-bold ${g.disponibilidade >= 90 ? "text-emerald-500" : g.disponibilidade >= 75 ? "text-amber-500" : "text-red-500"}`}>{g.disponibilidade}%</span>
                  </div>
                  <div className="flex justify-between"><span>Eficiência</span>
                    <span className={`font-bold ${g.eficiencia >= 90 ? "text-emerald-500" : "text-amber-500"}`}>{g.eficiencia}%</span>
                  </div>
                </div>
                {/* Barra eficiência */}
                <div className="mt-3 w-full bg-muted rounded-full h-1.5">
                  <div className={`h-1.5 rounded-full ${g.eficiencia >= 90 ? "bg-emerald-500" : g.eficiencia >= 75 ? "bg-amber-400" : "bg-red-500"}`}
                    style={{ width: `${g.eficiencia}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}