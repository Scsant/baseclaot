import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import StatusBadgeMnt, { STATUS_CONFIG, PRIORIDADE_CONFIG } from "./StatusBadgeMnt";
import { Clock, Building2, User, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

function elapsedLabel(dateStr) {
  if (!dateStr) return null;
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 60000);
  if (diff < 60) return `${diff}min`;
  const h = Math.floor(diff / 60);
  return `${h}h${diff % 60 > 0 ? ` ${diff % 60}m` : ""}`;
}

const STATUS_ORDER_DISPLAY = ["aguardando", "deslocamento", "em_manutencao", "aguardando_peca", "teste_operacional", "liberado"];

export default function PainelAcompanhamento() {
  const [chamados, setChamados] = useState([]);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const load = async () => {
    const data = await base44.entities.ChamadoManutencao.filter(
      { status: { $nin: ["cancelado"] } },
      "-updated_date",
      100
    );
    setChamados(data);
    setLastUpdate(new Date());
  };

  useEffect(() => {
    load();
    const unsub = base44.entities.ChamadoManutencao.subscribe(() => load());
    return unsub;
  }, []);

  const grouped = STATUS_ORDER_DISPLAY.map(status => ({
    status,
    items: chamados.filter(c => c.status === status),
    config: STATUS_CONFIG[status],
  })).filter(g => g.items.length > 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-foreground">Painel de Acompanhamento</h3>
        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
          <RefreshCw className="w-3 h-3" />
          Atualizado: {lastUpdate.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
        </div>
      </div>

      {grouped.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p className="font-semibold">Nenhum chamado ativo</p>
          <p className="text-xs mt-1">Todos os chamados foram concluídos ou cancelados</p>
        </div>
      ) : (
        <div className="space-y-6">
          {grouped.map(({ status, items, config }) => {
            const Icon = config?.icon;
            return (
              <div key={status}>
                <div className="flex items-center gap-2 mb-3">
                  <div className={cn("w-2.5 h-2.5 rounded-full", config?.dot)} />
                  <span className="text-sm font-bold text-foreground">{config?.label}</span>
                  <span className="text-xs text-muted-foreground">({items.length})</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {items.map(c => {
                    const prio = PRIORIDADE_CONFIG[c.prioridade];
                    const elapsed = elapsedLabel(c.data_abertura);
                    return (
                      <div key={c.id} className={cn(
                        "rounded-xl border-2 p-3 space-y-2",
                        c.sla_estourado ? "border-red-400 dark:border-red-600 bg-red-50 dark:bg-red-950/20" :
                        status === "liberado" ? "border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/20" :
                        "border-border bg-card"
                      )}>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-muted-foreground font-mono">{c.numero_chamado}</span>
                          {prio && <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded-full", prio.color)}>{prio.label}</span>}
                        </div>
                        <div>
                          <p className="text-base font-black text-foreground leading-none">{c.placa}</p>
                          <p className="text-xs text-muted-foreground">CM: {c.cm}</p>
                        </div>
                        {c.empresa_executora && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Building2 className="w-3 h-3" />{c.empresa_executora}
                          </div>
                        )}
                        {c.tecnico_responsavel && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <User className="w-3 h-3" />{c.tecnico_responsavel}
                          </div>
                        )}
                        {elapsed && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />há {elapsed}
                          </div>
                        )}
                        {c.sla_estourado && (
                          <div className="text-[10px] font-bold text-red-600 dark:text-red-400">⚠ SLA ESTOURADO</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}