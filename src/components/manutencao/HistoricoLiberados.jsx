import { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { CheckCircle2, Loader2 } from "lucide-react";

export default function HistoricoLiberados({ open, onClose }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    base44.entities.ChamadoManutencao.filter({ status: "liberado" }, "-data_conclusao", 500)
      .then(setItems)
      .finally(() => setLoading(false));
  }, [open]);

  const grupos = useMemo(() => Object.entries(items.reduce((acc, item) => {
    const dia = item.data_conclusao ? new Date(item.data_conclusao).toLocaleDateString("pt-BR") : "Sem data";
    (acc[dia] ||= []).push(item);
    return acc;
  }, {})), [items]);

  return <Sheet open={open} onOpenChange={(value) => !value && onClose()}><SheetContent className="w-full overflow-y-auto sm:max-w-xl"><SheetHeader><SheetTitle>Histórico de liberados</SheetTitle><SheetDescription>Atendimentos concluídos, separados por dia.</SheetDescription></SheetHeader>{loading ? <Loader2 className="mx-auto mt-16 h-7 w-7 animate-spin text-muted-foreground" /> : grupos.length === 0 ? <p className="mt-16 text-center text-sm text-muted-foreground">Nenhum liberado registrado.</p> : <div className="mt-6 space-y-6">{grupos.map(([dia, registros]) => <section key={dia}><div className="mb-2 flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /><h3 className="font-bold">{dia}</h3><span className="text-xs text-muted-foreground">({registros.length})</span></div><div className="space-y-2">{registros.map((item) => <div key={item.id} className="rounded-lg border bg-card p-3"><div className="flex justify-between gap-3"><span className="font-bold">{item.placa || `CM ${item.cm}`}</span><span className="text-xs text-muted-foreground">{item.data_conclusao ? new Date(item.data_conclusao).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) : "—"}</span></div><p className="text-xs text-muted-foreground">CM {item.cm} • {item.numero_chamado || "Sem chamado"}</p></div>)}</div></section>)}</div>}</SheetContent></Sheet>;
}