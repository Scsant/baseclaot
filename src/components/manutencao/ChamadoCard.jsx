import { useState } from "react";
import { Clock, Building2, User, ChevronDown, ChevronUp, Upload, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import StatusBadgeMnt, { STATUS_CONFIG, PRIORIDADE_CONFIG } from "./StatusBadgeMnt";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { cn } from "@/lib/utils";

const STATUS_ORDER = ["aguardando", "em_manutencao", "aguardando_chamado", "desistencia", "liberado"];

function elapsedLabel(dateStr) {
  if (!dateStr) return null;
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 60000);
  if (diff < 60) return `${diff}min`;
  const h = Math.floor(diff / 60);
  const m = diff % 60;
  return `${h}h${m > 0 ? ` ${m}m` : ""}`;
}

export default function ChamadoCard({ chamado, onStatusChange }) {
  const { user } = useAuth();
  const [expanded, setExpanded] = useState(false);
  const [uploading, setUploading] = useState(false);

  const prioConfig = PRIORIDADE_CONFIG[chamado.prioridade] || PRIORIDADE_CONFIG.media;
  const elapsed = elapsedLabel(chamado.data_abertura);
  const isClosed =       chamado.status === "liberado" || chamado.status === "desistencia";

  const handleStatusChange = async (newStatus) => {
    const update = { status: newStatus };
    if (newStatus === "liberado" || newStatus === "desistencia") {
      update.data_conclusao = new Date().toISOString();
    }
    if (newStatus === "em_manutencao" && !chamado.data_inicio_atendimento) {
      update.data_inicio_atendimento = new Date().toISOString();
    }
    await base44.entities.ChamadoManutencao.update(chamado.id, update);

    // Se liberado, criar notificação
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
      await base44.entities.ChamadoManutencao.update(chamado.id, { notificacao_enviada: true });
    }
    onStatusChange?.();
  };

  const handleFatUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    await base44.entities.ChamadoManutencao.update(chamado.id, { fat_url: file_url, fat_nome: file.name });
    setUploading(false);
    onStatusChange?.();
  };


  return (
    <div className={cn(
      "bg-card border-2 rounded-2xl overflow-hidden shadow-sm transition-all",
      chamado.sla_estourado ? "border-red-400 dark:border-red-600" :
      chamado.status === "liberado" ? "border-emerald-300 dark:border-emerald-700" :
      chamado.prioridade === "critica" ? "border-red-300 dark:border-red-700" :
      chamado.prioridade === "alta" ? "border-orange-300 dark:border-orange-700" : "border-border"
    )}>
      {/* Header */}
      <div className="px-4 py-3 flex items-center justify-between gap-2 bg-muted/30">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className={cn("w-2 h-2 rounded-full shrink-0", STATUS_CONFIG[chamado.status]?.dot || "bg-slate-400")} />
          <span className="text-xs font-black text-muted-foreground font-mono">{chamado.numero_chamado}</span>
          <span className="text-sm font-bold text-foreground truncate">{chamado.placa}</span>
          <span className="text-xs text-muted-foreground shrink-0">CM: {chamado.cm}</span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className={cn("text-[10px] px-1.5 py-0.5 rounded-full font-bold", prioConfig.color)}>{prioConfig.label}</span>
          <StatusBadgeMnt status={chamado.status} />
          <button onClick={() => setExpanded(v => !v)} className="text-muted-foreground hover:text-foreground ml-1">
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="px-4 py-3 grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1 text-xs">
        {chamado.empresa_executora && (
          <div className="flex items-center gap-1 text-muted-foreground"><Building2 className="w-3 h-3" />{chamado.empresa_executora}</div>
        )}
        {chamado.tecnico_responsavel && (
          <div className="flex items-center gap-1 text-muted-foreground"><User className="w-3 h-3" />{chamado.tecnico_responsavel}</div>
        )}
        {elapsed && (
          <div className="flex items-center gap-1 text-muted-foreground"><Clock className="w-3 h-3" />Aberto há {elapsed}</div>
        )}
        {chamado.modulo && <div className="text-muted-foreground">Módulo: {chamado.modulo}</div>}
        {chamado.tipo_manutencao && <div className="text-muted-foreground capitalize">{chamado.tipo_manutencao}</div>}
        {chamado.sla_estourado && <div className="text-red-600 dark:text-red-400 font-bold">SLA ESTOURADO</div>}
      </div>

      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-border pt-3">
          {chamado.descricao_problema && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-0.5">Problema</p>
              <p className="text-sm text-foreground">{chamado.descricao_problema}</p>
            </div>
          )}
          {chamado.pecas_utilizadas && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-0.5">Peças Utilizadas</p>
              <p className="text-sm text-foreground">{chamado.pecas_utilizadas}</p>
            </div>
          )}

          {/* FAT */}
          <div className="flex items-center gap-2">
            {chamado.fat_url ? (
              <a href={chamado.fat_url} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-xs text-primary hover:underline font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> FAT: {chamado.fat_nome || "Arquivo"}
              </a>
            ) : (
              <label className={cn("flex items-center gap-1.5 text-xs font-semibold cursor-pointer px-3 py-1.5 rounded-lg border border-dashed border-border hover:bg-muted transition-colors", uploading && "opacity-50 pointer-events-none")}>
                <Upload className="w-3.5 h-3.5" /> {uploading ? "Enviando..." : "Upload FAT"}
                <input type="file" className="hidden" onChange={handleFatUpload} accept=".pdf,.jpg,.png,.jpeg" />
              </label>
            )}
          </div>

          {/* Seletor de status por clique */}
          {!isClosed && (
            <div className="space-y-2 pt-1">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Alterar status</p>
              <div className="flex flex-wrap gap-1.5">
                {STATUS_ORDER.map(s => {
                  const cfg = STATUS_CONFIG[s];
                  const Icon = cfg?.icon;
                  const isActive = chamado.status === s;
                  return (
                    <button
                      key={s}
                      onClick={() => !isActive && handleStatusChange(s)}
                      disabled={isActive}
                      className={cn(
                        "flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all",
                        isActive
                          ? cn(cfg?.color, "opacity-100 cursor-default ring-2 ring-offset-1 ring-current")
                          : "border-border text-muted-foreground hover:bg-muted cursor-pointer"
                      )}
                    >
                      {Icon && <Icon className="w-3 h-3" />}
                      {cfg?.label}
                    </button>
                  );
                })}

              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}