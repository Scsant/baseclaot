import { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { CheckCircle2, XCircle, Plus, Trash2, Loader2, Truck, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { TURNOS, getTurnoAtual } from "@/lib/turnos";
import { toast } from "sonner";

const TURNO_COLORS = {
  1: { bg: "bg-blue-500", border: "border-blue-300 dark:border-blue-700", light: "bg-blue-50 dark:bg-blue-950/20", text: "text-blue-600 dark:text-blue-400" },
  2: { bg: "bg-amber-500", border: "border-amber-300 dark:border-amber-700", light: "bg-amber-50 dark:bg-amber-950/20", text: "text-amber-600 dark:text-amber-400" },
  3: { bg: "bg-purple-500", border: "border-purple-300 dark:border-purple-700", light: "bg-purple-50 dark:bg-purple-950/20", text: "text-purple-600 dark:text-purple-400" },
};

const todayStr = format(new Date(), "yyyy-MM-dd");

export default function CaminhoesDisponiveis() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [turno, setTurno] = useState(getTurnoAtual());
  const [form, setForm] = useState({ cm: "", disponivel: true, motivo_indisponibilidade: "", observacoes: "" });
  const [showForm, setShowForm] = useState(false);

  const { data: caminhoes = [], isLoading } = useQuery({
    queryKey: ["caminhoes-disponiveis", turno],
    queryFn: () =>
      base44.entities.CaminhaoDisponivel.filter({ turno, data_turno: todayStr }, "cm", 200),
    refetchInterval: 10000,
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.CaminhaoDisponivel.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["caminhoes-disponiveis"] });
      setForm({ cm: "", disponivel: true, motivo_indisponibilidade: "", observacoes: "" });
      setShowForm(false);
      toast.success("CM registrado com sucesso!");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.CaminhaoDisponivel.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["caminhoes-disponiveis"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.CaminhaoDisponivel.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["caminhoes-disponiveis"] }),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.cm.trim()) return;
    createMutation.mutate({
      ...form,
      turno,
      data_turno: todayStr,
      informado_por: user?.full_name || "Técnico",
    });
  };

  const disponiveis = caminhoes.filter((c) => c.disponivel !== false);
  const indisponiveis = caminhoes.filter((c) => c.disponivel === false);

  const turnoInfo = TURNOS.find((t) => t.id === turno);
  const colors = TURNO_COLORS[turno] || TURNO_COLORS[1];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg">
            <CheckCircle2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Caminhões Disponíveis</h1>
            <p className="text-xs text-muted-foreground">{format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</p>
          </div>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="gap-2">
          <Plus className="w-4 h-4" />
          Informar CM
        </Button>
      </div>

      {/* Turno Selector */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mr-1">Turno:</span>
        {TURNOS.map((t) => {
          const c = TURNO_COLORS[t.id];
          return (
            <button
              key={t.id}
              onClick={() => setTurno(t.id)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                turno === t.id
                  ? `${c.bg} text-white border-transparent`
                  : "border-border text-muted-foreground hover:bg-muted"
              }`}
            >
              {t.icon} {t.label} <span className="opacity-70 ml-1">{t.horario}</span>
            </button>
          );
        })}
      </div>

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className={`rounded-xl border-2 ${colors.border} ${colors.light} p-5 space-y-4`}>
          <h3 className={`text-sm font-bold uppercase tracking-wider ${colors.text}`}>
            {turnoInfo?.icon} Registrar CM — {turnoInfo?.label} ({turnoInfo?.horario})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wider">CM *</Label>
              <Input
                value={form.cm}
                onChange={(e) => setForm((p) => ({ ...p, cm: e.target.value }))}
                placeholder="Ex: CM-001"
                className="h-10"
                autoFocus
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wider">Observações</Label>
              <Input
                value={form.observacoes}
                onChange={(e) => setForm((p) => ({ ...p, observacoes: e.target.value }))}
                placeholder="Opcional"
                className="h-10"
              />
            </div>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-background border border-border">
            <div className="flex items-center gap-2">
              {form.disponivel
                ? <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                : <XCircle className="w-4 h-4 text-red-500" />}
              <Label className="text-sm font-semibold cursor-pointer">
                {form.disponivel ? "Disponível" : "Indisponível"}
              </Label>
            </div>
            <Switch
              checked={form.disponivel}
              onCheckedChange={(v) => setForm((p) => ({ ...p, disponivel: v, motivo_indisponibilidade: v ? "" : p.motivo_indisponibilidade }))}
            />
          </div>

          {!form.disponivel && (
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wider text-red-600 dark:text-red-400">Motivo da Indisponibilidade *</Label>
              <Textarea
                value={form.motivo_indisponibilidade}
                onChange={(e) => setForm((p) => ({ ...p, motivo_indisponibilidade: e.target.value }))}
                placeholder="Ex: Manutenção preventiva, pneu furado, problema mecânico..."
                className="resize-none h-20 text-sm"
              />
            </div>
          )}

          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="flex-1">Cancelar</Button>
            <Button
              type="submit"
              disabled={createMutation.isPending || (!form.disponivel && !form.motivo_indisponibilidade.trim())}
              className="flex-1"
            >
              {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Salvar
            </Button>
          </div>
        </form>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Total</p>
          <p className="text-3xl font-black font-mono">{caminhoes.length}</p>
        </div>
        <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4 text-center">
          <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1">Disponíveis</p>
          <p className="text-3xl font-black font-mono text-emerald-600 dark:text-emerald-400">{disponiveis.length}</p>
        </div>
        <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-center col-span-2 sm:col-span-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-red-600 dark:text-red-400 mb-1">Indisponíveis</p>
          <p className="text-3xl font-black font-mono text-red-600 dark:text-red-400">{indisponiveis.length}</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      ) : caminhoes.length === 0 ? (
        <div className="text-center py-16">
          <Truck className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground">Nenhum CM informado para este turno</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Disponíveis */}
          {disponiveis.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Disponíveis ({disponiveis.length})
                </h3>
              </div>
              <div className="space-y-2">
                {disponiveis.map((c) => (
                  <div key={c.id} className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold font-mono text-foreground">{c.cm}</p>
                      {c.observacoes && <p className="text-xs text-muted-foreground truncate">{c.observacoes}</p>}
                      {c.informado_por && <p className="text-[10px] text-muted-foreground">por {c.informado_por}</p>}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="shrink-0 text-muted-foreground hover:text-destructive h-7 w-7"
                      onClick={() => deleteMutation.mutate(c.id)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Indisponíveis */}
          {indisponiveis.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
                  Indisponíveis ({indisponiveis.length})
                </h3>
              </div>
              <div className="space-y-2">
                {indisponiveis.map((c) => (
                  <div key={c.id} className="flex items-start gap-3 p-3 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800">
                    <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold font-mono text-foreground">{c.cm}</p>
                      {c.motivo_indisponibilidade && (
                        <p className="text-xs text-red-600 dark:text-red-400 mt-0.5">{c.motivo_indisponibilidade}</p>
                      )}
                      {c.observacoes && <p className="text-xs text-muted-foreground">{c.observacoes}</p>}
                      {c.informado_por && <p className="text-[10px] text-muted-foreground">por {c.informado_por}</p>}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="shrink-0 text-muted-foreground hover:text-destructive h-7 w-7"
                      onClick={() => deleteMutation.mutate(c.id)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}