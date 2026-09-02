import { Clock, Wrench, PhoneCall, XCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export const STATUS_CONFIG = {
  aguardando: {
    label: "Aguardando",
    icon: Clock,
    color: "bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800",
    dot: "bg-blue-500",
    badge: "bg-blue-500",
  },
  em_manutencao: {
    label: "Em Manutenção",
    icon: Wrench,
    color: "bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800",
    dot: "bg-amber-500",
    badge: "bg-amber-500",
  },
  aguardando_chamado: {
    label: "Aguardando Chamado",
    icon: PhoneCall,
    color: "bg-violet-100 dark:bg-violet-950/50 text-violet-700 dark:text-violet-400 border-violet-200 dark:border-violet-800",
    dot: "bg-violet-500",
    badge: "bg-violet-500",
  },
  desistencia: {
    label: "Desistência",
    icon: XCircle,
    color: "bg-slate-100 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700",
    dot: "bg-slate-400",
    badge: "bg-slate-400",
  },
  liberado: {
    label: "Liberado",
    icon: CheckCircle2,
    color: "bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
    dot: "bg-emerald-500",
    badge: "bg-emerald-500",
  },
};

export const PRIORIDADE_CONFIG = {
  baixa: { label: "Baixa", color: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400" },
  media: { label: "Média", color: "bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400" },
  alta: { label: "Alta", color: "bg-orange-100 text-orange-700 dark:bg-orange-950/50 dark:text-orange-400" },
};

export default function StatusBadgeMnt({ status, size = "sm" }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.aguardando;
  const Icon = cfg.icon;
  return (
    <span className={cn(
      "inline-flex items-center gap-1 rounded-full border font-semibold",
      cfg.color,
      size === "sm" ? "text-[10px] px-2 py-0.5" : "text-xs px-2.5 py-1"
    )}>
      <Icon className={size === "sm" ? "w-2.5 h-2.5" : "w-3.5 h-3.5"} />
      {cfg.label}
    </span>
  );
}