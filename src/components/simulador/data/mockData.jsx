// Mock data para o SmartWood Control Tower

export const FRENTES = [
  { id: "f1", nome: "Frente 1024-ESTRELA II", fazenda: "Estrela II", distancia: 37, tipoEstrada: "Asfalto + Terra", tempoMedciclo: 2.8, capacidadeGrua: 102.86, grua: "GR-04", modulo: "M4", lat: -17.2, lng: -39.5, status: "normal" },
  { id: "f2", nome: "Frente 1139-TAMANDUÁ", fazenda: "Tamanduá", distancia: 58, tipoEstrada: "Terra", tempoMedciclo: 2.08, capacidadeGrua: 90.0, grua: "GR-02", modulo: "M2", lat: -17.4, lng: -39.3, status: "atencao" },
  { id: "f3", nome: "Frente 2129-MORADA DO SOL", fazenda: "Morada do Sol", distancia: 22, tipoEstrada: "Asfalto", tempoMedciclo: 2.82, capacidadeGrua: 102.86, grua: "GR-01", modulo: "M1", lat: -17.1, lng: -39.7, status: "normal" },
  { id: "f4", nome: "Frente 0146-ÁGUA DO SEGREDO", fazenda: "Água do Segredo", distancia: 26, tipoEstrada: "Terra", tempoMedciclo: 5.52, capacidadeGrua: 90.0, grua: "GR-03", modulo: "M3", lat: -17.6, lng: -39.2, status: "critico" },
  { id: "f5", nome: "Frente 0003-NOVA FLORESTA", fazenda: "Nova Floresta", distancia: 23, tipoEstrada: "Asfalto", tempoMedciclo: 2.19, capacidadeGrua: 90.0, grua: "GR-05", modulo: "M5", lat: -17.3, lng: -39.8, status: "normal" },
  { id: "f6", nome: "Frente 0100-PROGRESSO", fazenda: "Progresso", distancia: 37, tipoEstrada: "Terra + Asfalto", tempoMedciclo: 1.96, capacidadeGrua: 80.0, grua: "GR-06", modulo: "M6", lat: -17.5, lng: -39.6, status: "atencao" },
  { id: "f7", nome: "Frente 0025-NOVA AMÉRICA", fazenda: "Nova América", distancia: 33, tipoEstrada: "Terra", tempoMedciclo: 2.17, capacidadeGrua: 102.86, grua: "GR-07", modulo: "M7", lat: -17.7, lng: -39.4, status: "normal" },
  { id: "f8", nome: "Frente 2125-SÃO JORGE", fazenda: "São Jorge", distancia: 15, tipoEstrada: "Asfalto", tempoMedciclo: 2.82, capacidadeGrua: 102.86, grua: "GR-08", modulo: "M8", lat: -17.0, lng: -39.9, status: "normal" },
];

export const CAMINHOES_BTF = [
  { id: "btf01", nome: "BTF01", tipo: "BTF", dimN: 88, cmContratados: 24, cmDisp: 22, frente: "f3", status: "viagem", capacidade: 40, transportadora: "Frota Própria" },
  { id: "btf02", nome: "BTF02", tipo: "BTF", dimN: 92, cmContratados: 24, cmDisp: 23, frente: "f1", status: "carregando", capacidade: 40, transportadora: "Frota Própria" },
  { id: "btf03", nome: "BTF03", tipo: "BTF", dimN: 88, cmContratados: 24, cmDisp: 21, frente: "f2", status: "viagem", capacidade: 40, transportadora: "Frota Própria" },
  { id: "btf04", nome: "BTF04", tipo: "BTF", dimN: 88, cmContratados: 24, cmDisp: 20, frente: "f1", status: "fila", capacidade: 40, transportadora: "Frota Própria" },
  { id: "btf05", nome: "BTF05", tipo: "BTF", dimN: 79, cmContratados: 24, cmDisp: 19, frente: "f5", status: "viagem", capacidade: 38, transportadora: "Frota Própria" },
  { id: "btf06", nome: "BTF06", tipo: "BTF", dimN: 96, cmContratados: 24, cmDisp: 23, frente: "f3", status: "disponivel", capacidade: 42, transportadora: "Frota Própria" },
  { id: "btf07", nome: "BTF07", tipo: "BTF", dimN: 88, cmContratados: 24, cmDisp: 22, frente: "f7", status: "viagem", capacidade: 40, transportadora: "Frota Própria" },
  { id: "btf08", nome: "BTF08", tipo: "BTF", dimN: 79, cmContratados: 24, cmDisp: 19, frente: "f4", status: "fila", capacidade: 38, transportadora: "Frota Própria" },
  { id: "btf09", nome: "BTF09", tipo: "BTF", dimN: 88, cmContratados: 24, cmDisp: 20, frente: "f6", status: "manutencao", capacidade: 40, transportadora: "Frota Própria" },
];

