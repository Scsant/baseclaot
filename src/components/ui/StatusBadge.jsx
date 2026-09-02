import { Clock, CheckCircle2, XCircle, AlertTriangle, ShieldAlert } from "lucide-react";

const statusConfig = {
  aguardando: {
    label: "Aguardando OT",
    bg: "bg-amber-50 dark:bg-amber-950/40",
    border: "border-amber-400 dark:border-amber-500",
    text: "text-amber-700 dark:text-amber-400",
    icon: Clock,
  },
  liberada: {
    label: "OT Liberada",
    bg: "bg-emerald-50 dark:bg-emerald-950/40",
    border: "border-emerald-400 dark:border-emerald-500",
    text: "text-emerald-700 dark:text-emerald-400",
    icon: CheckCircle2,
  },
  cancelada: {
    label: "Cancelada",
    bg: "bg-red-50 dark:bg-red-950/40",
    border: "border-red-400 dark:border-red-500",
    text: "text-red-700 dark:text-red-400",
    icon: XCircle,
  },
  atrasada: {
    label: "Atrasada",
    bg: "bg-orange-50 dark:bg-orange-950/40",
    border: "border-orange-400 dark:border-orange-500",
    text: "text-orange-700 dark:text-orange-400",
    icon: AlertTriangle,
  },
  pendente: {
    label: "Com Pendência",
    bg: "bg-rose-50 dark:bg-rose-950/40",
    border: "border-rose-500 dark:border-rose-600",
    text: "text-rose-700 dark:text-rose-400",
    icon: ShieldAlert,
  },
};

export default function StatusBadge({ status, size = "sm" }) {
  const config = statusConfig[status] || statusConfig.aguardando;
  const Icon = config.icon;
  const sizeClasses = size === "lg" ? "px-4 py-2 text-sm" : "px-2.5 py-1 text-xs";

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border font-semibold ${config.bg} ${config.border} ${config.text} ${sizeClasses}`}>
      <Icon className={size === "lg" ? "w-4 h-4" : "w-3 h-3"} />
      {config.label}
    </span>
  );
}