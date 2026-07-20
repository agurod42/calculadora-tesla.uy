import { describe, expect, it } from "vitest";
import market from "../src/data/market-data.json";
import used from "../src/data/used-prices.json";
import { CAR_PRESETS } from "../src/data/cars";
import { TESLA_MODELS } from "../src/data";

/**
 * Sanidad de los datos que se refrescan solos (scheduled task). Atrapa que una
 * ingesta rota meta valores absurdos antes de que lleguen a producción.
 */

describe("market-data (FX + combustible)", () => {
  it("FX UYU/USD en rango plausible", () => {
    expect(market.fx?.uyuPerUsd).toBeGreaterThan(20);
    expect(market.fx?.uyuPerUsd).toBeLessThan(80);
  });

  it("nafta y gasoil en rango, y gasoil más barato que nafta", () => {
    const n = market.fuel?.naftaSuper95 ?? 0;
    const g = market.fuel?.gasoil50s ?? 0;
    expect(n).toBeGreaterThan(40);
    expect(n).toBeLessThan(200);
    expect(g).toBeGreaterThan(30);
    expect(g).toBeLessThan(n);
  });

  it("todo dato de mercado tiene fecha", () => {
    expect(market.fx?.asOf).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(market.fuel?.asOf).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe("used-prices", () => {
  const models = used.models as Record<string, { median: number; byYear?: Record<string, { median: number }> }>;

  it("los modelos principales tienen precio", () => {
    // Los modelos nuevos pueblan al correr la ingesta; sin dato caen al fallback.
    for (const id of ["vw-nivus", "chevrolet-onix", "peugeot-208", "toyota-corolla", "hyundai-hb20"]) {
      expect(models[id], `falta precio de ${id}`).toBeDefined();
    }
  });

  it("medianas en rango plausible (US$ 3k–150k)", () => {
    for (const [id, m] of Object.entries(models)) {
      expect(m.median, `${id} fuera de rango`).toBeGreaterThan(3_000);
      expect(m.median, `${id} fuera de rango`).toBeLessThan(150_000);
    }
  });

  it("precios por año son monótonos-ish: el más nuevo no vale menos que el más viejo", () => {
    for (const [id, m] of Object.entries(models)) {
      if (!m.byYear) continue;
      const years = Object.keys(m.byYear).map(Number).sort((a, b) => a - b);
      if (years.length < 2) continue;
      const oldest = m.byYear[String(years[0])]!.median;
      const newest = m.byYear[String(years[years.length - 1])]!.median;
      expect(newest, `${id}: ${years[years.length - 1]} < ${years[0]}`).toBeGreaterThanOrEqual(oldest);
    }
  });
});

describe("catálogo Tesla", () => {
  it("precios y consumo en rango", () => {
    for (const t of TESLA_MODELS) {
      expect(t.priceUsd).toBeGreaterThan(25_000);
      expect(t.priceUsd).toBeLessThan(70_000);
      expect(t.kwhPer100Km).toBeGreaterThan(10);
      expect(t.kwhPer100Km).toBeLessThan(25);
    }
  });
});