export const TRANSPORTADORAS = [
  { id: "tp1", nome: "CARGO POLO COMERCIO, LOGÍSTICA E", dimN: 89, cmContratados: 96, cmDisp: 85, performance: 91, pontualidade: 88, produtividade: 102.86 },
  { id: "tp2", nome: "SCALA TRANSPORTE E ADMINISTRAÇÃO", dimN: 100, cmContratados: 6, cmDisp: 6, performance: 100, pontualidade: 100, produtividade: 98.4 },
  { id: "tp3", nome: "EXPRESSO NEPOMUCENO S/A", dimN: 100, cmContratados: 100, cmDisp: 100, performance: 97, pontualidade: 95, produtividade: 100.0 },
  { id: "tp4", nome: "PLÁCIDOS TRANSPORTES RODOVIÁRIO LTDA", dimN: 90, cmContratados: 30, cmDisp: 27, performance: 88, pontualidade: 82, produtividade: 94.3 },
  { id: "tp5", nome: "SERRAMALHO TRANSPORTES LTDA", dimN: 77, cmContratados: 60, cmDisp: 46, performance: 79, pontualidade: 75, produtividade: 88.7 },
  { id: "tp6", nome: "EUCLIDES R GARBURO TRANSPORTES LTDA", dimN: 91, cmContratados: 74, cmDisp: 91, performance: 93, pontualidade: 90, produtividade: 97.2 },
  { id: "tp7", nome: "M.T. LOURENÇO TRANSPORTES EIRELI", dimN: 83, cmContratados: 2, cmDisp: 2, performance: 85, pontualidade: 80, produtividade: 91.5 },
];

export const GRUAS = [
  { id: "gr1", frente: "f1", nome: "GR-04", modelo: "Timber Jack 1270D", capacidade: 102.86, tempoMedCarreg: 18, disponibilidade: 94, eficiencia: 98, status: "operando" },
  { id: "gr2", frente: "f2", nome: "GR-02", modelo: "John Deere 3756D", capacidade: 90.0, tempoMedCarreg: 20, disponibilidade: 88, eficiencia: 91, status: "operando" },
  { id: "gr3", frente: "f3", nome: "GR-01", modelo: "Caterpillar 538", capacidade: 102.86, tempoMedCarreg: 18, disponibilidade: 96, eficiencia: 99, status: "operando" },
  { id: "gr4", frente: "f4", nome: "GR-03", modelo: "Komatsu 895.2", capacidade: 90.0, tempoMedCarreg: 22, disponibilidade: 72, eficiencia: 74, status: "manutencao" },
  { id: "gr5", frente: "f5", nome: "GR-05", modelo: "Ponsse Buffalo", capacidade: 90.0, tempoMedCarreg: 20, disponibilidade: 91, eficiencia: 93, status: "operando" },
  { id: "gr6", frente: "f6", nome: "GR-06", modelo: "Timber Jack 1170E", capacidade: 80.0, tempoMedCarreg: 24, disponibilidade: 85, eficiencia: 86, status: "operando" },
  { id: "gr7", frente: "f7", nome: "GR-07", modelo: "John Deere 3756D", capacidade: 102.86, tempoMedCarreg: 18, disponibilidade: 93, eficiencia: 95, status: "operando" },
  { id: "gr8", frente: "f8", nome: "GR-08", modelo: "Caterpillar 538", capacidade: 102.86, tempoMedCarreg: 18, disponibilidade: 97, eficiencia: 99, status: "operando" },
];

