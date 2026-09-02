import { useState, useCallback } from "react";
import SimuladorInputs from "@/components/motor/SimuladorInputs";
import ResultadosCards from "@/components/motor/ResultadosCards";
import ModelagemFilas from "@/components/motor/ModelagemFilas";
import AnalisePreditivaMotor from "@/components/motor/AnalisePreditivaMotor";
import RecomendacoesPanel from "@/components/motor/RecomendacoesPanel";
import { Button } from "@/components/ui/button";
import { Brain, Zap, RefreshCw } from "lucide-react";
import { calcularSimulacao } from "@/lib/motorSimulacao";

export default function MotorSimulacao() {
  const [inputs, setInputs] = useState({
    // Frota
    qtdCaminhoes: 10,
    tempoEnvioHoras: 3,
    capacidadeCaminhaoTon: 40,
    // Distância
    distanciaTotalKm: 15,
    distanciaTerraKm: 10,
    distanciaAsfaltadaKm: 5,
    velocidadeTerraKmh: 25,
    velocidadeAsfaltadaKmh: 60,
    // Gruas
    qtdGruas: 3,
    qtdGruasManutencao: 1,
    capacidadeGruaTonHora: 120,
    mtbfHoras: 8,
    mttrHoras: 2,
    eficienciaGrua: 90,
    // Tempos
    tempoManobraMin: 5,
    tempoPositMin: 3,
    tempoCarregMin: 8,
    tempoSaidaMin: 2,
    tempoDescarregMin: 15,
    // Estrada
    condicaoEstrada: "boa",
    capacidadeViaSimultanea: 2,
    riscoInterrupcao: 10,
    // Clima
    condicaoClimatica: "sol",
    // Apoio mecânico
    possuiTratorApoio: false,
    possuiSkidder: false,
    possuiEscavadeira: false,
    // Operação
    horasTurno: 8,
  });

  const [resultado, setResultado] = useState(null);
  const [calculando, setCalculando] = useState(false);
  const [otimizado, setOtimizado] = useState(false);

  const handleSimular = useCallback(() => {
    setCalculando(true);
    setOtimizado(false);
    setTimeout(() => {
      const res = calcularSimulacao(inputs);
      setResultado(res);
      setCalculando(false);
    }, 600);
  }, [inputs]);

  const handleOtimizar = useCallback(() => {
    setCalculando(true);
    setTimeout(() => {
      // Busca a quantidade ideal de caminhões iterativamente
      let melhorInputs = { ...inputs };
      let melhorResultado = null;
      let melhorScore = -Infinity;
      for (let n = 1; n <= 30; n++) {
        const testInputs = { ...inputs, qtdCaminhoes: n };
        const res = calcularSimulacao(testInputs);
        const score = res.producaoHora - res.filaMed * 2 - res.tempoEspera * 0.5;
        if (score > melhorScore) {
          melhorScore = score;
          melhorResultado = res;
          melhorInputs = testInputs;
        }
      }
      setInputs(melhorInputs);
      setResultado(melhorResultado);
      setOtimizado(true);
      setCalculando(false);
    }, 800);
  }, [inputs]);

  const handleReset = () => {
    setResultado(null);
    setOtimizado(false);
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center shadow-lg shadow-violet-500/30">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-foreground tracking-tight">Motor de Simulação Logística</h1>
            <p className="text-xs text-muted-foreground">Previsão de filas, gargalos e capacidade operacional florestal</p>
          </div>
        </div>
        {resultado && (
          <button onClick={handleReset} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
            <RefreshCw className="w-3.5 h-3.5" /> Nova Simulação
          </button>
        )}
      </div>

      {!resultado ? (
        // Inputs
        <div className="space-y-4">
          <SimuladorInputs inputs={inputs} onChange={setInputs} />
          <div className="flex gap-3 flex-wrap">
            <Button
              onClick={handleSimular}
              disabled={calculando}
              className="gap-2 bg-violet-600 hover:bg-violet-700 px-8 h-12 text-sm font-bold shadow-lg shadow-violet-500/30"
            >
              {calculando ? (
                <><RefreshCw className="w-4 h-4 animate-spin" /> Calculando...</>
              ) : (
                <><Brain className="w-4 h-4" /> SIMULAR OPERAÇÃO</>
              )}
            </Button>
            <Button
              onClick={handleOtimizar}
              disabled={calculando}
              variant="outline"
              className="gap-2 border-2 border-emerald-500 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 px-8 h-12 text-sm font-bold"
            >
              {calculando ? (
                <><RefreshCw className="w-4 h-4 animate-spin" /> Otimizando...</>
              ) : (
                <><Zap className="w-4 h-4" /> OTIMIZAR OPERAÇÃO</>
              )}
            </Button>
          </div>
        </div>
      ) : (
        // Resultados
        <div className="space-y-6">
          {otimizado && (
            <div className="bg-emerald-50 dark:bg-emerald-950/30 border-2 border-emerald-400 rounded-2xl px-5 py-3 flex items-center gap-3">
              <Zap className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <p className="font-bold text-emerald-700 dark:text-emerald-400 text-sm">Operação Otimizada pelo Motor Inteligente</p>
                <p className="text-xs text-emerald-600 dark:text-emerald-500">Quantidade ideal de caminhões calculada: <strong>{inputs.qtdCaminhoes}</strong></p>
              </div>
            </div>
          )}

          <ResultadosCards resultado={resultado} inputs={inputs} />
          <ModelagemFilas resultado={resultado} />
          <AnalisePreditivaMotor resultado={resultado} inputs={inputs} />
          <RecomendacoesPanel resultado={resultado} inputs={inputs} />

          <div className="flex gap-3 flex-wrap pt-2">
            <Button onClick={handleSimular} variant="outline" className="gap-2">
              <RefreshCw className="w-4 h-4" /> Recalcular
            </Button>
            <Button
              onClick={handleOtimizar}
              disabled={calculando}
              className="gap-2 bg-emerald-600 hover:bg-emerald-700"
            >
              <Zap className="w-4 h-4" /> Otimizar Operação
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}