import { AlertTriangle, WrenchIcon, Activity, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const STATUS_CONFIG = {
  operando: { label: "Operando", color: "bg-emerald-500", icon: Activity },
  manutencao: { label: "Manutenção", color: "bg-red-500", icon: WrenchIcon },
  manutencao_restrita: { label: "Mnt. Restrita", color: "bg-amber-500", icon: AlertTriangle },
  standby: { label: "Stand By", color: "bg-blue-500" },
};

export default function AlertaUtilizacaoModal({ open, onClose, modulosBaixaUtilizacao }) {
  if (!open || !modulosBaixaUtilizacao || modulosBaixaUtilizacao.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-gradient-to-r from-amber-600 to-amber-700">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-white" />
            <div>
              <h2 className="text-base font-black text-white">Alerta de Utilização Baixa</h2>
              <p className="text-xs text-white/60">{modulosBaixaUtilizacao.length} módulo(s) com utilização &lt; 70%</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/60 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {modulosBaixaUtilizacao.map((modulo, idx) => {
            const equipamentos = modulo.equipamentos || [];
            const totalEquips = equipamentos.length;
            const operando = equipamentos.filter((e) => e.status === "operando").length;
            const taxa = totalEquips > 0 ? Math.round((operando / totalEquips) * 100) : 0;

            return (
              <div key={idx} className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-700 space-y-3">
                {/* Módulo Header */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-foreground">
                      M{modulo.numero} — {modulo.titulo}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-black text-white ${taxa < 50 ? "bg-red-500" : "bg-amber-500"}`}>
                      {taxa}%
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {operando} de {totalEquips} máquinas operando
                  </p>
                </div>

                {/* Status das Gruas */}
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status dos Equipamentos:</p>
                  <div className="grid gap-2">
                    {equipamentos.map((equip, i) => {
                      const cfg = STATUS_CONFIG[equip.status];
                      const Icon = cfg?.icon;
                      return (
                        <div key={i} className="flex items-start gap-3 text-xs">
                          <div className={`w-2 h-2 rounded-full shrink-0 mt-1.5 ${cfg?.color || "bg-muted"}`} />
                          <div className="flex-1">
                            <p className="font-semibold text-foreground">{equip.nome}</p>
                            {equip.obs && <p className="text-muted-foreground italic mt-0.5">"{equip.obs}"</p>}
                          </div>
                          <span className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold ${cfg?.color || "bg-muted"} text-white`}>
                            {cfg?.label || "—"}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Obs do módulo */}
                {modulo.obs && (
                  <div className="p-2.5 rounded-lg bg-card border border-border">
                    <p className="text-xs text-muted-foreground italic">
                      <span className="font-semibold text-foreground">Observações:</span> {modulo.obs}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="px-6 py-4 border-t border-border bg-muted/20 flex justify-end">
          <Button onClick={onClose}>Fechar</Button>
        </div>
      </div>
    </div>
  );
}