import StatusBadge from "@/components/ui/StatusBadge";
import { Clock, Truck, FileText, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

function getMinutesAgo(dateStr) {
  if (!dateStr) return 0;
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
}

export default function CentralCard({ solicitacao, onClick }) {
  const s = solicitacao;
  const waitMinutes = s.status === "aguardando" ? getMinutesAgo(s.data_solicitacao) : (s.tempo_espera_minutos || 0);
  // Tempo desde que virou pendência (separado do tempo de aguardando)
  const pendenciaMinutes = s.status === "pendente" ? getMinutesAgo(s.data_pendencia || s.updated_date) : 0;
  const aguardandoMinutes = s.status === "pendente" && s.data_solicitacao && s.data_pendencia
    ? Math.max(0, Math.floor((new Date(s.data_pendencia) - new Date(s.data_solicitacao)) / 60000))
    : 0;
  const isDelayed = s.status === "aguardando" && waitMinutes > 15;
  const displayStatus = isDelayed ? "atrasada" : s.status;

  const borderColor =
    isDelayed ? "border-orange-400 dark:border-orange-500" :
    s.status === "aguardando" ? "border-amber-300 dark:border-amber-600" :
    s.status === "liberada" ? "border-emerald-300 dark:border-emerald-600" :
    "border-red-300 dark:border-red-600";

  const bgColor =
    isDelayed ? "bg-orange-50/60 dark:bg-orange-950/30" :
    s.status === "aguardando" ? "bg-amber-50/40 dark:bg-amber-950/15" :
    s.status === "liberada" ? "bg-emerald-50/40 dark:bg-emerald-950/15" :
    "bg-red-50/40 dark:bg-red-950/15";

  return (
    <button
      onClick={() => onClick(s)}
      className={`w-full text-left rounded-xl border-2 ${borderColor} ${bgColor} p-5 transition-all duration-300 hover:shadow-lg hover:scale-[1.01] ${
        isDelayed ? "animate-pulse-glow" : ""
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Placa</p>
          <p className="text-2xl font-bold font-mono text-foreground">{s.placa || s.cm || "—"}</p>
        </div>
        <StatusBadge status={displayStatus} />
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm">
        {s.transportadora && (
          <div className="col-span-2 flex items-center gap-1.5 text-muted-foreground">
            <Truck className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{s.transportadora}</span>
          </div>
        )}
        {s.frota && (
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <FileText className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate text-xs">Frota: <span className="font-semibold text-foreground">{s.frota}</span></span>
          </div>
        )}
        {s.btf && (
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <FileText className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate text-xs">BTF: <span className="font-semibold text-foreground">{s.btf}</span></span>
          </div>
        )}
      </div>

      <div className="mt-3 pt-3 border-t border-border/50 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="w-3 h-3" />
          {s.data_solicitacao && format(new Date(s.data_solicitacao), "HH:mm", { locale: ptBR })}
        </div>
        {s.status === "aguardando" && (
          <div className={`flex items-center gap-1 text-xs font-bold ${isDelayed ? "text-orange-600 dark:text-orange-400" : "text-amber-600 dark:text-amber-400"}`}>
            {isDelayed && <AlertTriangle className="w-3 h-3" />}
            {waitMinutes} min aguard.
          </div>
        )}
        {s.status === "pendente" && (
          <div className="flex flex-col gap-0.5 text-right">
            <span className="text-[10px] font-bold text-rose-500">⏱ {pendenciaMinutes}m pendência</span>
            <span className="text-[10px] text-muted-foreground">{aguardandoMinutes > 0 ? `${aguardandoMinutes}m aguard.` : ""}</span>
          </div>
        )}
        {s.numero_ot && (
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">OT: {s.numero_ot}</span>
        )}
      </div>
    </button>
  );
}