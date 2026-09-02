import { useState } from "react";
import { ChevronDown, ChevronUp, Save, Loader2, Plus, X, Clock, Wrench, Activity, PauseCircle, AlertTriangle, XCircle } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { calcularProjecao } from "./motorInteligencia";
import AlertaMeta from "./AlertaMeta";

const IMPACTOS_LISTA = [
  "Chuva", "Atolamento", "Falta de Caminhão", "Excesso de Caminhão",
  "Quebra Mecânica", "Falta de Operador", "Troca de Turno",
  "Estrada Interditada", "Baixa Produtividade da Grua", "Excesso de Fila",
  "Problema de Comunicação", "Segurança", "Outro",
];

const TURNOS = { 1: "Turno 1 (06–14h)", 2: "Turno 2 (14–22h)", 3: "Turno 3 (22–06h)" };

const EQUIP_STATUS_CONFIG = {
  operando: { label: "Operando", color: "bg-emerald-500", text: "text-emerald-700 dark:text-emerald-400", icon: Activity },
  manutencao: { label: "Manutenção", color: "bg-red-500", text: "text-red-700 dark:text-red-400", icon: Wrench },
  manutencao_restrita: { label: "Op. Restrita", color: "bg-amber-500", text: "text-amber-700 dark:text-amber-400", icon: AlertTriangle },
  standby: { label: "Stand By", color: "bg-blue-500", text: "text-blue-700 dark:text-blue-400", icon: PauseCircle },
  sem_crane: { label: "Sem Creare", color: "bg-orange-500", text: "text-orange-700 dark:text-orange-400", icon: XCircle },
};

const STATUS_CARD_COLORS = {
  oportunidade: "border-emerald-400 dark:border-emerald-600",
  balanceado: "border-yellow-400 dark:border-yellow-600",
  reduzir: "border-orange-400 dark:border-orange-600",
  mais_caminhoes: "border-sky-400 dark:border-sky-600",
  critico: "border-red-400 dark:border-red-600",
};

function numField(label, field, form, onChange, placeholder = "") {
  return (
    <div>
      <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">{label}</label>
      <input
        type="number"
        value={form[field] ?? ""}
        onChange={(e) => onChange(field, e.target.value === "" ? null : parseFloat(e.target.value))}
        placeholder={placeholder}
        className="mt-0.5 w-full text-xs rounded-lg border border-border bg-muted/30 px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-ring text-foreground placeholder:text-muted-foreground/40"
      />
    </div>
  );
}

