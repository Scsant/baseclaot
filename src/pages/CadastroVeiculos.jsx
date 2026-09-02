import { useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Car, Upload, Trash2, Search, Loader2, CheckCircle2, AlertTriangle, FileSpreadsheet } from "lucide-react";
import * as XLSX from "xlsx";

export default function CadastroVeiculos() {
  const queryClient = useQueryClient();
  const fileRef = useRef();
  const [search, setSearch] = useState("");
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const { data: veiculos = [], isLoading } = useQuery({
    queryKey: ["veiculos-cadastro"],
    queryFn: () => base44.entities.VeiculoCadastro.list("-created_date", 2000),
    refetchInterval: 10000,
  });

  const filtered = veiculos.filter((v) => {
    const q = search.toLowerCase();
    return (
      !q ||
      v.placa?.toLowerCase().includes(q) ||
      v.frota?.toLowerCase().includes(q) ||
      v.btf?.toLowerCase().includes(q) ||
      v.transportadora?.toLowerCase().includes(q)
    );
  });

  const proprios = filtered.filter((v) => v.tipo === "proprio");
  const terceiros = filtered.filter((v) => v.tipo === "terceiro");

  const handleImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    setImportResult(null);

    try {
      const buffer = await file.arrayBuffer();
      const wb = XLSX.read(buffer, { type: "array" });

      const findSheet = (names) => {
        for (const n of names) {
          if (wb.Sheets[n]) return wb.Sheets[n];
        }
        return null;
      };

      const propSheet = findSheet(["proprio", "Proprio", "PROPRIO"]);
      const tercSheet = findSheet(["Terceiro", "terceiro", "TERCEIRO"]);

      const propRows = propSheet ? XLSX.utils.sheet_to_json(propSheet, { defval: "" }) : [];
      const tercRows = tercSheet ? XLSX.utils.sheet_to_json(tercSheet, { defval: "" }) : [];

      const propList = propRows
        .map(r => ({
          placa: String(r["placa"] ?? r["Placa"] ?? r["PLACA"] ?? "").trim().toUpperCase(),
          frota: String(r["frota"] ?? r["Frota"] ?? r["FROTA"] ?? "").trim(),
          btf: String(r["btf"] ?? r["Btf"] ?? r["BTF"] ?? "").trim(),
          data_referencia: String(r["data"] ?? r["Data"] ?? r["DATA"] ?? "").trim(),
        }))
        .filter(r => r.placa);

      const tercList = tercRows
        .map(r => ({
          placa: String(r["placa"] ?? r["Placa"] ?? r["PLACA"] ?? "").trim().toUpperCase(),
          transportadora: String(r["Transportadora"] ?? r["transportadora"] ?? r["TRANSPORTADORA"] ?? "").trim(),
          data_referencia: String(r["data"] ?? r["Data"] ?? r["DATA"] ?? "").trim(),
        }))
        .filter(r => r.placa);

      if (propList.length === 0 && tercList.length === 0) {
        setImportResult({ error: "Nenhum veículo encontrado. Verifique se as abas se chamam 'proprio' e 'Terceiro'." });
        return;
      }

      const toImport = [
        ...propList.map(r => ({ ...r, tipo: "proprio", transportadora: "" })),
        ...tercList.map(r => ({ ...r, tipo: "terceiro", frota: "", btf: "" })),
      ];

      // Limpa e reimporta
      await base44.entities.VeiculoCadastro.deleteMany({});
      await base44.entities.VeiculoCadastro.bulkCreate(toImport);

      queryClient.invalidateQueries({ queryKey: ["veiculos-cadastro"] });
      setImportResult({
        success: true,
        count: toImport.length,
        proprios: propList.length,
        terceiros: tercList.length,
      });
    } catch (err) {
      setImportResult({ error: "Erro ao processar arquivo: " + err.message });
    } finally {
      setImporting(false);
      e.target.value = "";
    }
  };

  const handleDelete = async (id) => {
    setDeleting(id);
    await base44.entities.VeiculoCadastro.delete(id);
    queryClient.invalidateQueries({ queryKey: ["veiculos-cadastro"] });
    setDeleting(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-violet-700 flex items-center justify-center shadow-lg">
            <Car className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Cadastro de Veículos</h1>
            <p className="text-xs text-muted-foreground">{veiculos.length} veículos cadastrados</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input ref={fileRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={handleImport} />
          {veiculos.length > 0 && (
            <Button
              variant="outline"
              onClick={async () => {
                if (!confirm("Limpar todos os veículos cadastrados?")) return;
                await base44.entities.VeiculoCadastro.deleteMany({});
                queryClient.invalidateQueries({ queryKey: ["veiculos-cadastro"] });
                setImportResult(null);
              }}
              className="gap-2 text-red-500 border-red-200 hover:bg-red-50 dark:hover:bg-red-950/30"
            >
              <Trash2 className="w-4 h-4" />
              Limpar tudo
            </Button>
          )}
          <Button
            onClick={() => fileRef.current?.click()}
            disabled={importing}
            className="gap-2 bg-violet-600 hover:bg-violet-700"
          >
            {importing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            {importing ? "Processando..." : "Importar Excel"}
          </Button>
        </div>
      </div>

      {/* Import Result */}
      {importResult && (
        <div className={`rounded-xl border p-4 flex items-start gap-3 ${importResult.error
          ? "bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-800"
          : "bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800"
        }`}>
          {importResult.error
            ? <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            : <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
          }
          <div>
            {importResult.error
              ? <p className="text-sm text-red-700 dark:text-red-400">{importResult.error}</p>
              : (
                <div>
                  <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                    Importação concluída! {importResult.count} veículos cadastrados.
                  </p>
                  <p className="text-xs text-emerald-600 dark:text-emerald-500 mt-0.5">
                    {importResult.proprios} próprios · {importResult.terceiros} terceiros
                  </p>
                </div>
              )
            }
          </div>
        </div>
      )}



      {/* Instruções quando vazio */}
      {veiculos.length === 0 && !isLoading && !importing && (
        <div className="rounded-xl border-2 border-dashed border-border p-8 text-center">
          <FileSpreadsheet className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="font-semibold text-muted-foreground">Nenhum veículo cadastrado</p>
          <p className="text-sm text-muted-foreground/70 mt-1">
            Importe um arquivo Excel com as abas <strong>"proprio"</strong> e <strong>"Terceiro"</strong>
          </p>
          <p className="text-xs text-muted-foreground/50 mt-2">
            Aba <strong>proprio</strong>: colunas data, frota, horas_disp, btf, placa<br />
            Aba <strong>Terceiro</strong>: colunas data, Transportadora, placa
          </p>
        </div>
      )}

      {/* Search */}
      {veiculos.length > 0 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por placa, frota, BTF ou transportadora..."
            className="pl-10"
          />
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Próprios */}
          {proprios.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400">Frota Própria</span>
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{proprios.length}</span>
              </div>
              <div className="overflow-x-auto rounded-xl border border-border">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">Placa</th>
                      <th className="text-left px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">Frota</th>
                      <th className="text-left px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">BTF</th>
                      <th className="text-left px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">Data Ref.</th>
                      <th className="px-4 py-2.5"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {proprios.map((v) => (
                      <tr key={v.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-2.5 font-mono font-bold text-foreground">{v.placa}</td>
                        <td className="px-4 py-2.5 text-muted-foreground">{v.frota || "—"}</td>
                        <td className="px-4 py-2.5 text-muted-foreground">{v.btf || "—"}</td>
                        <td className="px-4 py-2.5 text-muted-foreground text-xs">{v.data_referencia || "—"}</td>
                        <td className="px-4 py-2.5">
                          <button onClick={() => handleDelete(v.id)} disabled={deleting === v.id} className="text-muted-foreground hover:text-red-500 transition-colors">
                            {deleting === v.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Terceiros */}
          {terceiros.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">Veículos Terceiros</span>
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{terceiros.length}</span>
              </div>
              <div className="overflow-x-auto rounded-xl border border-border">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">Placa</th>
                      <th className="text-left px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">Transportadora</th>
                      <th className="text-left px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">Data Ref.</th>
                      <th className="px-4 py-2.5"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {terceiros.map((v) => (
                      <tr key={v.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-2.5 font-mono font-bold text-foreground">{v.placa}</td>
                        <td className="px-4 py-2.5 text-muted-foreground">{v.transportadora || "—"}</td>
                        <td className="px-4 py-2.5 text-muted-foreground text-xs">{v.data_referencia || "—"}</td>
                        <td className="px-4 py-2.5">
                          <button onClick={() => handleDelete(v.id)} disabled={deleting === v.id} className="text-muted-foreground hover:text-red-500 transition-colors">
                            {deleting === v.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}