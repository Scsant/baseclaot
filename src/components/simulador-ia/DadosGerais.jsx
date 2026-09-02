const LABELS = { data: "Data", total_caminhoes: "Total de caminhões", volume_previsto: "Volume previsto", numero_projetos: "Número de projetos", fazendas: "Fazendas", modulos: "Módulos", frequencia_radio: "Frequência de rádio" };
const value = (item) => Array.isArray(item) ? item.join(", ") : item ?? "Não identificado";

export default function DadosGerais({ dados = {} }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm"><h2 className="text-lg font-bold">Informações Gerais Extraídas</h2><div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{Object.entries(LABELS).map(([key, label]) => <div key={key} className="rounded-lg bg-muted/50 p-3"><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 text-sm font-bold">{value(dados[key])}</p></div>)}</div>{dados.dados_nao_identificados?.length > 0 && <p className="mt-4 text-xs text-destructive"><strong>Dados não identificados:</strong> {dados.dados_nao_identificados.join(", ")}</p>}</section>
  );
}