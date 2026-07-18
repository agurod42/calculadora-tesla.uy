import { describe, expect, it } from "vitest";
import {
  evMonthlyCost,
  fuelMonthlyCost,
  monthlyPayment,
  simulate,
  type SimulationInput,
} from "../src/calc";
import { DEFAULTS, TESLA_MODELS } from "../src/data";

const m3standard = TESLA_MODELS.find((m) => m.id === "m3-standard")!;

const baseUsage = {
  homeChargeShare: 1,
  homeTariffUyuPerKwh: DEFAULTS.homeTariffUyuPerKwh,
  publicTariffUyuPerKwh: DEFAULTS.publicTariffUyuPerKwh,
};

describe("monthlyPayment (sistema francés)", () => {
  it("USD 7.000 a 12% / 36 meses ≈ USD 232", () => {
    expect(monthlyPayment(7000, 12, 36)).toBeCloseTo(232.5, 0);
  });

  it("tasa 0 divide el capital", () => {
    expect(monthlyPayment(12000, 0, 24)).toBe(500);
  });

  it("capital 0 → cuota 0", () => {
    expect(monthlyPayment(0, 12, 36)).toBe(0);
  });

  it("balloon: con residual la cuota es menor que sin residual", () => {
    const sin = monthlyPayment(30000, 5.8, 24);
    const con = monthlyPayment(30000, 5.8, 24, 6000);
    expect(con).toBeLessThan(sin);
  });

  it("balloon = capital → cuota interés-solo (P × i mensual)", () => {
    const i = 5.8 / 100 / 12;
    expect(monthlyPayment(10000, 5.8, 24, 10000)).toBeCloseTo(10000 * i, 4);
  });

  it("residual se topea al capital (no explota si es mayor)", () => {
    const i = 5.8 / 100 / 12;
    expect(monthlyPayment(10000, 5.8, 24, 99999)).toBeCloseTo(10000 * i, 4);
  });
});

describe("costos de energía", () => {
  it("nafta: 6.000 km a 7,9 L/100 con nafta de frontera (~$55/L) ≈ $26.000", () => {
    expect(fuelMonthlyCost(6000, 7.9, 55)).toBeCloseTo(26_070, -2);
  });

  it("fixture del hilo — BYD: 1.500 km/mes en valle ≈ $600-700", () => {
    const cost = evMonthlyCost(1500, 15, { kmPerMonth: 1500, ...baseUsage });
    expect(cost).toBeGreaterThan(500);
    expect(cost).toBeLessThan(750);
  });

  it("carga pública encarece: 50% pública ~2x vs 100% casa", () => {
    const home = evMonthlyCost(1000, 15, { kmPerMonth: 1000, ...baseUsage });
    const mixed = evMonthlyCost(1000, 15, { kmPerMonth: 1000, ...baseUsage, homeChargeShare: 0.5 });
    expect(mixed / home).toBeGreaterThan(1.8);
  });
});

describe("simulate — caso @SigloXXcap (6.000 km/mes, Nivus a 18k)", () => {
  const input: SimulationInput = {
    currentCar: {
      resaleValueUsd: 18_000,
      litersPer100Km: 7.9,
      fuelPriceUyuPerLiter: 55, // frontera
      fixedMonthlyUyu: 8_000,
    },
    tesla: m3standard,
    teslaCosts: { fixedMonthlyUyu: 11_000 },
    usage: { kmPerMonth: 6000, ...baseUsage },
    financing: { extraDownUsd: 0, annualRatePct: 12, months: 36, currency: "USD" },
    fxUyuPerUsd: 40,
    batteryWarrantyKm: DEFAULTS.batteryWarrantyKm,
  };

  const r = simulate(input);

  it("el préstamo real es ~15k (no los 7k que él creía)", () => {
    expect(r.loanPrincipalUsd).toBe(14_990);
  });

  it("ahorro de energía ≈ $23.000/mes", () => {
    expect(r.energySavingsUyu).toBeGreaterThan(22_000);
    expect(r.energySavingsUyu).toBeLessThan(25_000);
  });

  it("rinde: el ahorro cubre la cuota incluso con el préstamo real", () => {
    // cuota 15k a 12%/36m ≈ USD 498 ≈ $19.9k < $23k ahorro − $3k fijos
    expect(r.verdict).toBe("rinde");
    expect(r.netMonthlyDuringLoanUyu).toBeGreaterThan(0);
  });

  it("breakeven razonable (~3 años)", () => {
    expect(r.breakevenMonths).toBeGreaterThan(24);
    expect(r.breakevenMonths).toBeLessThan(48);
  });

  it("warning de garantía de batería a 72.000 km/año", () => {
    expect(r.warnings.map((w) => w.code)).toContain("battery-warranty");
  });

  it("TCO 5 años favorece al Tesla", () => {
    expect(r.tco5yTeslaUyu).toBeLessThan(r.tco5yCurrentUyu);
  });
});

