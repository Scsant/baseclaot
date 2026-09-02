/**
 * Motor Preditivo de Logística Florestal
 * Calcula previsões de ciclo de cada caminhão baseado em:
 * - Parâmetros da fazenda
 * - Hora do dia / turno
 * - Condição climática
 * - Histórico disponível
 */

export function getTurno(hora) {
  if (hora >= 6 && hora < 14) return "diurno";
  if (hora >= 14 && hora < 22) return "tarde";
  return "noturno";
}

/**
 * Calcula o tempo de ciclo previsto em minutos para um caminhão
 */
export function calcularTempoCiclo(fazenda, opcoes = {}) {
  const { horaSaida = 7, chovendo = false, confiancaBase = 85 } = opcoes;

  const turno = getTurno(horaSaida);

  // Tempo de trânsito baseado em distância e velocidade
  let velocidade = fazenda.velocidade_media_kmh || 45;

  // Ajustes por condição
  if (chovendo) velocidade *= 0.72;
  if (turno === "noturno") velocidade *= 0.88;
  if (fazenda.tipo_estrada === "ruim") velocidade *= 0.80;
  if (fazenda.tipo_estrada === "critica") velocidade *= 0.65;

  const distancia = fazenda.distancia_km || 50;
  const tempoTransitoIdaMin = (distancia / velocidade) * 60;

  // Tempo de carregamento
  let tempoCarregamento = fazenda.tempo_medio_carregamento_min || 35;
  if (chovendo) tempoCarregamento *= 1.15;

  // Tempo de fila
  let tempoFila = fazenda.tempo_medio_fila_min || 15;

  // Tempo de retorno (sem carga, um pouco mais rápido)
  const tempoTransitoVoltaMin = tempoTransitoIdaMin * 0.9;

  // Se tiver histórico aprendido, usa como base e ajusta
  let tempoCicloBase = fazenda.tempo_ciclo_historico_min;
  if (chovendo && fazenda.tempo_ciclo_chuva_min) {
    tempoCicloBase = fazenda.tempo_ciclo_chuva_min;
  } else if (turno === "noturno" && fazenda.tempo_ciclo_noturno_min) {
    tempoCicloBase = fazenda.tempo_ciclo_noturno_min;
  }

  let tempoCicloTotal;
  if (tempoCicloBase) {
    // Tem histórico — usa histórico com ajustes contextuais
    tempoCicloTotal = tempoCicloBase;
    if (chovendo && !fazenda.tempo_ciclo_chuva_min) tempoCicloTotal *= 1.28;
    if (turno === "noturno" && !fazenda.tempo_ciclo_noturno_min) tempoCicloTotal *= 1.18;
  } else {
    // Sem histórico — usa cálculo matemático
    tempoCicloTotal = tempoTransitoIdaMin + tempoFila + tempoCarregamento + tempoTransitoVoltaMin;
  }

  // Margem de segurança
  const margem = 1.05;
  tempoCicloTotal = Math.round(tempoCicloTotal * margem);

  // Índice de confiança
  let confianca = confiancaBase;
  if (!fazenda.tempo_ciclo_historico_min) confianca = Math.max(confianca - 20, 50);
  if (fazenda.tipo_estrada === "critica") confianca = Math.max(confianca - 10, 40);
  if (chovendo) confianca = Math.max(confianca - 8, 40);

  return {
    tempoCicloMin: tempoCicloTotal,
    tempoTransitoIdaMin: Math.round(tempoTransitoIdaMin),
    tempoFilaMin: Math.round(tempoFila),
    tempoCarregamentoMin: Math.round(tempoCarregamento),
    tempoTransitoVoltaMin: Math.round(tempoTransitoVoltaMin),
    indiceConfianca: Math.round(confianca),
    turno,
    ajusteChuva: chovendo,
  };
}

/**
 * Gera o cronograma completo de um caminhão
 */
