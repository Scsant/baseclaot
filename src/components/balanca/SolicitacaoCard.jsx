import StatusBadge from "@/components/ui/StatusBadge";
import { Clock, Truck, FileText, Calendar, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function SolicitacaoCard({ solicitacao }) {
  const s = solicitacao;
  const isAguardando = s.status === "aguardando";
  const isLiberada = s.status === "liberada";
  const isCancelada = s.status === "cancelada";

  const borderColor = isAguardando
    ? "border-amber-400 dark:border-amber-500"
    : isLiberada
    ? "border-emerald-400 dark:border-emerald-500"
    : "border-red-400 dark:border-red-500";

  const bgColor = isAguardando
    ? "bg-amber-50/50 dark:bg-amber-950/20"
    : isLiberada
    ? "bg-emerald-50/50 dark:bg-emerald-950/20"
    : "bg-red-50/50 dark:bg-red-950/20";

  return (
    <div className={`rounded-xl border-2 ${borderColor} ${bgColor} p-5 transition-all duration-300 hover:shadow-md`}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Placa</p>
          <p className="text-3xl font-bold font-mono text-foreground">{s.placa || s.cm || "—"}</p>
        </div>
        <StatusBadge status={s.status} />
      </div>

      <div className="space-y-2 text-sm">
        {s.transportadora && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Truck className="w-4 h-4 shrink-0" />
            <span className="font-bold text-foreground text-base truncate">{s.transportadora}</span>
          </div>
        )}
        {(s.frota || s.btf) && (
          <div className="flex items-center gap-3 text-muted-foreground">
            <FileText className="w-4 h-4 shrink-0" />
            {s.frota && <span className="font-semibold text-sm">Frota: <span className="text-foreground">{s.frota}</span></span>}
            {s.btf && <span className="font-semibold text-sm">BTF: <span className="text-foreground">{s.btf}</span></span>}
          </div>
        )}
        {s.data_solicitacao && (
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Calendar className="w-4 h-4" />
            <span className="font-semibold">{format(new Date(s.data_solicitacao), "dd/MM/yyyy HH:mm", { locale: ptBR })}</span>
          </div>
        )}
        {s.status === "pendente" && s.motivo_pendencia && (
          <div className="flex items-start gap-2 rounded-lg border border-red-300 bg-red-100/70 p-2.5 text-red-700 dark:border-red-700 dark:bg-red-950/40 dark:text-red-300">
            <AlertTriangle className="mt-0.5 w-4 h-4 shrink-0" />
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wider">Motivo da Pendência</p>
              <p className="break-words text-sm font-semibold">{s.motivo_pendencia}</p>
            </div>
          </div>
        )}
        {s.numero_ot && (
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
            <Clock className="w-4 h-4" />
            <span>OT: {s.numero_ot}</span>
          </div>
        )}
      </div>
    </div>
  );
}