import { useState, useEffect } from "react";
import { Settings, Save, RefreshCw, Plus, Trash2, Truck, Building2, MapPin, Zap, ChevronDown, ChevronUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const STORAGE_KEY = "smartwood_params";

const DEFAULT_DATA = {
  frentes: [
    { id: "f1", nome: "Frente 1024-ESTRELA II", fazenda: "Estrela II", distancia: 37, tipoEstrada: "Asfalto + Terra", tempoMedciclo: 2.8, modulo: "M4" },
    { id: "f2", nome: "Frente 1139-TAMANDUÁ", fazenda: "Tamanduá", distancia: 58, tipoEstrada: "Terra", tempoMedciclo: 2.08, modulo: "M2" },
    { id: "f3", nome: "Frente 2129-MORADA DO SOL", fazenda: "Morada do Sol", distancia: 22, tipoEstrada: "Asfalto", tempoMedciclo: 2.82, modulo: "M1" },
    { id: "f4", nome: "Frente 0146-ÁGUA DO SEGREDO", fazenda: "Água do Segredo", distancia: 26, tipoEstrada: "Terra", tempoMedciclo: 5.52, modulo: "M3" },
    { id: "f5", nome: "Frente 0003-NOVA FLORESTA", fazenda: "Nova Floresta", distancia: 23, tipoEstrada: "Asfalto", tempoMedciclo: 2.19, modulo: "M5" },
    { id: "f6", nome: "Frente 0100-PROGRESSO", fazenda: "Progresso", distancia: 37, tipoEstrada: "Terra + Asfalto", tempoMedciclo: 1.96, modulo: "M6" },
    { id: "f7", nome: "Frente 0025-NOVA AMÉRICA", fazenda: "Nova América", distancia: 33, tipoEstrada: "Terra", tempoMedciclo: 2.17, modulo: "M7" },
    { id: "f8", nome: "Frente 2125-SÃO JORGE", fazenda: "São Jorge", distancia: 15, tipoEstrada: "Asfalto", tempoMedciclo: 2.82, modulo: "M8" },
  ],
  btfs: [
    { id: "btf01", nome: "BTF01", dimN: 88, cmContratados: 24, cmDisp: 22, capacidade: 40 },
    { id: "btf02", nome: "BTF02", dimN: 92, cmContratados: 24, cmDisp: 23, capacidade: 40 },
    { id: "btf03", nome: "BTF03", dimN: 88, cmContratados: 24, cmDisp: 21, capacidade: 40 },
    { id: "btf04", nome: "BTF04", dimN: 88, cmContratados: 24, cmDisp: 20, capacidade: 40 },
    { id: "btf05", nome: "BTF05", dimN: 79, cmContratados: 24, cmDisp: 19, capacidade: 38 },
    { id: "btf06", nome: "BTF06", dimN: 96, cmContratados: 24, cmDisp: 23, capacidade: 42 },
    { id: "btf07", nome: "BTF07", dimN: 88, cmContratados: 24, cmDisp: 22, capacidade: 40 },
    { id: "btf08", nome: "BTF08", dimN: 79, cmContratados: 24, cmDisp: 19, capacidade: 38 },
    { id: "btf09", nome: "BTF09", dimN: 88, cmContratados: 24, cmDisp: 20, capacidade: 40 },
  ],
  transportadoras: [
    { id: "tp1", nome: "CARGO POLO COMERCIO, LOGÍSTICA E", cmContratados: 96, cmDisp: 85, performance: 91, pontualidade: 88, produtividade: 102.86 },
    { id: "tp2", nome: "SCALA TRANSPORTE E ADMINISTRAÇÃO", cmContratados: 6, cmDisp: 6, performance: 100, pontualidade: 100, produtividade: 98.4 },
    { id: "tp3", nome: "EXPRESSO NEPOMUCENO S/A", cmContratados: 100, cmDisp: 100, performance: 97, pontualidade: 95, produtividade: 100.0 },
    { id: "tp4", nome: "PLÁCIDOS TRANSPORTES RODOVIÁRIO LTDA", cmContratados: 30, cmDisp: 27, performance: 88, pontualidade: 82, produtividade: 94.3 },
    { id: "tp5", nome: "SERRAMALHO TRANSPORTES LTDA", cmContratados: 60, cmDisp: 46, performance: 79, pontualidade: 75, produtividade: 88.7 },
    { id: "tp6", nome: "EUCLIDES R GARBURO TRANSPORTES LTDA", cmContratados: 74, cmDisp: 91, performance: 93, pontualidade: 90, produtividade: 97.2 },
    { id: "tp7", nome: "M.T. LOURENÇO TRANSPORTES EIRELI", cmContratados: 2, cmDisp: 2, performance: 85, pontualidade: 80, produtividade: 91.5 },
  ],
  gruas: [
    { id: "gr1", frenteId: "f1", nome: "GR-04", modelo: "Timber Jack 1270D", capacidade: 102.86, tempoMedCarreg: 18, disponibilidade: 94, eficiencia: 98 },
    { id: "gr2", frenteId: "f2", nome: "GR-02", modelo: "John Deere 3756D", capacidade: 90.0, tempoMedCarreg: 20, disponibilidade: 88, eficiencia: 91 },
    { id: "gr3", frenteId: "f3", nome: "GR-01", modelo: "Caterpillar 538", capacidade: 102.86, tempoMedCarreg: 18, disponibilidade: 96, eficiencia: 99 },
    { id: "gr4", frenteId: "f4", nome: "GR-03", modelo: "Komatsu 895.2", capacidade: 90.0, tempoMedCarreg: 22, disponibilidade: 72, eficiencia: 74 },
    { id: "gr5", frenteId: "f5", nome: "GR-05", modelo: "Ponsse Buffalo", capacidade: 90.0, tempoMedCarreg: 20, disponibilidade: 91, eficiencia: 93 },
    { id: "gr6", frenteId: "f6", nome: "GR-06", modelo: "Timber Jack 1170E", capacidade: 80.0, tempoMedCarreg: 24, disponibilidade: 85, eficiencia: 86 },
    { id: "gr7", frenteId: "f7", nome: "GR-07", modelo: "John Deere 3756D", capacidade: 102.86, tempoMedCarreg: 18, disponibilidade: 93, eficiencia: 95 },
    { id: "gr8", frenteId: "f8", nome: "GR-08", modelo: "Caterpillar 538", capacidade: 102.86, tempoMedCarreg: 18, disponibilidade: 97, eficiencia: 99 },
  ],
  global: {
    metaDiariaTon: 41060,
    consumoFabricaThDia: 41060,
    tempoCarregMinutos: 20,
    tempoDescarregMinutos: 15,
    velocidadeMediaCarregado: 45,
    velocidadeMediaVazio: 60,
    capacidadeMediaCaminhao: 40,
    tempoEsperaAceitavelMin: 20,
    tempoMaxFilaMin: 40,
    margemSegurancaEstoqueH: 8,
    estoqueAtualTon: 9200,
    tonRealizadasHoje: 28420,
  },
};

function loadParams() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return DEFAULT_DATA;
}

