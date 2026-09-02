import { base44 } from "@/api/base44Client";

const string = { type: "string" };
const number = { type: "number" };
const stringArray = { type: "array", items: string };

export const ANALISE_SCHEMA = {
  type: "object",
  properties: {
    informacoes_gerais: { type: "object", properties: { data: string, total_caminhoes: number, volume_previsto: number, numero_projetos: number, fazendas: stringArray, modulos: stringArray, frequencia_radio: string, dados_nao_identificados: stringArray } },
    projetos: { type: "array", items: { type: "object", properties: { nome: string, caminhoes: number, volume_previsto: number, localizacao: string, gruas: number, composicao: string, dmt_km: number, viagens_dia: number, maximo_caminhoes: number, classificacao: string, produtividade_m3_h_grua: number, despacho_hora: number } } },
    transportadoras: { type: "array", items: { type: "object", properties: { nome: string, caminhoes: number, percentual_utilizado: number, distribuicao_projetos: string } } },
    resumo_executivo: string,
    pontos_positivos: stringArray,
    pontos_atencao: stringArray,
    oportunidades: stringArray,
    ranking_projetos: { type: "array", items: { type: "object", properties: { projeto: string, status: string, nota: number, justificativa: string } } },
    indice_geral: { type: "object", properties: { nota: number, situacao: string, justificativa: string } },
    cards_inteligentes: { type: "object", properties: { melhor_projeto: string, projeto_critico: string, mais_caminhoes: string, menos_gruas: string, mais_distante: string, maior_volume: string, melhor_produtividade: string, menor_produtividade: string } },
    alertas_inteligentes: stringArray,
    recomendacoes: stringArray
  },
  required: ["informacoes_gerais", "projetos", "transportadoras", "resumo_executivo", "pontos_positivos", "pontos_atencao", "oportunidades", "ranking_projetos", "indice_geral", "cards_inteligentes", "alertas_inteligentes", "recomendacoes"]
};

const PROMPT = `Você é um especialista em logística florestal com ampla experiência em transporte de madeira para fábricas de celulose. Interprete o print do simulador operacional anexado e produza uma análise objetiva para apoiar a decisão. Não faça apenas OCR: relacione capacidade, volume, distância, gruas, produtividade, composição, viagens, limites e distribuição da frota.

Extraia informações gerais, dados por projeto e transportadoras. Identifique sobrecarga, concentração de caminhões, baixa produtividade, poucas gruas, DMT elevada, risco de filas, baixa produção, capacidade insuficiente, desequilíbrio e os melhores desempenhos. Gere resumo executivo de 5 a 10 linhas, pontos positivos, pontos de atenção, oportunidades, alertas e de 5 a 10 recomendações práticas na voz de um coordenador de logística.

Crie ranking de 0 a 100 considerando volume, distância, gruas, produtividade, máximo de caminhões e classificação. Calcule também índice geral de 0 a 100. Preencha os oito cards comparativos. Use linguagem técnica, clara e executiva. Não invente valores: quando algo estiver ilegível ou ausente, omita o campo e registre em dados_nao_identificados. Retorne exclusivamente a estrutura JSON solicitada.`;

export async function analisarPrintOperacional(file) {
  const { file_url } = await base44.integrations.Core.UploadFile({ file });
  return base44.integrations.Core.InvokeLLM({
    prompt: PROMPT,
    file_urls: [file_url],
    model: "gpt_5_4",
    response_json_schema: ANALISE_SCHEMA
  });
}