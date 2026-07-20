/**
 * Motor de cálculo — funciones puras, sin dependencias. Toda la plata en UYU
 * salvo campos sufijados `Usd`. `fx` = UYU por USD.
 */

import type { TeslaModel } from "./data";

// ---------------------------------------------------------------------------
// Inputs
// ---------------------------------------------------------------------------

export interface CurrentCar {
  /** Valor de venta del usado (USD). 0 si no entrega auto. */
  resaleValueUsd: number;
  litersPer100Km: number;
  fuelPriceUyuPerLiter: number;
  /** Costos fijos mensuales del auto actual (patente + seguro + service, UYU). */
  fixedMonthlyUyu: number;
}

export interface TeslaCosts {
  /** Costos fijos mensuales estimados del Tesla (patente + seguro + service, UYU). */
  fixedMonthlyUyu: number;
}

export interface Usage {
  kmPerMonth: number;
  /** Fracción de la carga hecha en casa (0–1). */
  homeChargeShare: number;
  homeTariffUyuPerKwh: number;
  publicTariffUyuPerKwh: number;
}

export interface Financing {
  /** Plata extra que pone además de la venta del usado (USD). */
  extraDownUsd: number;
  annualRatePct: number;
  months: number;
  currency: "UI" | "USD";
  /** Cuota final / pago global (USD) al final del plazo — modalidad tipo
   *  "Crédito Inteligente" de Tesla. 0 = préstamo convencional sin balloon. */
  residualUsd?: number;
}

export interface SimulationInput {
  currentCar: CurrentCar;
  tesla: TeslaModel;
  teslaCosts: TeslaCosts;
  usage: Usage;
  financing: Financing;
  fxUyuPerUsd: number;
  batteryWarrantyKm: number;
}

// ---------------------------------------------------------------------------
// Output
// ---------------------------------------------------------------------------

export type Verdict = "rinde" | "depende" | "no_rinde";

export type WarningCode =
  | "battery-warranty"
  | "no-home-charging"
  | "range-pressure"
  | "funding-gap-none"; // no necesita préstamo

export interface Warning {
  code: WarningCode;
  detail: string;
}

export interface SimulationResult {
  verdict: Verdict;
  /** Nafta/mes hoy (UYU). */
  fuelMonthlyUyu: number;
  /** Luz/mes con el Tesla (UYU). */
  evMonthlyUyu: number;
  /** Ahorro de energía/mes (UYU). */
  energySavingsUyu: number;
  /** Δ costos fijos/mes (positivo = el Tesla sale más caro en fijos). */
  fixedDeltaUyu: number;
  /** Capital del préstamo (USD). */
  loanPrincipalUsd: number;
  /** Cuota mensual (UYU al fx dado). */
  loanPaymentUyu: number;
  /** Cuota final / pago global al término del plazo (UYU). 0 si no aplica. */
  residualUyu: number;
  /** Ahorro bruto/mes (energía − Δ fijos), sin contar la cuota. */
  grossMonthlySavingsUyu: number;
  /** Ahorro neto/mes durante el préstamo (bruto − cuota). */
  netMonthlyDuringLoanUyu: number;
  /** Meses hasta recuperar la inversión incremental (Infinity si nunca). */
  breakevenMonths: number;
  /** km/mes a partir de los cuales el cambio empieza a rendir (el ahorro cubre
   *  la cuota). null si nunca rinde por km (la luz cuesta más que la nafta). */
  kmToRinde: number | null;
  /** Costo total 5 años, cada lado (energía + fijos + financiamiento, UYU). */
  tco5yCurrentUyu: number;
  tco5yTeslaUyu: number;
  warnings: Warning[];
}

// ---------------------------------------------------------------------------
// Primitivas
// ---------------------------------------------------------------------------

/**
 * Cuota fija, sistema francés. Con `residual` > 0 amortiza sólo (principal −
 * residual): modela un balloon / pago global final (Crédito Inteligente). El
 * residual se topea al capital. Tasa 0 → división simple.
 */
export function monthlyPayment(
  principal: number,
  annualRatePct: number,
  months: number,
  residual = 0,
): number {
  if (principal <= 0) return 0;
  if (months <= 0) throw new RangeError("months must be > 0");
  const r = Math.min(Math.max(residual, 0), principal);
  const i = annualRatePct / 100 / 12;
  if (i === 0) return (principal - r) / months;
  return ((principal - r / Math.pow(1 + i, months)) * i) / (1 - Math.pow(1 + i, -months));
}

export function fuelMonthlyCost(kmPerMonth: number, litersPer100Km: number, priceUyuPerLiter: number): number {
  return (kmPerMonth / 100) * litersPer100Km * priceUyuPerLiter;
}

export function evMonthlyCost(kmPerMonth: number, kwhPer100Km: number, usage: Usage): number {
  const kwh = (kmPerMonth / 100) * kwhPer100Km;
  const blended =
    usage.homeChargeShare * usage.homeTariffUyuPerKwh +
    (1 - usage.homeChargeShare) * usage.publicTariffUyuPerKwh;
  return kwh * blended;
}

// ---------------------------------------------------------------------------
// Simulación
// ---------------------------------------------------------------------------

