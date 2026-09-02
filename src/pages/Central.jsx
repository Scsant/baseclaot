import { useState, useMemo, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/AuthContext";
import KpiCard from "@/components/ui/KpiCard";
import CentralCard from "@/components/central/CentralCard";
import LiberarModal from "@/components/central/LiberarModal";
import DistribuicaoModal from "@/components/central/DistribuicaoModal";
import DesviosModal from "@/components/central/DesviosModal";
import ConfigEmailsModal from "@/components/central/ConfigEmailsModal";
import AlertaUtilizacaoCard from "@/components/central/AlertaUtilizacaoCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Monitor, Clock, CheckCircle2, AlertTriangle, Timer, Search, Loader2, MapPin, Truck, ArrowRightLeft, Settings, History } from "lucide-react";
import CardAguardandoChamado from "@/components/manutencao/CardAguardandoChamado";
import { TURNOS, getTurnoAtual, filtrarPorTurno } from "@/lib/turnos";
import ChatPanel from "@/components/chat/ChatPanel";
import { useAlertaTurno } from "@/hooks/useAlertaTurno";
import AjudaModal from "@/components/ui/AjudaModal";
import HistoricoBloqueiosModal from "@/components/central/HistoricoBloqueiosModal";
import AlertaChuvaProjetos from "@/components/central/AlertaChuvaProjetos";

function getMinutesAgo(dateStr) {
  if (!dateStr) return 0;
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
}

export default function Central() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [turnoFilter, setTurnoFilter] = useState(getTurnoAtual());
  const [showDistribuicao, setShowDistribuicao] = useState(false);
  const [showDesvios, setShowDesvios] = useState(false);
  const [showConfigEmails, setShowConfigEmails] = useState(false);
  const [showHistoricoBloqueios, setShowHistoricoBloqueios] = useState(false);
  const [desvioFilter, setDesvioFilter] = useState(false);
  const [modulosBaixaUtilizacao, setModulosBaixaUtilizacao] = useState([]);

  const { data: solicitacoes = [], isLoading } = useQuery({
    queryKey: ["solicitacoes-central"],
    queryFn: async () => {
      const listas = await Promise.all(
        ["aguardando", "pendente", "liberada", "cancelada"].map((status) =>
          base44.entities.SolicitacaoOT.filter({ status }, "-created_date", 500)
        )
      );
      return listas.flat();
    },
    refetchInterval: 5000,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });

  useAlertaTurno(solicitacoes);

  useEffect(() => {
    const unsubscribe = base44.entities.SolicitacaoOT.subscribe(() => {
      queryClient.invalidateQueries({ queryKey: ["solicitacoes-central"] });
    });
    return unsubscribe;
  }, [queryClient]);

  // Carregar dados de TrocaTurno e verificar utilização
  useEffect(() => {
    try {
      const dataStr = localStorage.getItem("troca_turno_modulos");
      if (dataStr) {
        const modulos = JSON.parse(dataStr);
        const baixaUtilizacao = modulos
          .map((m) => {
            const equipamentos = m.equipamentos || [];
            const total = equipamentos.length;
            const operando = equipamentos.filter((e) => e.status === "operando").length;
            const taxa = total > 0 ? Math.round((operando / total) * 100) : 0;
            return { ...m, taxa };
          })
          .filter((m) => m.taxa < 65 && m.equipamentos && m.equipamentos.length > 0)
          .filter((m) => m.equipamentos.some((e) => e.status !== "standby"));
        
        setModulosBaixaUtilizacao(baixaUtilizacao);
      }
    } catch (error) {
      console.error("Erro ao carregar dados de TrocaTurno:", error);
    }
  }, []);

  const logAuditoria = (acao, s, extra = {}) => {
    base44.entities.AuditoriaLog.create({
      acao,
      usuario: user?.full_name || "Central",
      cm: s.cm,
      placa: s.placa,
      frota: s.frota,
      btf: s.btf,
      transportadora: s.transportadora,
      numero_ot: extra.numero_ot ?? s.numero_ot,
      solicitacao_id: s.id,
      data_acao: new Date().toISOString(),
      ...extra,
    });
  };

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.SolicitacaoOT.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["solicitacoes-central"] });
      setSelected(null);
    },
  });

  const handleLiberar = (s, ot) => {
    let pendenciaTotal = s.tempo_pendencia_minutos || 0;
    if (s.status === "pendente" && s.data_pendencia) {
      pendenciaTotal += getMinutesAgo(s.data_pendencia);
    }
    const waitMinutes = Math.max(0, getMinutesAgo(s.data_solicitacao) - pendenciaTotal);
    updateMutation.mutate({
      id: s.id,
      data: {
        status: "liberada",
        numero_ot: ot,
        data_liberacao: new Date().toISOString(),
        usuario_liberacao: user?.full_name || "Central",
        tempo_espera_minutos: waitMinutes,
      },
    });
    logAuditoria("liberacao", s, { numero_ot: ot, tempo_espera_minutos: waitMinutes });
  };

  const handleCancelar = (s) => {
    updateMutation.mutate({
      id: s.id,
      data: { status: "cancelada" },
    });
    logAuditoria("cancelamento", s);
  };

  const handlePendencia = (s, motivo) => {
    updateMutation.mutate({
      id: s.id,
      data: { status: "pendente", motivo_pendencia: motivo, data_pendencia: new Date().toISOString() },
    });
    logAuditoria("pendencia", s, { motivo });
  };

  const handleReativar = (s) => {
    const pendenciaMinutos = s.data_pendencia ? getMinutesAgo(s.data_pendencia) : 0;
    updateMutation.mutate({
      id: s.id,
      data: {
        status: "aguardando",
        motivo_pendencia: "",
        tempo_pendencia_minutos: (s.tempo_pendencia_minutos || 0) + pendenciaMinutos,
      },
    });
    logAuditoria("reativacao", s);
  };

  // KPIs — baseados no turno selecionado
  const kpis = useMemo(() => {
    const doTurno = turnoFilter === 0 ? solicitacoes : filtrarPorTurno(solicitacoes, turnoFilter, "data_solicitacao");
    const pendentes = doTurno.filter((s) => s.status === "aguardando").length;
    const liberadasTurno = doTurno.filter((s) => s.status === "liberada").length;
    const liberadas = doTurno.filter((s) => s.status === "liberada" && s.tempo_espera_minutos);
    const tempoMedio = liberadas.length
      ? Math.round(liberadas.reduce((a, s) => a + s.tempo_espera_minutos, 0) / liberadas.length)
      : 0;
    const atrasadas = doTurno.filter(
      (s) => s.status === "aguardando" && getMinutesAgo(s.data_solicitacao) > 15
    ).length;
    return { pendentes, liberadasTurno, tempoMedio, atrasadas };
  }, [solicitacoes, turnoFilter]);

  // Filter and sort
  const filtered = useMemo(() => {
    let list = turnoFilter === 0
      ? solicitacoes
      : filtrarPorTurno(solicitacoes, turnoFilter, "data_solicitacao");
    if (desvioFilter) {
      list = list.filter((s) => s.is_desvio);
    } else if (statusFilter !== "all") {
      list = list.filter((s) => s.status === statusFilter);
    }
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (s) =>
          s.cm?.toLowerCase().includes(q) ||
          s.placa?.toLowerCase().includes(q) ||
          s.transportadora?.toLowerCase().includes(q) ||
          s.numero_ot?.toLowerCase().includes(q)
      );
    }
    // Sort: aguardando first (oldest), then rest by newest
    return [...list].sort((a, b) => {
      if (a.status === "aguardando" && b.status !== "aguardando") return -1;
      if (a.status !== "aguardando" && b.status === "aguardando") return 1;
      if (a.status === "aguardando" && b.status === "aguardando") {
        return new Date(a.data_solicitacao) - new Date(b.data_solicitacao);
      }
      return new Date(b.created_date) - new Date(a.created_date);
    });
  }, [solicitacoes, statusFilter, search, desvioFilter, turnoFilter]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
            <Monitor className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Central de Monitoramento</h1>
            <p className="text-xs text-muted-foreground">Gerenciamento de liberações</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => window.open("/painel", "_blank")} className="gap-2 shrink-0">
            <Truck className="w-4 h-4" />
            Painel Motoristas
          </Button>
          <Button variant="outline" onClick={() => setShowDistribuicao(true)} className="gap-2 shrink-0">
            <MapPin className="w-4 h-4" />
            Distribuição
          </Button>
          <Button variant="outline" onClick={() => setShowDesvios(true)} className="gap-2 shrink-0 border-orange-300 text-orange-600 hover:bg-orange-50 dark:border-orange-700 dark:text-orange-400">
            <ArrowRightLeft className="w-4 h-4" />
            Desvios
          </Button>
          <Button variant="outline" onClick={() => setShowHistoricoBloqueios(true)} className="gap-2 shrink-0 border-red-300 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400">
            <History className="w-4 h-4" />
            Bloqueios
          </Button>
          <Button variant="outline" onClick={() => setShowConfigEmails(true)} className="gap-2 shrink-0" title="Configurar emails de alerta">
            <Settings className="w-4 h-4" />
          </Button>
          <AjudaModal />
        </div>
      </div>

      <AlertaChuvaProjetos />

      {/* Turno Selector */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mr-1">Turno:</span>
        <button
          onClick={() => setTurnoFilter(0)}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all ${
            turnoFilter === 0
              ? "bg-foreground text-background border-foreground"
              : "border-border text-muted-foreground hover:bg-muted"
          }`}
        >
          Todos
        </button>
        {TURNOS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTurnoFilter(t.id)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all ${
              turnoFilter === t.id
                ? t.color === "blue"
                  ? "bg-blue-500 text-white border-blue-500"
                  : t.color === "amber"
                  ? "bg-amber-500 text-white border-amber-500"
                  : "bg-purple-500 text-white border-purple-500"
                : "border-border text-muted-foreground hover:bg-muted"
            }`}
          >
            {t.icon} {t.label} <span className="opacity-70 ml-1">{t.horario}</span>
          </button>
        ))}
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard title="Pendentes" value={kpis.pendentes} icon={Clock} color="amber" />
        <KpiCard title="Liberadas no Turno" value={kpis.liberadasTurno} icon={CheckCircle2} color="green" />
        <KpiCard title="Tempo Médio" value={`${kpis.tempoMedio} min`} icon={Timer} color="blue" />
        <KpiCard title="Em Atraso" value={kpis.atrasadas} icon={AlertTriangle} color="red" />
      </div>

      {/* Alerta de Utilização */}
      <AlertaUtilizacaoCard modulosBaixaUtilizacao={modulosBaixaUtilizacao} />

      {/* CMs Aguardando Chamado de Manutenção */}
      <CardAguardandoChamado />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Pesquisar CM, placa, transportadora, OT..."
            className="pl-10 h-10"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Tabs value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setDesvioFilter(false); }}>
            <TabsList>
              <TabsTrigger value="all">Todos</TabsTrigger>
              <TabsTrigger value="aguardando">Pendentes</TabsTrigger>
              <TabsTrigger value="pendente">Com Pendência</TabsTrigger>
              <TabsTrigger value="liberada">Liberadas</TabsTrigger>
              <TabsTrigger value="cancelada">Canceladas</TabsTrigger>
            </TabsList>
          </Tabs>
          <button
            onClick={() => { setDesvioFilter((v) => !v); setStatusFilter("all"); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
              desvioFilter
                ? "bg-orange-500 text-white border-orange-500"
                : "border-orange-300 text-orange-600 hover:bg-orange-50 dark:border-orange-700 dark:text-orange-400"
            }`}
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            Somente Desvios
          </button>
        </div>
      </div>

      {/* Cards Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <Monitor className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground">Nenhuma solicitação encontrada</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((s) => (
            <CentralCard key={s.id} solicitacao={s} onClick={setSelected} />
          ))}
        </div>
      )}

      {/* Distribuição Modal */}
      <DistribuicaoModal open={showDistribuicao} onClose={() => setShowDistribuicao(false)} />

      {/* Desvios Modal */}
      <DesviosModal open={showDesvios} onClose={() => setShowDesvios(false)} />

      {/* Config Emails Modal */}
      <ConfigEmailsModal open={showConfigEmails} onClose={() => setShowConfigEmails(false)} />

      {/* Histórico de Bloqueios Modal */}
      <HistoricoBloqueiosModal open={showHistoricoBloqueios} onClose={() => setShowHistoricoBloqueios(false)} />

      {/* Chat */}
      <ChatPanel />

      {/* Modal */}
      <LiberarModal
        solicitacao={selected}
        open={!!selected}
        onClose={() => setSelected(null)}
        onLiberar={handleLiberar}
        onCancelar={handleCancelar}
        onPendencia={handlePendencia}
        onReativar={handleReativar}
        isProcessing={updateMutation.isPending}
      />
    </div>
  );
}