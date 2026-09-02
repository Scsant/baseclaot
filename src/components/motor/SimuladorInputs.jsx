import { Truck, MapPin, Zap, CloudRain, Wrench, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";

function Section({ title, icon: Icon, color, children }) {
  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      <div className={`flex items-center gap-2 px-4 py-3 ${color}`}>
        <Icon className="w-4 h-4 text-white" />
        <span className="text-xs font-bold text-white uppercase tracking-wider">{title}</span>
      </div>
      <div className="p-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">{children}</div>
    </div>
  );
}

function Field({ label, value, onChange, type = "number", min, step = "1", children, unit }) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}{unit && <span className="text-muted-foreground/70 ml-1 normal-case font-normal">({unit})</span>}</label>
      {children ? children : (
        <Input
          type={type}
          value={value}
          min={min}
          step={step}
          onChange={e => onChange(type === "number" ? parseFloat(e.target.value) || 0 : e.target.value)}
          className="h-8 text-xs"
        />
      )}
    </div>
  );
}

function Toggle({ label, value, onChange }) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</label>
      <button
        onClick={() => onChange(!value)}
        className={`w-full h-8 rounded-md text-xs font-bold border-2 transition-all ${value
          ? "bg-emerald-500 border-emerald-500 text-white"
          : "border-border text-muted-foreground hover:bg-muted"}`}
      >
        {value ? "SIM" : "NÃO"}
      </button>
    </div>
  );
}

const ESTRADAS = ["excelente", "boa", "regular", "ruim", "critica"];
const CLIMAS   = [
  { id: "sol", label: "Sol" },
  { id: "garoa", label: "Garoa" },
  { id: "chuva_leve", label: "Chuva Leve" },
  { id: "chuva_moderada", label: "Chuva Moderada" },
  { id: "chuva_forte", label: "Chuva Forte" },
];

function set(inputs, key, val) {
  return { ...inputs, [key]: val };
}

