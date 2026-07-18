/**
 * Acceso tipado al dataset de precios de usados (generado por
 * scripts/ingest-prices.mjs desde MercadoLibre Uruguay).
 */

import raw from "./used-prices.json";

export interface UsedPrice {
  median: number;
  count: number;
  min: number;
  max: number;
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
