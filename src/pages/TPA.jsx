import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Save, Send, ChevronDown, ChevronUp, Clock, BarChart2, Users, AlertTriangle, Truck, CheckCircle2, History, Plus } from "lucide-react";
import GraficoEvolucaoTPA from "@/components/tpa/GraficoEvolucaoTPA";

const STATUS_OPTIONS = [
  { value: "estavel", label: "Estável", emoji: "✅" },
  { value: "atencao", label: "Em Atenção", emoji: "⚠️" },
  { value: "critico", label: "Crítico", emoji: "🔴" },
];

const TURNO_OPTIONS = ["A", "B", "C", "D"];

const TURNO_HORARIOS = {
  "06h": "14h",
  "14h": "22h",
  "22h": "06h",
};

const DEFAULT_FORM = {
  turno: "C",
  data_turno: new Date().toISOString().slice(0, 10),
  horario_inicial: "",
  horario_final: "",
  horario_turno_inicio: "06h",
  horario_turno_fim: "14h",
  qtd_pessoas: "",
  tpa_transporte_abertura: "",
  tpa_transporte_atual: "",
  tpa_prancha_abertura: "",
  tpa_prancha_atual: "",
  tpa_carregamento_abertura: "",
  tpa_carregamento_atual: "",
  tpa_nao_apontado_abertura: "",
  tpa_nao_apontado_atual: "",
  acoes_turno: "- Acompanhamento constante e análise do PCO (Próprio + Olsen);",
  pareto_transporte: "AGUARDANDO MOTORISTA PARCEIRO FÁBRICA\nENGATE / DESENGATE DE CARRETAS\nFALTA DE COLABORADOR",
  pareto_prancha: "AGUARDANDO MOTORISTA\nFIM DE OPERAÇÃO PRANCHA\nSITUAÇÕES ADVERSAS / METEREOLÓGICAS",
  pareto_carregamento: "FALTA DE CAMINHÃO\nREFEIÇÃO\nSITUAÇÕES ADVERSAS / METEREOLÓGICAS",
  absenteismo_motoristas: "",
  absenteismo_operadores: "",
  otimizacao_frota: "",
  status_turno: "atencao",
  tipo: "parcial",
};

