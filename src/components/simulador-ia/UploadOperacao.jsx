import { useRef, useState } from "react";
import { Clipboard, FileImage, Loader2, Sparkles, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function UploadOperacao({ file, preview, loading, onFile, onAnalyze }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const drop = (event) => { event.preventDefault(); setDragging(false); onFile(event.dataTransfer.files?.[0]); };

  return (
    <section className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-6">
      <div onDragOver={(e) => { e.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={drop} className={`flex min-h-72 flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition-colors ${dragging ? "border-primary bg-primary/5" : "border-border bg-muted/30"}`}>
        {preview ? <img src={preview} alt="Preview do simulador operacional" className="max-h-80 w-full rounded-lg object-contain" /> : <><div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary"><FileImage className="h-8 w-8" /></div><h2 className="text-lg font-bold">Arraste o print do simulador</h2><p className="mt-2 text-sm text-muted-foreground">ou selecione uma imagem no computador</p></>}
        <input ref={inputRef} type="file" accept="image/png,image/jpeg" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
        <Button type="button" variant="outline" className="mt-5" onClick={() => inputRef.current?.click()}><Upload className="h-4 w-4" />{file ? "Trocar imagem" : "Selecionar imagem"}</Button>
      </div>
      <div className="mt-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground"><span className="flex items-center gap-1"><Clipboard className="h-3.5 w-3.5" />Cole com Ctrl + V</span><span>PNG · JPG · JPEG</span>{file && <strong className="text-foreground">{file.name}</strong>}</div>
        <Button onClick={onAnalyze} disabled={!file || loading} size="lg">{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}{loading ? "Analisando operação..." : "Analisar Operação"}</Button>
      </div>
    </section>
  );
}