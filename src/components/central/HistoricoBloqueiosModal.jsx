import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Lock, Unlock, Clock, AlertTriangle, Download } from "lucide-react";
import { base44 } from "@/api/base44Client";

function formatDuracao(minutos) {
  if (!minutos && minutos !== 0) return "—";
  const h = Math.floor(minutos / 60);
  const m = Math.round(minutos % 60);
  if (h > 0) return `${h}h ${m}min`;
  return `${m}min`;
}

function formatHora(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
}

function exportarCSV(registros) {
  const header = ["Fazenda", "Módulo", "Motivo", "Bloqueado Em", "Desbloqueado Em", "Duração (min)", "Registrado Por"];
  const rows = registros.map((r) => [
    r.fazenda || "",
    r.modulo || "",
    r.motivo || "",
    r.bloqueio_em ? new Date(r.bloqueio_em).toLocaleString("pt-BR") : "",
    r.desbloqueio_em ? new Date(r.desbloqueio_em).toLocaleString("pt-BR") : "",
    r.duracao_minutos ?? "",
    r.registrado_por || "",
  ]);
  const csv = [header, ...rows].map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(";")).join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `historico_bloqueios_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function HistoricoBloqueiosModal({ open, onClose }) {
  const [registros, setRegistros] = useState([]);
  const [ativos, setAtivos] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setIsLoading(true);

    Promise.all([
      base44.entities.HistoricoBloqueio.list("-bloqueio_em", 100),
      base44.entities.Distribuicao.list("-updated_date", 1),
    ])
      .then(([hist, dist]) => {
        setRegistros(hist);
        // Ativos vêm da fonte da verdade: Distribuicao
        const btfs = dist?.[0]?.btfs || {};
        const seen = new Set();
        const ativosReais = Object.entries(btfs)
          .filter(([k, v]) => k.startsWith("linha_") && v?.bloqueado && v?.fazenda)
          .map(([, v]) => ({ fazenda: v.fazenda, modulo: v.modulo || "", motivo: v.motivo_bloqueio || "", bloqueio_em: v.bloqueio_em || null }))
          .filter(({ fazenda, modulo }) => {
            const key = `${fazenda}||${modulo}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
          });
        setAtivos(ativosReais);
      })
      .catch(() => { setRegistros([]); setAtivos([]); })
      .finally(() => setIsLoading(false));
  }, [open]);

  const finalizados = registros.filter((r) => !!r.desbloqueio_em);

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="mb-5">
          <SheetTitle className="flex items-center justify-between gap-2 text-lg">
            <div className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-red-500" />
              Histórico de Bloqueios
            </div>
            {registros.length > 0 && (
              <Button size="sm" variant="outline" className="gap-1.5 text-xs" onClick={() => exportarCSV(registros)}>
                <Download className="w-3.5 h-3.5" />
                Exportar CSV
              </Button>
            )}
          </SheetTitle>
        </SheetHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground text-sm">
            Carregando...
          </div>
        ) : registros.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <Lock className="w-10 h-10 mb-3 opacity-20" />
            <p className="text-sm">Nenhum bloqueio registrado ainda.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Ativos */}
            {ativos.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-red-500">Atualmente Bloqueados ({ativos.length})</h3>
                </div>
                <div className="space-y-2">
                  {ativos.map((r) => (
                    <div key={r.id} className="rounded-lg border border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-950/20 p-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Lock className="w-3.5 h-3.5 text-red-500 shrink-0" />
                          <span className="font-bold text-sm text-red-700 dark:text-red-300">{r.fazenda}</span>
                          {r.modulo && <span className="text-xs text-red-500">({r.modulo})</span>}
                        </div>
                        <span className="text-[10px] font-semibold text-red-400 bg-red-100 dark:bg-red-900/40 px-2 py-0.5 rounded-full">ATIVO</span>
                      </div>
                      {r.motivo && <p className="text-xs text-red-600 dark:text-red-400 mt-1 italic">{r.motivo}</p>}
                      <div className="flex items-center gap-1 mt-1.5 text-[11px] text-red-500">
                        <Clock className="w-3 h-3" />
                        <span>Bloqueado em {formatHora(r.bloqueio_em)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Finalizados */}
            {finalizados.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Unlock className="w-4 h-4 text-green-600" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Desbloqueados ({finalizados.length})</h3>
                </div>
                <div className="space-y-2">
                  {finalizados.map((r) => (
                    <div key={r.id} className="rounded-lg border border-border bg-muted/30 p-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Unlock className="w-3.5 h-3.5 text-green-600 shrink-0" />
                          <span className="font-bold text-sm text-foreground">{r.fazenda}</span>
                          {r.modulo && <span className="text-xs text-muted-foreground">({r.modulo})</span>}
                        </div>
                        <span className="text-[10px] font-semibold text-green-600 bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded-full">LIBERADO</span>
                      </div>
                      {r.motivo && <p className="text-xs text-muted-foreground mt-1 italic">{r.motivo}</p>}
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1.5 text-[11px] text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Lock className="w-3 h-3" />
                          <span>{formatHora(r.bloqueio_em)}</span>
                        </div>
                        <span className="text-muted-foreground/40">→</span>
                        <div className="flex items-center gap-1">
                          <Unlock className="w-3 h-3 text-green-500" />
                          <span>{formatHora(r.desbloqueio_em)}</span>
                        </div>
                        <div className="flex items-center gap-1 font-semibold text-foreground">
                          <Clock className="w-3 h-3" />
                          <span>{formatDuracao(r.duracao_minutos)}</span>
                        </div>
                      </div>
                      {r.registrado_por && (
                        <p className="text-[10px] text-muted-foreground/60 mt-1">por {r.registrado_por}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}