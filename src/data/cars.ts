/**
 * Autos populares en Uruguay para el paso "Tu auto hoy".
 * La fuente única es car-catalog.json (lo comparten esta UI y el scraper de
 * MercadoLibre en scripts/ingest-prices.mjs, para que no se desincronicen).
 * La UI arma dos dropdowns (marca → modelo) a partir de esta lista.
 */

import catalog from "./car-catalog.json";

export type Fuel = "nafta" | "diesel";

export interface CarPreset {
  id: string;
  brand: string;
  model: string;
  /** Consumo mixto (L/100 km) del motor dominante en UY. */
  litersPer100Km: number;
  /** Combustible del motor dominante. */
  fuel: Fuel;
  /** Valor de reventa orientativo (USD), fallback si no hay dato de ML. */
  resaleUsd: number;
}

export const CAR_PRESETS: CarPreset[] = catalog.cars.map((c) => ({
  id: c.id,
  brand: c.brand,
  model: c.model,
  litersPer100Km: c.litersPer100Km,
  fuel: c.fuel as Fuel,
  resaleUsd: c.resaleUsd,
}));

/** Marcas en orden de aparición (Otro siempre al final). */
export const CAR_BRANDS: string[] = (() => {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const c of CAR_PRESETS) {
    if (c.brand !== "Otro" && !seen.has(c.brand)) {
      seen.add(c.brand);
      out.push(c.brand);
    }
  }
  out.push("Otro");
  return out;
})();

export function modelsForBrand(brand: string): CarPreset[] {
  return CAR_PRESETS.filter((c) => c.brand === brand);
}

export function carById(id: string): CarPreset | undefined {
  return CAR_PRESETS.find((c) => c.id === id);
}
