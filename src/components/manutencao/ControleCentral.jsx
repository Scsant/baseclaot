import { useState, useEffect } from "react";
import { ArrowLeft, LayoutDashboard, ClipboardList, Settings, BarChart3, Clock, Upload, TrendingUp, Bell, Monitor, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import DashboardKPIs from "./DashboardKPIs";
import TimelineEventos from "./TimelineEventos";
import HistoricoNotificacoes from "./HistoricoNotificacoes";
import RelatorioManutencao from "./RelatorioManutencao";
import PainelAcompanhamento from "./PainelAcompanhamento";
import GestaoStatusChamados from "./GestaoStatusChamados";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "chamados", label: "Gestão de Chamados", icon: ClipboardList },
  { id: "status", label: "Gestão de Status", icon: Settings },
  { id: "sla", label: "Controle de SLA", icon: Clock },
  { id: "timeline", label: "Timeline", icon: Clock },
  { id: "painel", label: "Painel", icon: Monitor },
  { id: "relatorios", label: "Relatórios", icon: BarChart3 },
  { id: "indicadores", label: "Indicadores", icon: TrendingUp },
  { id: "notificacoes", label: "Notificações", icon: Bell },
];

export default function ControleCentral({ onBack }) {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [chamados, setChamados] = useState([]);
  const [notificacoes, setNotificacoes] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadAll = async () => {
    const [ch, nt] = await Promise.all([
      base44.entities.ChamadoManutencao.list("-updated_date", 200),
      base44.entities.NotificacaoManutencao.list("-data_notificacao", 100),
    ]);
    setChamados(ch);
    setNotificacoes(nt);
    setLoading(false);
  };

  useEffect(() => {
    loadAll();
    const u1 = base44.entities.ChamadoManutencao.subscribe(() => loadAll());
    const u2 = base44.entities.NotificacaoManutencao.subscribe(() => loadAll());
    return () => { u1(); u2(); };
  }, []);

  const unreadCount = notificacoes.filter(n => !n.visualizada).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack} className="h-9 w-9">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow">
          <LayoutDashboard className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1">
          <h1 className="text-lg font-bold text-foreground">Controle Central — Manutenção Creare</h1>
          <p className="text-xs text-muted-foreground">Visão em tempo real de todos os chamados</p>
        </div>
        {unreadCount > 0 && (
          <button onClick={() => setActiveTab("notificacoes")} className="relative flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-100 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-400 text-xs font-bold hover:bg-emerald-200 dark:hover:bg-emerald-950/60 transition-colors">
            <Bell className="w-4 h-4" />
            {unreadCount} nova{unreadCount > 1 ? "s" : ""}
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 text-white text-[9px] font-black rounded-full flex items-center justify-center animate-pulse">{unreadCount}</span>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1">
        {TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all shrink-0",
                isActive
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:bg-muted"
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
              {tab.id === "notificacoes" && unreadCount > 0 && (
                <span className="bg-emerald-500 text-white text-[9px] font-black rounded-full w-4 h-4 flex items-center justify-center">{unreadCount}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div>
        {activeTab === "dashboard" && (
          <div className="space-y-5">
            <DashboardKPIs chamados={chamados} />
            <TimelineEventos chamados={chamados} />
          </div>
        )}
        {activeTab === "chamados" && <GestaoStatusChamados chamados={chamados} onRefresh={loadAll} mode="gestao" />}
        {activeTab === "status" && <GestaoStatusChamados chamados={chamados} onRefresh={loadAll} mode="status" />}
        {activeTab === "sla" && <GestaoStatusChamados chamados={chamados} onRefresh={loadAll} mode="sla" />}
        {activeTab === "timeline" && <TimelineEventos chamados={chamados} />}
        {activeTab === "painel" && <PainelAcompanhamento />}
        {activeTab === "relatorios" && <RelatorioManutencao chamados={chamados} />}
        {activeTab === "indicadores" && <RelatorioManutencao chamados={chamados} />}
        {activeTab === "notificacoes" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-foreground">Histórico de Notificações</h3>
              {unreadCount > 0 && (
                <Button size="sm" variant="outline" onClick={async () => {
                  const unread = notificacoes.filter(n => !n.visualizada);
                  await Promise.all(unread.map(n => base44.entities.NotificacaoManutencao.update(n.id, { visualizada: true, data_visualizacao: new Date().toISOString() })));
                  loadAll();
                }} className="text-xs">
                  Marcar todas como lidas
                </Button>
              )}
            </div>
            <HistoricoNotificacoes notificacoes={notificacoes} onRefresh={loadAll} />
          </div>
        )}
      </div>
    </div>
  );
}