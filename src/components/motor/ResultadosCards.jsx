import { TrendingUp, TrendingDown, Users, Clock, Gauge, AlertTriangle, Wrench, Truck, Activity, BarChart3 } from "lucide-react";

function Card({ title, value, unit, sub, icon: Icon, color, status }) {
  const colors = {
    blue:   "from-blue-500 to-blue-600",
    green:  "from-emerald-500 to-green-600",
    amber:  "from-amber-500 to-orange-500",
    red:    "from-red-500 to-red-600",
    violet: "from-violet-500 to-purple-600",
    teal:   "from-teal-500 to-cyan-600",
    rose:   "from-rose-500 to-red-500",
    indigo: "from-indigo-500 to-blue-600",
    slate:  "from-slate-500 to-slate-700",
    cyan:   "from-cyan-500 to-blue-500",
  };
  const statusColors = {
    ok:      "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200",
    warn:    "text-amber-600 bg-amber-50 dark:bg-amber-950/40 border-amber-200",
    danger:  "text-red-600 bg-red-50 dark:bg-red-950/40 border-red-200",
    neutral: "text-blue-600 bg-blue-50 dark:bg-blue-950/40 border-blue-200",
  };
  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden flex flex-col">
      <div className={`flex items-center gap-2 px-4 py-3 bg-gradient-to-r ${colors[color] || colors.blue}`}>
        <Icon className="w-4 h-4 text-white/90" />
        <span className="text-[10px] font-bold text-white uppercase tracking-wider">{title}</span>
      </div>
      <div className="px-4 py-4 flex-1 flex flex-col justify-between">
        <div>
          <span className="text-2xl font-black text-foreground tracking-tight">{value}</span>
          {unit && <span className="text-xs text-muted-foreground ml-1.5">{unit}</span>}
        </div>
        {sub && (
          <p className={`text-xs font-semibold mt-2 px-2 py-1 rounded-lg border ${statusColors[status || "neutral"]}`}>{sub}</p>
        )}
      </div>
    </div>
  );
}

export default function ResultadosCards({ resultado: r, inputs }) {
  const rhoPerc = (r.rho * 100).toFixed(0);

  const getSatStatus = () => {
    if (r.nivelSaturacao >= 100) return "danger";
    if (r.nivelSaturacao >= 80)  return "warn";
    return "ok";
  };

  const getRiscoStatus = () => {
    if (r.riscoOp >= 60) return "danger";
    if (r.riscoOp >= 30) return "warn";
    return "ok";
  };

  const getDeltaStatus = () => {
    if (r.deltaPerc > 5) return "ok";
    if (r.deltaPerc < -10) return "danger";
    return "warn";
  };

  return (
    <div>
      <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Resultado Executivo</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        <Card
          title="Capacidade da Frente"
          value={r.capFrenteTonH.toLocaleString("pt-BR")}
          unit="ton/h"
          sub={`Gruas op: ${r.gruasOp} | Disp: ${r.dispGrua}%`}
          icon={Gauge} color="blue"
          status={r.gruasOp >= inputs.qtdGruas * 0.8 ? "ok" : "warn"}
        />
        <Card
          title="Fila Prevista"
          value={r.filaMed.toFixed(1)}
          unit="caminhões"
          sub={`Fila máx: ${r.filaMax} cam`}
          icon={Users} color="amber"
          status={r.filaMed > 5 ? "danger" : r.filaMed > 2 ? "warn" : "ok"}
        />
        <Card
          title="Tempo Médio de Espera"
          value={r.tempoEspera.toFixed(1)}
          unit="min"
          sub={`Ciclo total: ${r.tCiclo.toFixed(0)} min`}
          icon={Clock} color={r.tempoEspera > 30 ? "red" : r.tempoEspera > 15 ? "amber" : "green"}
          status={r.tempoEspera > 30 ? "danger" : r.tempoEspera > 15 ? "warn" : "ok"}
        />
        <Card
          title="Produção Prevista"
          value={r.producaoHora.toLocaleString("pt-BR")}
          unit="ton/h"
          sub={`Turno: ${r.producaoTurno.toLocaleString("pt-BR")} | Dia: ${r.producaoDia.toLocaleString("pt-BR")} ton`}
          icon={TrendingUp} color="green"
          status="ok"
        />
        <Card
          title="Nível de Saturação"
          value={`${rhoPerc}%`}
          unit=""
          sub={r.nivelSaturacao >= 100 ? "SATURAÇÃO CRÍTICA" : r.nivelSaturacao >= 85 ? "Risco de congestionamento" : "Operação estável"}
          icon={Activity} color={getSatStatus() === "danger" ? "red" : getSatStatus() === "warn" ? "amber" : "teal"}
          status={getSatStatus()}
        />
        <Card
          title="Risco Operacional"
          value={`${r.riscoOp}%`}
          unit=""
          sub={r.riscoOp >= 60 ? "ALTO RISCO" : r.riscoOp >= 30 ? "Risco moderado" : "Risco baixo"}
          icon={AlertTriangle} color={getRiscoStatus() === "danger" ? "rose" : getRiscoStatus() === "warn" ? "amber" : "green"}
          status={getRiscoStatus()}
        />
        <Card
          title="Apoio Mecânico"
          value={[r.precisaTrator && "Trator", r.precisaSkidder && "Skidder", r.precisaEscav && "Escav."].filter(Boolean).join(" + ") || "Nenhum"}
          sub={r.precisaTrator || r.precisaSkidder || r.precisaEscav ? "Necessário para operação" : "Não necessário"}
          icon={Wrench} color={r.precisaTrator || r.precisaSkidder || r.precisaEscav ? "rose" : "green"}
          status={r.precisaTrator || r.precisaSkidder || r.precisaEscav ? "warn" : "ok"}
        />
        <Card
          title="Qtd Ideal de Caminhões"
          value={r.qtdIdeal}
          unit="caminhões"
          sub={`Atual: ${inputs.qtdCaminhoes} | Δ ${inputs.qtdCaminhoes > r.qtdIdeal ? "+" : ""}${inputs.qtdCaminhoes - r.qtdIdeal}`}
          icon={Truck} color="indigo"
          status={inputs.qtdCaminhoes === r.qtdIdeal ? "ok" : inputs.qtdCaminhoes > r.qtdIdeal ? "warn" : "danger"}
        />
        <Card
          title="Máx. Sem Fila"
          value={r.qtdMaxSemFila}
          unit="caminhões"
          sub={`Com ${inputs.qtdCaminhoes}: ${inputs.qtdCaminhoes > r.qtdMaxSemFila ? "HAVERÁ FILA" : "Sem fila"}`}
          icon={BarChart3} color="violet"
          status={inputs.qtdCaminhoes > r.qtdMaxSemFila ? "danger" : "ok"}
        />
        <Card
          title="Ganho / Perda de Prod."
          value={`${r.deltaPerc >= 0 ? "+" : ""}${r.deltaPerc}%`}
          unit=""
          sub={`${r.deltaProd >= 0 ? "+" : ""}${r.deltaProd.toLocaleString("pt-BR")} ton/h vs ideal`}
          icon={r.deltaPerc >= 0 ? TrendingUp : TrendingDown}
          color={getDeltaStatus() === "ok" ? "green" : getDeltaStatus() === "danger" ? "red" : "amber"}
          status={getDeltaStatus()}
        />
      </div>
    </div>
  );
}