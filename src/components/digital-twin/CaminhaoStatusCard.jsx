const STATUS_CONFIG = {
  programado:        { label: "Programado",       cor: "bg-slate-100 text-slate-700",   dot: "bg-slate-400"  },
  em_transito_ida:   { label: "Em Trânsito →",    cor: "bg-blue-100 text-blue-700",     dot: "bg-blue-500"   },
  em_fila:           { label: "Em Fila",           cor: "bg-amber-100 text-amber-700",   dot: "bg-amber-500"  },
  carregando:        { label: "Carregando",        cor: "bg-violet-100 text-violet-700", dot: "bg-violet-500" },
  em_transito_volta: { label: "Retornando ←",     cor: "bg-cyan-100 text-cyan-700",     dot: "bg-cyan-500"   },
  concluido:         { label: "Concluído",         cor: "bg-green-100 text-green-700",   dot: "bg-green-500"  },
  cancelado:         { label: "Cancelado",         cor: "bg-red-100 text-red-700",       dot: "bg-red-400"    },
};

export default function CaminhaoStatusCard({ caminhao }) {
  const cfg = STATUS_CONFIG[caminhao.status] || STATUS_CONFIG.programado;
  const conf = caminhao.indice_confianca ?? 85;
  const confCor = conf >= 80 ? "text-green-600" : conf >= 60 ? "text-amber-500" : "text-red-500";

  return (
    <div className="bg-card border border-border rounded-xl p-3 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <span className="font-mono font-bold text-sm text-foreground">{caminhao.placa}</span>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${cfg.cor}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
          {cfg.label}
        </span>
      </div>

      {/* Fazenda */}
      <p className="text-xs text-muted-foreground mb-2 truncate">
        🌲 {caminhao.fazenda_nome || "Fazenda não definida"}
        {caminhao.transportadora && <span className="ml-1">· {caminhao.transportadora}</span>}
      </p>

      {/* Timeline */}
      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[11px]">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Saída:</span>
          <span className="font-semibold">{caminhao.horario_saida_fabrica || "—"}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Cheg. Faz.:</span>
          <span className="font-semibold">{caminhao.previsao_chegada_fazenda || "—"}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Início Carr.:</span>
          <span className="font-semibold">{caminhao.previsao_inicio_carregamento || "—"}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Cheg. Fáb.:</span>
          <span className="font-semibold">{caminhao.previsao_chegada_fabrica || "—"}</span>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50">
        <span className="text-[11px] text-muted-foreground">
          Ciclo: <span className="font-semibold text-foreground">{caminhao.tempo_ciclo_previsto_min ? `${Math.round(caminhao.tempo_ciclo_previsto_min / 60)}h${caminhao.tempo_ciclo_previsto_min % 60}min` : "—"}</span>
        </span>
        <span className={`text-[11px] font-bold ${confCor}`}>
          {conf}% conf.
        </span>
      </div>
    </div>
  );
}