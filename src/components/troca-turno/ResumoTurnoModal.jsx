import { X, Activity, WrenchIcon, AlertTriangle, CheckCircle2, Printer, Sun, Cloud, CloudRain, CloudLightning, Wind, UserX } from "lucide-react";
import { Button } from "@/components/ui/button";

const CLIMA_ICONS = { sol: Sun, nublado: Cloud, chuva: CloudRain, tempestade: CloudLightning, vento: Wind };
const CLIMA_LABELS = { sol: "Sol", nublado: "Nublado", chuva: "Chuva", tempestade: "Tempestade", vento: "Vento" };
const CLIMA_COLORS = { sol: "text-yellow-500", nublado: "text-slate-500", chuva: "text-blue-500", tempestade: "text-purple-500", vento: "text-cyan-500" };

const STATUS_CONFIG = {
  operando: { label: "Operando", color: "bg-emerald-500", textColor: "text-emerald-700 dark:text-emerald-400" },
  manutencao: { label: "Manutenção", color: "bg-red-500", textColor: "text-red-700 dark:text-red-400" },
  manutencao_restrita: { label: "Op. Restrita", color: "bg-amber-500", textColor: "text-amber-700 dark:text-amber-400" },
  sem_crane: { label: "Sem Creare", color: "bg-orange-500", textColor: "text-orange-700 dark:text-orange-400" },
  standby: { label: "Stand By", color: "bg-blue-500", textColor: "text-blue-700 dark:text-blue-400" },
};

// compatibilidade: retorna array de statuses independente do formato salvo
function getStatuses(e) {
  return e.statuses || (e.status ? [e.status] : ["operando"]);
}

function hasStatus(e, key) {
  return getStatuses(e).includes(key);
}

function isOperando(e) {
  const st = getStatuses(e);
  return st.length === 1 && st[0] === "operando";
}