export function gerarCronograma(caminhao, fazenda, opcoes = {}) {
  const [h, m] = (caminhao.horario_saida_fabrica || "07:00").split(":").map(Number);
  const saidaMin = h * 60 + m;

  const { tempoCicloMin, tempoTransitoIdaMin, tempoFilaMin, tempoCarregamentoMin, tempoTransitoVoltaMin, indiceConfianca } =
    calcularTempoCiclo(fazenda, { horaSaida: h, ...opcoes });

  const chegadaFazenda = saidaMin + tempoTransitoIdaMin;
  const inicioCarregamento = chegadaFazenda + tempoFilaMin;
  const fimCarregamento = inicioCarregamento + tempoCarregamentoMin;
  const chegadaFabrica = fimCarregamento + tempoTransitoVoltaMin;
  const proximaViagem = chegadaFabrica + 15; // 15min de descarga/troca

  return {
    previsao_chegada_fazenda: minToHHMM(chegadaFazenda),
    previsao_inicio_carregamento: minToHHMM(inicioCarregamento),
    previsao_fim_carregamento: minToHHMM(fimCarregamento),
    previsao_chegada_fabrica: minToHHMM(chegadaFabrica),
    previsao_proxima_viagem: minToHHMM(proximaViagem),
    tempo_ciclo_previsto_min: tempoCicloMin,
    indice_confianca: indiceConfianca,
  };
}

/**
 * Detecta o status atual do caminhão baseado na hora atual
 */
export function detectarStatusAtual(cronograma, horaSaidaFabrica) {
  const agora = new Date();
  const agorMin = agora.getHours() * 60 + agora.getMinutes();

  const [h, m] = (horaSaidaFabrica || "07:00").split(":").map(Number);
  const saidaMin = h * 60 + m;

  const chegadaFazendaMin = hhmmToMin(cronograma.previsao_chegada_fazenda);
  const inicioCarregMin = hhmmToMin(cronograma.previsao_inicio_carregamento);
  const fimCarregMin = hhmmToMin(cronograma.previsao_fim_carregamento);
  const chegadaFabricaMin = hhmmToMin(cronograma.previsao_chegada_fabrica);

  if (agorMin < saidaMin) return "programado";
  if (agorMin < chegadaFazendaMin) return "em_transito_ida";
  if (agorMin < inicioCarregMin) return "em_fila";
  if (agorMin < fimCarregMin) return "carregando";
  if (agorMin < chegadaFabricaMin) return "em_transito_volta";
  return "concluido";
}

/**
 * Gera alertas inteligentes para um conjunto de caminhões/fazendas
 */
export function gerarAlertas(caminhoes, fazendas, climaMap = {}) {
  const alertas = [];

  // Agrupa caminhões por fazenda
  const porFazenda = {};
  caminhoes.forEach((c) => {
    const id = c.fazenda_id || c.fazenda_nome;
    if (!porFazenda[id]) porFazenda[id] = [];
    porFazenda[id].push(c);
  });

  Object.entries(porFazenda).forEach(([fazId, lista]) => {
    const fazenda = fazendas.find((f) => f.id === fazId || f.nome === fazId);
    if (!fazenda) return;

    const clima = climaMap[fazId] || {};
    const capacidade = fazenda.capacidade_max_caminhoes || 10;
    const gruas = fazenda.qtd_gruas || 2;

    // Excesso de caminhões
    const emFila = lista.filter((c) => c.status === "em_fila").length;
    if (emFila > gruas * 3) {
      alertas.push({
        tipo: "excesso_fila",
        severidade: "alta",
        fazenda: fazenda.nome,
        mensagem: `${fazenda.nome} possui ${emFila} caminhões em fila para ${gruas} grua(s). Fila excessiva prevista.`,
        icone: "🚛",
      });
    }

    // Poucos caminhões
    if (lista.length < gruas) {
      alertas.push({
        tipo: "falta_caminhoes",
        severidade: "media",
        fazenda: fazenda.nome,
        mensagem: `${fazenda.nome} possui apenas ${lista.length} caminhão(ões) programados para ${gruas} grua(s). Grua(s) podem ficar ociosas.`,
        icone: "⚠️",
      });
    }

    // Risco climático
    if (clima.chuva_probabilidade > 60) {
      alertas.push({
        tipo: "risco_clima",
        severidade: "alta",
        fazenda: fazenda.nome,
        mensagem: `${fazenda.nome}: ${clima.chuva_probabilidade}% de probabilidade de chuva. Redução de produtividade esperada (~28%).`,
        icone: "🌧️",
      });
    }

    // Estrada crítica
    if (fazenda.tipo_estrada === "critica") {
      alertas.push({
        tipo: "estrada_critica",
        severidade: "alta",
        fazenda: fazenda.nome,
        mensagem: `${fazenda.nome} possui estrada em condição crítica. Tempo de ciclo aumentado ~35%.`,
        icone: "🛣️",
      });
    }
  });

  return alertas;
}

export function minToHHMM(min) {
  const h = Math.floor(min / 60) % 24;
  const m = min % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function hhmmToMin(hhmm) {
  if (!hhmm) return 0;
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}