export default function SimuladorInputs({ inputs, onChange }) {
  const upd = (key) => (val) => onChange(set(inputs, key, val));

  return (
    <div className="space-y-4">
      {/* Frota */}
      <Section title="Frota de Caminhões" icon={Truck} color="bg-gradient-to-r from-blue-600 to-blue-700">
        <Field label="Qtd. Caminhões" value={inputs.qtdCaminhoes} onChange={upd("qtdCaminhoes")} min={1} />
        <Field label="Capacidade" value={inputs.capacidadeCaminhaoTon} onChange={upd("capacidadeCaminhaoTon")} unit="ton" step="0.5" />
        <Field label="Tempo de Envio" value={inputs.tempoEnvioHoras} onChange={upd("tempoEnvioHoras")} unit="horas" step="0.5" />
        <Field label="Horas por Turno" value={inputs.horasTurno} onChange={upd("horasTurno")} unit="h" />
      </Section>

      {/* Distância */}
      <Section title="Distâncias e Velocidades" icon={MapPin} color="bg-gradient-to-r from-indigo-600 to-violet-600">
        <Field label="Distância Total" value={inputs.distanciaTotalKm} onChange={upd("distanciaTotalKm")} unit="km" step="0.5" />
        <Field label="Trecho Terra" value={inputs.distanciaTerraKm} onChange={upd("distanciaTerraKm")} unit="km" step="0.5" />
        <Field label="Trecho Asfalto" value={inputs.distanciaAsfaltadaKm} onChange={upd("distanciaAsfaltadaKm")} unit="km" step="0.5" />
        <Field label="Vel. na Terra" value={inputs.velocidadeTerraKmh} onChange={upd("velocidadeTerraKmh")} unit="km/h" step="1" />
        <Field label="Vel. no Asfalto" value={inputs.velocidadeAsfaltadaKmh} onChange={upd("velocidadeAsfaltadaKmh")} unit="km/h" step="1" />
        <Field label="Via Simultânea" value={inputs.capacidadeViaSimultanea} onChange={upd("capacidadeViaSimultanea")} unit="cam" />
      </Section>

      {/* Gruas */}
      <Section title="Gruas de Carregamento" icon={Zap} color="bg-gradient-to-r from-amber-500 to-orange-600">
        <Field label="Qtd. Gruas" value={inputs.qtdGruas} onChange={upd("qtdGruas")} min={1} />
        <Field label="Gruas em Manutenção" value={inputs.qtdGruasManutencao} onChange={upd("qtdGruasManutencao")} min={0} />
        <Field label="Cap. por Grua" value={inputs.capacidadeGruaTonHora} onChange={upd("capacidadeGruaTonHora")} unit="t/h" step="5" />
        <Field label="Eficiência" value={inputs.eficienciaGrua} onChange={upd("eficienciaGrua")} unit="%" />
        <Field label="MTBF" value={inputs.mtbfHoras} onChange={upd("mtbfHoras")} unit="h" step="0.5" />
        <Field label="MTTR" value={inputs.mttrHoras} onChange={upd("mttrHoras")} unit="h" step="0.5" />
      </Section>

      {/* Tempos */}
      <Section title="Tempos Operacionais" icon={Clock} color="bg-gradient-to-r from-teal-600 to-cyan-600">
        <Field label="Manobra" value={inputs.tempoManobraMin} onChange={upd("tempoManobraMin")} unit="min" step="0.5" />
        <Field label="Posicionamento" value={inputs.tempoPositMin} onChange={upd("tempoPositMin")} unit="min" step="0.5" />
        <Field label="Carregamento" value={inputs.tempoCarregMin} onChange={upd("tempoCarregMin")} unit="min" step="0.5" />
        <Field label="Saída" value={inputs.tempoSaidaMin} onChange={upd("tempoSaidaMin")} unit="min" step="0.5" />
        <Field label="Descarregamento" value={inputs.tempoDescarregMin} onChange={upd("tempoDescarregMin")} unit="min" step="0.5" />
      </Section>

      {/* Estrada e Clima */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-stone-600 to-stone-700">
            <MapPin className="w-4 h-4 text-white" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">Condição da Estrada</span>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-5 gap-2">
              {ESTRADAS.map(e => {
                const colors = { excelente:"bg-emerald-500", boa:"bg-green-500", regular:"bg-amber-500", ruim:"bg-orange-500", critica:"bg-red-600" };
                return (
                  <button
                    key={e}
                    onClick={() => onChange(set(inputs, "condicaoEstrada", e))}
                    className={`py-2 rounded-lg text-[10px] font-bold capitalize border-2 transition-all ${inputs.condicaoEstrada === e ? colors[e] + " text-white border-transparent" : "border-border text-muted-foreground hover:bg-muted"}`}
                  >{e}</button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-sky-600 to-blue-600">
            <CloudRain className="w-4 h-4 text-white" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">Condição Climática</span>
          </div>
          <div className="p-4">
            <div className="flex flex-wrap gap-2">
              {CLIMAS.map(c => (
                <button
                  key={c.id}
                  onClick={() => onChange(set(inputs, "condicaoClimatica", c.id))}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border-2 transition-all ${inputs.condicaoClimatica === c.id ? "bg-sky-500 text-white border-sky-500" : "border-border text-muted-foreground hover:bg-muted"}`}
                >{c.label}</button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Apoio Mecânico */}
      <Section title="Apoio Mecânico Disponível" icon={Wrench} color="bg-gradient-to-r from-rose-600 to-red-700">
        <Toggle label="Trator de Apoio" value={inputs.possuiTratorApoio} onChange={upd("possuiTratorApoio")} />
        <Toggle label="Skidder" value={inputs.possuiSkidder} onChange={upd("possuiSkidder")} />
        <Toggle label="Escavadeira" value={inputs.possuiEscavadeira} onChange={upd("possuiEscavadeira")} />
      </Section>
    </div>
  );
}