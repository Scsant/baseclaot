const cache = new Map();
const CACHE_TTL = 24 * 60 * 60 * 1000;

async function consultarBigDataCloud(latitude, longitude) {
  const url = new URL("https://api.bigdatacloud.net/data/reverse-geocode-client");
  url.searchParams.set("latitude", latitude);
  url.searchParams.set("longitude", longitude);
  url.searchParams.set("localityLanguage", "pt");
  const resposta = await fetch(url);
  if (!resposta.ok) throw new Error("Falha na consulta principal");
  const dados = await resposta.json();
  const nome = dados.locality || dados.city;
  const uf = dados.principalSubdivisionCode?.split("-").pop() || dados.principalSubdivision || "";
  return nome ? { nome, uf } : null;
}

async function consultarOpenStreetMap(latitude, longitude) {
  const url = new URL("https://nominatim.openstreetmap.org/reverse");
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("lat", latitude);
  url.searchParams.set("lon", longitude);
  url.searchParams.set("zoom", "10");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("accept-language", "pt-BR");
  const resposta = await fetch(url);
  if (!resposta.ok) throw new Error("Falha na consulta alternativa");
  const { address = {} } = await resposta.json();
  const nome = address.municipality || address.city || address.town || address.village || address.county;
  const codigoEstado = address["ISO3166-2-lvl4"] || address["ISO3166-2-lvl3"] || "";
  return nome ? { nome, uf: codigoEstado.split("-").pop() || address.state || "" } : null;
}

export async function buscarMunicipio(latitude, longitude) {
  const chave = `${latitude}:${longitude}`;
  const salvo = cache.get(chave);
  if (salvo && Date.now() - salvo.criadoEm < CACHE_TTL) return salvo.valor;

  let valor = null;
  try {
    valor = await consultarBigDataCloud(latitude, longitude);
  } catch {
    valor = null;
  }

  if (!valor) {
    try {
      valor = await consultarOpenStreetMap(latitude, longitude);
    } catch {
      valor = null;
    }
  }

  if (valor) cache.set(chave, { valor, criadoEm: Date.now() });
  return valor;
}