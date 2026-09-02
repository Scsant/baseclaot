import { AlertTriangle, Activity, WrenchIcon, PauseCircle, XCircle } from "lucide-react";

const STATUS_CONFIG = {
  operando: { label: "Operando", color: "bg-emerald-500", icon: Activity },
  manutencao: { label: "Manutenção", color: "bg-red-500", icon: WrenchIcon },
  manutencao_restrita: { label: "Op. Restrita", color: "bg-amber-500", icon: AlertTriangle },
  sem_crane: { label: "Sem Creare", color: "bg-orange-500", icon: XCircle },
  standby: { label: "Stand By", color: "bg-blue-500", icon: PauseCircle },
};

export default function AlertaUtilizacaoTurno({ modulos }) {
  const modulosAlerta = modulos
    .map((m) => {
      const equips = m.equipamentos || [];
      const total = equips.length;
      const operando = equips.filter((e) => e.status === "operando").length;
      const taxa = total > 0 ? Math.round((operando / total) * 100) : 0;
      return { ...m, taxa, equips, total, operando };
    })
    .filter((m) => m.taxa < 65 && m.total > 0);

  if (modulosAlerta.length === 0) return null;

  return (
    <div className="p-4 rounded-2xl bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/30 border-2 border-red-300 dark:border-red-700 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3 pb-3 border-b border-red-200 dark:border-red-700">
        <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 animate-blink" />
        <div>
          <p className="text-sm font-black text-red-700 dark:text-red-400">Alerta de Utilização Baixa</p>
          <p className="text-xs text-red-600 dark:text-red-500">
            {modulosAlerta.length} módulo(s) com utilização abaixo de 65%
          </p>
        </div>
      </div>

      {/* Módulos em alerta */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {modulosAlerta.map((modulo) => (
          <div key={modulo.numero} className="p-3 rounded-xl bg-card border border-red-200 dark:border-red-700/50 space-y-2">
            {/* Cabeçalho do módulo */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-foreground">M{modulo.numero} — {modulo.titulo}</p>
                <p className="text-xs text-muted-foreground">{modulo.operando} de {modulo.total} operando</p>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-xs font-black text-white ${modulo.taxa < 50 ? "bg-red-500" : "bg-amber-500"}`}>
                {modulo.taxa}%
              </span>
            </div>

            {/* Lista de equipamentos */}
            <div className="space-y-1.5">
              {modulo.equips.map((equip, i) => {
                const cfg = STATUS_CONFIG[equip.status] || STATUS_CONFIG.standby;
                const Icon = cfg.icon;
                return (
                  <div key={i} className="flex items-start gap-2 text-xs">
                    <div className={`w-2 h-2 rounded-full shrink-0 mt-1.5 ${cfg.color}`} />
                    <div className="flex-1 min-w-0">
                      <span className="font-semibold text-foreground">{equip.nome}</span>
                      {equip.obs && (
                        <p className="text-muted-foreground italic text-[11px] truncate">"{equip.obs}"</p>
                      )}
                    </div>
                    <span className={`shrink-0 px-1.5 py-0.5 rounded-full text-[9px] font-bold text-white whitespace-nowrap ${cfg.color}`}>
                      {cfg.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}