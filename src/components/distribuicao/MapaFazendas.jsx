import { Fragment, useEffect, useMemo } from "react";
import { CircleMarker, MapContainer, Popup, TileLayer, Tooltip, useMap } from "react-leaflet";
import { MapPinned } from "lucide-react";
import "leaflet/dist/leaflet.css";

function AjustarMapa({ pontos }) {
  const map = useMap();
  useEffect(() => {
    if (pontos.length === 1) map.setView(pontos[0], 12);
    if (pontos.length > 1) map.fitBounds(pontos, { padding: [30, 30] });
  }, [map, pontos]);
  return null;
}

export default function MapaFazendas({ fazendas, desviosPorFazenda = {}, climas = {} }) {
  const localizadas = useMemo(() => fazendas.filter((fazenda) =>
    Number.isFinite(Number(fazenda.latitude)) && Number.isFinite(Number(fazenda.longitude))
  ), [fazendas]);
  const pontos = useMemo(() => localizadas.map((fazenda) => [Number(fazenda.latitude), Number(fazenda.longitude)]), [localizadas]);

  return (
    <section className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
        <div className="flex items-center gap-2"><MapPinned className="h-4 w-4 text-primary" /><h2 className="text-sm font-bold">Mapa das fazendas</h2></div>
        <span className="text-xs text-muted-foreground">{localizadas.length} com coordenadas</span>
      </div>
      {localizadas.length === 0 ? (
        <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">Nenhuma fazenda possui latitude e longitude cadastradas.</div>
      ) : (
        <MapContainer center={[-15.78, -47.93]} zoom={4} scrollWheelZoom className="h-64 w-full sm:h-72">
          <TileLayer attribution="&copy; OpenStreetMap" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <AjustarMapa pontos={pontos} />
          {localizadas.map((fazenda) => {
            const quantidade = desviosPorFazenda[fazenda.nome.trim().toLocaleLowerCase("pt-BR")] || 0;
            const comDesvio = quantidade > 0;
            const corAlerta = quantidade >= 5 ? "hsl(var(--destructive))" : quantidade >= 3 ? "hsl(var(--chart-3))" : "hsl(var(--chart-2))";
            const classeAlerta = quantidade >= 5 ? "text-destructive" : quantidade >= 3 ? "text-yellow-600" : "text-emerald-600";
            const previsaoChuva = (climas[fazenda.id]?.proximas12h || []).slice(1).reduce(
              (maior, periodo) => periodo.prob > maior.prob ? periodo : maior,
              { prob: 0, hora: "" }
            );
            const comChuva = previsaoChuva.prob > 0;
            return (
              <Fragment key={fazenda.id}>
                {comChuva && (
                  <CircleMarker center={[Number(fazenda.latitude), Number(fazenda.longitude)]} radius={18} pathOptions={{ color: "hsl(var(--primary))", fillColor: "hsl(var(--primary))", fillOpacity: 0.15, weight: 3, dashArray: "5 4", className: "animate-pulse" }}>
                    <Tooltip permanent direction="bottom" offset={[0, 15]}><span className="font-bold text-blue-700">🌧️ {fazenda.nome}: {previsaoChuva.prob}% às {previsaoChuva.hora}</span></Tooltip>
                  </CircleMarker>
                )}
                <CircleMarker center={[Number(fazenda.latitude), Number(fazenda.longitude)]} radius={comDesvio ? 13 : 8} pathOptions={{ color: comDesvio ? corAlerta : "hsl(var(--primary))", fillColor: comDesvio ? corAlerta : "hsl(var(--primary))", fillOpacity: comDesvio ? 0.9 : 0.75, className: comDesvio ? "animate-pulse" : "" }}>
                  {comDesvio && <Tooltip permanent direction="top" offset={[0, -12]}><span className={`font-bold ${classeAlerta}`}>⚠ {quantidade} {quantidade === 1 ? "desvio" : "desvios"}</span></Tooltip>}
                  <Popup><strong>{fazenda.nome}</strong><br />{fazenda.empresa || "Empresa não informada"}<br />{fazenda.latitude}, {fazenda.longitude}{comChuva && <><br /><strong className="text-blue-700">🌧️ Chuva prevista: {previsaoChuva.prob}% às {previsaoChuva.hora}</strong></>}{comDesvio && <><br /><strong className={classeAlerta}>⚠ {quantidade} {quantidade === 1 ? "desvio registrado hoje" : "desvios registrados hoje"}</strong></>}</Popup>
                </CircleMarker>
              </Fragment>
            );
          })}
        </MapContainer>
      )}
    </section>
  );
}