import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { X, Plus } from "lucide-react";

const TIPOS = [
  { value: "corretiva", label: "Corretiva" },
  { value: "preventiva", label: "Preventiva" },
  { value: "teste", label: "Teste" },
  { value: "instalacao", label: "Instalação" },
  { value: "desinstalacao", label: "Desinstalação" },
];
const PRIORIDADES = [
  { value: "baixa", label: "Baixa" },
  { value: "media", label: "Média" },
  { value: "alta", label: "Alta" },
];

export default function ChamadoForm({ onSaved, onClose }) {
  const { user } = useAuth();
  const [form, setForm] = useState({
    cm: "", tipo_manutencao: "corretiva", prioridade: "media", descricao_problema: "",
  });
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const handleSave = async () => {
    if (!form.cm) return;
    setSaving(true);
    const seq = Math.floor(Math.random() * 9000) + 1000;
    const payload = {
      ...form,
      placa: form.cm,
      numero_chamado: `CH-${seq}`,
      status: "aguardando",
      data_abertura: new Date().toISOString(),
      aberto_por: user?.full_name || "Sistema",
      notificacao_enviada: false,
    };
    await base44.entities.ChamadoManutencao.create(payload);
    setSaving(false);
    onSaved?.();
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-foreground">Nova Manutenção</h3>
        {onClose && <button onClick={onClose}><X className="w-4 h-4 text-muted-foreground hover:text-foreground" /></button>}
      </div>

      <div className="space-y-1">
        <label className="text-xs font-semibold text-muted-foreground">CM *</label>
        <Input value={form.cm} onChange={e => set("cm", e.target.value)} placeholder="Código CM" className="h-8 text-sm" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-muted-foreground">Tipo</label>
          <select value={form.tipo_manutencao} onChange={e => set("tipo_manutencao", e.target.value)} className="w-full h-8 text-sm rounded-md border border-input bg-transparent px-2 focus:outline-none focus:ring-1 focus:ring-ring">
            {TIPOS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold text-muted-foreground">Prioridade</label>
          <select value={form.prioridade} onChange={e => set("prioridade", e.target.value)} className="w-full h-8 text-sm rounded-md border border-input bg-transparent px-2 focus:outline-none focus:ring-1 focus:ring-ring">
            {PRIORIDADES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
          </select>
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-xs font-semibold text-muted-foreground">Observação</label>
        <textarea value={form.descricao_problema} onChange={e => set("descricao_problema", e.target.value)} rows={3} placeholder="Observações..." className="w-full text-sm rounded-lg border border-input bg-transparent px-3 py-2 resize-none focus:outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground/40" />
      </div>

      <div className="flex justify-end gap-2">
        {onClose && <Button variant="outline" size="sm" onClick={onClose}>Cancelar</Button>}
        <Button size="sm" onClick={handleSave} disabled={saving || !form.cm} className="bg-orange-600 hover:bg-orange-700">
          <Plus className="w-4 h-4" /> {saving ? "Salvando..." : "Registrar Manutenção"}
        </Button>
      </div>
    </div>
  );
}