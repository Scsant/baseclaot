import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/AuthContext";
import SolicitacaoForm from "@/components/balanca/SolicitacaoForm";
import SolicitacaoCard from "@/components/balanca/SolicitacaoCard";
import ProjetosBloqueadosAlert from "@/components/balanca/ProjetosBloqueadosAlert";
import PainelMotoristasEmbed from "@/components/balanca/PainelMotoristasEmbed";
import { Input } from "@/components/ui/input";
import AjudaModal from "@/components/ui/AjudaModal";
import { Scale, Search, Loader2, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import ChatPanel from "@/components/chat/ChatPanel";

export default function Balanca() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [showPainel, setShowPainel] = useState(false);

  const { data: solicitacoes = [], isLoading } = useQuery({
    queryKey: ["solicitacoes-balanca"],
    queryFn: () => base44.entities.SolicitacaoOT.list("-created_date", 100),
    refetchInterval: 5000,
  });

  const [placaDuplicada, setPlacaDuplicada] = useState(null);

  const createMutation = useMutation({
    mutationFn: (data) => {
      const ativas = solicitacoes.filter(s => s.status !== "cancelada" && s.status !== "liberada");
      const duplicada = ativas.find(s => s.placa?.toUpperCase() === data.placa?.toUpperCase());
      if (duplicada) {
        setPlacaDuplicada(data.placa?.toUpperCase());
        throw new Error("Placa já possui solicitação ativa");
      }
      setPlacaDuplicada(null);
      const payload = { ...data, status: "aguardando", data_solicitacao: new Date().toISOString(), usuario_solicitante: user?.full_name || "Operador" };
      if (!payload.cm) delete payload.cm;
      return base44.entities.SolicitacaoOT.create(payload);
    },
    onSuccess: (created, variables) => {
      queryClient.invalidateQueries({ queryKey: ["solicitacoes-balanca"] });
      base44.entities.AuditoriaLog.create({
        acao: "solicitacao",
        usuario: user?.full_name || "Operador",
        cm: variables.cm,
        placa: variables.placa,
        transportadora: variables.transportadora,
        solicitacao_id: created.id,
        data_acao: new Date().toISOString(),
      });
    },
  });

  const filtered = solicitacoes.filter((s) => {
    const q = search.toLowerCase();
    return (
      !q ||
      s.cm?.toLowerCase().includes(q) ||
      s.placa?.toLowerCase().includes(q) ||
      s.transportadora?.toLowerCase().includes(q) ||
      s.numero_ot?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
            <Scale className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Balança</h1>
            <p className="text-xs text-muted-foreground">Solicitar Ordens de Transporte</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setShowPainel((v) => !v)}
            variant={showPainel ? "default" : "outline"}
            className="gap-2"
          >
            <Truck className="w-4 h-4" />
            Painel Motoristas
          </Button>
          <AjudaModal />
        </div>
      </div>

      {/* Alerta Projetos Bloqueados */}
      <ProjetosBloqueadosAlert />

      {/* Form */}
      <SolicitacaoForm onSubmit={(data) => createMutation.mutate(data)} isSubmitting={createMutation.isPending} placaDuplicada={placaDuplicada} />

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Pesquisar por CM, placa, transportadora ou OT..."
          className="pl-10 h-10"
        />
      </div>

      {/* Cards Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <Scale className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground">Nenhuma solicitação encontrada</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((s) => (
            <SolicitacaoCard key={s.id} solicitacao={s} />
          ))}
        </div>
      )}
      {/* Painel Motoristas */}
      {showPainel && <PainelMotoristasEmbed />}

      {/* Chat */}
      <ChatPanel />
    </div>
  );
}