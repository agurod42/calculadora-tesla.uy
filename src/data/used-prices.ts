/**
 * Acceso tipado al dataset de precios de usados (generado por
 * scripts/ingest-prices.mjs desde MercadoLibre Uruguay).
 */

import raw from "./used-prices.json";

export interface YearPrice {
  median: number;
  count: number;
}

export interface UsedPrice {
  median: number;
  count: number;
  min: number;
  max: number;
  /** Mediana por año de fabricación (solo años con muestra suficiente). */
  byYear?: Record<string, YearPrice>;
}

interface UsedPricesFile {
  asOf: string;
  source: string;
  currency: string;
  note: string;
  models: Record<string, UsedPrice>;
}

const data = raw as UsedPricesFile;

export const USED_PRICES_AS_OF = data.asOf;
export const USED_PRICES_SOURCE = data.source;

/** Precio de mercado del usado, o null si no hay dato para ese modelo. */
export function usedPriceFor(carId: string): UsedPrice | null {
  return data.models[carId] ?? null;
}

/** Años con dato para un modelo, de más nuevo a más viejo. */
export function yearsFor(carId: string): number[] {
  const by = data.models[carId]?.byYear;
  if (!by) return [];
  return Object.keys(by)
    .map(Number)
    .sort((a, b) => b - a);
}

/**
 * Valor sugerido para un modelo y (opcional) año. Si el año tiene dato propio lo
 * usa; si no, cae a la mediana general del modelo.
 */
export function suggestedPrice(carId: string, year?: number): number | null {
  const p = data.models[carId];
  if (!p) return null;
  if (year != null && p.byYear?.[String(year)]) return p.byYear[String(year)]!.median;
  return p.median;
}
