import { CheckCircle2 } from "lucide-react";

export default function ListaExecutiva({ title, items = [], tone = "default", numbered = false }) {
  const style = tone === "risk" ? "border-destructive/30 bg-destructive/5" : tone === "positive" ? "border-chart-2/30 bg-chart-2/5" : "border-border bg-card";
  return (
    <section className={`rounded-2xl border p-5 shadow-sm ${style}`}><h2 className="text-lg font-bold">{title}</h2>{items.length ? <ol className="mt-3 space-y-2">{items.map((item, index) => <li key={`${title}-${index}`} className="flex gap-2 text-sm leading-6 text-muted-foreground"><CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-primary" /><span>{numbered && <strong className="mr-1 text-foreground">{index + 1}.</strong>}{item}</span></li>)}</ol> : <p className="mt-3 text-sm text-muted-foreground">Nenhum item identificado.</p>}</section>
  );
}