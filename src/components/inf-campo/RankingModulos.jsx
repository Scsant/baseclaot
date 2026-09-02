import { calcularProjecao } from "./motorInteligencia";

const STATUS_COLORS = {
  oportunidade: "text-emerald-600 dark:text-emerald-400",
  balanceado: "text-yellow-600 dark:text-yellow-400",
  reduzir: "text-orange-600 dark:text-orange-400",
  mais_caminhoes: "text-sky-600 dark:text-sky-400",
  critico: "text-red-600 dark:text-red-400",
};

export default function RankingModulos({ modulos, onSelect }) {
  const ranked = [...modulos]
    .map((m) => {
      const meta = m.meta_entrega_m3 || 0;
      const { projecaoFinal } = calcularProjecao(m);
      const pctMeta = meta > 0 ? (projecaoFinal / meta) * 100 : 0;
      return { ...m, pctMeta, projecaoFinal };
    })
    .sort((a, b) => b.pctMeta - a.pctMeta);

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      <div className="px-5 py-4 border-b border-border">
        <h3 className="text-sm font-bold text-foreground">Ranking dos Módulos</h3>
        <p className="text-xs text-muted-foreground">Ordenado do melhor para o pior desempenho</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-left px-4 py-2.5 text-muted-foreground font-semibold">#</th>
              <th className="text-left px-4 py-2.5 text-muted-foreground font-semibold">Módulo</th>
              <th className="text-right px-4 py-2.5 text-muted-foreground font-semibold">Meta (%)</th>
              <th className="text-right px-4 py-2.5 text-muted-foreground font-semibold">Produção Atual</th>
              <th className="text-right px-4 py-2.5 text-muted-foreground font-semibold">Projeção Final</th>
              <th className="text-left px-4 py-2.5 text-muted-foreground font-semibold">Status</th>
              <th className="text-left px-4 py-2.5 text-muted-foreground font-semibold">Sugestão</th>
            </tr>
          </thead>
          <tbody>
            {ranked.map((m, idx) => {
              const st = m._statusCalc;
              const pctColor = m.pctMeta >= 100 ? "text-emerald-600 dark:text-emerald-400" : m.pctMeta >= 95 ? "text-amber-600 dark:text-amber-400" : "text-red-600 dark:text-red-400";
              return (
                <tr
                  key={m.modulo_numero}
                  onClick={() => onSelect(m.modulo_numero)}
                  className="border-b border-border hover:bg-muted/40 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3">
                    <span className="w-6 h-6 rounded-full bg-muted flex items-center justify-center font-bold text-muted-foreground">{idx + 1}</span>
                  </td>
                  <td className="px-4 py-3 font-bold text-foreground">
                    {m.fazenda ? (
                      <div>
                        <div>Módulo {m.modulo_numero}</div>
                        <div className="text-[10px] text-muted-foreground font-normal">{m.fazenda}</div>
                      </div>
                    ) : (
                      <span>Módulo {m.modulo_numero}</span>
                    )}
                  </td>
                  <td className={`px-4 py-3 text-right font-bold ${pctColor}`}>
                    {m.meta_entrega_m3 ? `${Math.round(m.pctMeta)}%` : "—"}
                  </td>
                  <td className="px-4 py-3 text-right text-foreground">
                    {m.producao_atual_m3 != null ? `${m.producao_atual_m3.toLocaleString("pt-BR")} m³` : "—"}
                  </td>
                  <td className="px-4 py-3 text-right text-foreground">
                    {m.meta_entrega_m3 ? `${Math.round(m.projecaoFinal).toLocaleString("pt-BR")} m³` : "—"}
                  </td>
                  <td className="px-4 py-3">
                    {st && (
                      <span className={`font-semibold ${STATUS_COLORS[st.key] || ""}`}>{st.emoji}</span>
                    )}
                  </td>
                  <td className={`px-4 py-3 font-semibold ${STATUS_COLORS[st?.key] || "text-muted-foreground"}`}>
                    {st?.label || "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}