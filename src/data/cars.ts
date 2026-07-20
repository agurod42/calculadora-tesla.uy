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

/** Marcas ordenadas alfabéticamente (Otro siempre al final). */
export const CAR_BRANDS: string[] = (() => {
  const brands = [...new Set(CAR_PRESETS.map((c) => c.brand).filter((b) => b !== "Otro"))];
  brands.sort((a, b) => a.localeCompare(b, "es"));
  brands.push("Otro");
  return brands;
})();

/** Modelos de una marca, ordenados alfabéticamente. */
export function modelsForBrand(brand: string): CarPreset[] {
  return CAR_PRESETS.filter((c) => c.brand === brand).sort((a, b) =>
    a.model.localeCompare(b.model, "es", { numeric: true }),
  );
}

export function carById(id: string): CarPreset | undefined {
  return CAR_PRESETS.find((c) => c.id === id);
}
