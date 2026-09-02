import { useState } from "react";
import { base44 } from "@/api/base44Client";
import StatusBadgeMnt, { STATUS_CONFIG, PRIORIDADE_CONFIG } from "./StatusBadgeMnt";
import { Clock, Building2, User, AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const STATUS_ORDER = ["aguardando", "em_manutencao", "aguardando_peca", "teste_operacional", "liberado"];

function elapsedLabel(dateStr) {
  if (!dateStr) return null;
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 60000);
  if (diff < 60) return `${diff}min`;
  const h = Math.floor(diff / 60);
  return `${h}h${diff % 60 > 0 ? ` ${diff % 60}m` : ""}`;
}

function fmt(d) {
  if (!d) return "—";
  return new Date(d).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
}

// mode: "gestao" | "status" | "sla"
export default function GestaoStatusChamados({ chamados, onRefresh, mode = "gestao" }) {
  const [expandedId, setExpandedId] = useState(null);

  const filtered = mode === "sla"
    ? chamados.filter(c => c.sla_estourado || (c.sla_horas && c.status !== "liberado" && c.status !== "cancelado"))
    : mode === "status"
    ? chamados.filter(c => c.status !== "cancelado")
    : chamados;

  const sorted = [...filtered].sort((a, b) => {
    if (a.sla_estourado && !b.sla_estourado) return -1;
    if (!a.sla_estourado && b.sla_estourado) return 1;
    const prioOrder = { critica: 0, alta: 1, media: 2, baixa: 3 };
    return (prioOrder[a.prioridade] ?? 2) - (prioOrder[b.prioridade] ?? 2);
  });

  const handleStatus = async (chamado, newStatus) => {
    const update = { status: newStatus };
    if (newStatus === "liberado") update.data_conclusao = new Date().toISOString();
    if (newStatus === "em_manutencao" && !chamado.data_inicio_atendimento) update.data_inicio_atendimento = new Date().toISOString();
    await base44.entities.ChamadoManutencao.update(chamado.id, update);
    if (newStatus === "liberado") {
      await base44.entities.NotificacaoManutencao.create({
        chamado_id: chamado.id,
        numero_chamado: chamado.numero_chamado,
        cm: chamado.cm,
        placa: chamado.placa,
        empresa_executora: chamado.empresa_executora || "",
        tecnico_responsavel: chamado.tecnico_responsavel || "",
        status_anterior: chamado.status,
        status_novo: "liberado",
        data_notificacao: new Date().toISOString(),
        visualizada: false,
      });
    }
    onRefresh?.();
  };

  const title = mode === "sla" ? "Controle de SLA" : mode === "status" ? "Gestão de Status" : "Gestão de Chamados";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-foreground">{title}</h3>
        <span className="text-xs text-muted-foreground">{sorted.length} chamados</span>
      </div>

      {sorted.length === 0 ? (
        <p className="text-center text-muted-foreground py-12 text-sm">Nenhum chamado para exibir</p>
      ) : (
        <div className="space-y-2">
          {sorted.map(c => {
            const prio = PRIORIDADE_CONFIG[c.prioridade];
            const elapsed = elapsedLabel(c.data_abertura);
            const isExpanded = expandedId === c.id;
            const nextStatus = STATUS_ORDER[STATUS_ORDER.indexOf(c.status) + 1];
            const isClosed = c.status === "liberado" || c.status === "cancelado";

            const slaElapsed = c.data_abertura && c.sla_horas
              ? ((Date.now() - new Date(c.data_abertura)) / 3600000).toFixed(1)
              : null;

            return (
              <div key={c.id} className={cn(
                "bg-card border-2 rounded-2xl overflow-hidden",
                c.sla_estourado ? "border-red-400 dark:border-red-600" :
                c.prioridade === "critica" ? "border-red-200 dark:border-red-800" :
                c.status === "liberado" ? "border-emerald-200 dark:border-emerald-800" : "border-border"
              )}>
                <div
                  className="px-4 py-3 flex items-center gap-3 cursor-pointer hover:bg-muted/20 transition-colors"
                  onClick={() => setExpandedId(isExpanded ? null : c.id)}
                >
                  <div className={cn("w-2 h-2 rounded-full shrink-0", STATUS_CONFIG[c.status]?.dot)} />
                  <span className="text-xs font-black text-muted-foreground font-mono w-20 shrink-0">{c.numero_chamado}</span>
                  <span className="text-sm font-bold text-foreground w-24 shrink-0">{c.placa}</span>
                  <span className="text-xs text-muted-foreground hidden sm:block">CM: {c.cm}</span>
                  <div className="flex-1" />
                  <StatusBadgeMnt status={c.status} />
                  {prio && <span className={cn("text-[10px] px-1.5 py-0.5 rounded-full font-bold hidden sm:block", prio.color)}>{prio.label}</span>}
                  {c.sla_estourado && <AlertTriangle className="w-4 h-4 text-red-500" />}
                  {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                </div>

                {isExpanded && (
                  <div className="px-4 pb-4 pt-2 border-t border-border space-y-3">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div><span className="text-muted-foreground">Empresa</span><p className="font-semibold text-foreground">{c.empresa_executora || "—"}</p></div>
                      <div><span className="text-muted-foreground">Técnico</span><p className="font-semibold text-foreground">{c.tecnico_responsavel || "—"}</p></div>
                      <div><span className="text-muted-foreground">Abertura</span><p className="font-semibold text-foreground">{fmt(c.data_abertura)}</p></div>
                      <div><span className="text-muted-foreground">Conclusão</span><p className="font-semibold text-foreground">{fmt(c.data_conclusao)}</p></div>
                      {mode === "sla" && slaElapsed && (
                        <>
                          <div><span className="text-muted-foreground">SLA Definido</span><p className="font-semibold text-foreground">{c.sla_horas}h</p></div>
                          <div><span className="text-muted-foreground">Tempo Decorrido</span><p className={cn("font-semibold", c.sla_estourado ? "text-red-600 dark:text-red-400" : "text-foreground")}>{slaElapsed}h</p></div>
                          <div><span className="text-muted-foreground">Status SLA</span><p className={cn("font-bold", c.sla_estourado ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400")}>{c.sla_estourado ? "ESTOURADO" : "No prazo"}</p></div>
                        </>
                      )}
                    </div>
                    {c.descricao_problema && <p className="text-xs text-muted-foreground bg-muted/40 rounded-lg px-3 py-2">{c.descricao_problema}</p>}

                    {!isClosed && (
                      <div className="flex gap-2 flex-wrap pt-1">
                        {STATUS_ORDER.filter(s => s !== c.status && s !== "cancelado").map(s => (
                          <Button key={s} size="sm" variant="outline" onClick={() => handleStatus(c, s)} className={cn("text-xs", s === "liberado" && "border-emerald-400 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-600 dark:text-emerald-400")}>
                            → {STATUS_CONFIG[s]?.label}
                          </Button>
                        ))}
                        <Button size="sm" variant="outline" onClick={() => handleStatus(c, "cancelado")} className="text-xs text-destructive border-destructive/30 hover:bg-destructive/10">
                          Cancelar
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}