export function simulate(input: SimulationInput): SimulationResult {
  const { currentCar, tesla, teslaCosts, usage, financing, fxUyuPerUsd: fx } = input;

  const fuelMonthlyUyu = fuelMonthlyCost(
    usage.kmPerMonth,
    currentCar.litersPer100Km,
    currentCar.fuelPriceUyuPerLiter,
  );
  const evMonthlyUyu = evMonthlyCost(usage.kmPerMonth, tesla.kwhPer100Km, usage);
  const energySavingsUyu = fuelMonthlyUyu - evMonthlyUyu;
  const fixedDeltaUyu = teslaCosts.fixedMonthlyUyu - currentCar.fixedMonthlyUyu;
  const grossMonthlySavingsUyu = energySavingsUyu - fixedDeltaUyu;

  const loanPrincipalUsd = Math.max(
    0,
    tesla.priceUsd - currentCar.resaleValueUsd - financing.extraDownUsd,
  );
  const residualUsd = Math.min(Math.max(financing.residualUsd ?? 0, 0), loanPrincipalUsd);
  const loanPaymentUsd = monthlyPayment(
    loanPrincipalUsd,
    financing.annualRatePct,
    financing.months,
    residualUsd,
  );
  const loanPaymentUyu = loanPaymentUsd * fx;
  const residualUyu = residualUsd * fx;

  const netMonthlyDuringLoanUyu = grossMonthlySavingsUyu - loanPaymentUyu;

  // km a partir de los cuales rinde: el ahorro de energía crece lineal con los
  // km, mientras que la cuota y los costos fijos no. Despejamos net=0.
  const blendedTariffUyu =
    usage.homeChargeShare * usage.homeTariffUyuPerKwh +
    (1 - usage.homeChargeShare) * usage.publicTariffUyuPerKwh;
  const perKmSavingUyu =
    (currentCar.litersPer100Km * currentCar.fuelPriceUyuPerLiter -
      tesla.kwhPer100Km * blendedTariffUyu) /
    100;
  const kmToRinde =
    perKmSavingUyu <= 0
      ? null
      : Math.max(0, Math.round((fixedDeltaUyu + loanPaymentUyu) / perKmSavingUyu / 100) * 100);

  // Inversión incremental total: lo que efectivamente cuesta pasarse
  // (precio Tesla − usado), intereses incluidos. El interés incluye el
  // balloon (residual) que se paga al final además de las cuotas.
  const totalInterestUyu =
    (loanPaymentUsd * financing.months + residualUsd - loanPrincipalUsd) * fx;
  const incrementalInvestmentUyu =
    (tesla.priceUsd - currentCar.resaleValueUsd) * fx + totalInterestUyu;
  const breakevenMonths =
    grossMonthlySavingsUyu > 0
      ? Math.ceil(incrementalInvestmentUyu / grossMonthlySavingsUyu)
      : Infinity;

  const HORIZON = 60;
  const loanMonthsInHorizon = Math.min(financing.months, HORIZON);
  const tco5yCurrentUyu = (fuelMonthlyUyu + currentCar.fixedMonthlyUyu) * HORIZON;
  const tco5yTeslaUyu =
    (evMonthlyUyu + teslaCosts.fixedMonthlyUyu) * HORIZON +
    loanPaymentUyu * loanMonthsInHorizon +
    (financing.months <= HORIZON ? residualUyu : 0) +
    financing.extraDownUsd * fx;

  // Veredicto: rinde si el ahorro cubre la cuota entera; depende si el ahorro
  // es real pero la cuota lo supera y aun así te recuperás en ≤ 5 años.
  let verdict: Verdict;
  if (grossMonthlySavingsUyu <= 0) verdict = "no_rinde";
  else if (netMonthlyDuringLoanUyu >= 0) verdict = "rinde";
  else if (breakevenMonths <= HORIZON) verdict = "depende";
  else verdict = "no_rinde";

  const warnings: Warning[] = [];
  const kmPerYear = usage.kmPerMonth * 12;
  if (kmPerYear > 0) {
    const warrantyYears = input.batteryWarrantyKm / kmPerYear;
    if (warrantyYears < 4) {
      warnings.push({
        code: "battery-warranty",
        detail: `A ${Math.round(kmPerYear).toLocaleString("es-UY")} km/año agotás la garantía de batería (${input.batteryWarrantyKm.toLocaleString("es-UY")} km) en ~${warrantyYears.toFixed(1)} años.`,
      });
    }
  }
  if (usage.homeChargeShare < 0.5) {
    warnings.push({
      code: "no-home-charging",
      detail:
        "Con más de la mitad de la carga en cargadores públicos el ahorro se achica mucho — el caso ideal es wallbox en casa cargando de 00 a 07.",
    });
  }
  const dailyKm = usage.kmPerMonth / 30;
  if (dailyKm > tesla.rangeKm * 0.75 * 0.6) {
    warnings.push({
      code: "range-pressure",
      detail: `Manejás ~${Math.round(dailyKm)} km/día; la autonomía real en ruta ronda ${Math.round(tesla.rangeKm * 0.75)} km — vas a depender de carga en ruta.`,
    });
  }
  if (loanPrincipalUsd === 0) {
    warnings.push({ code: "funding-gap-none", detail: "No necesitás préstamo: la entrega cubre el precio." });
  }

  return {
    verdict,
    fuelMonthlyUyu,
    evMonthlyUyu,
    energySavingsUyu,
    fixedDeltaUyu,
    loanPrincipalUsd,
    loanPaymentUyu,
    residualUyu,
    grossMonthlySavingsUyu,
    netMonthlyDuringLoanUyu,
    breakevenMonths,
    kmToRinde,
    tco5yCurrentUyu,
    tco5yTeslaUyu,
    warnings,
  };
}
