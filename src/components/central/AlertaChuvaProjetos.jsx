import { useEffect, useState } from "react";
import { CloudRain } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { buscarClimaFazenda } from "@/lib/climaService";

const normalizar = (nome = "") => nome.trim().toLocaleLowerCase("pt-BR");

export default function AlertaChuvaProjetos() {
  const [alertas, setAlertas] = useState([]);

  useEffect(() => {
    let ativo = true;
    const carregar = async () => {
      const [distribuicoes, fazendas] = await Promise.all([
        base44.entities.Distribuicao.list("-updated_date", 1),
        base44.entities.FazendaPreditiva.list("nome", 200),
      ]);
      const nomes = [...new Set(Object.entries(distribuicoes[0]?.btfs || {})
        .filter(([key, item]) => key.startsWith("linha_") && item?.fazenda?.trim())
        .map(([, item]) => item.fazenda.trim()))];
      const porNome = Object.fromEntries(fazendas.map((fazenda) => [normalizar(fazenda.nome), fazenda]));
      const previsoes = await Promise.all(nomes.map(async (nome) => {
        const fazenda = porNome[normalizar(nome)];
        if (fazenda?.latitude == null || fazenda?.longitude == null) return null;
        const clima = await buscarClimaFazenda(fazenda.latitude, fazenda.longitude, `${fazenda.id}:${fazenda.latitude}:${fazenda.longitude}`);
        const previsaoFutura = (clima.proximas12h || []).slice(1).reduce(
          (maior, periodo) => periodo.prob > maior.prob ? periodo : maior,
          { prob: 0, hora: "" }
        );
        return previsaoFutura.prob > 0
          ? { nome, probabilidade: previsaoFutura.prob, horario: previsaoFutura.hora }
          : null;
      }));
      if (ativo) setAlertas(previsoes.filter(Boolean).sort((a, b) => b.probabilidade - a.probabilidade));
    };
    carregar();
    const unsubscribe = base44.entities.Distribuicao.subscribe(carregar);
    const interval = setInterval(carregar, 30 * 60 * 1000);
    return () => { ativo = false; unsubscribe(); clearInterval(interval); };
  }, []);

  if (alertas.length === 0) return null;
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 dark:border-amber-700 dark:bg-amber-950/20">
      <span className="flex items-center gap-1.5 text-xs font-bold text-amber-800 dark:text-amber-300"><CloudRain className="h-4 w-4" />Previsão de chuva — próximas 12h</span>
      {alertas.map((alerta) => <span key={normalizar(alerta.nome)} className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800 dark:bg-amber-900/40 dark:text-amber-200">{alerta.nome}: {alerta.probabilidade}% às {alerta.horario}</span>)}
    </div>
  );
}