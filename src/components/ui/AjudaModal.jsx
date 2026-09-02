import { useState } from "react";
import { HelpCircle, X, Scale, Monitor, Truck, ChevronRight, CheckCircle2, Clock, AlertTriangle, ArrowRightLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const FLUXO = [
  {
    step: 1,
    icon: Scale,
    color: "from-blue-500 to-blue-600",
    tela: "Balança",
    titulo: "Operador registra o caminhão na Balança",
    descricao: "O operador da balança pesa o caminhão e registra a solicitação de OT no sistema.",
    acoes: [
      "Acesse a página Balança no menu superior.",
      "Clique em Nova Solicitação.",
      "Informe o CM (código do caminhão), placa e transportadora.",
      "Adicione observações se necessário (ex: tipo de conjunto).",
      "Clique em Enviar Solicitação.",
      "O status ficará como Aguardando até a Central liberar.",
    ],
    dica: "O CM é obrigatório. A solicitação aparecerá automaticamente na tela da Central.",
  },
  {
    step: 2,
    icon: Monitor,
    color: "from-violet-500 to-purple-600",
    tela: "Central de Monitoramento",
    titulo: "Central analisa e libera (ou bloqueia) a OT",
    descricao: "O analista da central visualiza todas as solicitações em tempo real e decide a liberação.",
    acoes: [
      "Acesse Central de Monitoramento no menu.",
      "Filtre por turno ou por status (Pendentes / Liberadas / Canceladas).",
      "Clique no card do caminhão para abrir o painel de ação.",
      "Informe o número da OT e clique em Liberar OT.",
      "Se necessário, marque como Pendente informando o motivo (documentação, problema mecânico, etc.).",
      "Para desviar o caminhão para outra fazenda, use o botão Desvio dentro do card.",
      "Para cancelar, clique em Cancelar.",
    ],
    dica: "Cards em vermelho piscando indicam caminhões aguardando há mais de 15 minutos. Priorize-os!",
  },
  {
    step: 3,
    icon: Truck,
    color: "from-emerald-500 to-green-600",
    tela: "Painel dos Motoristas",
    titulo: "Motorista consulta sua OT liberada",
    descricao: "O painel público é exibido para os motoristas verem se sua OT foi liberada.",
    acoes: [
      "Acesse /painel no navegador (sem precisar de login).",
      "O painel atualiza automaticamente a cada 15 segundos.",
      "OTs liberadas aparecem em verde com o número da OT, destino e horário.",
      "OTs pendentes aparecem em laranja com o motivo do bloqueio.",
      "O motorista localiza seu CM ou placa na lista.",
      "Ao encontrar a OT liberada, o motorista pode seguir para o destino informado.",
    ],
    dica: "O painel toca um alerta sonoro sempre que uma nova OT é liberada.",
  },
];

const EXTRAS = [
  {
    icon: ArrowRightLeft,
    color: "text-orange-500",
    titulo: "Desvios de Caminhão",
    texto: "Use o botão Desvios na Central para registrar quando um caminhão é redirecionado para outra fazenda. Informe fazenda de origem, destino e motivo.",
  },
  {
    icon: AlertTriangle,
    color: "text-red-500",
    titulo: "Pendências",
    texto: "Caminhões com problemas (documentação, mecânico, etc.) ficam com status Pendente em laranja. A Central pode reativá-los a qualquer momento.",
  },
  {
    icon: Clock,
    color: "text-amber-500",
    titulo: "Alertas de Turno",
    texto: "O sistema envia e-mail automático 10 minutos antes do fim de cada turno com resumo de desvios e projetos bloqueados.",
  },
];

export default function AjudaModal() {
  const [open, setOpen] = useState(false);
  const [stepAtivo, setStepAtivo] = useState(0);

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="gap-2 border-blue-300 text-blue-600 hover:bg-blue-50 dark:border-blue-700 dark:text-blue-400 dark:hover:bg-blue-950/30"
      >
        <HelpCircle className="w-4 h-4" />
        Ajuda
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-gradient-to-r from-slate-700 to-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
                  <HelpCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-base font-black text-white">Como usar o Sistema de OT</h2>
                  <p className="text-xs text-white/60">Guia completo do fluxo operacional</p>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="text-white/60 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Stepper */}
            <div className="flex items-center gap-0 px-6 pt-5 pb-4 border-b border-border">
              {FLUXO.map((f, i) => {
                const Icon = f.icon;
                const isActive = stepAtivo === i;
                const isDone = stepAtivo > i;
                return (
                  <div key={i} className="flex items-center flex-1">
                    <button
                      onClick={() => setStepAtivo(i)}
                      className={`flex flex-col items-center gap-1.5 flex-1 transition-all`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isActive ? `bg-gradient-to-br ${f.color} shadow-lg` : isDone ? "bg-emerald-500" : "bg-muted"}`}>
                        {isDone ? <CheckCircle2 className="w-5 h-5 text-white" /> : <Icon className={`w-5 h-5 ${isActive ? "text-white" : "text-muted-foreground"}`} />}
                      </div>
                      <span className={`text-[10px] font-bold hidden sm:block ${isActive ? "text-foreground" : "text-muted-foreground"}`}>{f.tela}</span>
                    </button>
                    {i < FLUXO.length - 1 && (
                      <ChevronRight className={`w-4 h-4 mx-1 shrink-0 ${stepAtivo > i ? "text-emerald-500" : "text-muted-foreground/40"}`} />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Conteúdo */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
              {stepAtivo < FLUXO.length ? (
                (() => {
                  const f = FLUXO[stepAtivo];
                  const Icon = f.icon;
                  return (
                    <div className="space-y-4">
                      <div className={`flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r ${f.color}`}>
                        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-white/70 uppercase tracking-wider">Etapa {f.step} de {FLUXO.length}</p>
                          <h3 className="text-base font-black text-white">{f.titulo}</h3>
                          <p className="text-xs text-white/80 mt-0.5">{f.descricao}</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Passo a passo</p>
                        {f.acoes.map((acao, i) => (
                          <div key={i} className="flex items-start gap-3 p-3 bg-muted/40 rounded-xl">
                            <span className="w-5 h-5 rounded-full bg-card border-2 border-border text-[10px] font-black text-muted-foreground flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                            <p className="text-sm text-foreground">{acao}</p>
                          </div>
                        ))}
                      </div>

                      <div className="flex items-start gap-2 px-4 py-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-700 rounded-xl">
                        <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                        <p className="text-xs text-amber-700 dark:text-amber-400 font-medium">{f.dica}</p>
                      </div>
                    </div>
                  );
                })()
              ) : (
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-foreground">Informações Adicionais</h3>
                  {EXTRAS.map((e, i) => {
                    const Icon = e.icon;
                    return (
                      <div key={i} className="flex items-start gap-3 p-4 bg-muted/40 rounded-xl">
                        <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${e.color}`} />
                        <div>
                          <p className="text-sm font-bold text-foreground">{e.titulo}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{e.texto}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-muted/20">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setStepAtivo(Math.max(0, stepAtivo - 1))}
                disabled={stepAtivo === 0}
              >
                ← Anterior
              </Button>
              <div className="flex gap-1.5">
                {[...FLUXO, { step: 4 }].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setStepAtivo(i)}
                    className={`w-2 h-2 rounded-full transition-all ${stepAtivo === i ? "bg-primary w-5" : "bg-muted-foreground/30"}`}
                  />
                ))}
              </div>
              {stepAtivo < FLUXO.length - 1 ? (
                <Button size="sm" onClick={() => setStepAtivo(stepAtivo + 1)}>
                  Próximo →
                </Button>
              ) : stepAtivo === FLUXO.length - 1 ? (
                <Button size="sm" variant="outline" onClick={() => setStepAtivo(FLUXO.length)}>
                  Extras →
                </Button>
              ) : (
                <Button size="sm" onClick={() => setOpen(false)} className="bg-emerald-600 hover:bg-emerald-700">
                  Entendido ✓
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}