function buildWhatsappText(form) {
  const tipoLabel = form.tipo === "final" ? "DAILY FINAL" : "DAILY PARCIAL";
  const dataFmt = new Date(form.data_turno + "T12:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
  const statusMap = { estavel: "Estável", atencao: "Em Atenção", critico: "Crítico" };
  const statusCheck = { estavel: "(x) Estável\n( ) Em Atenção\n( ) Crítico", atencao: "( ) Estável\n(x) Em Atenção\n( ) Crítico", critico: "( ) Estável\n( ) Em Atenção\n(x) Crítico" };

  const tpa = (abertura, atual) => {
    const a = parseFloat(abertura);
    const b = parseFloat(atual);
    const emoji = !isNaN(a) && !isNaN(b) ? (b <= a ? "🟢" : "🔴") : "";
    return { abertura: abertura || "—", atual: (atual || "—") + emoji };
  };

  const tr = tpa(form.tpa_transporte_abertura, form.tpa_transporte_atual);
  const pr = tpa(form.tpa_prancha_abertura, form.tpa_prancha_atual);
  const ca = tpa(form.tpa_carregamento_abertura, form.tpa_carregamento_atual);
  const na = tpa(form.tpa_nao_apontado_abertura, form.tpa_nao_apontado_atual);

  const pareto = (titulo, texto) => {
    if (!texto?.trim()) return "";
    const linhas = texto.trim().split("\n").map((l) => `* ${l.trim()}`).join("\n");
    return `\n📉 Pareto – Principais ofensores\n${titulo}\n${linhas}`;
  };

  const abs = (titulo, texto) => {
    if (!texto?.trim()) return "";
    return `\n${titulo}\n${texto.trim()}`;
  };

  let txt = "";
  if (form.horario_inicial) txt += `Atualização inicial às ${form.horario_inicial} / `;
  if (form.horario_final) txt += `Atualização final às ${form.horario_final}\n`;
  else if (form.horario_inicial) txt += "\n";

  txt += `📊 ${tipoLabel} – TURNO ${form.turno} | ${dataFmt}\n`;
  txt += `⏰ Horário do turno: ${form.horario_turno_inicio} às ${form.horario_turno_fim}\n`;
  txt += `👥 Quantidade de pessoas no turno: ${form.qtd_pessoas || "—"}\n`;
  txt += `\n📌 TPA TRANSPORTE\nTPA abertura: ${tr.abertura}\nTPA parcial/atual: ${tr.atual}\n`;
  txt += `\n📌 TPA PRANCHA\nTPA abertura: ${pr.abertura}\nTPA parcial/atual: ${pr.atual}\n`;
  txt += `\n📌 TPA CARREGAMENTO\nTPA abertura: ${ca.abertura}\nTPA parcial/atual: ${ca.atual}\n`;
  txt += `\n📌 TPA NÃO APONTADO\nTPA abertura: ${na.abertura}\nTPA parcial/atual: ${na.atual}\n`;

  if (form.acoes_turno?.trim()) {
    txt += `\n⚙️ Principais ações realizadas no turno:\n${form.acoes_turno.trim()}\n`;
  }

  txt += pareto("Transporte", form.pareto_transporte);
  txt += pareto("Prancha", form.pareto_prancha);
  txt += pareto("Carregamento", form.pareto_carregamento);

  const temAbsenteismo = form.absenteismo_motoristas?.trim() || form.absenteismo_operadores?.trim();
  if (temAbsenteismo) {
    txt += `\n👥 Absenteísmo`;
    txt += abs("Motoristas faltantes:", form.absenteismo_motoristas);
    txt += abs("\nOperadores faltantes:", form.absenteismo_operadores);
    txt += "\n";
  }

  if (form.otimizacao_frota?.trim()) {
    txt += `\n🚛 Otimização de Frota / Alocações e impactos relevantes:\n${form.otimizacao_frota.trim()}\n`;
  }

  txt += `\n✅ Status geral do turno\n${statusCheck[form.status_turno] || statusCheck.atencao}`;

  return txt;
}

function Section({ icon: Icon, title, color, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/40 transition-colors"
      >
        <div className="flex items-center gap-2">
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${color}`}>
            <Icon className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-sm text-foreground">{title}</span>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </button>
      {open && <div className="px-4 pb-4 pt-1 space-y-3">{children}</div>}
    </div>
  );
}

function TpaField({ label, abertura, atuaLabel, onAbertura, onAtual, valorAtual, valorAbertura }) {
  const a = parseFloat(valorAbertura);
  const b = parseFloat(valorAtual);
  const indicador = !isNaN(a) && !isNaN(b) ? (b <= a ? "🟢" : "🔴") : null;
  return (
    <div className="grid grid-cols-2 gap-2">
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1 block">Abertura</label>
        <Input type="number" step="0.01" value={valorAbertura} onChange={(e) => onAbertura(e.target.value)} placeholder="0.00" className="h-9 text-sm" />
      </div>
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1 block">
          {atuaLabel || "Parcial/Atual"} {indicador}
        </label>
        <Input type="number" step="0.01" value={valorAtual} onChange={(e) => onAtual(e.target.value)} placeholder="0.00" className="h-9 text-sm" />
      </div>
    </div>
  );
}

export default function TPA() {
  const { user } = useAuth();
  const [form, setForm] = useState(DEFAULT_FORM);
  const [isSaving, setIsSaving] = useState(false);
  const [historico, setHistorico] = useState([]);
  const [showHistorico, setShowHistorico] = useState(false);
  const [preview, setPreview] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (showHistorico) {
      base44.entities.ReportTPA.list("-created_date", 20).then(setHistorico).catch(() => {});
    }
  }, [showHistorico]);

  const set = (field) => (val) => setForm((f) => ({ ...f, [field]: val }));
  const setE = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await base44.entities.ReportTPA.create({ ...form, criado_por: user?.full_name || "Usuário" });
      toast.success("Report salvo com sucesso!");
    } catch {
      toast.error("Erro ao salvar o report.");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePreview = () => {
    setPreview(buildWhatsappText(form));
    setShowPreview(true);
  };

  const handleEnviarWhatsapp = () => {
    const texto = buildWhatsappText(form);
    const encoded = encodeURIComponent(texto);
    window.open(`https://wa.me/?text=${encoded}`, "_blank");
  };

  const handleCarregar = (r) => {
    const { id, created_date, updated_date, created_by_id, criado_por, ...rest } = r;
    setForm({ ...DEFAULT_FORM, ...rest });
    setShowHistorico(false);
    toast.success("Report carregado para edição.");
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">📊 Report TPA</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Preencha o daily de turno e envie direto para o WhatsApp</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setShowHistorico((v) => !v)}>
            <History className="w-4 h-4" />
            Histórico
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setForm(DEFAULT_FORM)}>
            <Plus className="w-4 h-4" />
            Novo
          </Button>
        </div>
      </div>

      {/* Gráfico de Evolução */}
      <GraficoEvolucaoTPA />

      {/* Histórico */}
      {showHistorico && (
        <div className="rounded-xl border border-border bg-card p-4 space-y-2">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Últimos Reports</p>
          {historico.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">Nenhum report salvo ainda.</p>
          ) : (
            historico.map((r) => (
              <button
                key={r.id}
                onClick={() => handleCarregar(r)}
                className="w-full text-left rounded-lg border border-border hover:bg-muted/50 px-3 py-2 transition-colors"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold">Turno {r.turno} — {r.data_turno ? new Date(r.data_turno + "T12:00:00").toLocaleDateString("pt-BR") : "—"}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${r.tipo === "final" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}`}>
                    {r.tipo === "final" ? "FINAL" : "PARCIAL"}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{r.criado_por} — {new Date(r.created_date).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}</p>
              </button>
            ))
          )}
        </div>
      )}

      {/* Identificação */}
      <Section icon={Clock} title="Identificação do Turno" color="bg-blue-500">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Turno</label>
            <div className="flex gap-1.5">
              {TURNO_OPTIONS.map((t) => (
                <button
                  key={t}
                  onClick={() => set("turno")(t)}
                  className={`flex-1 py-1.5 rounded-lg text-sm font-bold border transition-all ${form.turno === t ? "bg-blue-500 text-white border-blue-500" : "border-border hover:bg-muted"}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Data</label>
            <Input type="date" value={form.data_turno} onChange={setE("data_turno")} className="h-9 text-sm" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Horário do turno</label>
            <div className="flex items-center gap-1.5">
              <Input value={form.horario_turno_inicio} onChange={setE("horario_turno_inicio")} placeholder="06h" className="h-9 text-sm" />
              <span className="text-muted-foreground text-xs shrink-0">às</span>
              <Input value={form.horario_turno_fim} onChange={setE("horario_turno_fim")} placeholder="14h" className="h-9 text-sm" />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Qtd. pessoas</label>
            <Input type="number" value={form.qtd_pessoas} onChange={setE("qtd_pessoas")} placeholder="Ex: 4" className="h-9 text-sm" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Atualização inicial</label>
            <Input value={form.horario_inicial} onChange={setE("horario_inicial")} placeholder="Ex: 06h21" className="h-9 text-sm" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Atualização final</label>
            <Input value={form.horario_final} onChange={setE("horario_final")} placeholder="Ex: 13h21" className="h-9 text-sm" />
          </div>
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">Tipo de report</label>
          <div className="flex gap-2">
            {["parcial", "final"].map((t) => (
              <button
                key={t}
                onClick={() => set("tipo")(t)}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold border transition-all ${form.tipo === t ? "bg-blue-500 text-white border-blue-500" : "border-border hover:bg-muted"}`}
              >
                {t === "parcial" ? "📊 Parcial" : "✅ Final"}
              </button>
            ))}
          </div>
        </div>
      </Section>

      {/* TPA Values */}
      <Section icon={BarChart2} title="Valores TPA" color="bg-emerald-500">
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">📌 TPA TRANSPORTE</p>
        <TpaField valorAbertura={form.tpa_transporte_abertura} valorAtual={form.tpa_transporte_atual} onAbertura={set("tpa_transporte_abertura")} onAtual={set("tpa_transporte_atual")} />
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mt-1">📌 TPA PRANCHA</p>
        <TpaField valorAbertura={form.tpa_prancha_abertura} valorAtual={form.tpa_prancha_atual} onAbertura={set("tpa_prancha_abertura")} onAtual={set("tpa_prancha_atual")} />
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mt-1">📌 TPA CARREGAMENTO</p>
        <TpaField valorAbertura={form.tpa_carregamento_abertura} valorAtual={form.tpa_carregamento_atual} onAbertura={set("tpa_carregamento_abertura")} onAtual={set("tpa_carregamento_atual")} />
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mt-1">📌 TPA NÃO APONTADO</p>
        <TpaField valorAbertura={form.tpa_nao_apontado_abertura} valorAtual={form.tpa_nao_apontado_atual} onAbertura={set("tpa_nao_apontado_abertura")} onAtual={set("tpa_nao_apontado_atual")} />
      </Section>

      {/* Ações */}
      <Section icon={CheckCircle2} title="Ações do Turno" color="bg-violet-500">
        <label className="text-xs font-medium text-muted-foreground mb-1 block">⚙️ Principais ações realizadas</label>
        <Textarea value={form.acoes_turno} onChange={setE("acoes_turno")} placeholder="- Ação 1&#10;- Ação 2" rows={3} className="text-sm resize-none" />
      </Section>

      {/* Pareto */}
      <Section icon={AlertTriangle} title="Pareto – Principais Ofensores" color="bg-orange-500" defaultOpen={false}>
        <label className="text-xs font-medium text-muted-foreground mb-1 block">📉 Transporte</label>
        <Textarea value={form.pareto_transporte} onChange={setE("pareto_transporte")} placeholder="Um ofensor por linha" rows={3} className="text-sm resize-none" />
        <label className="text-xs font-medium text-muted-foreground mb-1 block mt-2">📉 Prancha</label>
        <Textarea value={form.pareto_prancha} onChange={setE("pareto_prancha")} placeholder="Um ofensor por linha" rows={3} className="text-sm resize-none" />
        <label className="text-xs font-medium text-muted-foreground mb-1 block mt-2">📉 Carregamento</label>
        <Textarea value={form.pareto_carregamento} onChange={setE("pareto_carregamento")} placeholder="Um ofensor por linha" rows={3} className="text-sm resize-none" />
      </Section>

      {/* Absenteísmo */}
      <Section icon={Users} title="Absenteísmo" color="bg-pink-500" defaultOpen={false}>
        <label className="text-xs font-medium text-muted-foreground mb-1 block">🚛 Motoristas faltantes</label>
        <Textarea value={form.absenteismo_motoristas} onChange={setE("absenteismo_motoristas")} placeholder="Ex: BTF09 - 1 motorista;" rows={2} className="text-sm resize-none" />
        <label className="text-xs font-medium text-muted-foreground mb-1 block mt-2">👷 Operadores faltantes</label>
        <Textarea value={form.absenteismo_operadores} onChange={setE("absenteismo_operadores")} placeholder="Ex: M02 - 1 operador e 1 assistente;" rows={2} className="text-sm resize-none" />
      </Section>

      {/* Frota */}
      <Section icon={Truck} title="Otimização de Frota" color="bg-slate-500" defaultOpen={false}>
        <Textarea value={form.otimizacao_frota} onChange={setE("otimizacao_frota")} placeholder="Descreva alocações, liberações de manutenção e impactos relevantes..." rows={4} className="text-sm resize-none" />
      </Section>

      {/* Status */}
      <Section icon={CheckCircle2} title="Status Geral do Turno" color="bg-teal-500">
        <div className="flex gap-2">
          {STATUS_OPTIONS.map((s) => (
            <button
              key={s.value}
              onClick={() => set("status_turno")(s.value)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-bold border-2 transition-all ${
                form.status_turno === s.value
                  ? s.value === "estavel" ? "bg-green-500 text-white border-green-500"
                  : s.value === "atencao" ? "bg-amber-500 text-white border-amber-500"
                  : "bg-red-500 text-white border-red-500"
                  : "border-border hover:bg-muted"
              }`}
            >
              {s.emoji} {s.label}
            </button>
          ))}
        </div>
      </Section>

      {/* Preview */}
      {showPreview && (
        <div className="rounded-xl border border-border bg-muted/30 p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Pré-visualização do texto</p>
          <pre className="text-xs text-foreground whitespace-pre-wrap font-mono leading-relaxed">{preview}</pre>
        </div>
      )}

      {/* Action Buttons */}
      <div className="grid grid-cols-3 gap-2 pt-2">
        <Button variant="outline" onClick={handleSave} disabled={isSaving} className="gap-1.5 text-sm">
          <Save className="w-4 h-4" />
          {isSaving ? "Salvando..." : "Salvar"}
        </Button>
        <Button variant="outline" onClick={handlePreview} className="gap-1.5 text-sm">
          👁️ Preview
        </Button>
        <Button onClick={handleEnviarWhatsapp} className="gap-1.5 text-sm bg-green-500 hover:bg-green-600 text-white border-green-500">
          <Send className="w-4 h-4" />
          WhatsApp
        </Button>
      </div>
    </div>
  );
}