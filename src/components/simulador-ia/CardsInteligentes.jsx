import { CircleAlert, Construction, MapPin, Package, TrendingDown, Trophy, Truck, Zap } from "lucide-react";

const CONFIG = [
  ["melhor_projeto", "Melhor Projeto", Trophy], ["projeto_critico", "Projeto Crítico", CircleAlert],
  ["mais_caminhoes", "Mais Caminhões", Truck], ["menos_gruas", "Menos Gruas", Construction],
  ["mais_distante", "Mais Distante", MapPin], ["maior_volume", "Maior Volume", Package],
  ["melhor_produtividade", "Melhor Produtividade", Zap], ["menor_produtividade", "Menor Produtividade", TrendingDown]
];

export default function CardsInteligentes({ cards = {} }) {
  return (
    <section><h2 className="mb-3 text-lg font-bold">Cards Inteligentes</h2><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{CONFIG.map(([key, label, Icon]) => <div key={key} className="rounded-xl border border-border bg-card p-4 shadow-sm"><div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-muted-foreground"><Icon className="h-4 w-4 text-primary" />{label}</div><p className="mt-2 text-sm font-bold">{cards[key] || "Não identificado"}</p></div>)}</div></section>
  );
}