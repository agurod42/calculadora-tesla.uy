/**
 * Datos de referencia — UN solo lugar para todo lo que cambia con el tiempo.
 * La UI muestra `PRICES_AS_OF` para que el usuario sepa qué tan frescos son.
 */

export const PRICES_AS_OF = "2026-07-17";

export interface TeslaModel {
  id: string;
  name: string;
  priceUsd: number;
  /** Autonomía declarada (km). Real en ruta a 110 km/h ≈ 75 %. */
  rangeKm: number;
  /** Consumo estimado (kWh/100 km, uso mixto). */
  kwhPer100Km: number;
}

/** Precios oficiales Uruguay (lanzamiento julio 2026). */
export const TESLA_MODELS: TeslaModel[] = [
  { id: "m3-standard", name: "Model 3 Standard", priceUsd: 32_990, rangeKm: 534, kwhPer100Km: 13.5 },
  { id: "m3-premium", name: "Model 3 Premium", priceUsd: 37_990, rangeKm: 750, kwhPer100Km: 14.0 },
  { id: "m3-performance", name: "Model 3 Performance", priceUsd: 49_990, rangeKm: 528, kwhPer100Km: 15.5 },
  { id: "my-standard", name: "Model Y Standard", priceUsd: 36_490, rangeKm: 466, kwhPer100Km: 15.5 },
  { id: "my-premium", name: "Model Y Premium", priceUsd: 41_490, rangeKm: 466, kwhPer100Km: 16.0 },
];

export const DEFAULTS = {
  /** UTE Triple Horario, banda valle (00–07): $2,44/kWh + IVA 22 %. */
  homeTariffUyuPerKwh: 2.44 * 1.22,
  /** Carga pública rápida (aprox., varía por operador). */
  publicTariffUyuPerKwh: 9.0,
  /** Nafta Super 95 (UYU/L). TODO verificar precio ANCAP vigente antes de shippear UI. */
  fuelPriceUyuPerLiter: 79.0,
  /** Descuento IMESI en frontera (aprox. 30 %). */
  borderDiscount: 0.3,
  /** Cotización UYU/USD (editable en UI). */
  fxUyuPerUsd: 40,
  /** Tasa préstamo automotor en UI (real, % anual, aprox.). */
  loanRateUiPct: 9,
  /** Tasa préstamo automotor en USD (% anual, aprox.). */
  loanRateUsdPct: 12,
  loanMonths: 36,
  /** Garantía batería Tesla (km) — la temporal (8 años) casi nunca es la que muerde acá. */
  batteryWarrantyKm: 160_000,
} as const;
