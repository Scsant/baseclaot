import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import StatusBadge from "@/components/ui/StatusBadge";
import { CheckCircle2, XCircle, Truck, FileText, Clock, MessageSquare, Loader2, ShieldAlert, RotateCcw, ArrowRightLeft } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function LiberarModal({ solicitacao, open, onClose, onLiberar, onCancelar, onPendencia, onReativar, isProcessing }) {
  const [ot, setOt] = useState("");
  const [showPendencia, setShowPendencia] = useState(false);
  const [motivoPendencia, setMotivoPendencia] = useState("");
  const [isDesvio, setIsDesvio] = useState(false);
  const [fazendaOrigem, setFazendaOrigem] = useState("");
  const [fazendaDestino, setFazendaDestino] = useState("");
  const [motivoDesvio, setMotivoDesvio] = useState("");

  const s = solicitacao;
  if (!s) return null;

  const handleClose = () => {
    setOt("");
    setShowPendencia(false);
    setMotivoPendencia("");
    setIsDesvio(false);
    setFazendaOrigem("");
    setFazendaDestino("");
    setMotivoDesvio("");
    onClose();
  };

  const handleConfirmarPendencia = () => {
    onPendencia(s, motivoPendencia);
    setShowPendencia(false);
    setMotivoPendencia("");
  };

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-lg">Detalhes da Solicitação</SheetTitle>
        </SheetHeader>

        <div className="space-y-6">
          {/* CM destaque */}
          <div className="bg-muted rounded-xl p-5 text-center">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1">Placa</p>
            <p className="text-4xl font-bold font-mono text-foreground">{s.cm}</p>
          </div>

          <StatusBadge status={s.status} size="lg" />

          {/* Motivo de pendência já registrado */}
          {s.status === "pendente" && s.motivo_pendencia && (
            <div className="flex items-start gap-3 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800">
              <ShieldAlert className="w-4 h-4 text-rose-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-[10px] text-rose-600 dark:text-rose-400 uppercase font-semibold">Motivo da Pendência</p>
                <p className="text-sm text-rose-700 dark:text-rose-300">{s.motivo_pendencia}</p>
              </div>
            </div>
          )}

          {/* Info */}
          <div className="space-y-3">
            {s.placa && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Truck className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Tipo de Conjunto</p>
                  <p className="font-mono font-bold">{s.placa}</p>
                </div>
              </div>
            )}
            {s.transportadora && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <FileText className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Transportadora</p>
                  <p className="font-semibold">{s.transportadora}</p>
                </div>
              </div>
            )}
            {s.data_solicitacao && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Hora Solicitação</p>
                  <p className="font-semibold">{format(new Date(s.data_solicitacao), "dd/MM/yyyy HH:mm:ss", { locale: ptBR })}</p>
                </div>
              </div>
            )}
            {s.observacoes && (
              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <MessageSquare className="w-4 h-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Observações</p>
                  <p className="text-sm">{s.observacoes}</p>
                </div>
              </div>
            )}
          </div>

          {/* ── DESVIO ── */}
          <div className="space-y-3 pt-4 border-t border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ArrowRightLeft className="w-4 h-4 text-orange-500" />
                <Label className="text-sm font-semibold">Caminhão em Desvio?</Label>
              </div>
              <Switch
                checked={isDesvio}
                onCheckedChange={(val) => {
                  setIsDesvio(val);
                  if (!val) { setFazendaOrigem(""); setFazendaDestino(""); setMotivoDesvio(""); }
                  base44.entities.SolicitacaoOT.update(s.id, {
                    is_desvio: val,
                    ...(val ? {} : { fazenda_origem: "", fazenda_destino_desvio: "", motivo_desvio: "" })
                  });
                }}
              />
            </div>

            {isDesvio && (
              <div className="space-y-3 p-4 rounded-xl border-2 border-orange-300 dark:border-orange-700 bg-orange-50 dark:bg-orange-950/20">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Fazenda de Origem</Label>
                  <Input
                    value={fazendaOrigem}
                    onChange={(e) => {
                      setFazendaOrigem(e.target.value);
                      base44.entities.SolicitacaoOT.update(s.id, { fazenda_origem: e.target.value });
                    }}
                    placeholder="Destino original do caminhão"
                    className="h-10"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Novo Destino</Label>
                  <Input
                    value={fazendaDestino}
                    onChange={(e) => {
                      setFazendaDestino(e.target.value);
                      base44.entities.SolicitacaoOT.update(s.id, { fazenda_destino_desvio: e.target.value });
                    }}
                    placeholder="Fazenda para onde será desviado"
                    className="h-10"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Motivo do Desvio</Label>
                  <Textarea
                    value={motivoDesvio}
                    onChange={(e) => {
                      setMotivoDesvio(e.target.value);
                      base44.entities.SolicitacaoOT.update(s.id, { motivo_desvio: e.target.value });
                    }}
                    placeholder="Ex: Bloqueio na fazenda de origem..."
                    className="resize-none h-20 text-sm"
                  />
                </div>
              </div>
            )}
          </div>

          {/* ── AÇÕES: aguardando ── */}
          {s.status === "aguardando" && (
            <div className="space-y-3 pt-4 border-t border-border">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Número da OT *
                </Label>
                <Input
                  value={ot}
                  onChange={(e) => setOt(e.target.value)}
                  placeholder="Informe a OT"
                  className="h-12 text-lg font-mono font-bold text-center"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  onClick={() => onCancelar(s)}
                  disabled={isProcessing}
                  className="h-12 border-red-300 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-950/30"
                >
                  {isProcessing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <XCircle className="w-4 h-4 mr-2" />}
                  Cancelar
                </Button>
                <Button
                  onClick={() => { onLiberar(s, ot); setOt(""); }}
                  disabled={!ot.trim() || isProcessing}
                  className="h-12 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 shadow-lg"
                >
                  {isProcessing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                  Liberar OT
                </Button>
              </div>

              {/* Botão de pendência */}
              {!showPendencia ? (
                <Button
                  variant="outline"
                  onClick={() => setShowPendencia(true)}
                  disabled={isProcessing}
                  className="w-full h-11 border-rose-300 text-rose-600 hover:bg-rose-50 dark:border-rose-700 dark:text-rose-400 dark:hover:bg-rose-950/30"
                >
                  <ShieldAlert className="w-4 h-4 mr-2" />
                  Sinalizar Pendência / Bloqueio de Fazenda
                </Button>
              ) : (
                <div className="space-y-3 p-4 rounded-xl border-2 border-rose-300 dark:border-rose-700 bg-rose-50 dark:bg-rose-950/20">
                  <p className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    Informe a pendência
                  </p>
                  <Textarea
                    value={motivoPendencia}
                    onChange={(e) => setMotivoPendencia(e.target.value)}
                    placeholder="Ex: Bloqueio de fazenda, documentação pendente, problema mecânico..."
                    className="resize-none h-24 text-sm"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => { setShowPendencia(false); setMotivoPendencia(""); }}
                      className="flex-1"
                    >
                      Voltar
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleConfirmarPendencia}
                      disabled={!motivoPendencia.trim() || isProcessing}
                      className="flex-1 bg-rose-600 hover:bg-rose-700 text-white"
                    >
                      {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirmar Pendência"}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── AÇÕES: pendente ── */}
          {s.status === "pendente" && (
            <div className="space-y-3 pt-4 border-t border-border">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Número da OT (para liberar)
                </Label>
                <Input
                  value={ot}
                  onChange={(e) => setOt(e.target.value)}
                  placeholder="Informe a OT"
                  className="h-12 text-lg font-mono font-bold text-center"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  onClick={() => onReativar(s)}
                  disabled={isProcessing}
                  className="h-11"
                >
                  {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4 mr-2" />}
                  Reativar
                </Button>
                <Button
                  onClick={() => { onLiberar(s, ot); setOt(""); }}
                  disabled={!ot.trim() || isProcessing}
                  className="h-11 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700"
                >
                  {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                  Liberar OT
                </Button>
              </div>
            </div>
          )}

          {/* ── OT Liberada ── */}
          {s.status === "liberada" && s.numero_ot && (
            <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-700 rounded-xl p-4 text-center">
              <p className="text-xs text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1">OT Liberada</p>
              <p className="text-3xl font-bold font-mono text-emerald-700 dark:text-emerald-300">{s.numero_ot}</p>
              {s.data_liberacao && (
                <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-2">
                  {format(new Date(s.data_liberacao), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                </p>
              )}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}