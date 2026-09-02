const SEV_STYLE = {
  alta:  "border-red-200 bg-red-50 text-red-800",
  media: "border-amber-200 bg-amber-50 text-amber-800",
  baixa: "border-blue-200 bg-blue-50 text-blue-700",
};

export default function AlertasPanel({ alertas }) {
  if (!alertas?.length) {
    return (
      <div className="text-center py-8 text-muted-foreground text-sm">
        <span className="text-2xl block mb-2">✅</span>
        Nenhum alerta ativo no momento.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {alertas.map((a, i) => (
        <div key={i} className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm ${SEV_STYLE[a.severidade] || SEV_STYLE.baixa}`}>
          <span className="text-lg shrink-0 mt-0.5">{a.icone}</span>
          <div>
            <p className="font-semibold text-xs uppercase tracking-wide opacity-70 mb-0.5">{a.fazenda}</p>
            <p className="leading-snug">{a.mensagem}</p>
          </div>
        </div>
      ))}
    </div>
  );
}