export default function ResumoTurnoModal({ open, onClose, modulos, turnoInfo, obsGerais }) {
  if (!open) return null;

  const allEquips = modulos.flatMap((m) =>
    (m.equipamentos || []).map((e) => ({ ...e, modulo: m.titulo, moduloNum: m.numero }))
  );

  const operando = allEquips.filter(isOperando);
  const emManutencao = allEquips.filter((e) =>
    hasStatus(e, "manutencao") || hasStatus(e, "manutencao_restrita") || hasStatus(e, "sem_crane")
  );
  const emRestrita = allEquips.filter((e) => hasStatus(e, "manutencao_restrita"));

  const modulosComProblema = modulos.filter((m) =>
    m.falta_operador || (m.equipamentos || []).some((e) => !isOperando(e))
  );
  const modulosFaltaOperador = modulos.filter((m) => m.falta_operador);

  const handlePrint = () => window.print();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm print:hidden">
      <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-gradient-to-r from-slate-700 to-slate-800">
          <div>
            <h2 className="text-base font-black text-white">Resumo de Troca de Turno</h2>
            <p className="text-xs text-white/60">{turnoInfo}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={handlePrint} className="border-white/20 text-white hover:bg-white/10 gap-2">
              <Printer className="w-4 h-4" /> Imprimir
            </Button>
            <button onClick={onClose} className="text-white/60 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {/* KPIs rápidos */}
          <div className="grid grid-cols-4 gap-3">
            <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-700 p-3 text-center">
              <p className="text-2xl font-black text-emerald-700 dark:text-emerald-400">{operando.length}</p>
              <p className="text-xs text-emerald-600 dark:text-emerald-500 font-semibold">Operando</p>
            </div>
            <div className="rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-700 p-3 text-center">
              <p className="text-2xl font-black text-red-700 dark:text-red-400">{emManutencao.length}</p>
              <p className="text-xs text-red-600 dark:text-red-500 font-semibold">Manutenção</p>
            </div>
            <div className="rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-700 p-3 text-center">
              <p className="text-2xl font-black text-amber-700 dark:text-amber-400">{emRestrita.length}</p>
              <p className="text-xs text-amber-600 dark:text-amber-500 font-semibold">Op. Restrita</p>
            </div>
            <div className="rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-700 p-3 text-center">
              <p className="text-2xl font-black text-blue-700 dark:text-blue-400">
                {allEquips.length > 0 ? `${Math.round((operando.length / allEquips.length) * 100)}%` : "—"}
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-500 font-semibold">Taxa Utilização</p>
            </div>
          </div>

          {/* Alerta falta de operador */}
          {modulosFaltaOperador.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <UserX className="w-4 h-4 text-rose-500" />
                <p className="text-sm font-bold text-rose-600 dark:text-rose-400">Módulos com Falta de Operador</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {modulosFaltaOperador.map((m) => (
                  <span key={m.numero} className="px-3 py-1 rounded-full bg-rose-100 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 text-xs font-semibold">
                    M{m.numero} {m.titulo}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Alertas críticos — Op. Restrita */}
          {emRestrita.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <p className="text-sm font-bold text-red-600 dark:text-red-400">Equipamentos com Operação Restrita</p>
              </div>
              <div className="space-y-1.5">
                {emRestrita.map((e, i) => (
                  <div key={i} className="flex items-start gap-3 p-2.5 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-700 rounded-xl">
                    <span className="text-[10px] font-bold text-red-400 w-5 text-center">M{e.moduloNum}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground">{e.nome}</p>
                      <p className="text-xs text-muted-foreground">{e.modulo}{e.obs ? ` — ${e.obs}` : ""}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Módulos com algum problema */}
          {modulosComProblema.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <WrenchIcon className="w-4 h-4 text-amber-500" />
                <p className="text-sm font-bold text-foreground">Status por Módulo</p>
              </div>
              <div className="space-y-2">
                {modulosComProblema.map((m) => (
                  <div key={m.numero} className="p-3 bg-muted/40 rounded-xl">
                    <div className="flex items-center justify-between mb-1.5">
                      <p className="text-sm font-bold text-foreground">M{m.numero} — {m.titulo}</p>
                      {m.clima && (() => {
                        const Icon = CLIMA_ICONS[m.clima];
                        return Icon ? (
                          <span className={`flex items-center gap-1 text-[10px] font-semibold ${CLIMA_COLORS[m.clima]}`}>
                            <Icon className="w-3 h-3" />{CLIMA_LABELS[m.clima]}
                          </span>
                        ) : null;
                      })()}
                    </div>
                    <div className="space-y-1">
                      {(m.equipamentos || []).filter((e) => !isOperando(e)).map((e, i) => {
                        const statuses = getStatuses(e).filter((s) => s !== "operando");
                        return (
                          <div key={i} className="flex items-center gap-2 flex-wrap">
                            {statuses.map((s) => {
                              const st = STATUS_CONFIG[s];
                              if (!st) return null;
                              return (
                                <span key={s} className={`w-2 h-2 rounded-full shrink-0 ${st.color}`} />
                              );
                            })}
                            <span className="text-xs text-foreground">{e.nome}</span>
                            {statuses.map((s) => {
                              const st = STATUS_CONFIG[s];
                              if (!st) return null;
                              return (
                                <span key={s} className={`text-[10px] font-semibold ${st.textColor}`}>{st.label}</span>
                              );
                            })}
                            {e.obs && <span className="text-[10px] text-muted-foreground truncate">— {e.obs}</span>}
                          </div>
                        );
                      })}
                    </div>
                    {m.obs && (
                      <p className="mt-1.5 text-xs text-muted-foreground bg-card rounded-lg px-2.5 py-1.5 border border-border">
                        {m.obs}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Módulos todos ok */}
          {modulosComProblema.length < modulos.length && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <p className="text-sm font-bold text-foreground">Módulos 100% Operacionais</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {modulos
                  .filter((m) => !(m.equipamentos || []).some((e) => !isOperando(e)))
                  .map((m) => (
                    <span key={m.numero} className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 text-xs font-semibold">
                      M{m.numero} {m.titulo}
                    </span>
                  ))}
              </div>
            </div>
          )}

          {/* Obs gerais */}
          {obsGerais && (
            <div>
              <p className="text-sm font-bold text-foreground mb-1.5">Observações Gerais do Turno</p>
              <div className="p-3 bg-muted/40 rounded-xl border border-border">
                <p className="text-sm text-foreground whitespace-pre-wrap">{obsGerais}</p>
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-border bg-muted/20 flex justify-end">
          <Button onClick={onClose}>Fechar</Button>
        </div>
      </div>
    </div>
  );
}