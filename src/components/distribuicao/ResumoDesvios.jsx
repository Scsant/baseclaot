import { ArrowRightLeft, Truck } from "lucide-react";

export default function ResumoDesvios({ destinos }) {
  if (!destinos.length) return null;

  const total = destinos.reduce((soma, item) => soma + item.quantidade, 0);

  return (
    <section className="rounded-xl border border-orange-200 bg-orange-50/50 p-4 dark:border-orange-800 dark:bg-orange-950/10">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <ArrowRightLeft className="h-5 w-5 text-orange-600" />
          <div><h2 className="text-sm font-bold">Caminhões direcionados por desvio</h2><p className="text-xs text-muted-foreground">Atualização automática a partir da Central</p></div>
        </div>
        <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-700 dark:bg-orange-900/40 dark:text-orange-300">{total} caminhão{total !== 1 ? "ões" : ""}</span>
      </div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {destinos.map((item) => (
          <div key={item.chave} className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card px-3 py-2">
            <span className="truncate text-sm font-semibold">{item.nome}</span>
            <span className="flex shrink-0 items-center gap-1 text-sm font-bold text-orange-600"><Truck className="h-4 w-4" />{item.quantidade}</span>
          </div>
        ))}
      </div>
    </section>
  );
}