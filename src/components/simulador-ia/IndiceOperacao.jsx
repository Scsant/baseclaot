import { Gauge } from "lucide-react";

export default function IndiceOperacao({ indice, resumo }) {
  const nota = Math.max(0, Math.min(100, Number(indice?.nota) || 0));
  const cor = nota >= 80 ? "text-chart-2" : nota >= 60 ? "text-chart-3" : "text-destructive";
  return (
    <div className="grid gap-4 lg:grid-cols-[220px_1fr]">
      <section className="rounded-2xl border border-border bg-card p-5 shadow-sm"><div className="flex items-center gap-2 text-sm font-bold text-muted-foreground"><Gauge className="h-4 w-4" />Índice Geral</div><p className={`mt-4 text-5xl font-black ${cor}`}>{nota}<span className="text-xl text-muted-foreground">/100</span></p><p className="mt-2 font-bold">Situação {indice?.situacao || "Não identificada"}</p><p className="mt-2 text-xs text-muted-foreground">{indice?.justificativa}</p></section>
      <section className="rounded-2xl border border-border bg-card p-5 shadow-sm"><h2 className="text-lg font-bold">Resumo Executivo</h2><p className="mt-3 whitespace-pre-line text-sm leading-7 text-muted-foreground">{resumo}</p></section>
    </div>
  );
}