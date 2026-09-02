import { X, WrenchIcon, AlertTriangle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const STATUS_CONFIG = {
  manutencao: { label: "Manutenção", color: "bg-red-500", textColor: "text-red-700 dark:text-red-400", bgColor: "bg-red-50 dark:bg-red-950/30", borderColor: "border-red-200 dark:border-red-700", icon: WrenchIcon },
  manutencao_restrita: { label: "Op. Restrita", color: "bg-amber-500", textColor: "text-amber-700 dark:text-amber-400", bgColor: "bg-amber-50 dark:bg-amber-950/30", borderColor: "border-amber-200 dark:border-amber-700", icon: AlertTriangle },
  sem_crane: { label: "Sem Creare", color: "bg-orange-500", textColor: "text-orange-700 dark:text-orange-400", bgColor: "bg-orange-50 dark:bg-orange-950/30", borderColor: "border-orange-200 dark:border-orange-700", icon: XCircle },
};

export default function ResumoManutencaoModal({ open, onClose, modulos }) {
  if (!open) return null;

  // Coletar todos os equipamentos fora de operação por status
  const allEquips = modulos.flatMap((m) =>
    (m.equipamentos || [])
      .filter((e) => e.status === "manutencao" || e.status === "manutencao_restrita" || e.status === "sem_crane")
      .map((e) => ({ ...e, moduloTitulo: m.titulo, moduloNum: m.numero }))
  );

  const porStatus = {
    manutencao: allEquips.filter((e) => e.status === "manutencao"),
    manutencao_restrita: allEquips.filter((e) => e.status === "manutencao_restrita"),
    sem_crane: allEquips.filter((e) => e.status === "sem_crane"),
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-gradient-to-r from-red-700 to-red-800">
          <div>
            <h2 className="text-base font-black text-white flex items-center gap-2">
              <WrenchIcon className="w-4 h-4" /> Máquinas em Manutenção
            </h2>
            <p className="text-xs text-white/60">{allEquips.length} equipamento(s) fora de operação</p>
          </div>
          <button onClick={onClose} className="text-white/60 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {allEquips.length === 0 ? (
            <div className="text-center py-12">
              <WrenchIcon className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">Nenhuma máquina em manutenção ou standby.</p>
            </div>
          ) : (
            Object.entries(porStatus).map(([statusKey, equips]) => {
              if (equips.length === 0) return null;
              const cfg = STATUS_CONFIG[statusKey];
              const Icon = cfg.icon;
              return (
                <div key={statusKey}>
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className={`w-4 h-4 ${cfg.textColor}`} />
                    <p className={`text-sm font-bold ${cfg.textColor}`}>{cfg.label} — {equips.length} máquina(s)</p>
                  </div>
                  <div className="space-y-2">
                    {equips.map((e, i) => (
                      <div key={i} className={`flex items-start gap-3 p-3 rounded-xl border ${cfg.bgColor} ${cfg.borderColor}`}>
                        <span className={`text-[10px] font-black w-6 text-center shrink-0 mt-0.5 ${cfg.textColor}`}>M{e.moduloNum}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-foreground">{e.nome}</p>
                          <p className="text-xs text-muted-foreground">{e.moduloTitulo}</p>
                          {e.obs && (
                            <p className="text-xs text-muted-foreground mt-0.5 italic">"{e.obs}"</p>
                          )}
                        </div>
                        <span className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold text-white ${cfg.color}`}>{cfg.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="px-6 py-4 border-t border-border bg-muted/20 flex justify-end">
          <Button onClick={onClose}>Fechar</Button>
        </div>
      </div>
    </div>
  );
}