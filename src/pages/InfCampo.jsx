import { useState, useEffect } from "react";
import { MapPin, TrendingUp, AlertTriangle, Trophy, LayoutGrid, List, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import InfCampoResumoExecutivo from "@/components/inf-campo/ResumoExecutivo";
import InfCampoRanking from "@/components/inf-campo/RankingModulos";
import InfCampoModuloCard from "@/components/inf-campo/ModuloCard";
import { calcularStatusOperacional } from "@/components/inf-campo/motorInteligencia";

const NUM_MODULOS = 14;

export default function InfCampo() {
  const [registros, setRegistros] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState("grid"); // "grid" | "ranking"
  const [moduloAberto, setModuloAberto] = useState(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await base44.entities.InfCampo.list("-ultima_atualizacao", 100);
      // Para cada módulo (1-14), pega o registro mais recente
      const porModulo = {};
      data.forEach((r) => {
        const n = r.modulo_numero;
        if (!porModulo[n] || new Date(r.ultima_atualizacao) > new Date(porModulo[n].ultima_atualizacao)) {
          porModulo[n] = r;
        }
      });
      setRegistros(porModulo);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const unsub = base44.entities.InfCampo.subscribe(() => loadData());
    return unsub;
  }, []);

  const modulos = Array.from({ length: NUM_MODULOS }, (_, i) => {
    const n = i + 1;
    return registros[n] || { modulo_numero: n };
  });

  const modulosComStatus = modulos.map((m) => ({
    ...m,
    _statusCalc: calcularStatusOperacional(m),
  }));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center shadow-lg">
            <MapPin className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">INF. CAMPO</h1>
            <p className="text-xs text-muted-foreground">Monitoramento Operacional dos Módulos de Carregamento</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setView("grid")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${view === "grid" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/70"}`}
          >
            <LayoutGrid className="w-3.5 h-3.5" /> Módulos
          </button>
          <button
            onClick={() => setView("ranking")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${view === "ranking" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/70"}`}
          >
            <Trophy className="w-3.5 h-3.5" /> Ranking
          </button>
        </div>
      </div>

      {/* Resumo Executivo */}
      <InfCampoResumoExecutivo modulos={modulosComStatus} />

      {/* Grid de módulos ou ranking */}
      {view === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {modulosComStatus.map((mod) => (
            <InfCampoModuloCard
              key={mod.modulo_numero}
              modulo={mod}
              expanded={moduloAberto === mod.modulo_numero}
              onToggle={() => setModuloAberto(moduloAberto === mod.modulo_numero ? null : mod.modulo_numero)}
              onSave={loadData}
            />
          ))}
        </div>
      ) : (
        <InfCampoRanking modulos={modulosComStatus} onSelect={(n) => { setModuloAberto(n); setView("grid"); }} />
      )}
    </div>
  );
}