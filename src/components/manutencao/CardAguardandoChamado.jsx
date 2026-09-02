import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { PhoneCall } from "lucide-react";

export default function CardAguardandoChamado() {
  const [chamados, setChamados] = useState([]);

  const load = async () => {
    const data = await base44.entities.ChamadoManutencao.filter(
      { status: "aguardando_chamado" },
      "-updated_date",
      50
    );
    setChamados(data);
  };

  useEffect(() => {
    load();
    const unsub = base44.entities.ChamadoManutencao.subscribe(() => load());
    return unsub;
  }, []);

  if (chamados.length === 0) return null;

  return (
    <div className="bg-violet-50 dark:bg-violet-950/30 border-2 border-violet-300 dark:border-violet-700 rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 rounded-lg bg-violet-500 flex items-center justify-center shrink-0">
          <PhoneCall className="w-3.5 h-3.5 text-white" />
        </div>
        <div>
          <p className="text-sm font-bold text-violet-700 dark:text-violet-300 leading-none">Aguardando Chamado</p>
          <p className="text-[10px] text-violet-500 dark:text-violet-400 mt-0.5">CMs que precisam abrir chamado de manutenção</p>
        </div>
        <span className="ml-auto text-xs font-black text-violet-700 dark:text-violet-300 bg-violet-200 dark:bg-violet-800 px-2 py-0.5 rounded-full">
          {chamados.length}
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {chamados.map(c => (
          <div
            key={c.id}
            className="flex items-center gap-1.5 bg-white dark:bg-violet-900/50 border border-violet-200 dark:border-violet-700 rounded-lg px-3 py-1.5"
          >
            <span className="text-sm font-black font-mono text-violet-800 dark:text-violet-200">{c.cm}</span>
            {c.tipo_manutencao && (
              <span className="text-[10px] text-violet-500 dark:text-violet-400 capitalize">· {c.tipo_manutencao}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}