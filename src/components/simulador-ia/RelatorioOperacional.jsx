import CardsInteligentes from "@/components/simulador-ia/CardsInteligentes";
import DadosGerais from "@/components/simulador-ia/DadosGerais";
import IndiceOperacao from "@/components/simulador-ia/IndiceOperacao";
import ListaExecutiva from "@/components/simulador-ia/ListaExecutiva";
import RankingProjetos from "@/components/simulador-ia/RankingProjetos";
import TabelasOperacao from "@/components/simulador-ia/TabelasOperacao";

export default function RelatorioOperacional({ analise }) {
  return (
    <div className="space-y-5">
      <IndiceOperacao indice={analise.indice_geral} resumo={analise.resumo_executivo} />
      <CardsInteligentes cards={analise.cards_inteligentes} />
      <div className="grid gap-4 lg:grid-cols-3"><ListaExecutiva title="Pontos Positivos" items={analise.pontos_positivos} tone="positive" /><ListaExecutiva title="Pontos de Atenção" items={analise.pontos_atencao} tone="risk" /><ListaExecutiva title="Oportunidades" items={analise.oportunidades} /></div>
      <ListaExecutiva title="Alertas Inteligentes" items={analise.alertas_inteligentes} tone="risk" />
      <ListaExecutiva title="Recomendações da IA" items={analise.recomendacoes} numbered />
      <RankingProjetos ranking={analise.ranking_projetos} />
      <DadosGerais dados={analise.informacoes_gerais} />
      <TabelasOperacao projetos={analise.projetos} transportadoras={analise.transportadoras} />
    </div>
  );
}