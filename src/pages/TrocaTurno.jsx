import { useState, useEffect } from "react";
import { ClipboardList, Eye, RotateCcw, WrenchIcon, Loader2, Save, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import ModuloCard from "@/components/troca-turno/ModuloCard";
import ResumoTurnoModal from "@/components/troca-turno/ResumoTurnoModal";
import ResumoManutencaoModal from "@/components/troca-turno/ResumoManutencaoModal";
import { TURNOS } from "@/lib/turnos";
import { useAuth } from "@/lib/AuthContext";
import { base44 } from "@/api/base44Client";

const NUM_MODULOS = 14;

function getDefaultModulos() {
  return Array.from({ length: NUM_MODULOS }, (_, i) => ({
    numero: i + 1,
    titulo: `Módulo ${i + 1}`,
    equipamentos: [],
    obs: "",
  }));
}

const TURNO_COLORS = {
  1: { bg: "bg-blue-600", hover: "hover:bg-blue-700", badge: "bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400", border: "border-blue-500", tabColor: "text-blue-600 dark:text-blue-400" },
  2: { bg: "bg-amber-600", hover: "hover:bg-amber-700", badge: "bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400", border: "border-amber-500", tabColor: "text-amber-600 dark:text-amber-400" },
  3: { bg: "bg-purple-600", hover: "hover:bg-purple-700", badge: "bg-purple-100 dark:bg-purple-950/50 text-purple-700 dark:text-purple-400", border: "border-purple-500", tabColor: "text-purple-600 dark:text-purple-400" },
};

function getTurnoAtualId() {
  const h = new Date().getHours();
  if (h >= 6 && h < 14) return 1;
  if (h >= 14 && h < 22) return 2;
  return 3;
}

const defaultTurnoState = () => ({ modulos: getDefaultModulos(), obsGerais: "", recordId: null, savedAt: null });

export default function TrocaTurno() {
  const { user } = useAuth();
  const [turnoSelecionado, setTurnoSelecionado] = useState(getTurnoAtualId());
  const [turnos, setTurnos] = useState({ 1: defaultTurnoState(), 2: defaultTurnoState(), 3: defaultTurnoState() });
  const [showResumo, setShowResumo] = useState(false);
  const [showManutencao, setShowManutencao] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const turnoInfo = TURNOS.find((t) => t.id === turnoSelecionado);
  const turnoAtualId = getTurnoAtualId();
  const dadosTurno = turnos[turnoSelecionado];
  const colors = TURNO_COLORS[turnoSelecionado];

  // Carrega o registro mais recente de cada turno (sem filtro de data)
  useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        const [r1, r2, r3] = await Promise.all([
          base44.entities.TrocaTurno.filter({ turno: 1 }, "-updated_date", 1),
          base44.entities.TrocaTurno.filter({ turno: 2 }, "-updated_date", 1),
          base44.entities.TrocaTurno.filter({ turno: 3 }, "-updated_date", 1),
        ]);
        setTurnos((prev) => {
          const next = { ...prev };
          [[1, r1], [2, r2], [3, r3]].forEach(([id, records]) => {
            if (records && records.length > 0) {
              const rec = records[0];
              next[id] = {
                modulos: rec.modulos && rec.modulos.length > 0 ? rec.modulos : getDefaultModulos(),
                obsGerais: rec.observacoes_gerais || "",
                recordId: rec.id,
                savedAt: rec.updated_date ? new Date(rec.updated_date) : null,
              };
            }
          });
          return next;
        });
      } catch (e) {
        console.error("Erro ao carregar TrocaTurno:", e);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  const saveToDb = async () => {
    const dado = turnos[turnoSelecionado];
    try {
      setIsSaving(true);
      const payload = {
        turno: turnoSelecionado,
        data_turno: new Date().toISOString().slice(0, 10),
        modulos: dado.modulos,
        observacoes_gerais: dado.obsGerais,
        responsavel: user?.full_name || "",
      };
      let newRecordId = dado.recordId;
      if (dado.recordId) {
        await base44.entities.TrocaTurno.update(dado.recordId, payload);
      } else {
        const created = await base44.entities.TrocaTurno.create(payload);
        newRecordId = created.id;
      }
      setTurnos((prev) => ({
        ...prev,
        [turnoSelecionado]: { ...prev[turnoSelecionado], recordId: newRecordId, savedAt: new Date() },
      }));
    } catch (e) {
      console.error("Erro ao salvar TrocaTurno:", e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleModuloChange = (idx, updated) => {
    setTurnos((prev) => ({
      ...prev,
      [turnoSelecionado]: {
        ...prev[turnoSelecionado],
        modulos: prev[turnoSelecionado].modulos.map((m, i) => (i === idx ? updated : m)),
      },
    }));
  };

  const handleObsChange = (val) => {
    setTurnos((prev) => ({
      ...prev,
      [turnoSelecionado]: { ...prev[turnoSelecionado], obsGerais: val },
    }));
  };

  const handleReset = () => {
    if (!confirm("Tem certeza que deseja limpar todos os dados deste turno?")) return;
    setTurnos((prev) => ({
      ...prev,
      [turnoSelecionado]: { ...prev[turnoSelecionado], modulos: getDefaultModulos(), obsGerais: "" },
    }));
  };

  // Stats do turno selecionado
  const allEquips = dadosTurno.modulos.flatMap((m) => m.equipamentos || []);
  const getStatuses = (e) => e.statuses || (e.status ? [e.status] : ["operando"]);
  const totalOp = allEquips.filter((e) => getStatuses(e).includes("operando")).length;
  const totalMan = allEquips.filter((e) => getStatuses(e).includes("manutencao")).length;
  const totalRes = allEquips.filter((e) => getStatuses(e).includes("manutencao_restrita")).length;
  const totalSby = allEquips.filter((e) => getStatuses(e).includes("standby")).length;
  const totalSemCrane = allEquips.filter((e) => getStatuses(e).includes("sem_crane")).length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center shadow-lg">
            <ClipboardList className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Troca de Turno</h1>
            <p className="text-xs text-muted-foreground">
              Dados persistentes — selecione o turno para visualizar ou editar
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={handleReset} className="gap-2 text-muted-foreground">
            <RotateCcw className="w-4 h-4" /> Limpar Turno
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowManutencao(true)} className="gap-2 border-red-300 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400">
            <WrenchIcon className="w-4 h-4" /> Manutenção
            {(totalMan + totalRes) > 0 && (
              <span className="bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {totalMan + totalRes}
              </span>
            )}
          </Button>
          <div className="flex flex-col items-end gap-0.5">
            <Button onClick={saveToDb} disabled={isSaving} className={`gap-2 ${colors.bg} ${colors.hover}`}>
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {isSaving ? "Salvando..." : "Salvar"}
            </Button>
            {dadosTurno.savedAt && (
              <span className="text-[10px] text-muted-foreground">
                Salvo: {dadosTurno.savedAt.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
              </span>
            )}
          </div>
          <Button onClick={() => setShowResumo(true)} className="gap-2 bg-teal-600 hover:bg-teal-700">
            <Eye className="w-4 h-4" /> Ver Resumo
          </Button>
        </div>
      </div>

      {/* Seletor de Turno */}
      <div className="flex gap-1 p-1 bg-muted rounded-xl border border-border w-fit">
        {TURNOS.map((t) => {
          const isAtual = t.id === turnoAtualId;
          const isSelected = t.id === turnoSelecionado;
          const c = TURNO_COLORS[t.id];
          const savedInfo = turnos[t.id].savedAt;
          return (
            <button
              key={t.id}
              onClick={() => setTurnoSelecionado(t.id)}
              className={`relative flex flex-col items-start px-4 py-2 rounded-lg text-left transition-all ${
                isSelected
                  ? `bg-card shadow-sm border ${c.border}`
                  : "hover:bg-background/60 text-muted-foreground"
              }`}
            >
              {isAtual && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Turno atual" />
              )}
              <span className={`text-xs font-bold ${isSelected ? c.tabColor : ""}`}>{t.label}</span>
              <span className="text-[10px] text-muted-foreground">{t.horario}</span>
              {savedInfo && (
                <span className="text-[9px] text-muted-foreground/60 flex items-center gap-0.5 mt-0.5">
                  <Clock className="w-2 h-2" />
                  {savedInfo.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Banner turno diferente do atual */}
      {turnoSelecionado !== turnoAtualId && (
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 text-sm">
          <Clock className="w-4 h-4 shrink-0" />
          <span>Você está visualizando o <strong>{TURNOS.find((t) => t.id === turnoSelecionado)?.label}</strong>. O turno em curso agora é o <strong>{TURNOS.find((t) => t.id === turnoAtualId)?.label}</strong>.</span>
        </div>
      )}

      {/* Status bar */}
      <div className="flex flex-wrap gap-3 p-4 bg-card border border-border rounded-2xl">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <span className="text-sm font-semibold text-foreground">{totalOp}</span>
          <span className="text-xs text-muted-foreground">Operando</span>
        </div>
        <span className="text-border">|</span>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
          <span className="text-sm font-semibold text-foreground">{totalMan}</span>
          <span className="text-xs text-muted-foreground">Manutenção</span>
        </div>
        <span className="text-border">|</span>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
          <span className="text-sm font-semibold text-foreground">{totalRes}</span>
          <span className="text-xs text-muted-foreground">Op. Restrita</span>
        </div>
        <span className="text-border">|</span>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
          <span className="text-sm font-semibold text-foreground">{totalSemCrane}</span>
          <span className="text-xs text-muted-foreground">Sem Creare</span>
        </div>
        <span className="text-border">|</span>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
          <span className="text-sm font-semibold text-foreground">{totalSby}</span>
          <span className="text-xs text-muted-foreground">Stand By</span>
        </div>
        <span className="text-border hidden sm:block">|</span>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-foreground">{allEquips.length}</span>
          <span className="text-xs text-muted-foreground">Total de equipamentos</span>
        </div>
        <div className="ml-auto">
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${colors.badge}`}>
            {turnoInfo?.label} — {turnoInfo?.horario}
          </span>
        </div>
      </div>

      {/* Grid 14 módulos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {dadosTurno.modulos.map((modulo, idx) => (
          <ModuloCard
            key={`${turnoSelecionado}-${modulo.numero}`}
            modulo={modulo}
            onChange={(updated) => handleModuloChange(idx, updated)}
          />
        ))}
      </div>

      {/* Observações gerais */}
      <div className="bg-card border border-border rounded-2xl p-5 space-y-2">
        <label className="text-sm font-bold text-foreground">Observações Gerais do Turno</label>
        <p className="text-xs text-muted-foreground">Informações importantes para o próximo assistente de campo</p>
        <textarea
          value={dadosTurno.obsGerais}
          onChange={(e) => handleObsChange(e.target.value)}
          rows={4}
          placeholder="Ex: Estrada do módulo 7 com restrição de tráfego, aguardando liberação da manutenção. Chuva prevista às 18h..."
          className="w-full text-sm rounded-xl border border-border bg-muted/30 px-4 py-3 resize-none focus:outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground/40 text-foreground"
        />
      </div>

      <ResumoManutencaoModal
        open={showManutencao}
        onClose={() => setShowManutencao(false)}
        modulos={dadosTurno.modulos}
      />

      <ResumoTurnoModal
        open={showResumo}
        onClose={() => setShowResumo(false)}
        modulos={dadosTurno.modulos}
        turnoInfo={turnoInfo ? `${turnoInfo.label} ${turnoInfo.horario}` : ""}
        obsGerais={dadosTurno.obsGerais}
      />
    </div>
  );
}