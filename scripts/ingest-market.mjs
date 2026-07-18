/**
 * Ingesta de datos de mercado que driftean seguido: cotización del dólar
 * (diaria) y precios de combustible (mensuales, ANCAP). Corre OFFLINE junto con
 * la ingesta de precios de usados; escribe src/data/market-data.json estampado
 * con fecha y fuente. La UI lo lee con fallback a los DEFAULTS del código.
 *
 *   node scripts/ingest-market.mjs
 *
 * Guardrails: si un valor cae fuera de rango plausible, se conserva el anterior
 * (no se pisa con basura). Contenido externo = no confiable: solo se parsean
 * números.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, "..", "src", "data", "market-data.json");

const UA = "calculadora-tesla-uy/ingest";

function prev() {
  try {
    return JSON.parse(readFileSync(OUT, "utf8"));
  } catch {
    return { fx: null, fuel: null };
  }
}

async function getJson(url) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 20_000);
  try {
    const r = await fetch(url, { headers: { "user-agent": UA }, signal: ctrl.signal });
    return r.ok ? await r.json() : null;
  } catch {
    return null;
  } finally {
    clearTimeout(t);
  }
}

async function getText(url) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 20_000);
  try {
    const r = await fetch(url, { headers: { "user-agent": UA }, signal: ctrl.signal });
    return r.ok ? await r.text() : null;
  } catch {
    return null;
  } finally {
    clearTimeout(t);
  }
}

const today = () => new Date().toISOString().slice(0, 10);
const inRange = (n, lo, hi) => Number.isFinite(n) && n >= lo && n <= hi;

// --- Dólar: open.er-api.com (gratis, sin key) ------------------------------
async function fetchFx(previous) {
  const d = await getJson("https://open.er-api.com/v6/latest/USD");
  const rate = d?.rates?.UYU;
  if (inRange(rate, 20, 80)) {
    return { uyuPerUsd: Math.round(rate * 100) / 100, asOf: today(), source: "open.er-api.com" };
  }
  console.log("⚠ FX fuera de rango o inaccesible — conservo anterior");
  return previous;
}

// --- Combustible: datosuruguay.com/combustible (ANCAP) ---------------------
function parseFuelLabel(html, label) {
  const re = new RegExp(label + "[^0-9]{0,40}\\$\\s*([0-9]{2,3}[.,][0-9]{2})", "i");
  const m = html.match(re);
  return m ? Number(m[1].replace(".", "").replace(",", ".")) : null;
}

async function fetchFuel(previous) {
  const html = await getText("https://datosuruguay.com/combustible");
  if (!html) {
    console.log("⚠ combustible inaccesible — conservo anterior");
    return previous;
  }
  const nafta = parseFuelLabel(html, "S[uú]per\\s*95");
  const gasoil = parseFuelLabel(html, "Gasoil");
  if (inRange(nafta, 40, 200) && inRange(gasoil, 30, 150)) {
    return { naftaSuper95: nafta, gasoil50s: gasoil, asOf: today(), source: "datosuruguay.com (ANCAP)" };
  }
  console.log(`⚠ combustible fuera de rango (nafta=${nafta}, gasoil=${gasoil}) — conservo anterior`);
  return previous;
}

async function main() {
  const p = prev();
  const fx = await fetchFx(p.fx);
  const fuel = await fetchFuel(p.fuel);
  const payload = { fx, fuel };
  writeFileSync(OUT, JSON.stringify(payload, null, 2) + "\n");
  console.log("✓ market-data.json");
  console.log(`  fx:   ${fx ? fx.uyuPerUsd + " UYU/USD (" + fx.asOf + ")" : "—"}`);
  console.log(
    `  fuel: ${fuel ? "nafta " + fuel.naftaSuper95 + " · gasoil " + fuel.gasoil50s + " (" + fuel.asOf + ")" : "—"}`,
  );
}

main();
