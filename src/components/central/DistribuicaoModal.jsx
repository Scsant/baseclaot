import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MapPin, Truck, Save, Loader2, Clock } from "lucide-react";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";

const NUM_LINHAS = 12;
const MODULO_OPTIONS = ["", ...Array.from({ length: 14 }, (_, i) => `Módulo ${i + 1}`)];
const LINHAS_KEYS = Array.from({ length: NUM_LINHAS }, (_, i) => `linha_${i + 1}`);

export default function DistribuicaoModal({ open, onClose }) {
  const { user } = useAuth();
  const [btfs, setBtfs] = useState({});
  const [recordId, setRecordId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedBy, setLastSavedBy] = useState(null);
  const [lastSavedAt, setLastSavedAt] = useState(null);

  useEffect(() => {
    if (!open) return;
    base44.entities.Distribuicao.list("-updated_date", 1).then((records) => {
      if (records && records.length > 0) {
        const rec = records[0];
        setRecordId(rec.id);
        setBtfs(rec.btfs || {});
        setLastSavedBy(rec.last_saved_by || null);
        setLastSavedAt(rec.last_saved_at || null);
      } else {
        setRecordId(null);
        setBtfs({});
        setLastSavedBy(null);
        setLastSavedAt(null);
      }
    });
  }, [open]);

  const handleSave = async () => {
    setIsSaving(true);
    const now = new Date().toISOString();
    const payload = {
      btfs,
      last_saved_by: user?.full_name || "Usuário",
      last_saved_at: now,
    };
    try {
      if (recordId) {
        await base44.entities.Distribuicao.update(recordId, payload);
      } else {
        const created = await base44.entities.Distribuicao.create(payload);
        setRecordId(created.id);
      }
      setLastSavedBy(payload.last_saved_by);
      setLastSavedAt(now);
      toast.success("Distribuição salva para todos os usuários!");
      onClose();
    } catch {
      toast.error("Erro ao salvar distribuição");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader className="mb-4">
          <SheetTitle className="flex items-center gap-2 text-lg">
            <MapPin className="w-5 h-5 text-blue-500" />
            Distribuição de Caminhões
          </SheetTitle>
          {lastSavedBy && lastSavedAt && (
            <p className="text-xs text-muted-foreground">
              Último salvamento por <span className="font-semibold">{lastSavedBy}</span> em{" "}
              {new Date(lastSavedAt).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
            </p>
          )}
        </SheetHeader>

        <div>
          <div className="flex items-center gap-2 mb-4">
            <Truck className="w-4 h-4 text-blue-500" />
            <h3 className="font-bold text-sm uppercase tracking-wider text-foreground">Distribuição de Caminhões</h3>
          </div>

          {/* Header row */}
          <div className="flex items-center gap-2 mb-2 px-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex-1">Fazenda / Destino</span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground w-24 shrink-0">Módulo</span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground w-16 shrink-0 text-center">Bloqueio</span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground w-24 shrink-0 text-center">Cadenciamento</span>
          </div>

          <div className="space-y-2">
            {LINHAS_KEYS.map((key) => {
              const isBloqueado = !!btfs[key]?.bloqueado;
              const isCadenciado = !!btfs[key]?.cadenciado;
              return (
                <div key={key} className={`rounded-lg px-2 py-1.5 transition-colors ${isBloqueado ? "bg-red-50 dark:bg-red-950/20 border border-red-300 dark:border-red-700" : isCadenciado ? "bg-amber-50 dark:bg-amber-950/20 border border-amber-300 dark:border-amber-700" : ""}`}>
                  <div className="flex items-center gap-2">
                    <Input
                      value={btfs[key]?.fazenda || ""}
                      onChange={(e) =>
                        setBtfs((prev) => ({ ...prev, [key]: { ...prev[key], fazenda: e.target.value } }))
                      }
                      placeholder="Fazenda / Destino"
                      className="h-8 text-sm flex-1"
                    />
                    <select
                      value={btfs[key]?.modulo || ""}
                      onChange={(e) =>
                        setBtfs((prev) => ({ ...prev, [key]: { ...prev[key], modulo: e.target.value } }))
                      }
                      className="h-8 w-24 shrink-0 rounded-md border border-input bg-transparent px-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                    >
                      {MODULO_OPTIONS.map((m) => (
                        <option key={m} value={m}>{m || "— Mód."}</option>
                      ))}
                    </select>
                    <div className="w-16 shrink-0 flex items-center justify-center">
                      <input
                        type="checkbox"
                        checked={isBloqueado}
                        disabled={isCadenciado}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          const prev_entry = btfs[key] || {};
                          if (!checked && prev_entry.bloqueio_em && prev_entry.fazenda) {
                            // Registrar desbloqueio no histórico
                            const agora = new Date().toISOString();
                            const duracaoMin = (new Date(agora) - new Date(prev_entry.bloqueio_em)) / 60000;
                            base44.entities.HistoricoBloqueio.create({
                              fazenda: prev_entry.fazenda,
                              modulo: prev_entry.modulo || "",
                              motivo: prev_entry.motivo_bloqueio || "",
                              bloqueio_em: prev_entry.bloqueio_em,
                              desbloqueio_em: agora,
                              duracao_minutos: Math.round(duracaoMin),
                              registrado_por: user?.full_name || "Usuário",
                            }).catch(() => {});
                          }
                          if (checked && prev_entry.fazenda && !prev_entry.bloqueio_em) {
                            // Registrar início do bloqueio no histórico
                            base44.entities.HistoricoBloqueio.create({
                              fazenda: prev_entry.fazenda,
                              modulo: prev_entry.modulo || "",
                              motivo: "",
                              bloqueio_em: new Date().toISOString(),
                              registrado_por: user?.full_name || "Usuário",
                            }).catch(() => {});
                          }
                          setBtfs((prev) => ({
                            ...prev,
                            [key]: {
                              ...prev[key],
                              bloqueado: checked,
                              motivo_bloqueio: checked ? prev[key]?.motivo_bloqueio : "",
                              bloqueio_em: checked ? (prev[key]?.bloqueio_em || new Date().toISOString()) : null,
                            },
                          }));
                        }}
                        className="w-4 h-4 accent-red-500 cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
                      />
                    </div>
                    <label className="w-24 shrink-0 flex items-center justify-center gap-1.5 text-[10px] font-semibold text-amber-700 dark:text-amber-400 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isCadenciado}
                        disabled={isBloqueado}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setBtfs((prev) => ({
                            ...prev,
                            [key]: {
                              ...prev[key],
                              cadenciado: checked,
                              motivo_cadenciamento: checked ? prev[key]?.motivo_cadenciamento : "",
                              cadenciamento_em: checked ? (prev[key]?.cadenciamento_em || new Date().toISOString()) : null,
                            },
                          }));
                        }}
                        className="w-4 h-4 accent-amber-500 cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
                      />
                      <span>Cadenciamento</span>
                    </label>
                  </div>
                  {isBloqueado && (
                    <div className="mt-1.5 space-y-1">
                      <Input
                        value={btfs[key]?.motivo_bloqueio || ""}
                        onChange={(e) =>
                          setBtfs((prev) => ({ ...prev, [key]: { ...prev[key], motivo_bloqueio: e.target.value } }))
                        }
                        placeholder="Motivo do bloqueio..."
                        className="h-7 text-xs border-red-300 dark:border-red-700 focus-visible:ring-red-400"
                      />
                      {btfs[key]?.bloqueio_em && (
                        <div className="flex items-center gap-1 text-[10px] text-red-500 dark:text-red-400">
                          <Clock className="w-3 h-3" />
                          <span>Bloqueado às {new Date(btfs[key].bloqueio_em).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}</span>
                        </div>
                      )}
                    </div>
                  )}
                  {isCadenciado && (
                    <div className="mt-1.5 space-y-1">
                      <Input
                        value={btfs[key]?.motivo_cadenciamento || ""}
                        onChange={(e) =>
                          setBtfs((prev) => ({ ...prev, [key]: { ...prev[key], motivo_cadenciamento: e.target.value } }))
                        }
                        placeholder="Motivo do cadenciamento..."
                        className="h-7 text-xs border-amber-300 dark:border-amber-700 focus-visible:ring-amber-400"
                      />
                      {btfs[key]?.cadenciamento_em && (
                        <div className="flex items-center gap-1 text-[10px] text-amber-600 dark:text-amber-400">
                          <Clock className="w-3 h-3" />
                          <span>Cadenciado às {new Date(btfs[key].cadenciamento_em).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-border">
          <Button onClick={handleSave} disabled={isSaving} className="w-full h-11 gap-2">
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {isSaving ? "Salvando..." : "Salvar Distribuição"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}