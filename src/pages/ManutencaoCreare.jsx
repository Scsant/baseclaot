import { useState } from "react";
import { Wrench, LayoutDashboard, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import ManutencaoPortal from "@/components/manutencao/ManutencaoPortal";
import ControleCentral from "@/components/manutencao/ControleCentral";

export default function ManutencaoCreare() {
  const [view, setView] = useState(null); // null | "manutencao" | "central"

  if (view === "manutencao") {
    return <ManutencaoPortal onBack={() => setView(null)} />;
  }
  if (view === "central") {
    return <ControleCentral onBack={() => setView(null)} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg">
          <Wrench className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground">Manutenção Creare</h1>
          <p className="text-xs text-muted-foreground">Gestão completa de manutenção de frotas</p>
        </div>
      </div>

      {/* Cards de acesso */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl">
        {/* Manutenção */}
        <button
          onClick={() => setView("manutencao")}
          className="group relative overflow-hidden rounded-2xl border-2 border-orange-200 dark:border-orange-800 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/40 dark:to-orange-900/20 p-6 text-left hover:border-orange-400 dark:hover:border-orange-600 hover:shadow-lg transition-all"
        >
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center mb-4 shadow-md group-hover:scale-105 transition-transform">
            <Wrench className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-lg font-bold text-orange-700 dark:text-orange-400 mb-1">Manutenção</h2>
          <p className="text-sm text-muted-foreground">Abertura e gestão de chamados, registro de atendimentos e upload de FAT.</p>
          <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-orange-600 dark:text-orange-400">
            Acessar <span className="text-base">→</span>
          </div>
        </button>

        {/* Controle Central */}
        <button
          onClick={() => setView("central")}
          className="group relative overflow-hidden rounded-2xl border-2 border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/40 dark:to-blue-900/20 p-6 text-left hover:border-blue-400 dark:hover:border-blue-600 hover:shadow-lg transition-all"
        >
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mb-4 shadow-md group-hover:scale-105 transition-transform">
            <LayoutDashboard className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-lg font-bold text-blue-700 dark:text-blue-400 mb-1">Controle Central</h2>
          <p className="text-sm text-muted-foreground">Dashboard operacional, KPIs em tempo real, SLA, timeline e painel de acompanhamento.</p>
          <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-400">
            Acessar <span className="text-base">→</span>
          </div>
        </button>
      </div>
    </div>
  );
}