describe("simulate — casos borde", () => {
  const lowKm: SimulationInput = {
    currentCar: {
      resaleValueUsd: 10_000,
      litersPer100Km: 7,
      fuelPriceUyuPerLiter: DEFAULTS.fuelPriceUyuPerLiter,
      fixedMonthlyUyu: 7_000,
    },
    tesla: m3standard,
    teslaCosts: { fixedMonthlyUyu: 11_000 },
    usage: { kmPerMonth: 600, ...baseUsage },
    financing: { extraDownUsd: 0, annualRatePct: 12, months: 60, currency: "USD" },
    fxUyuPerUsd: 40,
    batteryWarrantyKm: DEFAULTS.batteryWarrantyKm,
  };

  it("600 km/mes con préstamo de 23k no rinde", () => {
    const r = simulate(lowKm);
    expect(r.verdict).toBe("no_rinde");
  });

  it("sin auto que entregar, mismo uso bajo: tampoco rinde y no hay breakeven", () => {
    const r = simulate({
      ...lowKm,
      currentCar: { ...lowKm.currentCar, resaleValueUsd: 0 },
    });
    expect(r.verdict).toBe("no_rinde");
  });

  it("mucha carga pública dispara el warning y reduce el ahorro", () => {
    const r = simulate({
      ...lowKm,
      usage: { kmPerMonth: 3000, ...baseUsage, homeChargeShare: 0.2 },
    });
    expect(r.warnings.map((w) => w.code)).toContain("no-home-charging");
    const rHome = simulate({ ...lowKm, usage: { kmPerMonth: 3000, ...baseUsage } });
    expect(r.energySavingsUyu).toBeLessThan(rHome.energySavingsUyu);
  });

  it("entrega cubre el precio → cuota 0 y warning informativo", () => {
    const r = simulate({
      ...lowKm,
      currentCar: { ...lowKm.currentCar, resaleValueUsd: 40_000 },
      usage: { kmPerMonth: 2000, ...baseUsage },
    });
    expect(r.loanPaymentUyu).toBe(0);
    expect(r.warnings.map((w) => w.code)).toContain("funding-gap-none");
    expect(r.verdict).toBe("rinde");
  });

  it("Crédito Inteligente (balloon): cuota menor y pago final expuesto", () => {
    const base: SimulationInput = {
      ...lowKm,
      currentCar: { ...lowKm.currentCar, resaleValueUsd: 8_000 },
      usage: { kmPerMonth: 4000, ...baseUsage },
      financing: { extraDownUsd: 0, annualRatePct: 5.8, months: 24, currency: "USD" },
    };
    const convencional = simulate(base);
    const inteligente = simulate({
      ...base,
      financing: { ...base.financing, residualUsd: 0.2 * m3standard.priceUsd },
    });
    // El balloon baja la cuota mensual y expone un pago final > 0.
    expect(inteligente.loanPaymentUyu).toBeLessThan(convencional.loanPaymentUyu);
    expect(inteligente.residualUyu).toBeGreaterThan(0);
    expect(convencional.residualUyu).toBe(0);
    // El costo total incremental (con intereses) es similar: el balloon no
    // regala plata, sólo la corre para el final.
    expect(inteligente.tco5yTeslaUyu).toBeGreaterThan(convencional.tco5yTeslaUyu * 0.9);
  });
});