export function getSavedParams() {
  return loadParams();
}

function SectionHeader({ title, icon: IconComp, color, expanded, onToggle, count }) {
  return (
    <button
      onClick={onToggle}
      className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${expanded ? color + " text-white" : "border-border bg-card hover:bg-muted"}`}
    >
      <div className="flex items-center gap-3">
        <IconComp className="w-4 h-4" />
        <span className="font-bold text-sm">{title}</span>
        <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${expanded ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"}`}>{count} registros</span>
      </div>
      {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
    </button>
  );
}

function FieldInput({ label, value, onChange, type = "text", className = "" }) {
  return (
    <div className={`space-y-1 ${className}`}>
      <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</label>
      <Input
        type={type}
        value={value}
        onChange={e => onChange(type === "number" ? parseFloat(e.target.value) || 0 : e.target.value)}
        className="h-8 text-xs"
      />
    </div>
  );
}

export default function Parametrizacao() {
  const [data, setData] = useState(loadParams);
  const [expandido, setExpandido] = useState("global");

  const toggle = (s) => setExpandido(prev => prev === s ? null : s);

  const handleSave = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    toast.success("Parâmetros salvos! Recarregue a página para aplicar.");
  };

  const handleReset = () => {
    if (!confirm("Resetar todos os dados para o padrão?")) return;
    setData(DEFAULT_DATA);
    localStorage.removeItem(STORAGE_KEY);
    toast.success("Dados resetados para o padrão.");
  };

  // Helpers
  const updateGlobal = (field, val) => setData(d => ({ ...d, global: { ...d.global, [field]: val } }));
  const updateItem = (section, id, field, val) =>
    setData(d => ({ ...d, [section]: d[section].map(i => i.id === id ? { ...i, [field]: val } : i) }));
  const removeItem = (section, id) =>
    setData(d => ({ ...d, [section]: d[section].filter(i => i.id !== id) }));
  const addItem = (section, template) =>
    setData(d => ({ ...d, [section]: [...d[section], { ...template, id: `${section}_${Date.now()}` }] }));

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center">
            <Settings className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-black text-lg text-foreground">Parametrização do Sistema</h2>
            <p className="text-xs text-muted-foreground">Edite os dados reais da operação aqui</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleReset} className="gap-1.5">
            <RefreshCw className="w-3.5 h-3.5" /> Resetar
          </Button>
          <Button size="sm" onClick={handleSave} className="gap-1.5 bg-emerald-600 hover:bg-emerald-700">
            <Save className="w-3.5 h-3.5" /> Salvar Tudo
          </Button>
        </div>
      </div>

      <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-700 rounded-xl px-4 py-3 text-xs text-amber-800 dark:text-amber-300 font-medium">
        ⚠️ Após salvar, recarregue a página para os dados serem aplicados nos demais módulos do simulador.
      </div>

      {/* Parâmetros Globais */}
      <div>
        <SectionHeader title="Parâmetros Globais da Fábrica" icon={Settings} color="bg-gradient-to-r from-slate-700 to-slate-800 border-slate-700" expanded={expandido === "global"} onToggle={() => toggle("global")} count={Object.keys(data.global).length} />
        {expandido === "global" && (
          <div className="mt-3 bg-card border border-border rounded-xl p-4">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <FieldInput label="Meta Diária (ton)" value={data.global.metaDiariaTon} onChange={v => updateGlobal("metaDiariaTon", v)} type="number" />
              <FieldInput label="Consumo Fábrica (t/dia)" value={data.global.consumoFabricaThDia} onChange={v => updateGlobal("consumoFabricaThDia", v)} type="number" />
              <FieldInput label="Estoque Atual (ton)" value={data.global.estoqueAtualTon} onChange={v => updateGlobal("estoqueAtualTon", v)} type="number" />
              <FieldInput label="Ton Realizadas Hoje" value={data.global.tonRealizadasHoje} onChange={v => updateGlobal("tonRealizadasHoje", v)} type="number" />
              <FieldInput label="Tempo Carregamento (min)" value={data.global.tempoCarregMinutos} onChange={v => updateGlobal("tempoCarregMinutos", v)} type="number" />
              <FieldInput label="Tempo Descarregamento (min)" value={data.global.tempoDescarregMinutos} onChange={v => updateGlobal("tempoDescarregMinutos", v)} type="number" />
              <FieldInput label="Vel. Média Carregado (km/h)" value={data.global.velocidadeMediaCarregado} onChange={v => updateGlobal("velocidadeMediaCarregado", v)} type="number" />
              <FieldInput label="Vel. Média Vazio (km/h)" value={data.global.velocidadeMediaVazio} onChange={v => updateGlobal("velocidadeMediaVazio", v)} type="number" />
              <FieldInput label="Cap. Média Caminhão (ton)" value={data.global.capacidadeMediaCaminhao} onChange={v => updateGlobal("capacidadeMediaCaminhao", v)} type="number" />
              <FieldInput label="Espera Aceitável (min)" value={data.global.tempoEsperaAceitavelMin} onChange={v => updateGlobal("tempoEsperaAceitavelMin", v)} type="number" />
              <FieldInput label="Fila Máxima (min)" value={data.global.tempoMaxFilaMin} onChange={v => updateGlobal("tempoMaxFilaMin", v)} type="number" />
              <FieldInput label="Margem Segurança Estoque (h)" value={data.global.margemSegurancaEstoqueH} onChange={v => updateGlobal("margemSegurancaEstoqueH", v)} type="number" />
            </div>
          </div>
        )}
      </div>

      {/* Frentes */}
      <div>
        <SectionHeader title="Frentes de Carregamento" icon={MapPin} color="bg-gradient-to-r from-blue-600 to-blue-700 border-blue-600" expanded={expandido === "frentes"} onToggle={() => toggle("frentes")} count={data.frentes.length} />
        {expandido === "frentes" && (
          <div className="mt-3 space-y-3">
            {data.frentes.map(f => (
              <div key={f.id} className="bg-card border border-border rounded-xl p-4 group">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-bold text-xs text-blue-600 dark:text-blue-400 font-mono">{f.modulo}</span>
                  <button onClick={() => removeItem("frentes", f.id)} className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition-opacity">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                  <FieldInput label="Nome da Frente" value={f.nome} onChange={v => updateItem("frentes", f.id, "nome", v)} className="lg:col-span-2" />
                  <FieldInput label="Fazenda" value={f.fazenda} onChange={v => updateItem("frentes", f.id, "fazenda", v)} />
                  <FieldInput label="Módulo" value={f.modulo} onChange={v => updateItem("frentes", f.id, "modulo", v)} />
                  <FieldInput label="Distância (km)" value={f.distancia} onChange={v => updateItem("frentes", f.id, "distancia", v)} type="number" />
                  <FieldInput label="Tempo Ciclo (h)" value={f.tempoMedciclo} onChange={v => updateItem("frentes", f.id, "tempoMedciclo", v)} type="number" />
                  <FieldInput label="Tipo de Estrada" value={f.tipoEstrada} onChange={v => updateItem("frentes", f.id, "tipoEstrada", v)} className="lg:col-span-2" />
                </div>
              </div>
            ))}
            <button
              onClick={() => addItem("frentes", { nome: "Nova Frente", fazenda: "", distancia: 0, tipoEstrada: "Terra", tempoMedciclo: 0, modulo: "" })}
              className="w-full py-3 border-2 border-dashed border-blue-300 dark:border-blue-700 rounded-xl text-xs font-bold text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/20 flex items-center justify-center gap-2 transition-all"
            >
              <Plus className="w-4 h-4" /> Adicionar Frente
            </button>
          </div>
        )}
      </div>

      {/* BTFs */}
      <div>
        <SectionHeader title="BTFs — Frota Própria" icon={Truck} color="bg-gradient-to-r from-indigo-600 to-indigo-700 border-indigo-600" expanded={expandido === "btfs"} onToggle={() => toggle("btfs")} count={data.btfs.length} />
        {expandido === "btfs" && (
          <div className="mt-3 space-y-2">
            <div className="grid grid-cols-5 gap-3 px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              <span>Nome</span><span>DIM (%)</span><span>CM Contratados</span><span>CM Disponíveis</span><span>Capacidade (t)</span>
            </div>
            {data.btfs.map(b => (
              <div key={b.id} className="bg-card border border-border rounded-xl p-3 group">
                <div className="grid grid-cols-5 gap-3 items-center">
                  <Input value={b.nome} onChange={e => updateItem("btfs", b.id, "nome", e.target.value)} className="h-8 text-xs font-mono font-bold" />
                  <Input type="number" value={b.dimN} onChange={e => updateItem("btfs", b.id, "dimN", parseFloat(e.target.value) || 0)} className="h-8 text-xs" />
                  <Input type="number" value={b.cmContratados} onChange={e => updateItem("btfs", b.id, "cmContratados", parseFloat(e.target.value) || 0)} className="h-8 text-xs" />
                  <Input type="number" value={b.cmDisp} onChange={e => updateItem("btfs", b.id, "cmDisp", parseFloat(e.target.value) || 0)} className="h-8 text-xs" />
                  <div className="flex items-center gap-2">
                    <Input type="number" value={b.capacidade} onChange={e => updateItem("btfs", b.id, "capacidade", parseFloat(e.target.value) || 0)} className="h-8 text-xs" />
                    <button onClick={() => removeItem("btfs", b.id)} className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition-opacity shrink-0">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            <button
              onClick={() => addItem("btfs", { nome: "BTF10", dimN: 88, cmContratados: 24, cmDisp: 20, capacidade: 40 })}
              className="w-full py-3 border-2 border-dashed border-indigo-300 dark:border-indigo-700 rounded-xl text-xs font-bold text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 flex items-center justify-center gap-2 transition-all"
            >
              <Plus className="w-4 h-4" /> Adicionar BTF
            </button>
          </div>
        )}
      </div>

      {/* Transportadoras */}
      <div>
        <SectionHeader title="Transportadoras Terceiras" icon={Building2} color="bg-gradient-to-r from-amber-600 to-orange-600 border-amber-600" expanded={expandido === "transportadoras"} onToggle={() => toggle("transportadoras")} count={data.transportadoras.length} />
        {expandido === "transportadoras" && (
          <div className="mt-3 space-y-2">
            <div className="grid grid-cols-6 gap-3 px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              <span className="col-span-2">Nome</span><span>CM Contr.</span><span>CM Disp.</span><span>Performance %</span><span>Produt. t/h</span>
            </div>
            {data.transportadoras.map(t => (
              <div key={t.id} className="bg-card border border-border rounded-xl p-3 group">
                <div className="grid grid-cols-6 gap-3 items-center">
                  <Input value={t.nome} onChange={e => updateItem("transportadoras", t.id, "nome", e.target.value)} className="h-8 text-xs col-span-2" />
                  <Input type="number" value={t.cmContratados} onChange={e => updateItem("transportadoras", t.id, "cmContratados", parseFloat(e.target.value) || 0)} className="h-8 text-xs" />
                  <Input type="number" value={t.cmDisp} onChange={e => updateItem("transportadoras", t.id, "cmDisp", parseFloat(e.target.value) || 0)} className="h-8 text-xs" />
                  <Input type="number" value={t.performance} onChange={e => updateItem("transportadoras", t.id, "performance", parseFloat(e.target.value) || 0)} className="h-8 text-xs" />
                  <div className="flex items-center gap-2">
                    <Input type="number" value={t.produtividade} onChange={e => updateItem("transportadoras", t.id, "produtividade", parseFloat(e.target.value) || 0)} className="h-8 text-xs" />
                    <button onClick={() => removeItem("transportadoras", t.id)} className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition-opacity shrink-0">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            <button
              onClick={() => addItem("transportadoras", { nome: "Nova Transportadora", cmContratados: 0, cmDisp: 0, performance: 85, pontualidade: 80, produtividade: 90 })}
              className="w-full py-3 border-2 border-dashed border-amber-300 dark:border-amber-700 rounded-xl text-xs font-bold text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/20 flex items-center justify-center gap-2 transition-all"
            >
              <Plus className="w-4 h-4" /> Adicionar Transportadora
            </button>
          </div>
        )}
      </div>

      {/* Gruas */}
      <div>
        <SectionHeader title="Gruas de Carregamento" icon={Zap} color="bg-gradient-to-r from-orange-500 to-red-600 border-orange-500" expanded={expandido === "gruas"} onToggle={() => toggle("gruas")} count={data.gruas.length} />
        {expandido === "gruas" && (
          <div className="mt-3 space-y-2">
            <div className="grid grid-cols-7 gap-3 px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              <span>Nome</span><span>Modelo</span><span>Frente ID</span><span>Cap. t/h</span><span>T. Carreg (min)</span><span>Disponib. %</span><span>Eficiência %</span>
            </div>
            {data.gruas.map(g => (
              <div key={g.id} className="bg-card border border-border rounded-xl p-3 group">
                <div className="grid grid-cols-7 gap-3 items-center">
                  <Input value={g.nome} onChange={e => updateItem("gruas", g.id, "nome", e.target.value)} className="h-8 text-xs font-mono font-bold" />
                  <Input value={g.modelo} onChange={e => updateItem("gruas", g.id, "modelo", e.target.value)} className="h-8 text-xs" />
                  <Input value={g.frenteId} onChange={e => updateItem("gruas", g.id, "frenteId", e.target.value)} className="h-8 text-xs" placeholder="f1, f2..." />
                  <Input type="number" value={g.capacidade} onChange={e => updateItem("gruas", g.id, "capacidade", parseFloat(e.target.value) || 0)} className="h-8 text-xs" />
                  <Input type="number" value={g.tempoMedCarreg} onChange={e => updateItem("gruas", g.id, "tempoMedCarreg", parseFloat(e.target.value) || 0)} className="h-8 text-xs" />
                  <Input type="number" value={g.disponibilidade} onChange={e => updateItem("gruas", g.id, "disponibilidade", parseFloat(e.target.value) || 0)} className="h-8 text-xs" />
                  <div className="flex items-center gap-2">
                    <Input type="number" value={g.eficiencia} onChange={e => updateItem("gruas", g.id, "eficiencia", parseFloat(e.target.value) || 0)} className="h-8 text-xs" />
                    <button onClick={() => removeItem("gruas", g.id)} className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition-opacity shrink-0">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            <button
              onClick={() => addItem("gruas", { nome: "GR-09", frenteId: "f1", modelo: "", capacidade: 90, tempoMedCarreg: 20, disponibilidade: 90, eficiencia: 90 })}
              className="w-full py-3 border-2 border-dashed border-orange-300 dark:border-orange-700 rounded-xl text-xs font-bold text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-950/20 flex items-center justify-center gap-2 transition-all"
            >
              <Plus className="w-4 h-4" /> Adicionar Grua
            </button>
          </div>
        )}
      </div>

      {/* Botão Salvar fixo */}
      <div className="sticky bottom-4 flex justify-end">
        <Button onClick={handleSave} className="gap-2 bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-500/30 text-sm font-bold px-6">
          <Save className="w-4 h-4" /> Salvar Parâmetros
        </Button>
      </div>
    </div>
  );
}