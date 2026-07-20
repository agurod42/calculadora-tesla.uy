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

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, "..", "src", "data", "used-prices.json");
const CATALOG = join(__dirname, "..", "src", "data", "car-catalog.json");

// Fuente única (compartida con la UI): cada auto con mlSlug != null.
const MODELS = JSON.parse(readFileSync(CATALOG, "utf8"))
  .cars.filter((c) => c.mlSlug)
  .map((c) => ({ id: c.id, slug: c.mlSlug }));

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17 Safari/605.1.15";
const PAGES = [1, 49, 97]; // ML pagina de a 48
const MIN_USD = 3_000;
const MAX_USD = 150_000;
const MIN_SAMPLE = 5;
const MIN_YEAR_SAMPLE = 3; // mínimo de avisos para publicar una mediana por año

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function median(nums) {
  const s = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

/** Mediana redondeada a la centena, con recorte de 10% en cada extremo. */
function trimmedMedian(nums) {
  const sorted = [...nums].sort((a, b) => a - b);
  const cut = Math.floor(sorted.length * 0.1);
  const trimmed = cut > 0 ? sorted.slice(cut, -cut) : sorted;
  return {
    median: Math.round(median(trimmed) / 100) * 100,
    min: trimmed[0],
    max: trimmed[trimmed.length - 1],
  };
}

/**
 * Extrae {year, price} por aviso del HTML de ML. Cada aviso vive en un bloque
 * `ui-search-layout__item`; adentro el año es el primer poly-attributes_list__item
 * de 4 dígitos y el precio la primera andes-money-amount__fraction (todo en US$).
 */
function parseListings(html) {
  const out = [];
  const cards = html.split("ui-search-layout__item").slice(1);
  for (const card of cards) {
    const pm = card.match(/andes-money-amount__fraction[^>]*>([0-9.]+)</i);
    if (!pm) continue;
    const price = Number(pm[1].replace(/\./g, ""));
    if (!Number.isFinite(price) || price < MIN_USD || price > MAX_USD) continue;
    const ym = card.match(/poly-attributes_list__item[^>]*>((?:19|20)\d\d)</i);
    const year = ym ? Number(ym[1]) : null;
    out.push({ year, price });
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
    return { ok: true, listings: parseListings(await res.text()) };
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
    let listings = [];
    let failed = null;
    for (const desde of PAGES) {
      const r = await fetchPage(spec.slug, desde);
      if (!r.ok) {
        failed = r.reason;
        break;
      }
      listings.push(...r.listings);
      if (r.listings.length < 40) break; // última página
      await sleep(800);
    }

    const prices = listings.map((l) => l.price);
    if (failed && prices.length === 0) {
      console.log(`skip (${failed})`);
    } else if (prices.length >= MIN_SAMPLE) {
      const overall = trimmedMedian(prices);
      // Medianas por año (solo años con muestra suficiente).
      const byYearGroups = {};
      for (const l of listings) {
        if (l.year == null) continue;
        (byYearGroups[l.year] ??= []).push(l.price);
      }
      const byYear = {};
      for (const [year, ps] of Object.entries(byYearGroups)) {
        if (ps.length >= MIN_YEAR_SAMPLE) {
          byYear[year] = { median: trimmedMedian(ps).median, count: ps.length };
        }
      }
      models[spec.id] = {
        median: overall.median,
        count: prices.length,
        min: overall.min,
        max: overall.max,
        byYear,
      };
      const nYears = Object.keys(byYear).length;
      console.log(`US$ ${overall.median} (${prices.length} avisos, ${nYears} años)`);
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
