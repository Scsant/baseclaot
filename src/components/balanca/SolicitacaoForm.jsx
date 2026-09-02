import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2, Car, Zap, AlertTriangle } from "lucide-react";
import { base44 } from "@/api/base44Client";

const EMPTY = { placa: "", transportadora: "", frota: "", btf: "", observacoes: "" };

export default function SolicitacaoForm({ onSubmit, isSubmitting, placaDuplicada }) {
  const [form, setForm] = useState(EMPTY);
  const [veiculos, setVeiculos] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [showSugg, setShowSugg] = useState(false);
  const [autoFilled, setAutoFilled] = useState(false);
  const suggRef = useRef(null);
  const placaInputRef = useRef(null);

  // Load vehicle registry once
  useEffect(() => {
    base44.entities.VeiculoCadastro.list("-created_date", 2000).then(setVeiculos).catch(() => {});
  }, []);

  // Close suggestions on outside click
  useEffect(() => {
    const handler = (e) => {
      if (suggRef.current && !suggRef.current.contains(e.target)) setShowSugg(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handlePlacaChange = (value) => {
    const upper = value.toUpperCase();
    setForm((f) => ({ ...f, placa: upper }));
    setAutoFilled(false);

    if (upper.length >= 2) {
      const matched = veiculos.filter((v) => v.placa?.toUpperCase().startsWith(upper));
      setSuggestions(matched.slice(0, 8));
      setShowSugg(matched.length > 0);
    } else {
      setSuggestions([]);
      setShowSugg(false);
    }
  };

  const selectVeiculo = (v) => {
    const updates = { placa: v.placa };
    if (v.tipo === "proprio") {
      updates.frota = v.frota || "";
      updates.btf = v.btf || "";
      updates.transportadora = "";
    } else {
      updates.transportadora = v.transportadora || "";
      updates.frota = "";
      updates.btf = "";
    }
    setForm((f) => ({ ...f, ...updates }));
    setAutoFilled(true);
    setShowSugg(false);
    setSuggestions([]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.placa.trim()) return;
    onSubmit(form);
    setForm(EMPTY);
    setAutoFilled(false);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-card rounded-xl border border-border p-6 space-y-4">
      {placaDuplicada && (
        <div className="flex items-center gap-2 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg px-4 py-2.5 text-sm text-red-700 dark:text-red-400">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          Placa <strong>{placaDuplicada}</strong> já possui uma solicitação ativa.
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        {/* Placa com autocomplete */}
        <div className="space-y-1.5 relative" ref={suggRef}>
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            Placa
            {autoFilled && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 dark:text-emerald-400 px-1.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                <Zap className="w-2.5 h-2.5" /> Auto
              </span>
            )}
          </Label>
          <Input
            ref={placaInputRef}
            value={form.placa}
            onChange={(e) => handlePlacaChange(e.target.value)}
            onFocus={() => suggestions.length > 0 && setShowSugg(true)}
            placeholder="Digite a placa..."
            className="h-11 text-base font-mono uppercase"
            autoComplete="off"
          />
          {/* Dropdown de sugestões */}
          {showSugg && suggestions.length > 0 && (
            <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-card border border-border rounded-xl shadow-xl overflow-hidden">
              {suggestions.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onMouseDown={() => selectVeiculo(v)}
                  className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-muted transition-colors text-left"
                >
                  <div className="flex items-center gap-2">
                    <Car className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    <span className="font-mono font-bold text-sm">{v.placa}</span>
                  </div>
                  <div className="text-right">
                    {v.tipo === "proprio" ? (
                      <div className="text-xs text-muted-foreground">
                        <span className="text-violet-600 dark:text-violet-400 font-semibold">Próprio</span>
                        {v.frota && <span> · Frota {v.frota}</span>}
                        {v.btf && <span> · {v.btf}</span>}
                      </div>
                    ) : (
                      <div className="text-xs text-muted-foreground">
                        <span className="text-blue-600 dark:text-blue-400 font-semibold">Terceiro</span>
                        {v.transportadora && <span> · {v.transportadora}</span>}
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Frota e BTF (apenas para próprios) */}
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Frota</Label>
          <Input
            value={form.frota}
            onChange={(e) => setForm({ ...form, frota: e.target.value })}
            placeholder="Frota"
            className="h-11 text-base font-mono"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">BTF</Label>
          <Input
            value={form.btf}
            onChange={(e) => setForm({ ...form, btf: e.target.value })}
            placeholder="BTF"
            className="h-11 text-base font-mono"
          />
        </div>

        {/* Transportadora */}
        <div className="space-y-1.5 sm:col-span-2">
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Transportadora</Label>
          <Input
            value={form.transportadora}
            onChange={(e) => setForm({ ...form, transportadora: e.target.value })}
            placeholder="Nome da transportadora"
            className="h-11"
          />
        </div>

        {/* Observações */}
        <div className="space-y-1.5 sm:col-span-2">
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Observações</Label>
          <Textarea
            value={form.observacoes}
            onChange={(e) => setForm({ ...form, observacoes: e.target.value })}
            placeholder="Observações adicionais..."
            className="resize-none h-20"
          />
        </div>
      </div>

      <Button
        type="submit"
        disabled={isSubmitting || !form.placa.trim()}
        className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg"
      >
        {isSubmitting ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Send className="w-5 h-5 mr-2" />}
        Solicitar OT
      </Button>
    </form>
  );
}