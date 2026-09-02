import { useEffect, useState } from "react";
import { AlertTriangle, Lock, Clock, Gauge } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function ProjetosBloqueadosAlert() {
  const [bloqueados, setBloqueados] = useState([]);
  const [cadenciados, setCadenciados] = useState([]);
  const [lastSavedBy, setLastSavedBy] = useState(null);
  const [lastSavedAt, setLastSavedAt] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const records = await base44.entities.Distribuicao.list("-updated_date", 1);
        if (records && records.length > 0) {
          const rec = records[0];
          const btfs = rec.btfs || {};
          const seen = new Set();
          const lista = Object.entries(btfs)
            .filter(([k, v]) => k.startsWith("linha_") && v?.bloqueado && v?.fazenda)
            .map(([, v]) => ({ fazenda: v.fazenda, modulo: v.modulo || "", motivo: v.motivo_bloqueio || "", bloqueio_em: v.bloqueio_em || null }))
            .filter(({ fazenda, modulo }) => {
              const key = `${fazenda}||${modulo}`;
              if (seen.has(key)) return false;
              seen.add(key);
              return true;
            });
          const listaCadenciados = Object.entries(btfs)
            .filter(([k, v]) => k.startsWith("linha_") && v?.cadenciado && v?.fazenda)
            .map(([, v]) => ({ fazenda: v.fazenda, modulo: v.modulo || "", motivo: v.motivo_cadenciamento || "", cadenciamento_em: v.cadenciamento_em || null }));
          setBloqueados(lista);
          setCadenciados(listaCadenciados);
          setLastSavedBy(rec.last_saved_by || null);
          setLastSavedAt(rec.last_saved_at || null);
        } else {
          setBloqueados([]);
          setCadenciados([]);
        }
      } catch {}
    }
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (bloqueados.length === 0 && cadenciados.length === 0) return null;

  const atualizadoEm = lastSavedBy && lastSavedAt ? (
    <div className="flex items-center gap-1 text-[10px] opacity-80">
      <Clock className="w-3 h-3" />
      <span>Atualizado por <strong>{lastSavedBy}</strong> em {new Date(lastSavedAt).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}</span>
    </div>
  ) : null;

  return (
    <div className="space-y-3">
      {bloqueados.length > 0 && (
        <div className="rounded-xl border-2 border-red-400 bg-red-50 dark:bg-red-950/20 dark:border-red-700 p-4">
          <div className="flex items-center justify-between gap-2 mb-3 flex-wrap text-red-500 dark:text-red-400">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <h3 className="font-bold text-sm text-red-700 dark:text-red-400 uppercase tracking-wider">Projetos Bloqueados ({bloqueados.length})</h3>
            </div>
            {atualizadoEm}
          </div>
          <div className="flex flex-wrap gap-2">
            {bloqueados.map(({ fazenda, modulo, motivo, bloqueio_em }, i) => (
              <div key={i} className="flex flex-col gap-0.5 px-3 py-1.5 rounded-lg bg-red-100 dark:bg-red-900/40 border border-red-300 dark:border-red-700">
                <div className="flex items-center gap-1.5">
                  <Lock className="w-3 h-3 text-red-500 shrink-0" />
                  <span className="text-xs font-bold text-red-700 dark:text-red-300">{fazenda}</span>
                  {modulo && <span className="text-xs text-red-500">({modulo})</span>}
                </div>
                {motivo && <span className="text-[10px] text-red-500 dark:text-red-400 italic">{motivo}</span>}
                {bloqueio_em && <span className="text-[10px] text-red-400 dark:text-red-500">Bloqueado às {new Date(bloqueio_em).toLocaleString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {cadenciados.length > 0 && (
        <div className="rounded-xl border-2 border-amber-400 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-700 p-4">
          <div className="flex items-center justify-between gap-2 mb-3 flex-wrap text-amber-600 dark:text-amber-400">
            <div className="flex items-center gap-2">
              <Gauge className="w-5 h-5 shrink-0" />
              <h3 className="font-bold text-sm text-amber-700 dark:text-amber-400 uppercase tracking-wider">Projetos em Cadenciamento ({cadenciados.length})</h3>
            </div>
            {atualizadoEm}
          </div>
          <div className="flex flex-wrap gap-2">
            {cadenciados.map(({ fazenda, modulo, motivo, cadenciamento_em }, i) => (
              <div key={i} className="flex flex-col gap-0.5 px-3 py-1.5 rounded-lg bg-amber-100 dark:bg-amber-900/40 border border-amber-300 dark:border-amber-700">
                <div className="flex items-center gap-1.5">
                  <Gauge className="w-3 h-3 text-amber-600 shrink-0" />
                  <span className="text-xs font-bold text-amber-800 dark:text-amber-300">{fazenda}</span>
                  {modulo && <span className="text-xs text-amber-600">({modulo})</span>}
                </div>
                {motivo && <span className="text-[10px] text-amber-700 dark:text-amber-400 italic">{motivo}</span>}
                {cadenciamento_em && <span className="text-[10px] text-amber-600 dark:text-amber-500">Cadenciado às {new Date(cadenciamento_em).toLocaleString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}