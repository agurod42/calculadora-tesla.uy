/**
 * Acceso tipado a market-data.json (FX + combustible, generado por
 * scripts/ingest-market.mjs). Con fallback a los DEFAULTS del código si el
 * archivo no tiene el dato.
 */

import raw from "./market-data.json";
import { DEFAULTS } from "../data";

interface Fx {
  uyuPerUsd: number;
  asOf: string;
  source: string;
}
interface Fuel {
  naftaSuper95: number;
  gasoil50s: number;
  asOf: string;
  source: string;
}
interface MarketFile {
  fx: Fx | null;
  fuel: Fuel | null;
}

const data = raw as MarketFile;

export const MARKET_FX = {
  uyuPerUsd: data.fx?.uyuPerUsd ?? DEFAULTS.fxUyuPerUsd,
  asOf: data.fx?.asOf ?? null,
};

export const MARKET_FUEL = {
  nafta: data.fuel?.naftaSuper95 ?? DEFAULTS.fuelPriceUyuPerLiter,
  gasoil: data.fuel?.gasoil50s ?? DEFAULTS.dieselPriceUyuPerLiter,
  asOf: data.fuel?.asOf ?? null,
};

/** Precio de combustible según tipo, tomado de market-data. */
export function marketFuelPrice(fuel: "nafta" | "diesel"): number {
  return fuel === "diesel" ? MARKET_FUEL.gasoil : MARKET_FUEL.nafta;
}
