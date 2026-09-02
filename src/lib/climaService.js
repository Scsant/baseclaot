/**
 * Serviço de clima usando Open-Meteo (gratuito, sem chave)
 */

const CACHE = {};
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutos

export async function buscarClimaFazenda(lat, lon, fazendaId) {
  const agora = Date.now();
  if (CACHE[fazendaId] && agora - CACHE[fazendaId].ts < CACHE_TTL_MS) {
    return CACHE[fazendaId].data;
  }

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=precipitation_probability,precipitation,weathercode,temperature_2m&current_weather=true&forecast_days=2&timezone=America%2FSao_Paulo`;
    const res = await fetch(url);
    const json = await res.json();

    const current = json.current_weather || {};
    const hourly = json.hourly || {};

    // Hora atual no índice
    const now = new Date();
    const idx = now.getHours();

    const chuva_prob = hourly.precipitation_probability?.[idx] ?? 0;
    const chuva_mm = hourly.precipitation?.[idx] ?? 0;
    const temp = hourly.temperature_2m?.[idx] ?? current.temperature ?? 20;
    const wcode = current.weathercode ?? 0;

    // Previsão das próximas 12 horas
    const proximas12h = [];
    for (let i = idx; i < idx + 12 && i < (hourly.precipitation_probability?.length || 0); i++) {
      proximas12h.push({
        hora: `${String(i % 24).padStart(2, "0")}:00`,
        prob: hourly.precipitation_probability[i] ?? 0,
        mm: hourly.precipitation[i] ?? 0,
        temp: hourly.temperature_2m[i] ?? temp,
      });
    }

    const chovendo = chuva_prob > 40 || chuva_mm > 0.5 || [51, 53, 55, 61, 63, 65, 71, 73, 75, 80, 81, 82, 95].includes(wcode);

    const data = {
      temperatura: Math.round(temp),
      chuva_probabilidade: chuva_prob,
      chuva_mm: Math.round(chuva_mm * 10) / 10,
      chovendo,
      descricao: descricaoWMO(wcode),
      icone: iconeWMO(wcode, current.is_day),
      proximas6h: proximas12h.slice(0, 6),
      proximas12h,
      wcode,
    };

    CACHE[fazendaId] = { ts: agora, data };
    return data;
  } catch {
    return { temperatura: 22, chuva_probabilidade: 0, chuva_mm: 0, chovendo: false, descricao: "Sem dados", icone: "☁️", proximas6h: [], proximas12h: [] };
  }
}

function descricaoWMO(code) {
  const map = {
    0: "Céu limpo", 1: "Predominantemente limpo", 2: "Parcialmente nublado", 3: "Nublado",
    45: "Névoa", 48: "Névoa com geada", 51: "Garoa leve", 53: "Garoa moderada", 55: "Garoa intensa",
    61: "Chuva leve", 63: "Chuva moderada", 65: "Chuva forte", 71: "Neve leve", 73: "Neve moderada",
    80: "Pancadas leves", 81: "Pancadas moderadas", 82: "Pancadas fortes", 95: "Trovoada",
  };
  return map[code] || "Variável";
}

function iconeWMO(code, isDay) {
  if (code === 0) return isDay ? "☀️" : "🌙";
  if (code <= 2) return "🌤️";
  if (code === 3) return "☁️";
  if (code <= 48) return "🌫️";
  if (code <= 55) return "🌦️";
  if (code <= 65) return "🌧️";
  if (code <= 75) return "❄️";
  if (code <= 82) return "⛈️";
  return "🌩️";
}