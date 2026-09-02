import { useState } from "react";
import { Bell, CheckCircle2, X, Filter } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function fmt(d) {
  return new Date(d).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function HistoricoNotificacoes({ notificacoes, onRefresh }) {
  const [filterStart, setFilterStart] = useState("");
  const [filterEnd, setFilterEnd] = useState("");

  const filtered = notificacoes.filter(n => {
    const d = new Date(n.data_notificacao);
    if (filterStart && d < new Date(filterStart)) return false;
    if (filterEnd && d > new Date(filterEnd + "T23:59:59")) return false;
    return true;
  });

  const markRead = async (id) => {
    await base44.entities.NotificacaoManutencao.update(id, { visualizada: true, data_visualizacao: new Date().toISOString() });
    onRefresh?.();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 text-sm font-bold text-foreground">
          <Filter className="w-4 h-4" /> Filtrar por período
        </div>
        <div className="flex items-center gap-2">
          <Input type="date" value={filterStart} onChange={e => setFilterStart(e.target.value)} className="h-8 text-xs w-36" />
          <span className="text-xs text-muted-foreground">até</span>
          <Input type="date" value={filterEnd} onChange={e => setFilterEnd(e.target.value)} className="h-8 text-xs w-36" />
          {(filterStart || filterEnd) && (
            <Button variant="ghost" size="sm" onClick={() => { setFilterStart(""); setFilterEnd(""); }} className="h-8 text-xs">
              <X className="w-3 h-3" /> Limpar
            </Button>
          )}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="text-center text-xs text-muted-foreground py-8">Nenhuma notificação no período</p>
      ) : (
        <div className="space-y-2">
          {filtered.map(n => (
            <div key={n.id} className={`rounded-xl border p-3 flex items-start gap-3 ${n.visualizada ? "bg-muted/30 opacity-70" : "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800"}`}>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${n.visualizada ? "bg-muted" : "bg-emerald-500"}`}>
                <CheckCircle2 className={`w-4 h-4 ${n.visualizada ? "text-muted-foreground" : "text-white"}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-foreground">{n.placa}</span>
                  {n.numero_chamado && <span className="text-[10px] text-muted-foreground font-mono">{n.numero_chamado}</span>}
                  {!n.visualizada && <span className="text-[9px] bg-emerald-500 text-white px-1.5 py-0.5 rounded-full font-bold">NOVO</span>}
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 mt-1">
                  {n.empresa_executora && <p className="text-xs text-muted-foreground">Empresa: {n.empresa_executora}</p>}
                  {n.tecnico_responsavel && <p className="text-xs text-muted-foreground">Técnico: {n.tecnico_responsavel}</p>}
                  <p className="text-xs text-muted-foreground">CM: {n.cm}</p>
                  <p className="text-[10px] text-muted-foreground">{fmt(n.data_notificacao)}</p>
                </div>
              </div>
              {!n.visualizada && (
                <button onClick={() => markRead(n.id)} className="text-muted-foreground hover:text-foreground shrink-0">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}