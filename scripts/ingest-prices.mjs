/**
 * Ingesta de precios de usados desde el sitio público de MercadoLibre Uruguay.
 *
 * La API de ML está cerrada (403 sin app partner), pero el sitio web público
 * (autos.mercadolibre.com.uy/{marca}/{modelo}/) responde 200 y trae ~48 avisos
 * por página con el precio en el markup `andes-money-amount__fraction`. Este
 * script, por cada modelo popular, junta los precios en US$ de las primeras
 * páginas, descarta extremos y guarda la mediana en src/data/used-prices.json.
 *
 * Corre OFFLINE (no en cada request): el scraping es frágil, así que un fallo
 * deja el dato viejo en vez de romper la app. La UI lee el JSON al instante.
 *
 *   node scripts/ingest-prices.mjs
 *
 * Refrescar cada tanto (semanal). El contenido es input externo no confiable:
 * solo se extraen números, nunca se ejecuta nada de la respuesta.
 */

import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, "..", "src", "data", "used-prices.json");

// id + slug en ML. Mantener en sync con src/data/cars.ts.
const MODELS = [
  { id: "vw-nivus", slug: "volkswagen/nivus" },
  { id: "vw-polo", slug: "volkswagen/polo" },
  { id: "vw-taos", slug: "volkswagen/taos" },
  { id: "vw-tcross", slug: "volkswagen/t-cross" },
  { id: "chevrolet-onix", slug: "chevrolet/onix" },
  { id: "chevrolet-tracker", slug: "chevrolet/tracker" },
  { id: "fiat-cronos", slug: "fiat/cronos" },
  { id: "fiat-pulse", slug: "fiat/pulse" },
  { id: "peugeot-208", slug: "peugeot/208" },
  { id: "peugeot-2008", slug: "peugeot/2008" },
  { id: "renault-sandero", slug: "renault/sandero" },
  { id: "renault-duster", slug: "renault/duster" },
  { id: "renault-kardian", slug: "renault/kardian" },
  { id: "toyota-yaris", slug: "toyota/yaris" },
  { id: "toyota-corolla", slug: "toyota/corolla" },
  { id: "toyota-corolla-cross", slug: "toyota/corolla-cross" },
  { id: "toyota-hilux", slug: "toyota/hilux" },
  { id: "toyota-etios", slug: "toyota/etios" },
  { id: "ford-territory", slug: "ford/territory" },
  { id: "ford-ranger", slug: "ford/ranger" },
  { id: "hyundai-creta", slug: "hyundai/creta" },
  { id: "hyundai-hb20", slug: "hyundai/hb20" },
  { id: "kia-sportage", slug: "kia/sportage" },
  { id: "nissan-kicks", slug: "nissan/kicks" },
  { id: "suzuki-vitara", slug: "suzuki/vitara" },
];

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17 Safari/605.1.15";
const PAGES = [1, 49]; // ML pagina de a 48: _Desde_1 y _Desde_49
const MIN_USD = 3_000;
const MAX_USD = 150_000;
const MIN_SAMPLE = 5;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function median(nums) {
  const s = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

/**
 * Extrae precios en US$ del HTML de ML. Solo la fracción de
 * andes-money-amount__fraction; ML muestra todos los precios en US$ en autos.
 */
function parsePrices(html) {
  const out = [];
  const re = /andes-money-amount__fraction[^>]*>([0-9.]+)</gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    const n = Number(m[1].replace(/\./g, ""));
    if (Number.isFinite(n) && n >= MIN_USD && n <= MAX_USD) out.push(n);
  }
  return out;
}

async function fetchPage(slug, desde) {
  const url = `https://autos.mercadolibre.com.uy/${slug}/_Desde_${desde}`;
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 30_000);
  try {
    const res = await fetch(url, { headers: { "user-agent": UA }, signal: ctrl.signal });
    if (!res.ok) return { ok: false, reason: `HTTP ${res.status}` };
    return { ok: true, prices: parsePrices(await res.text()) };
  } catch (e) {
    return { ok: false, reason: String(e.name || e) };
  } finally {
    clearTimeout(t);
  }
}

async function main() {
  const models = {};
  for (const spec of MODELS) {
    process.stdout.write(`· ${spec.id} … `);
    let prices = [];
    let failed = null;
    for (const desde of PAGES) {
      const r = await fetchPage(spec.slug, desde);
      if (!r.ok) {
        failed = r.reason;
        break;
      }
      prices.push(...r.prices);
      if (r.prices.length < 40) break; // última página
      await sleep(800);
    }

    if (failed && prices.length === 0) {
      console.log(`skip (${failed})`);
    } else if (prices.length >= MIN_SAMPLE) {
      // Recortar 10% de cada extremo (avisos atípicos / mal cargados).
      const sorted = [...prices].sort((a, b) => a - b);
      const cut = Math.floor(sorted.length * 0.1);
      const trimmed = cut > 0 ? sorted.slice(cut, -cut) : sorted;
      models[spec.id] = {
        median: Math.round(median(trimmed) / 100) * 100,
        count: prices.length,
        min: trimmed[0],
        max: trimmed[trimmed.length - 1],
      };
      console.log(`US$ ${models[spec.id].median} (${prices.length} avisos)`);
    } else {
      console.log(`skip (solo ${prices.length} avisos)`);
    }
    await sleep(1000);
  }

  const payload = {
    asOf: new Date().toISOString().slice(0, 10),
    source: "mercadolibre.com.uy",
    currency: "USD",
    note: "Mediana de precios publicados en MercadoLibre Uruguay (todos los años/versiones). Orientativo.",
    models,
  };
  writeFileSync(OUT, JSON.stringify(payload, null, 2) + "\n");
  console.log(`\n✓ ${Object.keys(models).length}/${MODELS.length} modelos → ${OUT}`);
}

main();
