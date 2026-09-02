// ============================================================
//  Motor Matemático de Simulação Logística Florestal
// ============================================================

const FATORES_ESTRADA = {
  excelente: { velMult: 1.0, dispMult: 1.0 },
  boa:       { velMult: 0.90, dispMult: 0.97 },
  regular:   { velMult: 0.75, dispMult: 0.92 },
  ruim:      { velMult: 0.55, dispMult: 0.82 },
  critica:   { velMult: 0.35, dispMult: 0.65 },
};

const FATORES_CLIMA = {
  sol:           { velMult: 1.0,  dispMult: 1.0,  carregMult: 1.0,  manobraMult: 1.0,  atolRisco: 0   },
  garoa:         { velMult: 0.92, dispMult: 0.97, carregMult: 0.97, manobraMult: 1.05, atolRisco: 5   },
  chuva_leve:    { velMult: 0.80, dispMult: 0.93, carregMult: 0.94, manobraMult: 1.10, atolRisco: 15  },
  chuva_moderada:{ velMult: 0.65, dispMult: 0.85, carregMult: 0.88, manobraMult: 1.20, atolRisco: 30  },
  chuva_forte:   { velMult: 0.40, dispMult: 0.65, carregMult: 0.75, manobraMult: 1.50, atolRisco: 60  },
};

