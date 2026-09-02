import { CheckCircle2, AlertTriangle, XCircle, ChevronRight, Lightbulb } from "lucide-react";

function Rec({ tipo, texto }) {
  const config = {
    ok:      { icon: CheckCircle2, bg: "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800", text: "text-emerald-700 dark:text-emerald-400", icon_color: "text-emerald-500" },
    warn:    { icon: AlertTriangle, bg: "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800",     text: "text-amber-700 dark:text-amber-400",   icon_color: "text-amber-500"   },
    danger:  { icon: XCircle,       bg: "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800",             text: "text-red-700 dark:text-red-400",       icon_color: "text-red-500"     },
  };
  const c = config[tipo] || config.warn;
  const Icon = c.icon;
  return (
    <div className={`flex items-start gap-3 px-4 py-3 rounded-xl border ${c.bg}`}>
      <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${c.icon_color}`} />
      <p className={`text-xs font-semibold ${c.text}`}>{texto}</p>
    </div>
  );
}

export default function RecomendacoesPanel({ resultado: r, inputs }) {
  const recs = [];
  const delta = inputs.qtdCaminhoes - r.qtdIdeal;

  // Frota
  if (delta > 0)       recs.push({ tipo: "warn",   texto: `Reduzir frota em ${delta} caminhão(ões). Excesso gera fila de ${r.filaMed.toFixed(1)} cam e espera de ${r.tempoEspera.toFixed(0)} min.` });
  else if (delta < 0)  recs.push({ tipo: "danger",  texto: `Enviar mais ${Math.abs(delta)} caminhão(ões). Frota insuficiente para atingir capacidade ideal.` });
  else                 recs.push({ tipo: "ok",      texto: `Operação com frota balanceada (${inputs.qtdCaminhoes} caminhões = ideal).` });

  // Fila
  if (r.filaMed > 8)   recs.push({ tipo: "danger",  texto: `Fila crítica prevista: ${r.filaMed.toFixed(0)} caminhões. Risco de ruptura de abastecimento.` });
  else if (r.filaMed > 3) recs.push({ tipo: "warn", texto: `Fila moderada prevista: ${r.filaMed.toFixed(1)} caminhões. Monitorar evolução.` });

  // Espera
  if (r.tempoEspera > 45) recs.push({ tipo: "danger", texto: `Tempo de espera crítico: ${r.tempoEspera.toFixed(0)} min. Risco de fila superior a 45 minutos.` });
  else if (r.tempoEspera > 20) recs.push({ tipo: "warn", texto: `Tempo de espera elevado: ${r.tempoEspera.toFixed(0)} min. Avaliar adição de grua.` });

  // Gruas
  if (r.gruasOp < 1)   recs.push({ tipo: "danger",  texto: "Sem gruas operacionais! Operação impossível. Acionar manutenção imediatamente." });
  else if (r.gruasOp < inputs.qtdGruas * 0.7) recs.push({ tipo: "warn", texto: `Disponibilidade de gruas baixa (${r.dispGrua}%). Necessário disponibilizar mais uma grua.` });

  // Capacidade
  if (r.nivelSaturacao > 100) {
    const excesso = (r.nivelSaturacao - 100).toFixed(0);
    recs.push({ tipo: "danger", texto: `Capacidade da frente será excedida em ${excesso}%. Reduzir envio de caminhões ou aumentar capacidade de gruas.` });
  }

  // Apoio mecânico
  if (r.precisaTrator && !inputs.possuiTratorApoio)
    recs.push({ tipo: "warn", texto: "Necessário trator de apoio permanente para as condições atuais (estrada/clima)." });
  if (r.precisaSkidder && !inputs.possuiSkidder)
    recs.push({ tipo: "warn", texto: "Recomendado skidder para suporte de manuseio de madeira na frente." });
  if (r.precisaEscav && !inputs.possuiEscavadeira)
    recs.push({ tipo: "warn", texto: "Condição de estrada crítica. Necessária escavadeira para recuperação e manutenção de pista." });

  // Saturação
  if (r.rho >= 1)  recs.push({ tipo: "danger", texto: `Sistema saturado (ρ = ${r.rho.toFixed(2)}). Chegada de caminhões superior à capacidade de atendimento. Fila crescerá indefinidamente.` });
  else if (r.rho >= 0.85) recs.push({ tipo: "warn", texto: `Sistema próximo do limite (ρ = ${r.rho.toFixed(2)}). Qualquer variação pode saturar a operação.` });

  // Ociosidade
  if (r.probOciosidade > 50) recs.push({ tipo: "warn", texto: `Alta ociosidade prevista (${r.probOciosidade.toFixed(0)}%). Gruas subutilizadas. Aumentar envio de caminhões.` });

  // Risco
  if (r.riscoOp >= 60)      recs.push({ tipo: "danger", texto: `Risco operacional ALTO (${r.riscoOp}%). Intervenção imediata necessária.` });
  else if (r.riscoOp >= 30) recs.push({ tipo: "warn",   texto: `Risco operacional moderado (${r.riscoOp}%). Atenção redobrada na supervisão.` });
  else                       recs.push({ tipo: "ok",    texto: `Risco operacional baixo (${r.riscoOp}%). Condições favoráveis de operação.` });

  // Produção
  if (r.deltaPerc < -15)   recs.push({ tipo: "danger",  texto: `Produção ${Math.abs(r.deltaPerc).toFixed(0)}% abaixo do ideal. Revisar configuração da frente.` });
  else if (r.deltaPerc > 5) recs.push({ tipo: "ok",     texto: `Produção ${r.deltaPerc.toFixed(0)}% acima do ideal. Manter configuração atual.` });

  const dangers = recs.filter(x => x.tipo === "danger").length;
  const warns   = recs.filter(x => x.tipo === "warn").length;

  return (
    <div>
      <div className="flex items-center gap-3 mb-3">
        <Lightbulb className="w-4 h-4 text-amber-500" />
        <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Recomendações Automáticas</h2>
        <div className="flex gap-1.5">
          {dangers > 0 && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-200">{dangers} crítico(s)</span>}
          {warns   > 0 && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200">{warns} alerta(s)</span>}
        </div>
      </div>
      <div className="space-y-2">
        {recs.sort((a, b) => { const o = { danger: 0, warn: 1, ok: 2 }; return o[a.tipo] - o[b.tipo]; }).map((r, i) => (
          <Rec key={i} tipo={r.tipo} texto={r.texto} />
        ))}
      </div>
    </div>
  );
}