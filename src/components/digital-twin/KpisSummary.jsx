export default function KpisSummary({ caminhoes, alertas }) {
  const total = caminhoes.length;
  const counts = {
    programado: 0, em_transito_ida: 0, em_fila: 0,
    carregando: 0, em_transito_volta: 0, concluido: 0,
  };
  caminhoes.forEach((c) => { if (counts[c.status] !== undefined) counts[c.status]++; });

  const tempoMedio = caminhoes.length
    ? Math.round(caminhoes.reduce((s, c) => s + (c.tempo_ciclo_previsto_min || 0), 0) / caminhoes.length)
    : 0;

  const confMedia = caminhoes.length
    ? Math.round(caminhoes.reduce((s, c) => s + (c.indice_confianca || 0), 0) / caminhoes.length)
    : 0;

  const alertasAltos = alertas.filter((a) => a.severidade === "alta").length;

  const kpis = [
    { label: "Total Programados", value: total, icon: "🚛", cor: "border-l-blue-500" },
    { label: "Em Trânsito", value: counts.em_transito_ida + counts.em_transito_volta, icon: "🛣️", cor: "border-l-cyan-500" },
    { label: "Em Fila / Carregando", value: counts.em_fila + counts.carregando, icon: "⏳", cor: "border-l-amber-500" },
    { label: "Concluídos", value: counts.concluido, icon: "✅", cor: "border-l-green-500" },
    { label: "Ciclo Médio", value: tempoMedio ? `${Math.floor(tempoMedio/60)}h${tempoMedio%60}min` : "—", icon: "🔄", cor: "border-l-violet-500" },
    { label: "Confiança Média", value: confMedia ? `${confMedia}%` : "—", icon: "🎯", cor: "border-l-teal-500" },
    { label: "Alertas Críticos", value: alertasAltos, icon: "🚨", cor: alertasAltos > 0 ? "border-l-red-500" : "border-l-green-500" },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
      {kpis.map((k) => (
        <div key={k.label} className={`bg-card border border-border border-l-4 ${k.cor} rounded-xl px-3 py-3`}>
          <p className="text-lg mb-1">{k.icon}</p>
          <p className="text-xl font-bold text-foreground">{k.value}</p>
          <p className="text-[11px] text-muted-foreground leading-tight">{k.label}</p>
        </div>
      ))}
    </div>
  );
}