export function calcularSimulacao(inputs) {
  const {
    qtdCaminhoes, capacidadeCaminhaoTon,
    distanciaTerraKm, distanciaAsfaltadaKm,
    velocidadeTerraKmh, velocidadeAsfaltadaKmh,
    qtdGruas, qtdGruasManutencao, capacidadeGruaTonHora,
    eficienciaGrua, mtbfHoras, mttrHoras,
    tempoManobraMin, tempoPositMin, tempoCarregMin, tempoSaidaMin, tempoDescarregMin,
    condicaoEstrada, condicaoClimatica,
    capacidadeViaSimultanea, horasTurno,
    possuiTratorApoio, possuiSkidder, possuiEscavadeira,
  } = inputs;

  const fe = FATORES_ESTRADA[condicaoEstrada] || FATORES_ESTRADA.boa;
  const fc = FATORES_CLIMA[condicaoClimatica] || FATORES_CLIMA.sol;
  const fMult = fe.velMult * fc.velMult;

  // ---- Velocidades ajustadas
  const velTerra  = velocidadeTerraKmh  * fMult;
  const velAsf    = velocidadeAsfaltadaKmh * fMult;

  // ---- Tempos de viagem (horas)
  const tvTerra   = distanciaTerraKm   / Math.max(velTerra, 1);
  const tvAsf     = distanciaAsfaltadaKm / Math.max(velAsf, 1);
  const tvVazio   = (tvTerra + tvAsf) * 60; // min
  const tvCarreg  = tvVazio * 0.9;          // min (carregado ~10% mais lento)
  const tvTotal   = tvVazio + tvCarreg;     // min (ida + volta)

  // ---- Tempos na frente (min) ajustados pelo clima
  const tManobra  = tempoManobraMin  * fc.manobraMult;
  const tPosit    = tempoPositMin    * fc.manobraMult;
  const tCarreg   = tempoCarregMin   * fc.carregMult;
  const tSaida    = tempoSaidaMin;
  const tDescarreg= tempoDescarregMin;
  const tFrente   = tManobra + tPosit + tCarreg + tSaida; // min na frente

  // ---- Ciclo total
  const tCiclo    = tvTotal + tFrente + tDescarreg; // min

  // ---- Gruas operacionais
  const dispGrua  = (mtbfHoras / Math.max(mtbfHoras + mttrHoras, 1)) * (eficienciaGrua / 100) * fe.dispMult * fc.dispMult;
  const gruasOp   = Math.max(0, (qtdGruas - qtdGruasManutencao)) * dispGrua;

  // ---- Capacidade de carregamento das gruas (ton/h)
  const capGruasTonH = gruasOp * capacidadeGruaTonHora * fc.carregMult;

  // ---- Taxa de chegada dos caminhões à frente (caminhões/min)
  // λ = qtdCaminhoes / tCiclo  (assumindo estado estacionário)
  const lambda = qtdCaminhoes / Math.max(tCiclo, 1); // cam/min

  // ---- Capacidade máxima de serviço das gruas (cam/min)
  // Uma grua serve 1 caminhão a cada tCarreg min
  const mu = gruasOp / Math.max(tCarreg, 0.1); // cam/min

  // ---- Teoria das Filas M/M/c
  const rho = lambda / Math.max(mu, 0.001); // taxa de ocupação
  const rhoCap = Math.min(rho, 0.9999);

  // Tempo médio de espera na fila (min) - Kingman approximation
  const tempoEspera = rho >= 1
    ? (tCarreg * rho) / (1 - Math.min(rho, 0.995)) * 0.5
    : (tCarreg * rhoCap * rhoCap) / Math.max(1 - rhoCap, 0.001) * 0.5;

  // Comprimento médio da fila Lq
  const filaMed = lambda * tempoEspera; // Little's Law
  const filaMax = Math.ceil(filaMed * 2.5);

  // Tempo médio no sistema
  const tempoSistema = tempoEspera + tCarreg;

  // ---- Produção
  const ciclosHora   = 60 / Math.max(tCiclo, 1);
  const producaoHora = Math.min(
    qtdCaminhoes * ciclosHora * capacidadeCaminhaoTon,
    capGruasTonH
  );
  const producaoTurno = producaoHora * horasTurno * 0.85; // 85% eficiência real
  const producaoDia   = producaoTurno * 3;

  // ---- Saturation & Risk
  const nivelSaturacao = Math.min((rho * 100), 120);
  const probCongestion = rho >= 1 ? 95 : Math.min(rho * rho * 100, 95);
  const probOciosidade = Math.max(0, (1 - rho) * 100);
  const probSaturacao  = Math.max(0, (rho - 0.8) * 500);

  // ---- Qtd ideal de caminhões
  // Que iguala lambda ≈ mu * 0.85 (utilização de 85%)
  const qtdIdeal = Math.max(1, Math.round(mu * tCiclo * 0.85));
  const qtdMaxSemFila = Math.max(1, Math.round(mu * tCiclo * 0.70));

  // ---- Ganho/Perda relativo ao ideal
  const producaoIdeal = Math.min(
    qtdIdeal * ciclosHora * capacidadeCaminhaoTon,
    capGruasTonH
  );
  const deltaProd = producaoHora - producaoIdeal;
  const deltaPerc = producaoIdeal > 0 ? (deltaProd / producaoIdeal) * 100 : 0;

  // ---- Capacidade da frente (ton/h)
  const capFrenteTonH = capGruasTonH;

  // ---- Risco operacional
  let riscoOp = 0;
  if (rho >= 1)            riscoOp += 40;
  else if (rho >= 0.85)    riscoOp += 20;
  if (gruasOp < 1)         riscoOp += 30;
  if (filaMed > 5)         riscoOp += 15;
  if (fc.atolRisco > 20)   riscoOp += fc.atolRisco * 0.3;
  if (!possuiTratorApoio)  riscoOp += 5;
  riscoOp = Math.min(riscoOp, 100);

  // ---- Apoio mecânico
  const precisaTrator   = rho >= 0.9 || fc.atolRisco > 20 || condicaoEstrada === "critica";
  const precisaSkidder  = gruasOp < qtdGruas * 0.7;
  const precisaEscav    = condicaoEstrada === "critica" || condicaoEstrada === "ruim";

  return {
    // Tempos
    tvVazio: round(tvVazio), tvCarreg: round(tvCarreg), tCiclo: round(tCiclo),
    tFrente: round(tFrente), tempoEspera: round(tempoEspera), tempoSistema: round(tempoSistema),
    // Gruas
    gruasOp: round(gruasOp, 1), capGruasTonH: round(capGruasTonH),
    dispGrua: round(dispGrua * 100, 1),
    // Produção
    producaoHora: round(producaoHora), producaoTurno: round(producaoTurno), producaoDia: round(producaoDia),
    capFrenteTonH: round(capFrenteTonH),
    // Filas
    lambda: round(lambda, 4), mu: round(mu, 4), rho: round(rho, 4),
    filaMed: round(filaMed, 1), filaMax,
    probCongestion: round(probCongestion, 1), probOciosidade: round(probOciosidade, 1),
    probSaturacao: round(probSaturacao, 1), nivelSaturacao: round(nivelSaturacao, 1),
    // Otimização
    qtdIdeal, qtdMaxSemFila,
    deltaProd: round(deltaProd), deltaPerc: round(deltaPerc, 1),
    // Risco
    riscoOp: round(riscoOp, 1),
    precisaTrator, precisaSkidder, precisaEscav,
    // Pass-through
    ciclosHora: round(ciclosHora, 2),
    // Preditiva (escalada por horizonte)
    _inputs: { ...inputs, velTerra: round(velTerra, 1), velAsf: round(velAsf, 1), gruasOp: round(gruasOp, 1) },
  };
}

function round(val, dec = 0) {
  const f = Math.pow(10, dec);
  return Math.round(val * f) / f;
}