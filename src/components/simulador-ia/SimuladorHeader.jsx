import { BrainCircuit } from "lucide-react";

export default function SimuladorHeader() {
  return (
    <header className="rounded-2xl bg-sidebar px-5 py-6 text-sidebar-foreground shadow-sm sm:px-7">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground"><BrainCircuit className="h-6 w-6" /></div>
        <div><p className="mb-1 text-xs font-bold uppercase tracking-widest text-sidebar-foreground/60">Inteligência logística</p><h1 className="font-heading text-2xl font-black sm:text-3xl">Simulador Operacional IA</h1><p className="mt-2 max-w-3xl text-sm text-sidebar-foreground/70">Faça upload do print do simulador operacional e receba automaticamente uma análise inteligente da programação do dia.</p></div>
      </div>
    </header>
  );
}