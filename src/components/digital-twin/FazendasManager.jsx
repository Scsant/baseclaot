import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Edit2, Trash2, MapPin, Check, X } from "lucide-react";
import { toast } from "sonner";

const EMPTY = {
  nome: "", codigo: "", empresa: "", latitude: "", longitude: "",
  distancia_km: "", trecho_terra_km: "", trecho_asfalto_km: "",
  qtd_gruas: 2, capacidade_max_caminhoes: 10, tipo_estrada: "regular",
  velocidade_media_kmh: 45, tempo_medio_carregamento_min: 35, tempo_medio_fila_min: 15,
  observacoes: "", ativa: true,
};

const ESTRADA_OPTS = [
  { value: "boa", label: "Boa", cor: "text-green-600" },
  { value: "regular", label: "Regular", cor: "text-amber-600" },
  { value: "ruim", label: "Ruim", cor: "text-orange-600" },
  { value: "critica", label: "Crítica", cor: "text-red-600" },
];

export default function FazendasManager({ fazendas, onRefresh }) {
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSave = async () => {
    if (!form.nome || !form.distancia_km) {
      toast.error("Preencha Nome e Distância.");
      return;
    }
    setSaving(true);
    try {
      const data = {
        ...form,
        latitude: form.latitude ? Number(form.latitude) : null,
        longitude: form.longitude ? Number(form.longitude) : null,
        distancia_km: Number(form.distancia_km),
        qtd_gruas: Number(form.qtd_gruas),
        capacidade_max_caminhoes: Number(form.capacidade_max_caminhoes),
        velocidade_media_kmh: Number(form.velocidade_media_kmh),
        tempo_medio_carregamento_min: Number(form.tempo_medio_carregamento_min),
        tempo_medio_fila_min: Number(form.tempo_medio_fila_min),
        trecho_terra_km: form.trecho_terra_km ? Number(form.trecho_terra_km) : null,
        trecho_asfalto_km: form.trecho_asfalto_km ? Number(form.trecho_asfalto_km) : null,
      };
      if (editId) {
        await base44.entities.FazendaPreditiva.update(editId, data);
        toast.success("Fazenda atualizada!");
      } else {
        await base44.entities.FazendaPreditiva.create(data);
        toast.success("Fazenda cadastrada!");
      }
      setForm(EMPTY);
      setEditId(null);
      setShowForm(false);
      onRefresh();
    } catch (err) {
      toast.error("Erro ao salvar: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (f) => {
    setForm({ ...EMPTY, ...f });
    setEditId(f.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Remover esta fazenda?")) return;
    await base44.entities.FazendaPreditiva.delete(id);
    toast.success("Fazenda removida.");
    onRefresh();
  };

  const F = ({ label, k, type = "text", placeholder = "" }) => (
    <div>
      <label className="text-xs font-medium text-muted-foreground mb-1 block">{label}</label>
      <Input type={type} value={form[k]} onChange={set(k)} placeholder={placeholder} className="h-8 text-sm" />
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Lista */}
      {fazendas.length === 0 && !showForm && (
        <p className="text-center text-sm text-muted-foreground py-6">Nenhuma fazenda cadastrada. Adicione uma para começar.</p>
      )}

      <div className="grid grid-cols-1 gap-2">
        {fazendas.map((f) => {
          const est = ESTRADA_OPTS.find((e) => e.value === f.tipo_estrada) || ESTRADA_OPTS[1];
          return (
            <div key={f.id} className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                  <span className="font-semibold text-sm truncate">{f.nome}</span>
                  {f.codigo && <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded font-mono">{f.codigo}</span>}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5 flex flex-wrap gap-2">
                  <span>{f.distancia_km} km</span>
                  <span>·</span>
                  <span>{f.qtd_gruas} grua(s)</span>
                  <span>·</span>
                  <span className={est.cor}>Estrada {est.label}</span>
                  <span>·</span>
                  <span>{f.velocidade_media_kmh} km/h</span>
                </div>
              </div>
              <div className="flex gap-1 shrink-0">
                <button onClick={() => handleEdit(f)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => handleDelete(f.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-muted-foreground hover:text-red-600 transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Form */}
      {showForm && (
        <div className="rounded-xl border border-border bg-card p-4 space-y-3">
          <p className="font-semibold text-sm">{editId ? "Editar Fazenda" : "Nova Fazenda"}</p>
          <div className="grid grid-cols-2 gap-2">
            <F label="Nome *" k="nome" placeholder="Ex: Fazenda Delta" />
            <F label="Código" k="codigo" placeholder="Ex: FD-01" />
            <F label="Empresa" k="empresa" />
            <F label="Distância da Fábrica (km) *" k="distancia_km" type="number" placeholder="50" />
            <F label="Latitude" k="latitude" type="number" placeholder="-20.123" />
            <F label="Longitude" k="longitude" type="number" placeholder="-40.456" />
            <F label="Trecho Terra (km)" k="trecho_terra_km" type="number" />
            <F label="Trecho Asfalto (km)" k="trecho_asfalto_km" type="number" />
            <F label="Qtd. Gruas" k="qtd_gruas" type="number" placeholder="2" />
            <F label="Cap. Max. Caminhões" k="capacidade_max_caminhoes" type="number" placeholder="10" />
            <F label="Velocidade Média (km/h)" k="velocidade_media_kmh" type="number" placeholder="45" />
            <F label="Tempo Carregamento (min)" k="tempo_medio_carregamento_min" type="number" placeholder="35" />
            <F label="Tempo Fila (min)" k="tempo_medio_fila_min" type="number" placeholder="15" />
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Condição da Estrada</label>
              <select value={form.tipo_estrada} onChange={set("tipo_estrada")} className="w-full h-8 rounded-md border border-input bg-transparent px-3 text-sm">
                {ESTRADA_OPTS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={saving} size="sm" className="gap-1.5">
              <Check className="w-3.5 h-3.5" />
              {saving ? "Salvando..." : "Salvar"}
            </Button>
            <Button variant="outline" size="sm" onClick={() => { setShowForm(false); setForm(EMPTY); setEditId(null); }} className="gap-1.5">
              <X className="w-3.5 h-3.5" />
              Cancelar
            </Button>
          </div>
        </div>
      )}

      {!showForm && (
        <Button variant="outline" size="sm" onClick={() => setShowForm(true)} className="gap-1.5 w-full">
          <Plus className="w-4 h-4" />
          Adicionar Fazenda
        </Button>
      )}
    </div>
  );
}