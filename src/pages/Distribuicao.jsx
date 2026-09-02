import { useCallback, useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { MapPinned, RefreshCw, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { buscarClimaFazenda } from "@/lib/climaService";
import { buscarMunicipio } from "@/lib/municipioService";
import ProjetoDistribuicaoCard from "@/components/distribuicao/ProjetoDistribuicaoCard";
import ResumoDesvios from "@/components/distribuicao/ResumoDesvios";
import MapaFazendas from "@/components/distribuicao/MapaFazendas";

const normalizar = (nome = "") => nome.trim().toLocaleLowerCase("pt-BR");

export default function Distribuicao() {
  const [registro, setRegistro] = useState(null);
  const [fazendas, setFazendas] = useState([]);
  const [desvios, setDesvios] = useState([]);
  const [climas, setClimas] = useState({});
  const [municipios, setMunicipios] = useState({});
  const [loading, setLoading] = useState(true);
  const [savingName, setSavingName] = useState("");
  const [ocultos, setOcultos] = useState(() => (localStorage.getItem("distribuicao-projetos-ocultos") || "").split("|").filter(Boolean));

  const carregar = useCallback(async () => {
    setLoading(true);
    const [distribuicoes, cadastros] = await Promise.all([
      base44.entities.Distribuicao.list("-updated_date", 1),
      base44.entities.FazendaPreditiva.list("nome", 200),
    ]);
    setRegistro(distribuicoes[0] || null);
    setFazendas(cadastros);
    setLoading(false);
  }, []);

  const carregarDesvios = useCallback(async () => {
    const registros = [];
    let skip = 0;
    while (true) {
      const lote = await base44.entities.SolicitacaoOT.filter({ is_desvio: true }, "-created_date", 500, skip);
      registros.push(...lote);
      if (lote.length < 500) break;
      skip += 500;
    }
    const hoje = new Date();
    setDesvios(registros.filter((item) => {
      const data = new Date(item.data_solicitacao || item.created_date);
      return data.getFullYear() === hoje.getFullYear()
        && data.getMonth() === hoje.getMonth()
        && data.getDate() === hoje.getDate();
    }));
  }, []);

  useEffect(() => {
    carregar();
    carregarDesvios();
    const unsubscribeDistribuicao = base44.entities.Distribuicao.subscribe(() => carregar());
    const unsubscribeDesvios = base44.entities.SolicitacaoOT.subscribe(() => carregarDesvios());
    return () => {
      unsubscribeDistribuicao();
      unsubscribeDesvios();
    };
  }, [carregar, carregarDesvios]);

  const projetos = useMemo(() => {
    const unicos = new Map();
    Object.entries(registro?.btfs || {})
      .filter(([key, item]) => key.startsWith("linha_") && item?.fazenda?.trim())
      .forEach(([, item]) => {
        const fazenda = item.fazenda.trim();
        const modulo = item.modulo?.trim() || "";
        const chave = `${normalizar(fazenda)}::${normalizar(modulo)}`;
        if (!unicos.has(chave)) unicos.set(chave, { ...item, fazenda, modulo });
      });
    return Array.from(unicos.values());
  }, [registro]);
  const chaveProjeto = (projeto) => `${normalizar(projeto.fazenda)}::${normalizar(projeto.modulo)}`;
  const projetosVisiveis = useMemo(() => projetos.filter((projeto) => !ocultos.includes(chaveProjeto(projeto))), [projetos, ocultos]);
  const destinosDesviados = useMemo(() => {
    const totais = new Map();
    desvios.filter((item) => item.fazenda_destino_desvio?.trim()).forEach((item) => {
      const nome = item.fazenda_destino_desvio.trim();
      const chave = normalizar(nome);
      const atual = totais.get(chave);
      totais.set(chave, { chave, nome: atual?.nome || nome, quantidade: (atual?.quantidade || 0) + 1 });
    });
    return Array.from(totais.values()).sort((a, b) => b.quantidade - a.quantidade || a.nome.localeCompare(b.nome, "pt-BR"));
  }, [desvios]);
  const quantidadePorProjeto = useMemo(() => Object.fromEntries(destinosDesviados.map((item) => [item.chave, item.quantidade])), [destinosDesviados]);
  const fazendasPorNome = useMemo(() => Object.fromEntries(fazendas.map((f) => [normalizar(f.nome), f])), [fazendas]);
  const fazendasDistribuicao = useMemo(() => {
    const nomesAtivos = new Set(projetos.map((projeto) => normalizar(projeto.fazenda)));
    return fazendas.filter((fazenda) => nomesAtivos.has(normalizar(fazenda.nome)));
  }, [fazendas, projetos]);

  useEffect(() => {
    const localizadas = Array.from(new Map(
      projetos
        .map((p) => fazendasPorNome[normalizar(p.fazenda)])
        .filter((f) => f?.latitude != null && f?.longitude != null)
        .map((f) => [f.id, f])
    ).values());

    Promise.all(localizadas.map(async (f) => [
      f.id,
      await buscarClimaFazenda(f.latitude, f.longitude, `${f.id}:${f.latitude}:${f.longitude}`),
    ])).then((items) => setClimas(Object.fromEntries(items)));

    Promise.all(localizadas.map(async (f) => [
      f.id,
      await buscarMunicipio(f.latitude, f.longitude),
    ])).then((items) => setMunicipios(Object.fromEntries(items)));
  }, [projetos, fazendasPorNome]);

  const ocultarProjeto = (projeto) => {
    const atualizados = [...new Set([...ocultos, chaveProjeto(projeto)])];
    setOcultos(atualizados);
    localStorage.setItem("distribuicao-projetos-ocultos", atualizados.join("|"));
  };

  const restaurarProjetos = () => {
    setOcultos([]);
    localStorage.removeItem("distribuicao-projetos-ocultos");
  };

  const salvarLocalizacao = async (nome, latitude, longitude) => {
    setSavingName(nome);
    try {
      const atual = fazendasPorNome[normalizar(nome)];
      if (atual) await base44.entities.FazendaPreditiva.update(atual.id, { latitude, longitude });
      else await base44.entities.FazendaPreditiva.create({ nome, latitude, longitude, distancia_km: 0, ativa: true });
      toast.success("Localização salva.");
      await carregar();
    } catch (error) {
      toast.error("Não foi possível salvar a localização.");
      throw error;
    } finally {
      setSavingName("");
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3"><div className="w-11 h-11 rounded-xl bg-primary flex items-center justify-center"><MapPinned className="w-6 h-6 text-primary-foreground" /></div><div><h1 className="text-2xl font-bold">Distribuição</h1><p className="text-sm text-muted-foreground">Projetos ativos, situação operacional, localização e clima</p></div></div>
        <div className="flex items-center gap-2">
          {ocultos.length > 0 && <Button variant="ghost" onClick={restaurarProjetos} className="gap-2"><RotateCcw className="w-4 h-4" />Restaurar ocultos ({ocultos.length})</Button>}
          <Button variant="outline" onClick={carregar} disabled={loading} className="gap-2"><RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />Atualizar</Button>
        </div>
      </div>

      {registro?.last_saved_at && <p className="text-xs text-muted-foreground">Distribuição atualizada por {registro.last_saved_by || "Usuário"} em {new Date(registro.last_saved_at).toLocaleString("pt-BR")}</p>}

      <ResumoDesvios destinos={destinosDesviados} />

      <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div>
      {loading ? <div className="py-20 text-center text-muted-foreground">Carregando distribuição...</div> : projetos.length === 0 ? <div className="py-20 text-center border-2 border-dashed border-border rounded-xl text-muted-foreground">Nenhum projeto inserido na distribuição atual.</div> : <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3 gap-4">{projetosVisiveis.map((projeto) => { const fazenda = fazendasPorNome[normalizar(projeto.fazenda)]; return <ProjetoDistribuicaoCard key={`${normalizar(projeto.fazenda)}-${normalizar(projeto.modulo)}`} projeto={projeto} fazenda={fazenda} clima={fazenda ? climas[fazenda.id] : null} municipio={fazenda ? municipios[fazenda.id] : null} saving={savingName === projeto.fazenda} onSaveLocation={(lat, lon) => salvarLocalizacao(projeto.fazenda, lat, lon)} onHide={() => ocultarProjeto(projeto)} quantidadeDestinada={quantidadePorProjeto[normalizar(projeto.fazenda)] || 0} />; })}</div>}
        </div>
        <aside className="xl:sticky xl:top-4">
          <MapaFazendas fazendas={fazendasDistribuicao} desviosPorFazenda={quantidadePorProjeto} climas={climas} />
        </aside>
      </div>
    </div>
  );
}