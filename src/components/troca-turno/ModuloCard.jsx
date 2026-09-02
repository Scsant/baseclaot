import { useState } from "react";
import { Pencil, Check, Plus, Trash2, ChevronDown, ChevronUp, AlertTriangle, WrenchIcon, Activity, PauseCircle, XCircle, Sun, Cloud, CloudRain, CloudLightning, Wind, UserX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const CLIMA_OPTIONS = [
  { key: "sol", label: "Sol", icon: Sun, color: "text-yellow-500", bg: "bg-yellow-50 dark:bg-yellow-950/30", border: "border-yellow-300 dark:border-yellow-700" },
  { key: "nublado", label: "Nublado", icon: Cloud, color: "text-slate-500", bg: "bg-slate-50 dark:bg-slate-800/30", border: "border-slate-300 dark:border-slate-600" },
  { key: "chuva", label: "Chuva", icon: CloudRain, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-950/30", border: "border-blue-300 dark:border-blue-700" },
  { key: "tempestade", label: "Tempestade", icon: CloudLightning, color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-950/30", border: "border-purple-300 dark:border-purple-700" },
  { key: "vento", label: "Vento", icon: Wind, color: "text-cyan-500", bg: "bg-cyan-50 dark:bg-cyan-950/30", border: "border-cyan-300 dark:border-cyan-700" },
];

const STATUS_CONFIG = {
  operando: {
    label: "Operando",
    color: "bg-emerald-500",
    textColor: "text-emerald-700 dark:text-emerald-400",
    bgColor: "bg-emerald-50 dark:bg-emerald-950/30",
    borderColor: "border-emerald-200 dark:border-emerald-700",
    icon: Activity,
  },
  manutencao: {
    label: "Manutenção",
    color: "bg-red-500",
    textColor: "text-red-700 dark:text-red-400",
    bgColor: "bg-red-50 dark:bg-red-950/30",
    borderColor: "border-red-200 dark:border-red-700",
    icon: WrenchIcon,
  },
  manutencao_restrita: {
    label: "Op. Restrita",
    color: "bg-amber-500",
    textColor: "text-amber-700 dark:text-amber-400",
    bgColor: "bg-amber-50 dark:bg-amber-950/30",
    borderColor: "border-amber-200 dark:border-amber-700",
    icon: AlertTriangle,
  },
  sem_crane: {
    label: "Sem Creare",
    color: "bg-orange-500",
    textColor: "text-orange-700 dark:text-orange-400",
    bgColor: "bg-orange-50 dark:bg-orange-950/30",
    borderColor: "border-orange-200 dark:border-orange-700",
    icon: XCircle,
  },
  standby: {
    label: "Stand By",
    color: "bg-blue-500",
    textColor: "text-blue-700 dark:text-blue-400",
    bgColor: "bg-blue-50 dark:bg-blue-950/30",
    borderColor: "border-blue-200 dark:border-blue-700",
    icon: PauseCircle,
  },
};

export default function ModuloCard({ modulo, onChange }) {
  const [editingTitle, setEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState(modulo.titulo);
  const [novoEquip, setNovoEquip] = useState("");
  const [expanded, setExpanded] = useState(true);

  const toggleFaltaOperador = () => {
    onChange({ ...modulo, falta_operador: !modulo.falta_operador });
  };

  const setClima = (key) => {
    onChange({ ...modulo, clima: modulo.clima === key ? null : key });
  };

  const climaAtual = CLIMA_OPTIONS.find((c) => c.key === modulo.clima);

  const saveTitle = () => {
    onChange({ ...modulo, titulo: tempTitle });
    setEditingTitle(false);
  };

  const addEquipamento = () => {
    if (!novoEquip.trim()) return;
    const equipamentos = [...(modulo.equipamentos || []), {
      id: Date.now(),
      nome: novoEquip.trim(),
      statuses: ["operando"],
      obs: "",
    }];
    onChange({ ...modulo, equipamentos });
    setNovoEquip("");
  };

  const updateEquip = (idx, field, value) => {
    const equipamentos = modulo.equipamentos.map((e, i) =>
      i === idx ? { ...e, [field]: value } : e
    );
    onChange({ ...modulo, equipamentos });
  };

  const toggleEquipStatus = (idx, key) => {
    const equip = modulo.equipamentos[idx];
    // compatibilidade: migra status antigo para array
    const current = equip.statuses || (equip.status ? [equip.status] : ["operando"]);
    let next;
    if (current.includes(key)) {
      // remove — mas mantém ao menos 1
      next = current.filter((s) => s !== key);
      if (next.length === 0) next = [key];
    } else {
      if (current.length >= 2) {
        // substitui o último
        next = [current[0], key];
      } else {
        next = [...current, key];
      }
    }
    const equipamentos = modulo.equipamentos.map((e, i) =>
      i === idx ? { ...e, statuses: next, status: next[0] } : e
    );
    onChange({ ...modulo, equipamentos });
  };

  const removeEquip = (idx) => {
    const equipamentos = modulo.equipamentos.filter((_, i) => i !== idx);
    onChange({ ...modulo, equipamentos });
  };

  const equipamentos = modulo.equipamentos || [];
  // helper: pega array de statuses compatível com dados antigos
  const getStatuses = (e) => e.statuses || (e.status ? [e.status] : ["operando"]);
  const totalOp = equipamentos.filter((e) => getStatuses(e).includes("operando")).length;
  const totalMan = equipamentos.filter((e) => getStatuses(e).includes("manutencao")).length;
  const totalRes = equipamentos.filter((e) => getStatuses(e).includes("manutencao_restrita")).length;
  const totalSby = equipamentos.filter((e) => getStatuses(e).includes("standby")).length;
  const totalSemCrane = equipamentos.filter((e) => getStatuses(e).includes("sem_crane")).length;

  // Card border color based on worst status
  const cardBorder = modulo.falta_operador
    ? "border-rose-500 dark:border-rose-500"
    : totalMan > 0
    ? "border-red-400 dark:border-red-600"
    : totalRes > 0
    ? "border-amber-400 dark:border-amber-600"
    : totalSemCrane > 0
    ? "border-orange-400 dark:border-orange-600"
    : totalSby > 0
    ? "border-blue-400 dark:border-blue-600"
    : "border-border";

  return (
    <div className={cn("bg-card border-2 rounded-2xl overflow-hidden shadow-sm transition-all", cardBorder)}>
      {/* Card Header */}
      <div className="px-4 py-3 flex items-center justify-between gap-2 bg-muted/30">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="text-xs font-black text-muted-foreground shrink-0 w-6 h-6 rounded-lg bg-muted flex items-center justify-center">
            {modulo.numero}
          </span>
          {editingTitle ? (
            <div className="flex items-center gap-1.5 flex-1">
              <Input
                value={tempTitle}
                onChange={(e) => setTempTitle(e.target.value)}
                className="h-7 text-sm font-semibold"
                onKeyDown={(e) => e.key === "Enter" && saveTitle()}
                autoFocus
              />
              <Button size="icon" variant="ghost" className="h-7 w-7 shrink-0" onClick={saveTitle}>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 flex-1 min-w-0">
              <span className="text-sm font-bold text-foreground truncate">{modulo.titulo}</span>
              <button onClick={() => { setTempTitle(modulo.titulo); setEditingTitle(true); }} className="text-muted-foreground/50 hover:text-muted-foreground shrink-0">
                <Pencil className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {/* Status pills */}
          <div className="hidden sm:flex items-center gap-1">
            {modulo.falta_operador && <span className="px-1.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 text-[10px] font-bold flex items-center gap-0.5"><UserX className="w-2.5 h-2.5" /> S/Op</span>}
            {totalOp > 0 && <span className="px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold">{totalOp} op.</span>}
            {totalMan > 0 && <span className="px-1.5 py-0.5 rounded-full bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-400 text-[10px] font-bold">{totalMan} mnt.</span>}
            {totalRes > 0 && <span className="px-1.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 text-[10px] font-bold">{totalRes} rest.</span>}
            {totalSemCrane > 0 && <span className="px-1.5 py-0.5 rounded-full bg-orange-100 dark:bg-orange-950/50 text-orange-700 dark:text-orange-400 text-[10px] font-bold">{totalSemCrane} s.crane</span>}
            {totalSby > 0 && <span className="px-1.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 text-[10px] font-bold">{totalSby} sby.</span>}
          </div>
          <button onClick={() => setExpanded(!expanded)} className="text-muted-foreground hover:text-foreground">
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="px-4 pb-4 pt-3 space-y-3">
          {/* Equipamentos */}
          {equipamentos.length === 0 ? (
            <p className="text-xs text-muted-foreground italic text-center py-2">Nenhum equipamento cadastrado</p>
          ) : (
            <div className="space-y-2">
              {equipamentos.map((equip, idx) => {
                const activeStatuses = getStatuses(equip);
                const primarySt = STATUS_CONFIG[activeStatuses[0]] || STATUS_CONFIG.operando;
                const PrimaryIcon = primarySt.icon;
                return (
                  <div key={equip.id} className={cn("rounded-xl border p-2.5 space-y-1.5", primarySt.bgColor, primarySt.borderColor)}>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 shrink-0">
                        {activeStatuses.map((s) => {
                          const Ic = STATUS_CONFIG[s]?.icon || Activity;
                          return <Ic key={s} className={cn("w-3.5 h-3.5", STATUS_CONFIG[s]?.textColor)} />;
                        })}
                      </div>
                      <span className="text-sm font-semibold text-foreground flex-1 truncate">{equip.nome}</span>
                      {activeStatuses.length === 2 && (
                        <span className="text-[9px] font-bold text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full shrink-0">2</span>
                      )}
                      <button onClick={() => removeEquip(idx)} className="text-muted-foreground/40 hover:text-destructive shrink-0">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                    {/* Status selector — até 2 selecionados */}
                    <div className="flex gap-1 flex-wrap">
                      {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
                        const isActive = activeStatuses.includes(key);
                        const isDisabled = !isActive && activeStatuses.length >= 2;
                        return (
                          <button
                            key={key}
                            onClick={() => toggleEquipStatus(idx, key)}
                            disabled={isDisabled}
                            className={cn(
                              "px-2 py-0.5 rounded-full text-[10px] font-bold border transition-all",
                              isActive
                                ? `${cfg.color} text-white border-transparent`
                                : isDisabled
                                ? "bg-transparent border-border text-muted-foreground/30 cursor-not-allowed"
                                : "bg-transparent border-border text-muted-foreground hover:bg-muted"
                            )}
                          >
                            {cfg.label}
                          </button>
                        );
                      })}
                    </div>
                    {/* Obs */}
                    <input
                      value={equip.obs || ""}
                      onChange={(e) => updateEquip(idx, "obs", e.target.value)}
                      placeholder="Observação..."
                      className="w-full text-xs bg-transparent border-0 border-b border-dashed border-border/60 focus:outline-none focus:border-primary pb-0.5 text-muted-foreground placeholder:text-muted-foreground/40"
                    />
                  </div>
                );
              })}
            </div>
          )}

          {/* Add equipamento */}
          <div className="flex gap-2">
            <Input
              value={novoEquip}
              onChange={(e) => setNovoEquip(e.target.value)}
              placeholder="Ex: Grua..."
              className="h-8 text-xs"
              onKeyDown={(e) => e.key === "Enter" && addEquipamento()}
            />
            <Button size="sm" variant="outline" onClick={addEquipamento} className="h-8 px-3 shrink-0">
              <Plus className="w-3.5 h-3.5" />
            </Button>
          </div>

          {/* Falta de Operador */}
          <button
            onClick={toggleFaltaOperador}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl border-2 text-sm font-semibold transition-all ${
              modulo.falta_operador
                ? "bg-rose-100 dark:bg-rose-950/40 border-rose-400 dark:border-rose-600 text-rose-700 dark:text-rose-400"
                : "border-dashed border-border text-muted-foreground hover:border-rose-300 hover:text-rose-500"
            }`}
          >
            <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 ${
              modulo.falta_operador ? "bg-rose-500 border-rose-500" : "border-current"
            }`}>
              {modulo.falta_operador && <Check className="w-2.5 h-2.5 text-white" />}
            </div>
            <UserX className="w-3.5 h-3.5 shrink-0" />
            Falta de Operador
          </button>

          {/* Clima */}
          <div className="space-y-1">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Condição Climática</p>
            <div className="flex gap-1.5 flex-wrap">
              {CLIMA_OPTIONS.map((c) => {
                const Icon = c.icon;
                const selected = modulo.clima === c.key;
                return (
                  <button
                    key={c.key}
                    onClick={() => setClima(c.key)}
                    title={c.label}
                    className={cn(
                      "flex items-center gap-1 px-2 py-1 rounded-lg border text-[10px] font-semibold transition-all",
                      selected ? `${c.bg} ${c.border} ${c.color}` : "border-border text-muted-foreground hover:bg-muted"
                    )}
                  >
                    <Icon className="w-3 h-3" />
                    {c.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Obs do módulo */}
          <textarea
            value={modulo.obs || ""}
            onChange={(e) => onChange({ ...modulo, obs: e.target.value })}
            placeholder="Observações do módulo para o próximo turno..."
            rows={5}
            className="w-full min-h-32 text-xs rounded-lg border border-border bg-muted/30 px-3 py-2 resize-y focus:outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground/40 text-foreground"
          />
        </div>
      )}
    </div>
  );
}