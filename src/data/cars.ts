/**
 * Autos populares en Uruguay — presets para el paso "Tu auto hoy".
 * `resaleUsd` es un valor ORIENTATIVO (modelo ~5 años, estado bueno); en la UI
 * el usuario lo overridea. En etapa 3 esto se reemplaza por lookup a
 * MercadoLibre; este dataset queda como fallback.
 *
 * Fuentes: promedios de listados MercadoLibre Uruguay (2026-07). Aproximado.
 */

export interface CarPreset {
  id: string;
  label: string;
  /** Consumo mixto (L/100 km). */
  litersPer100Km: number;
  /** Valor de reventa orientativo (USD), fallback si no hay dato de gallito. */
  resaleUsd: number;
  /** Path en gallito para la ingesta de precios: /autos/venta/automoviles/{brand}/{model}. */
  gallito?: { brand: string; model: string };
}

export const CAR_PRESETS: CarPreset[] = [
  { id: "vw-nivus", label: "VW Nivus", litersPer100Km: 7.5, resaleUsd: 22_000, gallito: { brand: "volkswagen", model: "nivus" } },
  { id: "vw-polo", label: "VW Polo", litersPer100Km: 6.8, resaleUsd: 16_000, gallito: { brand: "volkswagen", model: "polo" } },
  { id: "vw-taos", label: "VW Taos", litersPer100Km: 8.5, resaleUsd: 30_000, gallito: { brand: "volkswagen", model: "taos" } },
  { id: "vw-tcross", label: "VW T-Cross", litersPer100Km: 7.8, resaleUsd: 24_000, gallito: { brand: "volkswagen", model: "t-cross" } },
  { id: "chevrolet-onix", label: "Chevrolet Onix", litersPer100Km: 6.5, resaleUsd: 14_000, gallito: { brand: "chevrolet", model: "onix" } },
  { id: "chevrolet-tracker", label: "Chevrolet Tracker", litersPer100Km: 8.0, resaleUsd: 22_000, gallito: { brand: "chevrolet", model: "tracker" } },
  { id: "fiat-cronos", label: "Fiat Cronos", litersPer100Km: 6.8, resaleUsd: 13_000, gallito: { brand: "fiat", model: "cronos" } },
  { id: "fiat-pulse", label: "Fiat Pulse", litersPer100Km: 7.3, resaleUsd: 18_000, gallito: { brand: "fiat", model: "pulse" } },
  { id: "peugeot-208", label: "Peugeot 208", litersPer100Km: 6.6, resaleUsd: 15_000, gallito: { brand: "peugeot", model: "208" } },
  { id: "peugeot-2008", label: "Peugeot 2008", litersPer100Km: 7.4, resaleUsd: 22_000, gallito: { brand: "peugeot", model: "2008" } },
  { id: "renault-sandero", label: "Renault Sandero", litersPer100Km: 6.9, resaleUsd: 12_000, gallito: { brand: "renault", model: "sandero" } },
  { id: "renault-duster", label: "Renault Duster", litersPer100Km: 8.2, resaleUsd: 18_000, gallito: { brand: "renault", model: "duster" } },
  { id: "renault-kardian", label: "Renault Kardian", litersPer100Km: 6.9, resaleUsd: 21_000, gallito: { brand: "renault", model: "kardian" } },
  { id: "toyota-yaris", label: "Toyota Yaris", litersPer100Km: 6.2, resaleUsd: 18_000, gallito: { brand: "toyota", model: "yaris" } },
  { id: "toyota-corolla", label: "Toyota Corolla", litersPer100Km: 6.8, resaleUsd: 26_000, gallito: { brand: "toyota", model: "corolla" } },
  { id: "toyota-corolla-cross", label: "Toyota Corolla Cross", litersPer100Km: 7.2, resaleUsd: 32_000, gallito: { brand: "toyota", model: "corolla-cross" } },
  { id: "toyota-hilux", label: "Toyota Hilux", litersPer100Km: 9.5, resaleUsd: 40_000, gallito: { brand: "toyota", model: "hilux" } },
  { id: "toyota-etios", label: "Toyota Etios", litersPer100Km: 6.4, resaleUsd: 13_000, gallito: { brand: "toyota", model: "etios" } },
  { id: "ford-territory", label: "Ford Territory", litersPer100Km: 8.8, resaleUsd: 28_000, gallito: { brand: "ford", model: "territory" } },
  { id: "ford-ranger", label: "Ford Ranger", litersPer100Km: 9.8, resaleUsd: 42_000, gallito: { brand: "ford", model: "ranger" } },
  { id: "hyundai-creta", label: "Hyundai Creta", litersPer100Km: 7.9, resaleUsd: 24_000, gallito: { brand: "hyundai", model: "creta" } },
  { id: "hyundai-hb20", label: "Hyundai HB20", litersPer100Km: 6.7, resaleUsd: 15_000, gallito: { brand: "hyundai", model: "hb20" } },
  { id: "kia-sportage", label: "Kia Sportage", litersPer100Km: 8.6, resaleUsd: 30_000, gallito: { brand: "kia", model: "sportage" } },
  { id: "nissan-kicks", label: "Nissan Kicks", litersPer100Km: 7.3, resaleUsd: 21_000, gallito: { brand: "nissan", model: "kicks" } },
  { id: "suzuki-vitara", label: "Suzuki Vitara", litersPer100Km: 7.6, resaleUsd: 23_000, gallito: { brand: "suzuki", model: "vitara" } },
  { id: "otro", label: "Otro / no está en la lista", litersPer100Km: 8.0, resaleUsd: 15_000 },
];
