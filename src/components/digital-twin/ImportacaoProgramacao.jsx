import { useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Upload, FileSpreadsheet, CheckCircle2, AlertTriangle, X } from "lucide-react";
import { gerarCronograma, detectarStatusAtual } from "@/lib/motorPreditivo";
import * as XLSX from "xlsx";
import { toast } from "sonner";

export default function ImportacaoProgramacao({ fazendas, onImportado }) {
  const { user } = useAuth();
  const inputRef = useRef();
  const [dragging, setDragging] = useState(false);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  const processarArquivo = (file) => {
    setErro("");
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const wb = XLSX.read(e.target.result, { type: "array" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(ws, { defval: "" });

        if (!rows.length) { setErro("Planilha vazia ou formato inválido."); return; }

        const mapeados = rows.map((row, i) => {
          // Aceita vários formatos de cabeçalho
          const placa = String(row["Placa"] || row["placa"] || row["PLACA"] || "").trim().toUpperCase();
          const horario = String(row["Horário Saída"] || row["Horario Saida"] || row["horario_saida_fabrica"] || row["Saída"] || row["Saida"] || "07:00").trim();
          const fazendaNome = String(row["Fazenda"] || row["Projeto"] || row["fazenda"] || row["FAZENDA"] || "").trim();
          const transportadora = String(row["Transportadora"] || row["transportadora"] || "").trim();
          const tipoCaminhao = String(row["Tipo"] || row["tipo_caminhao"] || "").trim();
          const produto = String(row["Produto"] || row["produto"] || "Madeira").trim();
          const obs = String(row["Observações"] || row["Observacoes"] || row["obs"] || "").trim();

          return { placa, horario_saida_fabrica: horario, fazenda_nome: fazendaNome, transportadora, tipo_caminhao: tipoCaminhao, produto, observacoes: obs };
        }).filter((r) => r.placa);

        setPreview({ arquivo: file.name, linhas: mapeados });
      } catch {
        setErro("Erro ao ler o arquivo. Verifique se é um Excel válido (.xlsx).");
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processarArquivo(file);
  };

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (file) processarArquivo(file);
  };

  const handleImportar = async () => {
    if (!preview) return;
    setLoading(true);
    try {
      const hoje = new Date().toISOString().slice(0, 10);

      // Cria sessão
      const sessao = await base44.entities.SessaoOperacao.create({
        data_operacao: hoje,
        total_caminhoes: preview.linhas.length,
        total_fazendas: [...new Set(preview.linhas.map((l) => l.fazenda_nome))].length,
        importado_por: user?.full_name || "Usuário",
        arquivo_origem: preview.arquivo,
        ultima_simulacao: new Date().toISOString(),
      });

      // Cria programações com previsões calculadas
      const registros = preview.linhas.map((linha) => {
        const fazenda = fazendas.find(
          (f) => f.nome?.toLowerCase() === linha.fazenda_nome?.toLowerCase() || f.codigo === linha.fazenda_nome
        );
        let cronograma = {};
        if (fazenda) {
          cronograma = gerarCronograma(linha, fazenda);
          const status = detectarStatusAtual(cronograma, linha.horario_saida_fabrica);
          cronograma.status = status;
        } else {
          cronograma.status = "programado";
          cronograma.indice_confianca = 50;
        }

        return {
          sessao_id: sessao.id,
          data_operacao: hoje,
          placa: linha.placa,
          transportadora: linha.transportadora,
          tipo_caminhao: linha.tipo_caminhao,
          produto: linha.produto,
          fazenda_nome: linha.fazenda_nome,
          fazenda_id: fazenda?.id || "",
          horario_saida_fabrica: linha.horario_saida_fabrica,
          observacoes: linha.observacoes,
          ultima_atualizacao_previsao: new Date().toISOString(),
          ...cronograma,
        };
      });

      await base44.entities.ProgramacaoCaminhao.bulkCreate(registros);
      toast.success(`${registros.length} caminhões importados e simulados!`);
      setPreview(null);
      if (onImportado) onImportado(sessao.id);
    } catch (err) {
      toast.error("Erro ao importar: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      {!preview && (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
            dragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-muted/30"
          }`}
        >
          <input ref={inputRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleFile} />
          <FileSpreadsheet className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
          <p className="font-semibold text-foreground">Arraste a planilha aqui ou clique para selecionar</p>
          <p className="text-xs text-muted-foreground mt-1">Suporte: .xlsx, .xls, .csv</p>
          <div className="mt-4 text-xs text-muted-foreground bg-muted/40 rounded-lg px-4 py-2 inline-block text-left">
            <p className="font-semibold mb-1">Colunas esperadas:</p>
            <p>Placa · Horário Saída · Fazenda · Transportadora · Tipo · Produto</p>
          </div>
        </div>
      )}

      {erro && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          {erro}
        </div>
      )}

      {/* Preview */}
      {preview && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              <span className="font-semibold text-sm">{preview.arquivo}</span>
              <span className="text-xs text-muted-foreground">({preview.linhas.length} caminhões)</span>
            </div>
            <button onClick={() => setPreview(null)} className="text-muted-foreground hover:text-foreground">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="max-h-48 overflow-y-auto rounded-lg border border-border">
            <table className="w-full text-xs">
              <thead className="bg-muted sticky top-0">
                <tr>
                  {["Placa", "Saída", "Fazenda", "Transportadora"].map((h) => (
                    <th key={h} className="text-left px-3 py-2 font-semibold text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {preview.linhas.map((l, i) => (
                  <tr key={i} className="border-t border-border hover:bg-muted/30">
                    <td className="px-3 py-1.5 font-mono font-bold">{l.placa}</td>
                    <td className="px-3 py-1.5">{l.horario_saida_fabrica}</td>
                    <td className="px-3 py-1.5">{l.fazenda_nome || <span className="text-amber-500">—</span>}</td>
                    <td className="px-3 py-1.5 text-muted-foreground">{l.transportadora}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Button onClick={handleImportar} disabled={loading} className="w-full gap-2">
            <Upload className="w-4 h-4" />
            {loading ? "Importando e simulando..." : `Importar e Simular ${preview.linhas.length} Caminhões`}
          </Button>
        </div>
      )}
    </div>
  );
}