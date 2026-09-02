import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ArrowRightLeft, Truck, FileText, MapPin, AlertTriangle, Loader2, Download } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function DesviosModal({ open, onClose }) {
  const { data: desvios = [], isLoading } = useQuery({
    queryKey: ["desvios"],
    queryFn: () => base44.entities.SolicitacaoOT.filter({ is_desvio: true }, "-created_date", 100),
    enabled: open,
  });

  const exportarCSV = () => {
    const header = ["Placa","Frota","BTF","Transportadora","OT","Origem","Destino Desvio","Motivo","Data"];
    const rows = desvios.map((s) => [
      s.placa || "",
      s.frota || "",
      s.btf || "",
      s.transportadora || "",
      s.numero_ot || "",
      s.fazenda_origem || "",
      s.fazenda_destino_desvio || "",
      (s.motivo_desvio || "").replace(/,/g, ";"),
      s.data_solicitacao ? format(new Date(s.data_solicitacao), "dd/MM/yyyy HH:mm", { locale: ptBR }) : "",
    ]);
    const csv = [header, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `desvios_${format(new Date(), "yyyyMMdd_HHmm")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="mb-6">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2 text-lg">
              <ArrowRightLeft className="w-5 h-5 text-orange-500" />
              Caminhões em Desvio
            </SheetTitle>
            {desvios.length > 0 && (
              <Button variant="outline" size="sm" onClick={exportarCSV} className="gap-2 text-xs">
                <Download className="w-3.5 h-3.5" />
                Exportar CSV
              </Button>
            )}
          </div>
        </SheetHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : desvios.length === 0 ? (
          <div className="text-center py-20">
            <ArrowRightLeft className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">Nenhum desvio registrado</p>
          </div>
        ) : (
          <div className="space-y-3">
            {desvios.map((s) => (
              <div key={s.id} className="rounded-xl border-2 border-orange-300 dark:border-orange-700 bg-orange-50/50 dark:bg-orange-950/20 p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Placa</p>
                    <p className="text-xl font-bold font-mono">{s.placa || s.cm}</p>
                    {(s.frota || s.btf) && (
                      <div className="flex items-center gap-3 mt-1">
                        {s.frota && <span className="text-xs font-mono text-muted-foreground">Frota: <span className="font-bold text-foreground">{s.frota}</span></span>}
                        {s.btf && <span className="text-xs font-mono text-muted-foreground">BTF: <span className="font-bold text-foreground">{s.btf}</span></span>}
                      </div>
                    )}
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                    <ArrowRightLeft className="w-3 h-3" /> Desvio
                  </span>
                </div>

                <div className="space-y-1.5 text-sm">
                  {s.transportadora && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <FileText className="w-3.5 h-3.5" />
                      <span>{s.transportadora}</span>
                    </div>
                  )}
                  {s.fazenda_origem && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="w-3.5 h-3.5 text-red-400" />
                      <span><span className="font-semibold text-foreground">Origem:</span> {s.fazenda_origem}</span>
                    </div>
                  )}
                  {s.fazenda_destino_desvio && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="w-3.5 h-3.5 text-green-500" />
                      <span><span className="font-semibold text-foreground">Destino:</span> {s.fazenda_destino_desvio}</span>
                    </div>
                  )}
                  {s.motivo_desvio && (
                    <div className="flex items-start gap-2 text-muted-foreground">
                      <AlertTriangle className="w-3.5 h-3.5 mt-0.5 text-orange-500 shrink-0" />
                      <span>{s.motivo_desvio}</span>
                    </div>
                  )}
                </div>

                {s.data_solicitacao && (
                  <p className="text-[10px] text-muted-foreground">
                    {format(new Date(s.data_solicitacao), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}