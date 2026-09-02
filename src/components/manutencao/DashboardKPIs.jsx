import { Clock, Wrench, CheckCircle2, AlertTriangle } from "lucide-react";

export default function DashboardKPIs({ chamados }) {
  const hoje = new Date().toDateString();

  const aguardando = chamados.filter(c => c.status === "aguardando").length;
  const emManutencao = chamados.filter(c => ["deslocamento", "em_manutencao", "aguardando_peca", "teste_operacional"].includes(c.status)).length;
  const liberadosHoje = chamados.filter(c => c.status === "liberado" && new Date(c.data_conclusao).toDateString() === hoje).length;
  const slaEstourado = chamados.filter(c => c.sla_estourado && c.status !== "liberado" && c.status !== "cancelado").length;

  const cards = [
    {
      label: "Aguardando Manutenção",
      value: aguardando,
      icon: Clock,
      color: "border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-950/30",
      valueColor: "text-blue-700 dark:text-blue-400",
      iconBg: "bg-blue-500",
    },
    {
      label: "Em Manutenção",
      value: emManutencao,
      icon: Wrench,
      color: "border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/30",
      valueColor: "text-amber-700 dark:text-amber-400",
      iconBg: "bg-amber-500",
    },
    {
      label: "Liberados Hoje",
      value: liberadosHoje,
      icon: CheckCircle2,
      color: "border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/30",
      valueColor: "text-emerald-700 dark:text-emerald-400",
      iconBg: "bg-emerald-500",
    },
    {
      label: "SLA Estourado",
      value: slaEstourado,
      icon: AlertTriangle,
      color: "border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-950/30",
      valueColor: "text-red-700 dark:text-red-400",
      iconBg: "bg-red-500",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div key={card.label} className={`rounded-2xl border-2 p-4 ${card.color}`}>
            <div className="flex items-center justify-between mb-3">
              <div className={`w-8 h-8 rounded-lg ${card.iconBg} flex items-center justify-center`}>
                <Icon className="w-4 h-4 text-white" />
              </div>
            </div>
            <p className={`text-3xl font-black ${card.valueColor}`}>{card.value}</p>
            <p className="text-xs text-muted-foreground font-semibold mt-0.5">{card.label}</p>
          </div>
        );
      })}
    </div>
  );
}