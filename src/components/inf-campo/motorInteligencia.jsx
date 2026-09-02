// Motor de Inteligência Operacional - INF. CAMPO

export function calcularProdutividade(producao, horas) {
  if (!horas || horas <= 0) return 0;
  return producao / horas;
}

export function calcularHorasRestantes(turno) {
  const agora = new Date();
  const h = agora.getHours() + agora.getMinutes() / 60;
  const fimTurno = turno === 1 ? 14 : turno === 2 ? 22 : 30; // 30 = 06h do dia seguinte
  let restantes = fimTurno - h;
  if (restantes < 0) restantes += 24;
  return Math.max(0, Math.min(restantes, 8));
}

export function calcularProjecao(modulo) {
  const producao = modulo.producao_atual_m3 || 0;
  const horas = modulo.horas_trabalhadas || 0;
  const turno = modulo.turno || 1;
  const produtividade = calcularProdutividade(producao, horas);
  const horasRestantes = calcularHorasRestantes(turno);
  const projecaoAdicional = produtividade * horasRestantes;
  const projecaoFinal = producao + projecaoAdicional;
  return { produtividade, horasRestantes, projecaoAdicional, projecaoFinal };
}

export function calcularAlertaMeta(meta, projecaoFinal) {
  if (!meta || meta <= 0) return null;
  const pct = projecaoFinal / meta;
  if (pct >= 1) return { tipo: "verde", label: "META GARANTIDA", cor: "emerald" };
  if (pct >= 0.95) return { tipo: "amarelo", label: "ATENÇÃO", cor: "amber" };
  return { tipo: "vermelho", label: "RISCO DE NÃO CUMPRIMENTO", cor: "red" };
}

export function calcularStatusOperacional(modulo) {
  const { projecaoFinal } = calcularProjecao(modulo);
  const meta = modulo.meta_entrega_m3 || 0;
  const impactos = modulo.impactos || [];
  const equipamentos = modulo.equipamentos || [];
  const cmsEnviados = modulo.cms_enviados || 0;
  const cmsAguardando = modulo.cms_aguardando || 0;
  const cmsCarregando = modulo.cms_carregando || 0;

  const equipMnt = equipamentos.filter((e) => {
    const statuses = e.statuses || (e.status ? [e.status] : []);
    return statuses.includes("manutencao");
  }).length;

  const pctMeta = meta > 0 ? projecaoFinal / meta : 1;
  const temExcessoCam = impactos.includes("Excesso de Caminhão") || cmsAguardando > cmsCarregando * 1.5;
  const temFaltaCam = impactos.includes("Falta de Caminhão");
  const multiplosImpactos = impactos.length >= 3;
  const semEquip = equipamentos.length > 0 && equipMnt >= equipamentos.length;

  if (pctMeta < 0.8 && (multiplosImpactos || semEquip)) {
    return { key: "critico", label: "Operação Crítica", emoji: "🔴", cor: "red" };
  }
  if (temExcessoCam) {
    return { key: "reduzir", label: "Reduzir Fluxo", emoji: "🟠", cor: "orange" };
  }
  if (temFaltaCam || (cmsEnviados < 3 && meta > 0)) {
    return { key: "mais_caminhoes", label: "Necessita Mais Caminhões", emoji: "🔵", cor: "blue" };
  }
  if (pctMeta >= 1 && equipMnt === 0 && cmsAguardando < 3) {
    return { key: "oportunidade", label: "Módulo com Oportunidade", emoji: "🟢", cor: "emerald" };
  }
  return { key: "balanceado", label: "Operação Balanceada", emoji: "🟡", cor: "yellow" };
}