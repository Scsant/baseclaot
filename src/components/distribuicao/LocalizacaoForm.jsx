import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, X } from "lucide-react";

export default function LocalizacaoForm({ fazenda, onSave, onCancel, saving }) {
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [erro, setErro] = useState("");

  useEffect(() => {
    setLatitude(fazenda?.latitude ?? "");
    setLongitude(fazenda?.longitude ?? "");
  }, [fazenda]);

  const submit = async () => {
    const lat = Number(String(latitude).trim().replace(",", "."));
    const lon = Number(String(longitude).trim().replace(",", "."));
    if (!Number.isFinite(lat) || lat < -90 || lat > 90 || !Number.isFinite(lon) || lon < -180 || lon > 180) {
      setErro("Informe uma latitude e longitude válidas.");
      return;
    }
    setErro("");
    try {
      await onSave(lat, lon);
    } catch {
      setErro("Não foi possível salvar as coordenadas. Tente novamente.");
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-2 pt-3 border-t border-border">
      <Input type="text" inputMode="decimal" value={latitude} onChange={(e) => { setLatitude(e.target.value); setErro(""); }} placeholder="Latitude (ex: -20,123)" />
      <Input type="text" inputMode="decimal" value={longitude} onChange={(e) => { setLongitude(e.target.value); setErro(""); }} placeholder="Longitude (ex: -40,456)" />
      <div className="flex gap-2">
        <Button size="sm" onClick={submit} disabled={saving || latitude === "" || longitude === ""} className="gap-1"><Check className="w-4 h-4" />Salvar</Button>
        <Button size="sm" variant="outline" onClick={onCancel}><X className="w-4 h-4" /></Button>
      </div>
      {erro && <p className="text-xs text-destructive sm:col-span-3">{erro}</p>}
    </div>
  );
}