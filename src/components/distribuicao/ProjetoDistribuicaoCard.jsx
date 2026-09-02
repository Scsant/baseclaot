import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Cloud, EyeOff, MapPin, Pencil, ShieldCheck, ShieldX, Truck } from "lucide-react";
import LocalizacaoForm from "@/components/distribuicao/LocalizacaoForm";

export default function ProjetoDistribuicaoCard({ projeto, fazenda, clima, municipio, onSaveLocation, saving, onHide, quantidadeDestinada }) {
  const [editing, setEditing] = useState(false);
  const [agora, setAgora] = useState(Date.now());
  const localizado = fazenda?.latitude != null && fazenda?.longitude != null;

  useEffect(() => {
    if (!projeto.bloqueado) return;
    const timer = setInterval(() => setAgora(Date.now()), 60000);
    return () => clearInterval(timer);
  }, [projeto.bloqueado]);

  const minutosBloqueio = projeto.bloqueio_em ? Math.max(0, Math.floor((agora - new Date(projeto.bloqueio_em).getTime()) / 60000)) : null;
  const tempoBloqueio = minutosBloqueio == null ? "Não informado" : minutosBloqueio >= 1440 ? `${Math.floor(minutosBloqueio / 1440)}d ${Math.floor((minutosBloqueio % 1440) / 60)}h` : minutosBloqueio >= 60 ? `${Math.floor(minutosBloqueio / 60)}h ${minutosBloqueio % 60}min` : `${minutosBloqueio}min`;
  const previsao = (clima?.proximas12h || []).filter((_, index) => index % 3 === 0);

  return (
    <div className={`rounded-xl border p-3 space-y-2 ${projeto.bloqueado ? "border-red-300 bg-red-50/50 dark:bg-red-950/10" : "border-emerald-300 bg-emerald-50/40 dark:bg-emerald-950/10"}`}>
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0"><h2 className="font-bold text-sm text-foreground truncate">{projeto.fazenda}</h2><p className="text-[11px] text-muted-foreground">{projeto.modulo || "Módulo não informado"}</p></div>
        <div className="flex items-center gap-1 shrink-0">
          <span className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${projeto.bloqueado ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"}`}>
            {projeto.bloqueado ? <ShieldX className="w-3 h-3" /> : <ShieldCheck className="w-3 h-3" />}{projeto.bloqueado ? "Bloqueado" : "Liberado"}
          </span>
          <Button variant="ghost" size="sm" onClick={onHide} className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive" title="Ocultar card nesta página"><EyeOff className="w-3.5 h-3.5" /></Button>
        </div>
      </div>

      {projeto.bloqueado && (
        <div className="flex items-center justify-between gap-2 text-[11px] text-red-700">
          {projeto.motivo_bloqueio && <span className="truncate" title={projeto.motivo_bloqueio}><strong>Motivo:</strong> {projeto.motivo_bloqueio}</span>}
          <span className="font-bold shrink-0">Bloqueado há {tempoBloqueio}</span>
        </div>
      )}

      <div className="flex items-center justify-between gap-2 rounded-lg border border-orange-200 bg-orange-50/60 px-2 py-1.5 dark:border-orange-800 dark:bg-orange-950/10">
        <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground"><Truck className="h-3.5 w-3.5 text-orange-600" />Quantidade de caminhões destinados</span>
        <strong className="text-sm text-orange-600">{quantidadeDestinada}</strong>
      </div>

      <div className="flex items-center justify-between gap-2 rounded-lg bg-card border border-border px-2 py-1.5">
        <div className="flex items-center gap-1.5 text-[11px] min-w-0"><MapPin className="w-3.5 h-3.5 text-primary shrink-0" /><div className="min-w-0">{localizado ? <><p className="font-semibold truncate">{municipio === undefined ? "Identificando município..." : municipio ? `${municipio.nome}${municipio.uf ? ` - ${municipio.uf}` : ""}` : "Município não identificado"}</p><p className="text-[9px] text-muted-foreground truncate">{fazenda.latitude}, {fazenda.longitude}</p></> : <span>Sem localização</span>}</div></div>
        <Button variant="ghost" size="sm" onClick={() => setEditing(!editing)} className="h-6 w-6 p-0 shrink-0" title={localizado ? "Editar localização" : "Inserir localização"}><Pencil className="w-3 h-3" /></Button>
      </div>
      {editing && <LocalizacaoForm fazenda={fazenda} saving={saving} onCancel={() => setEditing(false)} onSave={async (lat, lon) => { await onSaveLocation(lat, lon); setEditing(false); }} />}

      <div className="rounded-lg bg-card border border-border px-2 py-2 min-h-11">
        {!localizado ? <div className="flex items-center gap-2"><Cloud className="w-4 h-4 text-blue-500 shrink-0" /><p className="text-[11px] text-muted-foreground">Cadastre as coordenadas</p></div> : !clima ? <p className="text-[11px] text-muted-foreground">Carregando clima...</p> : <>
          <div className="flex items-center gap-2"><span className="text-xl">{clima.icone}</span><div className="min-w-0"><p className="text-xs font-bold truncate">{clima.temperatura}°C · {clima.descricao}</p><p className="text-[10px] text-muted-foreground">Chuva {clima.chuva_probabilidade}% · {clima.chuva_mm} mm</p></div></div>
          {previsao.length > 0 && <div className="grid grid-cols-4 gap-1 mt-2 pt-2 border-t border-border">{previsao.map((item) => <div key={item.hora} className="text-center"><p className="text-[9px] text-muted-foreground">{item.hora}</p><p className="text-[10px] font-bold">{Math.round(item.temp)}°</p><p className="text-[9px] text-blue-600">{item.prob}%</p></div>)}</div>}
        </>}
      </div>
    </div>
  );
}