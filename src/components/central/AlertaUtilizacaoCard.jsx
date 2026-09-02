import { AlertTriangle, Activity, WrenchIcon, XCircle, PauseCircle } from "lucide-react";

const STATUS_CONFIG = {
  operando: { label: "Operando", color: "bg-emerald-500", icon: Activity },
  manutencao: { label: "Manutenção", color: "bg-red-500", icon: WrenchIcon },
  manutencao_restrita: { label: "Op. Restrita", color: "bg-amber-500", icon: AlertTriangle },
  sem_crane: { label: "Sem Creare", color: "bg-orange-500", icon: XCircle },
  standby: { label: "Stand By", color: "bg-blue-500", icon: PauseCircle },
};

export default function AlertaUtilizacaoCard({ modulosBaixaUtilizacao }) {
  if (!modulosBaixaUtilizacao || modulosBaixaUtilizacao.length === 0) return null;

  return (
    <div className="p-4 rounded-2xl bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/30 border-2 border-red-300 dark:border-red-700 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3 pb-3 border-b border-red-200 dark:border-red-700">
        <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 animate-blink" />
        <div>
          <p className="text-sm font-black text-red-700 dark:text-red-400">Alerta de Utilização Baixa</p>
          <p className="text-xs text-red-600 dark:text-red-500">{modulosBaixaUtilizacao.length} módulo(s) com utilização &lt; 65%</p>
        </div>
      </div>

      {/* Módulos */}
      <div className="space-y-3">
        {modulosBaixaUtilizacao.map((modulo, idx) => {
          const equipamentos = modulo.equipamentos || [];
          const totalEquips = equipamentos.length;
          const operando = equipamentos.filter((e) => e.status === "operando").length;
          const taxa = totalEquips > 0 ? Math.round((operando / totalEquips) * 100) : 0;

          return (
            <div key={idx} className="p-3 rounded-xl bg-card border border-red-200 dark:border-red-700/50 space-y-2">
              {/* Módulo Header */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-foreground">M{modulo.numero} — {modulo.titulo}</p>
                  <p className="text-xs text-muted-foreground">{operando} de {totalEquips} máquinas operando</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-black text-white ${taxa < 50 ? "bg-red-500" : "bg-amber-500"}`}>
                  {taxa}%
                </span>
              </div>

              {/* Status das Gruas */}
              <div className="space-y-1.5">
                {equipamentos.map((equip, i) => {
                  const cfg = STATUS_CONFIG[equip.status];
                  return (
                    <div key={i} className="flex items-start gap-2 text-xs">
                      <div className={`w-2 h-2 rounded-full shrink-0 mt-1.5 ${cfg?.color || "bg-muted"}`} />
                      <div className="flex-1">
                        <p className="font-semibold text-foreground">{equip.nome}</p>
                        {equip.obs && <p className="text-muted-foreground italic text-[11px]">"{equip.obs}"</p>}
                      </div>
                      <span className={`shrink-0 px-2 py-0.5 rounded-full text-[9px] font-bold ${cfg?.color || "bg-muted"} text-white whitespace-nowrap`}>
                        {cfg?.label || "—"}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Obs do módulo */}
              {modulo.obs && (
                <div className="pt-1.5 border-t border-border">
                  <p className="text-xs text-muted-foreground italic">
                    <span className="font-semibold text-foreground">Obs:</span> {modulo.obs}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}