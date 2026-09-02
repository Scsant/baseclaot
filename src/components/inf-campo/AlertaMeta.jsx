import { CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { calcularProjecao, calcularAlertaMeta } from "./motorInteligencia";

export default function AlertaMeta({ modulo }) {
  const meta = modulo.meta_entrega_m3 || 0;
  if (!meta) return null;

  const { projecaoFinal } = calcularProjecao(modulo);
  const alerta = calcularAlertaMeta(meta, projecaoFinal);
  if (!alerta) return null;

  const configs = {
    verde: {
      bg: "bg-emerald-50 dark:bg-emerald-950/30",
      border: "border-emerald-300 dark:border-emerald-700",
      text: "text-emerald-700 dark:text-emerald-400",
      icon: CheckCircle2,
    },
    amarelo: {
      bg: "bg-amber-50 dark:bg-amber-950/30",
      border: "border-amber-300 dark:border-amber-700",
      text: "text-amber-700 dark:text-amber-400",
      icon: AlertTriangle,
    },
    vermelho: {
      bg: "bg-red-50 dark:bg-red-950/30",
      border: "border-red-300 dark:border-red-700",
      text: "text-red-700 dark:text-red-400",
      icon: XCircle,
    },
  };

  const cfg = configs[alerta.tipo];
  const Icon = cfg.icon;
  const diff = projecaoFinal - meta;

  return (
    <div className={`rounded-xl border-2 ${cfg.border} ${cfg.bg} p-3 space-y-1.5`}>
      <div className={`flex items-center gap-2 font-bold text-sm ${cfg.text}`}>
        <Icon className="w-4 h-4 shrink-0" />
        {alerta.label}
      </div>
      <div className="grid grid-cols-3 gap-2 text-xs">
        <div>
          <p className="text-muted-foreground">Meta</p>
          <p className="font-bold text-foreground">{meta.toLocaleString("pt-BR")} m³</p>
        </div>
        <div>
          <p className="text-muted-foreground">Projeção</p>
          <p className="font-bold text-foreground">{Math.round(projecaoFinal).toLocaleString("pt-BR")} m³</p>
        </div>
        <div>
          <p className="text-muted-foreground">{diff >= 0 ? "Saldo" : "Déficit"}</p>
          <p className={`font-bold ${diff >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
            {diff >= 0 ? "+" : ""}{Math.round(diff).toLocaleString("pt-BR")} m³
          </p>
        </div>
      </div>
    </div>
  );
}