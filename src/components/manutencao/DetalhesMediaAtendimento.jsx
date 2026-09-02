import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Timer } from "lucide-react";

function formatarMinutos(minutos) {
  const total = Math.round(minutos);
  return total < 60 ? `${total}min` : `${Math.floor(total / 60)}h${total % 60 ? ` ${total % 60}m` : ""}`;
}

export default function DetalhesMediaAtendimento({ open, onClose, itens }) {
  return (
    <Dialog open={open} onOpenChange={(aberto) => !aberto && onClose()}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>CMs considerados na média</DialogTitle>
          <DialogDescription>Tempos de atendimento contabilizados desde o início do dia.</DialogDescription>
        </DialogHeader>
        <div className="max-h-[60vh] space-y-2 overflow-y-auto pr-1">
          {itens.length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">Nenhum CM considerado no momento.</p>}
          {itens.map((item) => (
            <div key={`${item.status}-${item.id}`} className="flex items-center justify-between gap-4 rounded-lg border bg-card p-3">
              <div>
                <p className="font-mono text-base font-bold">CM {item.cm || "—"}</p>
                <p className="text-xs text-muted-foreground">{item.placa || "Sem placa"} · {item.status === "em_manutencao" ? "Em manutenção" : "Liberado"}</p>
              </div>
              <div className="flex items-center gap-1.5 whitespace-nowrap text-sm font-bold text-primary">
                <Timer className="h-4 w-4" />
                {formatarMinutos(item.minutos)}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}