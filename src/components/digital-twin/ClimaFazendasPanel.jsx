import { useState, useEffect } from "react";
import { buscarClimaFazenda } from "@/lib/climaService";

export default function ClimaFazendasPanel({ fazendas }) {
  const [climas, setClimas] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fazendasComCoord = fazendas.filter((f) => f.latitude && f.longitude);
    if (!fazendasComCoord.length) return;
    setLoading(true);
    Promise.all(
      fazendasComCoord.map((f) =>
        buscarClimaFazenda(f.latitude, f.longitude, f.id).then((c) => ({ id: f.id, clima: c }))
      )
    ).then((results) => {
      const map = {};
      results.forEach((r) => { map[r.id] = r.clima; });
      setClimas(map);
      setLoading(false);
    });
  }, [fazendas.map((f) => f.id).join(",")]);

  const fazendasComCoord = fazendas.filter((f) => f.latitude && f.longitude);

  if (!fazendasComCoord.length) {
    return (
      <div className="text-center py-6 text-muted-foreground text-sm">
        <span className="text-2xl block mb-2">🌤️</span>
        Cadastre fazendas com latitude/longitude para ver o clima em tempo real.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {fazendasComCoord.map((f) => {
        const c = climas[f.id];
        return (
          <div key={f.id} className={`rounded-xl border p-4 transition-all ${c?.chovendo ? "border-blue-200 bg-blue-50/50" : "border-border bg-card"}`}>
            <div className="flex items-center justify-between mb-2">
              <p className="font-semibold text-sm truncate">{f.nome}</p>
              <span className="text-2xl">{c?.icone || (loading ? "⏳" : "—")}</span>
            </div>
            {c ? (
              <>
                <p className="text-xs text-muted-foreground">{c.descricao}</p>
                <div className="flex items-center gap-3 mt-2 text-sm">
                  <span className="font-bold">{c.temperatura}°C</span>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${c.chuva_probabilidade > 50 ? "bg-blue-100 text-blue-700" : "bg-muted text-muted-foreground"}`}>
                    🌧️ {c.chuva_probabilidade}%
                  </span>
                  {c.chuva_mm > 0 && <span className="text-xs text-blue-600">{c.chuva_mm}mm</span>}
                </div>
                {c.chovendo && (
                  <div className="mt-2 text-xs bg-blue-100 text-blue-800 rounded-lg px-2 py-1 font-medium">
                    ⚠️ Redução de produtividade esperada (~28%)
                  </div>
                )}
              </>
            ) : (
              <p className="text-xs text-muted-foreground">{loading ? "Carregando..." : "Sem dados climáticos"}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}