import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, ReferenceLine } from "recharts";
import { Truck, Zap, AlertTriangle, TrendingUp, Package, Clock, Activity, ChevronRight } from "lucide-react";
import { FRENTES, GRUAS, CAMINHOES_BTF, TRANSPORTADORAS, PARAMS_GLOBAIS, HISTORICO_HORAS, SUGESTOES_IA } from "./data/mockData";

const StatusDot = ({ status }) => {
  const colors = { normal: "bg-emerald-500", atencao: "bg-amber-400", critico: "bg-red-500", parada: "bg-red-600" };
  return <span className={`inline-block w-2.5 h-2.5 rounded-full ${colors[status] || "bg-slate-400"} animate-pulse`} />;
};

export default function TorreControle() {
  const totalCaminhoes = CAMINHOES_BTF.length + TRANSPORTADORAS.reduce((s, t) => s + t.cmDisp, 0);
  const emViagem = CAMINHOES_BTF.filter(c => c.status === "viagem").length + 180;
  const carregando = CAMINHOES_BTF.filter(c => c.status === "carregando").length + 42;
  const emFila = CAMINHOES_BTF.filter(c => c.status === "fila").length + 28;
  const disponiveis = CAMINHOES_BTF.filter(c => c.status === "disponivel").length + 15;
  const indisponiveis = CAMINHOES_BTF.filter(c => c.status === "manutencao").length + 38;

  const gruasOperando = GRUAS.filter(g => g.status === "operando").length;
  const gruasParadas = GRUAS.filter(g => g.status !== "operando").length;
  const eficienciaMedia = Math.round(GRUAS.reduce((s, g) => s + g.eficiencia, 0) / GRUAS.length);

  const tonRealizadas = 28420;
  const metaDiaria = PARAMS_GLOBAIS.metaDiariaTon;
  const progresso = Math.round((tonRealizadas / metaDiaria) * 100);
  const tonPrevistas = 39800;
  const gap = tonPrevistas - metaDiaria;

  const estoqueAtual = 9200;
  const coberturaH = Math.round(estoqueAtual / (metaDiaria / 24));
  const horasRuptura = coberturaH;

  const alertas = [
    { nivel: "critico", msg: "Grua GR-03 parada — Frente 0146 em risco de ruptura", icon: "🚨" },
    { nivel: "atencao", msg: "Fila excessiva na Frente 1024-ESTRELA II (8 caminhões)", icon: "⚠️" },
    { nivel: "atencao", msg: "Estoque da fábrica em nível de atenção: 9.200t (22h cobertura)", icon: "📦" },
    { nivel: "info", msg: "Meta diária 69% concluída — ritmo adequado", icon: "📊" },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Produção */}
        <div className="md:col-span-2 bg-card rounded-2xl border border-border p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
                <TrendingUp className="w-4.5 h-4.5 text-white" />
              </div>
              <span className="font-bold text-sm text-foreground">Produção da Fábrica</span>
            </div>
            <span className="text-2xl font-black text-emerald-500">{progresso}%</span>
          </div>
          <div className="flex items-end justify-between text-xs text-muted-foreground mb-2">
            <span>Realizado: <b className="text-foreground">{tonRealizadas.toLocaleString()}t</b></span>
            <span>Meta: <b className="text-foreground">{metaDiaria.toLocaleString()}t</b></span>
            <span>Previsto: <b className={gap >= 0 ? "text-emerald-500" : "text-red-500"}>{tonPrevistas.toLocaleString()}t</b></span>
          </div>
          <div className="w-full bg-muted rounded-full h-3">
            <div className="bg-gradient-to-r from-emerald-500 to-emerald-400 h-3 rounded-full transition-all" style={{ width: `${progresso}%` }} />
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            Gap vs meta: <span className={gap >= 0 ? "text-emerald-500 font-bold" : "text-red-500 font-bold"}>{gap >= 0 ? "+" : ""}{gap.toLocaleString()}t</span>
          </div>
        </div>

        {/* Estoque */}
        <div className="bg-card rounded-2xl border border-border p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <Package className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-sm text-foreground">Estoque Madeira</span>
          </div>
          <div className="text-3xl font-black text-foreground mb-1">{(estoqueAtual / 1000).toFixed(1)}k<span className="text-base font-normal text-muted-foreground">t</span></div>
          <div className="text-xs text-muted-foreground">Cobertura: <b className={coberturaH < 12 ? "text-amber-500" : "text-emerald-500"}>{coberturaH}h</b></div>
          <div className="mt-2 w-full bg-muted rounded-full h-2">
            <div className={`h-2 rounded-full ${coberturaH > 16 ? "bg-emerald-500" : coberturaH > 8 ? "bg-amber-400" : "bg-red-500"}`}
              style={{ width: `${Math.min(100, (coberturaH / 24) * 100)}%` }} />
          </div>
        </div>

        {/* Frota */}
        <div className="bg-card rounded-2xl border border-border p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Truck className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-sm text-foreground">Frota</span>
          </div>
          <div className="grid grid-cols-2 gap-y-1 text-xs">
            <span className="text-muted-foreground">Em viagem</span><span className="font-bold text-blue-500">{emViagem}</span>
            <span className="text-muted-foreground">Carregando</span><span className="font-bold text-amber-500">{carregando}</span>
            <span className="text-muted-foreground">Em fila</span><span className="font-bold text-orange-500">{emFila}</span>
            <span className="text-muted-foreground">Disponíveis</span><span className="font-bold text-emerald-500">{disponiveis}</span>
            <span className="text-muted-foreground">Indispon.</span><span className="font-bold text-red-500">{indisponiveis}</span>
          </div>
        </div>
      </div>

      {/* Gruas + Alertas + IPO mini */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Gruas */}
        <div className="bg-card rounded-2xl border border-border p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-sm text-foreground">Gruas</span>
          </div>
          <div className="space-y-2">
            {GRUAS.map(g => (
              <div key={g.id} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <StatusDot status={g.status === "operando" ? "normal" : "critico"} />
                  <span className="font-mono font-bold">{g.nome}</span>
                </div>
                <span className="text-muted-foreground">{g.eficiencia}% ef.</span>
                <span className={`font-bold ${g.status === "operando" ? "text-emerald-500" : "text-red-500"}`}>
                  {g.status === "operando" ? "ON" : "OFF"}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-border text-xs flex justify-between">
            <span className="text-muted-foreground">Eficiência média</span>
            <span className="font-bold text-emerald-500">{eficienciaMedia}%</span>
          </div>
        </div>

        {/* Alertas */}
        <div className="bg-card rounded-2xl border border-border p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-sm text-foreground">Alertas Ativos</span>
            <span className="ml-auto bg-red-100 dark:bg-red-950 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full">{alertas.length}</span>
          </div>
          <div className="space-y-2">
            {alertas.map((a, i) => (
              <div key={i} className={`flex items-start gap-2 p-2 rounded-lg text-xs ${
                a.nivel === "critico" ? "bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800" :
                a.nivel === "atencao" ? "bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800" :
                "bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800"
              }`}>
                <span>{a.icon}</span>
                <span className="leading-relaxed text-foreground">{a.msg}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Gráfico tendência */}
        <div className="bg-card rounded-2xl border border-border p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <Activity className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-sm text-foreground">Tendência Produção</span>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={HISTORICO_HORAS.slice(-12)}>
              <XAxis dataKey="hora" tick={{ fontSize: 9 }} interval={2} />
              <YAxis tick={{ fontSize: 9 }} />
              <Tooltip contentStyle={{ fontSize: 11 }} />
              <ReferenceLine y={1710} stroke="#ef4444" strokeDasharray="4 4" />
              <Line type="monotone" dataKey="ton" stroke="#6366f1" strokeWidth={2} dot={false} name="Ton/h" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Status Frentes */}
      <div className="bg-card rounded-2xl border border-border p-5 shadow-sm">
        <h3 className="font-bold text-sm text-foreground mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4 text-blue-500" /> Status das Frentes em Tempo Real
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {FRENTES.map(f => {
            const grua = GRUAS.find(g => g.frente === f.id);
            return (
              <div key={f.id} className={`rounded-xl border p-3 ${
                f.status === "normal" ? "border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/20" :
                f.status === "atencao" ? "border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/20" :
                "border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20 animate-pulse"
              }`}>
                <div className="flex items-center gap-1.5 mb-2">
                  <StatusDot status={f.status} />
                  <span className="font-bold text-[11px] text-foreground">{f.modulo}</span>
                </div>
                <div className="text-[10px] font-semibold text-foreground truncate">{f.fazenda}</div>
                <div className="text-[10px] text-muted-foreground mt-0.5">{f.distancia}km • {f.tempoMedciclo.toFixed(1)}h ciclo</div>
                <div className="text-[10px] mt-1">
                  <span className="text-muted-foreground">Grua: </span>
                  <span className={`font-bold ${grua?.status === "operando" ? "text-emerald-500" : "text-red-500"}`}>
                    {grua?.eficiencia}% ef.
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}