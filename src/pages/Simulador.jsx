import { useEffect, useState } from "react";
import SimuladorHeader from "@/components/simulador-ia/SimuladorHeader";
import UploadOperacao from "@/components/simulador-ia/UploadOperacao";
import RelatorioOperacional from "@/components/simulador-ia/RelatorioOperacional";
import { analisarPrintOperacional } from "@/lib/simuladorIA";

const TIPOS_ACEITOS = ["image/png", "image/jpeg"];

export default function Simulador() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [analise, setAnalise] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const selecionar = (imagem) => {
    if (!imagem) return;
    if (!TIPOS_ACEITOS.includes(imagem.type)) { setError("Use uma imagem PNG, JPG ou JPEG."); return; }
    setFile(imagem); setAnalise(null); setError("");
  };

  useEffect(() => {
    if (!file) { setPreview(""); return; }
    const url = URL.createObjectURL(file); setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  useEffect(() => {
    const colar = (event) => { const imagem = Array.from(event.clipboardData?.files || []).find((item) => item.type.startsWith("image/")); if (imagem) selecionar(imagem); };
    window.addEventListener("paste", colar); return () => window.removeEventListener("paste", colar);
  }, []);

  const analisar = async () => {
    setLoading(true); setError(""); setAnalise(null);
    try { setAnalise(await analisarPrintOperacional(file)); }
    catch { setError("Não foi possível analisar a imagem. Verifique o arquivo e tente novamente."); }
    finally { setLoading(false); }
  };

  return <div className="mx-auto max-w-7xl space-y-5"><SimuladorHeader /><UploadOperacao file={file} preview={preview} loading={loading} onFile={selecionar} onAnalyze={analisar} />{error && <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm font-medium text-destructive">{error}</div>}{analise && <RelatorioOperacional analise={analise} />}</div>;
}