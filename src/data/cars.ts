/**
 * Autos populares en Uruguay — presets para el paso "Tu auto hoy".
 * La UI arma dos dropdowns (marca → modelo) a partir de esta lista.
 * `resaleUsd` es un fallback orientativo; el valor real sale de used-prices.json
 * (mediana de MercadoLibre, con desglose por año). El usuario siempre overridea.
 *
 * `litersPer100Km`: consumo MIXTO representativo del motor dominante en Uruguay,
 * en base a pruebas reales y homologaciones (autotest.com.ar, elcerokm, autoblog,
 * km77). Es un valor por modelo (no por versión) y editable en la UI. Hilux y
 * Ranger son DIÉSEL (`fuel: "diesel"`): su consumo y el precio del combustible
 * difieren de la nafta.
 */

export type Fuel = "nafta" | "diesel";

export interface CarPreset {
  id: string;
  /** Marca (para el primer dropdown). */
  brand: string;
  /** Modelo (para el segundo dropdown). */
  model: string;
  /** Consumo mixto (L/100 km) del motor dominante en UY. */
  litersPer100Km: number;
  /** Combustible del motor dominante. */
  fuel: Fuel;
  /** Valor de reventa orientativo (USD), fallback si no hay dato de ML. */
  resaleUsd: number;
}

export const CAR_PRESETS: CarPreset[] = [
  { id: "vw-nivus", brand: "Volkswagen", model: "Nivus", litersPer100Km: 6.8, fuel: "nafta", resaleUsd: 22_000 },
  { id: "vw-polo", brand: "Volkswagen", model: "Polo", litersPer100Km: 7.0, fuel: "nafta", resaleUsd: 16_000 },
  { id: "vw-taos", brand: "Volkswagen", model: "Taos", litersPer100Km: 8.0, fuel: "nafta", resaleUsd: 30_000 },
  { id: "vw-tcross", brand: "Volkswagen", model: "T-Cross", litersPer100Km: 7.0, fuel: "nafta", resaleUsd: 24_000 },
  { id: "chevrolet-onix", brand: "Chevrolet", model: "Onix", litersPer100Km: 6.5, fuel: "nafta", resaleUsd: 14_000 },
  { id: "chevrolet-tracker", brand: "Chevrolet", model: "Tracker", litersPer100Km: 7.5, fuel: "nafta", resaleUsd: 22_000 },
  { id: "fiat-cronos", brand: "Fiat", model: "Cronos", litersPer100Km: 7.0, fuel: "nafta", resaleUsd: 13_000 },
  { id: "fiat-pulse", brand: "Fiat", model: "Pulse", litersPer100Km: 7.3, fuel: "nafta", resaleUsd: 18_000 },
  { id: "peugeot-208", brand: "Peugeot", model: "208", litersPer100Km: 7.0, fuel: "nafta", resaleUsd: 15_000 },
  { id: "peugeot-2008", brand: "Peugeot", model: "2008", litersPer100Km: 8.0, fuel: "nafta", resaleUsd: 22_000 },
  { id: "renault-sandero", brand: "Renault", model: "Sandero", litersPer100Km: 7.3, fuel: "nafta", resaleUsd: 12_000 },
  { id: "renault-duster", brand: "Renault", model: "Duster", litersPer100Km: 9.0, fuel: "nafta", resaleUsd: 18_000 },
  { id: "renault-kardian", brand: "Renault", model: "Kardian", litersPer100Km: 6.5, fuel: "nafta", resaleUsd: 21_000 },
  { id: "toyota-yaris", brand: "Toyota", model: "Yaris", litersPer100Km: 6.0, fuel: "nafta", resaleUsd: 18_000 },
  { id: "toyota-corolla", brand: "Toyota", model: "Corolla", litersPer100Km: 6.5, fuel: "nafta", resaleUsd: 26_000 },
  { id: "toyota-corolla-cross", brand: "Toyota", model: "Corolla Cross", litersPer100Km: 6.5, fuel: "nafta", resaleUsd: 32_000 },
  { id: "toyota-hilux", brand: "Toyota", model: "Hilux", litersPer100Km: 8.5, fuel: "diesel", resaleUsd: 40_000 },
  { id: "toyota-etios", brand: "Toyota", model: "Etios", litersPer100Km: 6.5, fuel: "nafta", resaleUsd: 13_000 },
  { id: "ford-territory", brand: "Ford", model: "Territory", litersPer100Km: 7.5, fuel: "nafta", resaleUsd: 28_000 },
  { id: "ford-ranger", brand: "Ford", model: "Ranger", litersPer100Km: 9.0, fuel: "diesel", resaleUsd: 42_000 },
  { id: "hyundai-creta", brand: "Hyundai", model: "Creta", litersPer100Km: 7.5, fuel: "nafta", resaleUsd: 24_000 },
  { id: "hyundai-hb20", brand: "Hyundai", model: "HB20", litersPer100Km: 6.5, fuel: "nafta", resaleUsd: 15_000 },
  { id: "kia-sportage", brand: "Kia", model: "Sportage", litersPer100Km: 8.5, fuel: "nafta", resaleUsd: 30_000 },
  { id: "nissan-kicks", brand: "Nissan", model: "Kicks", litersPer100Km: 7.0, fuel: "nafta", resaleUsd: 21_000 },
  { id: "suzuki-vitara", brand: "Suzuki", model: "Vitara", litersPer100Km: 6.5, fuel: "nafta", resaleUsd: 23_000 },
  { id: "otro", brand: "Otro", model: "No está en la lista", litersPer100Km: 8.0, fuel: "nafta", resaleUsd: 15_000 },
];

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
