/**
 * Datos de referencia — UN solo lugar para todo lo que cambia con el tiempo.
 * La UI muestra `PRICES_AS_OF` para que el usuario sepa qué tan frescos son.
 */

export const PRICES_AS_OF = "2026-07-18";

export interface TeslaModel {
  id: string;
  name: string;
  priceUsd: number;
  /** Autonomía declarada (km). Real en ruta a 110 km/h ≈ 75 %. */
  rangeKm: number;
  /** Consumo desde el enchufe (kWh/100 km): consumo combinado real de EV
   *  Database + ~10 % de pérdidas de carga (lo que se paga en el medidor). */
  kwhPer100Km: number;
}

/** Precios oficiales Uruguay (lanzamiento julio 2026). Consumo: EV Database
 *  (Vehicle Consumption combinado) × 1,10 por pérdidas de carga. */
export const TESLA_MODELS: TeslaModel[] = [
  { id: "m3-standard", name: "Model 3 Standard", priceUsd: 32_990, rangeKm: 534, kwhPer100Km: 14.6 },
  { id: "m3-premium", name: "Model 3 Premium", priceUsd: 37_990, rangeKm: 750, kwhPer100Km: 15.0 },
  { id: "m3-performance", name: "Model 3 Performance", priceUsd: 49_990, rangeKm: 528, kwhPer100Km: 16.8 },
  { id: "my-standard", name: "Model Y Standard", priceUsd: 36_490, rangeKm: 466, kwhPer100Km: 17.4 },
  { id: "my-premium", name: "Model Y Premium", priceUsd: 41_490, rangeKm: 466, kwhPer100Km: 17.6 },
];

export const DEFAULTS = {
  /** UTE Triple Horario, banda valle (00–07): $2,44/kWh + IVA 22 %. */
  homeTariffUyuPerKwh: 2.44 * 1.22,
  /** Carga pública rápida (aprox., varía por operador). */
  publicTariffUyuPerKwh: 9.0,
  /** Nafta Súper 95 (UYU/L) — ANCAP julio 2026. */
  fuelPriceUyuPerLiter: 88.67,
  /** Gasoil 50S (UYU/L) — ANCAP julio 2026. */
  dieselPriceUyuPerLiter: 58.68,
  /** Descuento IMESI en frontera (aprox. 30 %). */
  borderDiscount: 0.3,
  /** Cotización UYU/USD (editable en UI). */
  fxUyuPerUsd: 40,
  /** Tasa préstamo en UI (banco, % anual, aprox. — editable). */
  loanRateUiPct: 9,
  /** Tasa préstamo en USD: financiación Tesla Crédito Convencional (TIN 5,80 %
   *  anual, sistema francés, verificado en tesla.com/es_UY 2026-07-18). */
  loanRateUsdPct: 5.8,
  /** Plazo por defecto — coincide con el default de Tesla (60 cuotas). */
  loanMonths: 60,
  /** Patente de rodados = aforo × alícuota (SUCIVE 2026). El aforo se aproxima
   *  con el valor de mercado. Usado combustión: 4,5 %. EV 0km: 3 %. */
  patenteRateUsed: 0.045,
  patenteRateEv: 0.03,
  /** Seguro + service mensual estimado (UYU) — parte editable de los costos
   *  fijos. EV: service más barato (sin aceite), seguro algo más caro. */
  seguroServiceUsedUyu: 4_500,
  seguroServiceEvUyu: 4_500,
  /** Garantía batería Tesla (km) — la temporal (8 años) casi nunca es la que muerde acá. */
  batteryWarrantyKm: 160_000,
} as const;
