import { Wrench, CheckCircle2, PlusCircle, Download } from "lucide-react";
import { STATUS_CONFIG } from "./StatusBadgeMnt";

function getTimelineEvents(chamado) {
  const events = [];
  if (chamado.data_abertura) events.push({ label: "Chamado Aberto", date: chamado.data_abertura, icon: PlusCircle, color: "text-blue-500", bg: "bg-blue-100 dark:bg-blue-950/50" });
  if (chamado.data_inicio_atendimento) events.push({ label: "Início do Atendimento", date: chamado.data_inicio_atendimento, icon: Wrench, color: "text-amber-500", bg: "bg-amber-100 dark:bg-amber-950/50" });
  if (chamado.data_conclusao) events.push({ label: "Liberado", date: chamado.data_conclusao, icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-100 dark:bg-emerald-950/50" });
  return events.sort((a, b) => new Date(a.date) - new Date(b.date));
}

function fmt(dateStr) {
  return new Date(dateStr).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
}

function exportCSV(chamados) {
  const rows = [];
  rows.push(["Chamado", "Placa", "CM", "Empresa", "Técnico", "Tipo", "Prioridade", "Status", "Abertura", "Início Atendimento", "Conclusão", "SLA (h)", "SLA Estourado", "Descrição"]);
  chamados.forEach(c => {
    rows.push([
      c.numero_chamado || "",
      c.placa || "",
      c.cm || "",
      c.empresa_executora || "",
      c.tecnico_responsavel || "",
      c.tipo_manutencao || "",
      c.prioridade || "",
      c.status || "",
      c.data_abertura ? new Date(c.data_abertura).toLocaleString("pt-BR") : "",
      c.data_inicio_atendimento ? new Date(c.data_inicio_atendimento).toLocaleString("pt-BR") : "",
      c.data_conclusao ? new Date(c.data_conclusao).toLocaleString("pt-BR") : "",
      c.sla_horas || "",
      c.sla_estourado ? "Sim" : "Não",
      (c.descricao_problema || "").replace(/\n/g, " "),
    ]);
  });
  const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(";")).join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `timeline_manutencao_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function TimelineEventos({ chamados }) {
  const recentes = [...chamados].sort((a, b) => new Date(b.data_abertura) - new Date(a.data_abertura)).slice(0, 10);

  return (
    <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-foreground">Timeline de Eventos</h3>
        <button
          onClick={() => exportCSV(chamados)}
          disabled={chamados.length === 0}
          className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground border border-border rounded-lg px-2.5 py-1 hover:bg-muted transition-colors disabled:opacity-40 disabled:pointer-events-none"
        >
          <Download className="w-3.5 h-3.5" /> Baixar CSV
        </button>
      </div>
      {recentes.length === 0 ? (
        <p className="text-xs text-muted-foreground text-center py-4">Nenhum evento registrado</p>
      ) : (
        <div className="space-y-4">
          {recentes.map(chamado => {
            const events = getTimelineEvents(chamado);
            return (
              <div key={chamado.id} className="space-y-1">
                <p className="text-xs font-bold text-foreground">{chamado.placa} <span className="text-muted-foreground font-normal">— {chamado.numero_chamado}</span></p>
                <div className="relative pl-4 space-y-1.5">
                  <div className="absolute left-1.5 top-2 bottom-2 w-px bg-border" />
                  {events.map((ev, i) => {
                    const Icon = ev.icon;
                    return (
                      <div key={i} className="flex items-center gap-2 relative">
                        <div className={`w-5 h-5 rounded-full ${ev.bg} flex items-center justify-center -ml-[7px] z-10 shrink-0`}>
                          <Icon className={`w-2.5 h-2.5 ${ev.color}`} />
                        </div>
                        <span className="text-xs text-foreground">{ev.label}</span>
                        <span className="text-[10px] text-muted-foreground ml-auto">{fmt(ev.date)}</span>
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