export const PARAMS_GLOBAIS = {
  consumoFabricaThDia: 41060,
  metaDiariaTon: 41060,
  tempoCarregMinutos: 20,
  tempoDescarregMinutos: 15,
  velocidadeMediaCarregado: 45,
  velocidadeMediaVazio: 60,
  capacidadeMediaCaminhao: 40,
  tempoEsperaAceitavelMin: 20,
  tempoMaxFilaMin: 40,
  margemSegurancaEstoqueH: 8,
  totalCaminhoes: 502,
};

export const SUGESTOES_IA = [
  {
    id: "s1",
    tipo: "transferencia",
    prioridade: "alta",
    titulo: "Transferir 4 caminhões BTF para Frente 1024",
    descricao: "Frente 1024-ESTRELA II com alta demanda e grua subutilizada. Realocar 4 BTFs da Frente 0146.",
    impactoTon: +180,
    impactoFila: -25,
    impactoProd: +3.2,
    frente_origem: "f4",
    frente_destino: "f1",
    caminhoes: 4,
    status: "pendente",
  },
  {
    id: "s2",
    tipo: "alerta",
    prioridade: "critica",
    titulo: "Grua GR-03 em manutenção — risco de ruptura em 2h",
    descricao: "Frente 0146 com grua parada. Considerar desvio de caminhões para frentes alternativas.",
    impactoTon: -320,
    impactoFila: +45,
    impactoProd: -8.1,
    frente_origem: "f4",
    frente_destino: null,
    caminhoes: 0,
    status: "pendente",
  },
  {
    id: "s3",
    tipo: "otimizacao",
    prioridade: "media",
    titulo: "Aumentar frequência em Frente 2125-SÃO JORGE",
    descricao: "Frente com menor distância (15km) e grua eficiente. Adicionar 3 caminhões aumenta 120t/turno.",
    impactoTon: +120,
    impactoFila: -10,
    impactoProd: +2.1,
    frente_origem: null,
    frente_destino: "f8",
    caminhoes: 3,
    status: "pendente",
  },
];

export const IPO_RANKING = [
  { frente: "f1", nome: "1024-ESTRELA II", ipo: 98, estoque: 85, distancia: 37, fila: 2, grua: 99 },
  { frente: "f2", nome: "1139-TAMANDUÁ", ipo: 95, estoque: 72, distancia: 58, fila: 1, grua: 91 },
  { frente: "f8", nome: "2125-SÃO JORGE", ipo: 91, estoque: 90, distancia: 15, fila: 0, grua: 99 },
  { frente: "f3", nome: "2129-MORADA DO SOL", ipo: 87, estoque: 68, distancia: 22, fila: 1, grua: 99 },
  { frente: "f5", nome: "0003-NOVA FLORESTA", ipo: 82, estoque: 60, distancia: 23, fila: 0, grua: 93 },
  { frente: "f7", nome: "0025-NOVA AMÉRICA", ipo: 78, estoque: 55, distancia: 33, fila: 2, grua: 95 },
  { frente: "f6", nome: "0100-PROGRESSO", ipo: 65, estoque: 48, distancia: 37, fila: 3, grua: 86 },
  { frente: "f4", nome: "0146-ÁGUA DO SEGREDO", ipo: 31, estoque: 20, distancia: 26, fila: 8, grua: 74 },
];

export const HISTORICO_HORAS = Array.from({ length: 24 }, (_, i) => ({
  hora: `${String(i).padStart(2, "0")}:00`,
  ton: Math.round(1400 + Math.random() * 400),
  meta: 1710,
  fila: Math.round(2 + Math.random() * 8),
}));

export const PREVISAO = [
  { horizonte: "1h", ton: 1680, risco: "baixo", fila: 3, ruptura: false },
  { horizonte: "2h", ton: 3290, risco: "baixo", fila: 4, ruptura: false },
  { horizonte: "4h", ton: 6400, risco: "medio", fila: 7, ruptura: false },
  { horizonte: "8h", ton: 12200, risco: "alto", fila: 12, ruptura: false },
  { horizonte: "24h", ton: 38500, risco: "alto", fila: 9, ruptura: true },
];