export default function ModuloCard({ modulo, expanded, onToggle, onSave }) {
  const { user } = useAuth();
  const [form, setForm] = useState({
    fazenda: modulo.fazenda || "",
    projeto: modulo.projeto || "",
    data_turno: modulo.data_turno || new Date().toISOString().slice(0, 10),
    turno: modulo.turno || 1,
    supervisor: modulo.supervisor || "",
    assistente_campo: modulo.assistente_campo || "",
    meta_entrega_m3: modulo.meta_entrega_m3 ?? null,
    dmt: modulo.dmt ?? null,
    nota_fazenda: modulo.nota_fazenda ?? null,
    peso_medio: modulo.peso_medio ?? null,
    media_m3_viagem: modulo.media_m3_viagem ?? null,
    cms_enviados: modulo.cms_enviados ?? null,
    cms_carregando: modulo.cms_carregando ?? null,
    cms_aguardando: modulo.cms_aguardando ?? null,
    producao_atual_m3: modulo.producao_atual_m3 ?? null,
    horas_trabalhadas: modulo.horas_trabalhadas ?? null,
    impactos: modulo.impactos || [],
    impacto_outro_detalhe: modulo.impacto_outro_detalhe || "",
    observacoes: "",
  });
  const [isSaving, setIsSaving] = useState(false);

  const st = modulo._statusCalc;
  const cardBorder = STATUS_CARD_COLORS[st?.key] || "border-border";
  const { produtividade, horasRestantes, projecaoFinal } = calcularProjecao({ ...modulo, ...form });

  const setField = (field, val) => setForm((p) => ({ ...p, [field]: val }));

  const toggleImpacto = (imp) => {
    setForm((p) => ({
      ...p,
      impactos: p.impactos.includes(imp) ? p.impactos.filter((i) => i !== imp) : [...p.impactos, imp],
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const historico = [...(modulo.historico_obs || [])];
      if (form.observacoes?.trim()) {
        historico.push({
          texto: form.observacoes,
          autor: user?.full_name || "Usuário",
          data: new Date().toISOString(),
        });
      }
      const payload = {
        ...form,
        observacoes: modulo.observacoes || "",
        historico_obs: historico,
        modulo_numero: modulo.modulo_numero,
        ultima_atualizacao: new Date().toISOString(),
        equipamentos: modulo.equipamentos || [],
      };
      if (modulo.id) {
        await base44.entities.InfCampo.update(modulo.id, payload);
      } else {
        await base44.entities.InfCampo.create(payload);
      }
      onSave();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  const historico = modulo.historico_obs || [];
  const equipamentos = modulo.equipamentos || [];

  return (
    <div className={`bg-card border-2 ${cardBorder} rounded-2xl overflow-hidden shadow-sm transition-all`}>
      {/* Header */}
      <div className="px-4 py-3 flex items-center justify-between gap-2 bg-muted/30">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center text-white text-xs font-black shrink-0">
            {modulo.modulo_numero}
          </span>
          <div className="min-w-0">
            <p className="text-sm font-bold text-foreground truncate">
              Módulo {String(modulo.modulo_numero).padStart(2, "0")}
              {modulo.fazenda && <span className="font-normal text-muted-foreground"> — {modulo.fazenda}</span>}
            </p>
            {st && <p className="text-[10px] text-muted-foreground">{st.emoji} {st.label}</p>}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {modulo.ultima_atualizacao && (
            <span className="hidden sm:flex items-center gap-1 text-[10px] text-muted-foreground">
              <Clock className="w-2.5 h-2.5" />
              {new Date(modulo.ultima_atualizacao).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
            </span>
          )}
          <button onClick={onToggle} className="text-muted-foreground hover:text-foreground">
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mini KPIs sempre visíveis */}
      {!expanded && (
        <div className="px-4 py-2.5 flex flex-wrap gap-3 text-xs border-t border-border">
          {modulo.producao_atual_m3 != null && (
            <span className="text-foreground font-semibold">{modulo.producao_atual_m3} <span className="text-muted-foreground font-normal">m³</span></span>
          )}
          {modulo.meta_entrega_m3 != null && (
            <span className="text-muted-foreground">Meta: {modulo.meta_entrega_m3} m³</span>
          )}
          {modulo.cms_enviados != null && (
            <span className="text-muted-foreground">{modulo.cms_enviados} CMs</span>
          )}
        </div>
      )}

      {expanded && (
        <div className="px-4 pb-5 pt-3 space-y-5">
          {/* Cabeçalho do módulo */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Fazenda</label>
              <input value={form.fazenda} onChange={(e) => setField("fazenda", e.target.value)} placeholder="Nome da fazenda" className="mt-0.5 w-full text-xs rounded-lg border border-border bg-muted/30 px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-ring text-foreground placeholder:text-muted-foreground/40" />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Projeto</label>
              <input value={form.projeto} onChange={(e) => setField("projeto", e.target.value)} placeholder="Nome do projeto" className="mt-0.5 w-full text-xs rounded-lg border border-border bg-muted/30 px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-ring text-foreground placeholder:text-muted-foreground/40" />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Data</label>
              <input type="date" value={form.data_turno} onChange={(e) => setField("data_turno", e.target.value)} className="mt-0.5 w-full text-xs rounded-lg border border-border bg-muted/30 px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-ring text-foreground" />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Turno</label>
              <select value={form.turno} onChange={(e) => setField("turno", parseInt(e.target.value))} className="mt-0.5 w-full text-xs rounded-lg border border-border bg-muted/30 px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-ring text-foreground">
                {[1, 2, 3].map((t) => <option key={t} value={t}>{TURNOS[t]}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Supervisor</label>
              <input value={form.supervisor} onChange={(e) => setField("supervisor", e.target.value)} placeholder="Nome do supervisor" className="mt-0.5 w-full text-xs rounded-lg border border-border bg-muted/30 px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-ring text-foreground placeholder:text-muted-foreground/40" />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Assistente de Campo</label>
              <input value={form.assistente_campo} onChange={(e) => setField("assistente_campo", e.target.value)} placeholder="Nome do assistente" className="mt-0.5 w-full text-xs rounded-lg border border-border bg-muted/30 px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-ring text-foreground placeholder:text-muted-foreground/40" />
            </div>
          </div>

          {/* Indicadores operacionais */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Indicadores Operacionais</p>
            <div className="grid grid-cols-2 gap-3">
              {numField("Meta de Entrega (m³)", "meta_entrega_m3", form, setField, "0")}
              {numField("DMT", "dmt", form, setField, "km")}
              {numField("Nota da Fazenda", "nota_fazenda", form, setField, "0-10")}
              {numField("Peso Médio Entregue", "peso_medio", form, setField, "kg")}
              {numField("Média m³/viagem", "media_m3_viagem", form, setField, "m³")}
              {numField("CMs Enviados", "cms_enviados", form, setField, "0")}
              {numField("CMs Carregando", "cms_carregando", form, setField, "0")}
              {numField("CMs Aguardando", "cms_aguardando", form, setField, "0")}
              {numField("Produção Atual (m³)", "producao_atual_m3", form, setField, "m³")}
              {numField("Horas Trabalhadas", "horas_trabalhadas", form, setField, "h")}
            </div>
          </div>

          {/* Motor de inteligência */}
          {(form.producao_atual_m3 != null && form.horas_trabalhadas != null) && (
            <div className="bg-muted/30 rounded-xl border border-border p-3 space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Motor de Inteligência</p>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <p className="text-muted-foreground">Produtividade</p>
                  <p className="font-bold text-foreground">{produtividade.toFixed(1)} m³/h</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Horas restantes</p>
                  <p className="font-bold text-foreground">{horasRestantes.toFixed(1)} h</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Projeção final</p>
                  <p className="font-bold text-foreground">{Math.round(projecaoFinal).toLocaleString("pt-BR")} m³</p>
                </div>
              </div>
            </div>
          )}

          {/* Alerta de meta */}
          <AlertaMeta modulo={{ ...modulo, ...form }} />

          {/* Sugestão operacional */}
          {st && (
            <div className={`rounded-xl p-3 text-sm font-semibold border-2 ${
              st.key === "critico" ? "bg-red-50 dark:bg-red-950/30 border-red-300 dark:border-red-700 text-red-700 dark:text-red-400" :
              st.key === "oportunidade" ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-400" :
              st.key === "mais_caminhoes" ? "bg-sky-50 dark:bg-sky-950/30 border-sky-300 dark:border-sky-700 text-sky-700 dark:text-sky-400" :
              st.key === "reduzir" ? "bg-orange-50 dark:bg-orange-950/30 border-orange-300 dark:border-orange-700 text-orange-700 dark:text-orange-400" :
              "bg-yellow-50 dark:bg-yellow-950/30 border-yellow-300 dark:border-yellow-700 text-yellow-700 dark:text-yellow-400"
            }`}>
              {st.emoji} Sugestão: {st.label}
            </div>
          )}

          {/* Equipamentos */}
          {equipamentos.length > 0 && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Equipamentos</p>
              <div className="flex flex-wrap gap-2">
                {equipamentos.map((eq, i) => {
                  const statuses = eq.statuses || (eq.status ? [eq.status] : ["operando"]);
                  const primary = EQUIP_STATUS_CONFIG[statuses[0]] || EQUIP_STATUS_CONFIG.operando;
                  const Icon = primary.icon;
                  return (
                    <div key={i} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-muted border border-border text-xs">
                      <Icon className={`w-3 h-3 ${primary.text}`} />
                      <span className="font-semibold text-foreground">{eq.nome}</span>
                      <span className={`text-[10px] ${primary.text}`}>{primary.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Impactos */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Impactos Identificados</p>
            <div className="flex flex-wrap gap-1.5">
              {IMPACTOS_LISTA.map((imp) => {
                const active = form.impactos.includes(imp);
                return (
                  <button
                    key={imp}
                    onClick={() => toggleImpacto(imp)}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border transition-all ${
                      active
                        ? "bg-amber-500 text-white border-amber-500"
                        : "bg-transparent border-border text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {imp}
                  </button>
                );
              })}
            </div>
            {form.impactos.includes("Outro") && (
              <input
                value={form.impacto_outro_detalhe}
                onChange={(e) => setField("impacto_outro_detalhe", e.target.value)}
                placeholder="Detalhe o impacto..."
                className="mt-2 w-full text-xs rounded-lg border border-border bg-muted/30 px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-ring text-foreground placeholder:text-muted-foreground/40"
              />
            )}
          </div>

          {/* Observações */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Nova Observação</p>
            <textarea
              value={form.observacoes}
              onChange={(e) => setField("observacoes", e.target.value)}
              rows={3}
              placeholder="Ex: Fila elevada devido manutenção preventiva da Grua 02. Previsão de normalização às 15:30."
              className="w-full text-xs rounded-xl border border-border bg-muted/30 px-3 py-2 resize-none focus:outline-none focus:ring-1 focus:ring-ring text-foreground placeholder:text-muted-foreground/40"
            />
          </div>

          {/* Histórico de observações */}
          {historico.length > 0 && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Histórico de Observações</p>
              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {[...historico].reverse().map((h, i) => (
                  <div key={i} className="text-xs bg-muted/40 rounded-lg p-2.5 border border-border">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="font-semibold text-foreground">{h.autor}</span>
                      <span className="text-[10px] text-muted-foreground">{new Date(h.data).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}</span>
                    </div>
                    <p className="text-muted-foreground">{h.texto}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Salvar */}
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-purple-700 text-white text-sm font-semibold shadow hover:opacity-90 transition-all disabled:opacity-60"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {isSaving ? "Salvando..." : "Salvar Registro"}
          </button>
        </div>
      )}
    </div>
  );
}