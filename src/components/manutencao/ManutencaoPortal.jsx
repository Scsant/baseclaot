import { useState, useEffect } from "react";
import { ArrowLeft, Plus, Search, Wrench, Loader2, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { base44 } from "@/api/base44Client";
import ChamadoCard from "./ChamadoCard";
import ChamadoForm from "./ChamadoForm";
import { STATUS_CONFIG } from "./StatusBadgeMnt";

const STATUS_FILTER_OPTIONS = [
  { value: "todos", label: "Todos" },
  { value: "aguardando", label: "Aguardando" },
  { value: "em_manutencao", label: "Em Manutenção" },
  { value: "aguardando_chamado", label: "Aguardando Chamado" },
  { value: "desistencia", label: "Desistência" },
  { value: "liberado", label: "Liberado" },
];

export default function ManutencaoPortal({ onBack }) {
  const [chamados, setChamados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("todos");

  const load = async () => {
    setLoading(true);
    const data = await base44.entities.ChamadoManutencao.list("-data_abertura", 100);
    setChamados(data);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // Realtime
    const unsub = base44.entities.ChamadoManutencao.subscribe(() => load());
    return unsub;
  }, []);

  const filtered = chamados.filter(c => {
    const matchSearch = !search || c.placa?.toLowerCase().includes(search.toLowerCase()) || c.cm?.toLowerCase().includes(search.toLowerCase()) || c.numero_chamado?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "todos" || c.status === filterStatus;
    return matchSearch && matchStatus;
  });

  // SLA check
  useEffect(() => {
    chamados.forEach(async (c) => {
      if (c.status === "liberado" || c.status === "cancelado" || c.sla_estourado) return;
      if (!c.data_abertura || !c.sla_horas) return;
      const elapsed = (Date.now() - new Date(c.data_abertura)) / 3600000;
      if (elapsed > c.sla_horas) {
        await base44.entities.ChamadoManutencao.update(c.id, { sla_estourado: true });
      }
    });
  }, [chamados]);

  const ativos = chamados.filter(c => c.status !== "liberado" && c.status !== "cancelado").length;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack} className="h-9 w-9">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow">
          <Wrench className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1">
          <h1 className="text-lg font-bold text-foreground">Gestão de Manutenção</h1>
          <p className="text-xs text-muted-foreground">{ativos} manutenções ativas em andamento</p>
        </div>
        <Link to="/manutencao-painel" target="_blank">
          <Button size="sm" variant="outline" className="gap-2">
            <ExternalLink className="w-4 h-4" /> Painel
          </Button>
        </Link>
        <Button size="sm" onClick={() => setShowForm(v => !v)} className="bg-orange-600 hover:bg-orange-700 gap-2">
          <Plus className="w-4 h-4" /> {showForm ? "Fechar" : "Nova Manutenção"}
        </Button>
      </div>

      {showForm && <ChamadoForm onSaved={() => { setShowForm(false); load(); }} onClose={() => setShowForm(false)} />}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por placa, CM ou chamado..." className="pl-9 h-9" />
        </div>
        <div className="flex gap-1 flex-wrap">
          {STATUS_FILTER_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => setFilterStatus(opt.value)}
              className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
                filterStatus === opt.value
                  ? "bg-foreground text-background border-foreground"
                  : "border-border text-muted-foreground hover:bg-muted"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Wrench className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="font-semibold">Nenhuma manutenção encontrada</p>
          <p className="text-xs mt-1">Registre uma nova manutenção para começar</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(c => (
            <ChamadoCard key={c.id} chamado={c} onStatusChange={load} />
          ))}
        </div>
      )}
    </div>
  );
}