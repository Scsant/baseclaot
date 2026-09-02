import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { Truck, Scale, Monitor, BarChart3, ClipboardList, CheckCircle2, ArrowLeftRight, Wrench, Car, Activity, MapPinned } from "lucide-react";
import EditarNomeUsuario from "@/components/EditarNomeUsuario";

const modules = [
  {
    id: "sistema-ot",
    title: "Sistema OT",
    description: "Gerenciamento de ordens de transporte, liberações, balança e monitoramento central.",
    icon: Truck,
    color: "from-blue-500 to-blue-700",
    borderColor: "border-blue-200 dark:border-blue-800",
    hoverBg: "hover:bg-blue-50 dark:hover:bg-blue-950/20",
    path: "/balanca",
    roles: ["operador", "central", "admin"],
    subItems: [
      { label: "Balança", path: "/balanca", icon: Scale, roles: ["operador", "admin"] },
      { label: "Central", path: "/central", icon: Monitor, roles: ["central", "admin"] },
      { label: "Dashboard", path: "/dashboard", icon: BarChart3, roles: ["central", "admin"] },
      { label: "Auditoria", path: "/auditoria", icon: ClipboardList, roles: ["admin"] },
    ],
  },

  {
    id: "caminhoes",
    title: "Caminhões Disponíveis",
    description: "Controle de disponibilidade de CMs por turno. Informe quais caminhões estão disponíveis e os motivos de indisponibilidade.",
    icon: CheckCircle2,
    color: "from-emerald-500 to-emerald-700",
    borderColor: "border-emerald-200 dark:border-emerald-800",
    hoverBg: "hover:bg-emerald-50 dark:hover:bg-emerald-950/20",
    path: "/caminhoes-disponiveis",
    roles: ["operador", "central", "admin"],
    subItems: [],
  },
  {
    id: "troca-turno",
    title: "Troca de Turno",
    description: "Acompanhamento dos 14 módulos de carregamento pelo assistente de campo. Registre equipamentos, status e observações para uma passagem de turno eficiente.",
    icon: ArrowLeftRight,
    color: "from-teal-500 to-emerald-600",
    borderColor: "border-teal-200 dark:border-teal-800",
    hoverBg: "hover:bg-teal-50 dark:hover:bg-teal-950/20",
    path: "/troca-turno",
    roles: ["operador", "central", "admin"],
    subItems: [],
  },
  {
    id: "cadastro-veiculos",
    title: "Cadastro de Veículos",
    description: "Importe a planilha de frota própria e terceiros. Preenche automaticamente transportadora, frota e BTF ao digitar a placa na Balança.",
    icon: Car,
    color: "from-violet-500 to-violet-700",
    borderColor: "border-violet-200 dark:border-violet-800",
    hoverBg: "hover:bg-violet-50 dark:hover:bg-violet-950/20",
    path: "/cadastro-veiculos",
    roles: ["central", "admin"],
    subItems: [],
  },
  {
    id: "tpa",
    title: "TPA – Daily Report",
    description: "Preencha o relatório diário de turno com TPA Transporte, Prancha, Carregamento, Pareto de ofensores e envie direto para o WhatsApp.",
    icon: Activity,
    color: "from-green-500 to-emerald-700",
    borderColor: "border-green-200 dark:border-green-800",
    hoverBg: "hover:bg-green-50 dark:hover:bg-green-950/20",
    path: "/tpa",
    roles: ["operador", "central", "admin"],
    subItems: [],
  },
  {
    id: "distribuicao",
    title: "Distribuição",
    description: "Acompanhe os projetos da distribuição atual, o status de bloqueio, a localização geográfica e as condições climáticas de cada fazenda.",
    icon: MapPinned,
    color: "from-blue-500 to-cyan-600",
    borderColor: "border-blue-200 dark:border-blue-800",
    hoverBg: "hover:bg-blue-50 dark:hover:bg-blue-950/20",
    path: "/distribuicao",
    roles: ["operador", "central", "admin"],
    subItems: [],
  },
  {
    id: "manutencao-creare",
    title: "Manutenção Creare",
    description: "Gestão completa de manutenção de frotas. Chamados, status em tempo real, SLA, timeline e notificações automáticas para a Central Operacional.",
    icon: Wrench,
    color: "from-orange-500 to-red-600",
    borderColor: "border-orange-200 dark:border-orange-800",
    hoverBg: "hover:bg-orange-50 dark:hover:bg-orange-950/20",
    path: "/manutencao-creare",
    roles: ["operador", "central", "admin"],
    subItems: [],
  },
];

const ADMIN_EMAIL = "carlosjeronimo.contato@gmail.com";

export default function Home() {
  const { user, setUser } = useAuth();
  const role = user?.role || "admin";
  const isOwner = user?.email === ADMIN_EMAIL;

  const visibleModules = modules.filter((m) => m.roles.includes(role));

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-xl mx-auto mb-4">
          <Truck className="w-9 h-9 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-foreground tracking-tight">Plataforma de Transportes</h1>
        <p className="text-muted-foreground mt-2 text-sm">Selecione o módulo que deseja acessar</p>
      </div>

      {/* Editar nome — apenas para o administrador do sistema */}
      {isOwner && (
        <EditarNomeUsuario user={user} onUpdate={(novoNome) => {
          // força reload para atualizar o contexto de auth
          window.location.reload();
        }} />
      )}

      {/* Modules Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-3xl px-4">
        {visibleModules.map((mod) => {
          const Icon = mod.icon;
          const visibleSubs = mod.subItems.filter((s) => s.roles.includes(role));

          return (
            <div
              key={mod.id}
              className={`bg-card border-2 ${mod.borderColor} rounded-2xl p-6 flex flex-col gap-4 transition-all duration-200 ${mod.hoverBg} shadow-sm hover:shadow-md`}
            >
              {/* Icon + Title */}
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${mod.color} flex items-center justify-center shadow-lg shrink-0`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground">{mod.title}</h2>
                </div>
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed">{mod.description}</p>

              {/* Sub-items or single button */}
              {visibleSubs.length > 0 ? (
                <div className="flex flex-wrap gap-2 mt-auto">
                  {visibleSubs.map((sub) => {
                    const SubIcon = sub.icon;
                    return (
                      <Link
                        key={sub.path}
                        to={sub.path}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted hover:bg-primary hover:text-primary-foreground text-xs font-semibold transition-all"
                      >
                        <SubIcon className="w-3.5 h-3.5" />
                        {sub.label}
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <Link
                  to={mod.path}
                  className={`mt-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r ${mod.color} text-white text-sm font-semibold shadow hover:opacity-90 transition-all`}
                >
                  <Icon className="w-4 h-4" />
                  Acessar Módulo
                </Link>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}