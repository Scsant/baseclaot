import { CheckCircle2, AlertTriangle, TrendingUp, Truck, Activity } from "lucide-react";
import { calcularProjecao } from "./motorInteligencia";

export default function ResumoExecutivo({ modulos }) {
  const criticos = modulos.filter((m) => m._statusCalc?.key === "critico").length;
  const oportunidade = modulos.filter((m) => m._statusCalc?.key === "oportunidade").length;
  const maisCaminhoes = modulos.filter((m) => m._statusCalc?.key === "mais_caminhoes").length;

  const totalMeta = modulos.reduce((s, m) => s + (m.meta_entrega_m3 || 0), 0);
  const totalProducao = modulos.reduce((s, m) => s + (m.producao_atual_m3 || 0), 0);

  const dentroMeta = modulos.filter((m) => {
    const meta = m.meta_entrega_m3 || 0;
    const { projecaoFinal } = calcularProjecao(m);
    return meta > 0 && projecaoFinal >= meta * 0.95;
  }).length;

  const impactoEstimado = modulos.reduce((s, m) => {
    const meta = m.meta_entrega_m3 || 0;
    const { projecaoFinal } = calcularProjecao(m);
    if (meta > 0 && projecaoFinal < meta) return s + (meta - projecaoFinal);
    return s;
  }, 0);

  const kpis = [
    { label: "Módulos monitorados", value: modulos.length, icon: Activity, bg: "bg-blue-50 dark:bg-blue-950/30", text: "text-blue-600 dark:text-blue-400", border: "border-blue-200 dark:border-blue-700" },
    { label: "Dentro da meta", value: dentroMeta, icon: CheckCircle2, bg: "bg-emerald-50 dark:bg-emerald-950/30", text: "text-emerald-600 dark:text-emerald-400", border: "border-emerald-200 dark:border-emerald-700" },
    { label: "Com oportunidade", value: oportunidade, icon: TrendingUp, bg: "bg-green-50 dark:bg-green-950/30", text: "text-green-600 dark:text-green-400", border: "border-green-200 dark:border-green-700" },
    { label: "Necessita caminhões", value: maisCaminhoes, icon: Truck, bg: "bg-sky-50 dark:bg-sky-950/30", text: "text-sky-600 dark:text-sky-400", border: "border-sky-200 dark:border-sky-700" },
    { label: "Operação crítica", value: criticos, icon: AlertTriangle, bg: "bg-red-50 dark:bg-red-950/30", text: "text-red-600 dark:text-red-400", border: "border-red-200 dark:border-red-700" },
  ];

  return (
    <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">Resumo Operacional</h2>
        {impactoEstimado > 0 && (
          <span className="text-xs text-red-600 dark:text-red-400 font-semibold bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-700 px-2.5 py-1 rounded-full">
            Impacto estimado: −{Math.round(impactoEstimado).toLocaleString("pt-BR")} m³
          </span>
        )}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {kpis.map((k, i) => {
          const Icon = k.icon;
          return (
            <div key={i} className={`rounded-xl border ${k.border} ${k.bg} p-3 flex flex-col gap-1`}>
              <div className="flex items-center gap-1.5">
                <Icon className={`w-3.5 h-3.5 ${k.text}`} />
                <span className={`text-[10px] font-semibold uppercase tracking-wide ${k.text} leading-tight`}>{k.label}</span>
              </div>
              <span className="text-2xl font-black text-foreground">{k.value}</span>
            </div>
          );
        })}
      </div>
      {totalMeta > 0 && (
        <div className="flex flex-wrap gap-4 pt-2 border-t border-border text-xs text-muted-foreground">
          <span>Meta total: <strong className="text-foreground">{totalMeta.toLocaleString("pt-BR")} m³</strong></span>
          <span>Produção atual: <strong className="text-foreground">{totalProducao.toLocaleString("pt-BR")} m³</strong></span>
          <span>Progresso: <strong className="text-foreground">{Math.round((totalProducao / totalMeta) * 100)}%</strong></span>
        </div>
      )}
    </div>
  );
}