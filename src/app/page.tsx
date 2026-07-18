"use client";

import { useMemo, useState } from "react";
import { simulate, type SimulationInput } from "@/calc";
import { DEFAULTS, PRICES_AS_OF, TESLA_MODELS } from "@/data";
import { CAR_BRANDS, CAR_PRESETS, carById, modelsForBrand } from "@/data/cars";
import { USED_PRICES_AS_OF, suggestedPrice, usedPriceFor, yearsFor } from "@/data/used-prices";
import { Verdict } from "@/components/Verdict";
import { Field, NumberInput, Select, Slider, Toggle } from "@/components/ui";
import { km, uyu, usd } from "@/lib/format";

const STEPS = ["Tu auto hoy", "Tu Tesla", "Plata y costos", "Veredicto"];

export default function Page() {
  const [step, setStep] = useState(0);

  // Paso 1 — auto actual. Cascade marca → modelo → año.
  const firstCar = CAR_PRESETS[0]!;
  const [brand, setBrand] = useState(firstCar.brand);
  const [carId, setCarId] = useState(firstCar.id);
  const [year, setYear] = useState<number | null>(null); // null = cualquier año
  const [noCar, setNoCar] = useState(false);
  const [resaleUsd, setResaleUsd] = useState(usedPriceFor(firstCar.id)?.median ?? firstCar.resaleUsd);
  const [liters, setLiters] = useState(firstCar.litersPer100Km);
  const [border, setBorder] = useState(false);
  const [fuelBase, setFuelBase] = useState<number>(DEFAULTS.fuelPriceUyuPerLiter);
  const [kmPerMonth, setKmPerMonth] = useState(1500);

  // Paso 2 — Tesla
  const [teslaId, setTeslaId] = useState(TESLA_MODELS[0]!.id);

  // Paso 3 — financiamiento y costos
  const [extraDownUsd, setExtraDownUsd] = useState(0);
  const [currency, setCurrency] = useState<"UI" | "USD">("USD");
  const [loanRate, setLoanRate] = useState<number>(DEFAULTS.loanRateUsdPct);
  const [loanMonths, setLoanMonths] = useState<number>(DEFAULTS.loanMonths);
  const [wallbox, setWallbox] = useState(true);
  const [homeShare, setHomeShare] = useState(90);
  const [fixedCurrent, setFixedCurrent] = useState(8000);
  const [fixedTesla, setFixedTesla] = useState(11000);
  const [fx, setFx] = useState<number>(DEFAULTS.fxUyuPerUsd);

  const tesla = TESLA_MODELS.find((m) => m.id === teslaId)!;
  const fuelPrice = border ? fuelBase * (1 - DEFAULTS.borderDiscount) : fuelBase;

  // Aplica un modelo + año: actualiza consumo, combustible y valor sugerido.
  function applyCar(id: string, yr: number | null) {
    const c = carById(id);
    if (!c) return;
    setCarId(id);
    setYear(yr);
    setLiters(c.litersPer100Km);
    setFuelBase(
      c.fuel === "diesel" ? DEFAULTS.dieselPriceUyuPerLiter : DEFAULTS.fuelPriceUyuPerLiter,
    );
    setResaleUsd(suggestedPrice(id, yr ?? undefined) ?? c.resaleUsd);
  }

  const fuel = carById(carId)?.fuel ?? "nafta";
  const fuelLabel = fuel === "diesel" ? "gasoil" : "nafta";

  function pickBrand(b: string) {
    setBrand(b);
    const first = modelsForBrand(b)[0];
    if (first) applyCar(first.id, null);
  }

  const priceInfo = usedPriceFor(carId);
  const availableYears = yearsFor(carId);
  const yearInfo = year != null ? priceInfo?.byYear?.[String(year)] : undefined;

  function pickCurrency(c: "UI" | "USD") {
    setCurrency(c);
    setLoanRate(c === "UI" ? DEFAULTS.loanRateUiPct : DEFAULTS.loanRateUsdPct);
  }

  const result = useMemo(() => {
    const input: SimulationInput = {
      currentCar: {
        resaleValueUsd: noCar ? 0 : resaleUsd,
        litersPer100Km: liters,
        fuelPriceUyuPerLiter: fuelPrice,
        fixedMonthlyUyu: noCar ? 0 : fixedCurrent,
      },
      tesla,
      teslaCosts: { fixedMonthlyUyu: fixedTesla },
      usage: {
        kmPerMonth,
        homeChargeShare: wallbox ? homeShare / 100 : 0,
        homeTariffUyuPerKwh: DEFAULTS.homeTariffUyuPerKwh,
        publicTariffUyuPerKwh: DEFAULTS.publicTariffUyuPerKwh,
      },
      financing: { extraDownUsd, annualRatePct: loanRate, months: loanMonths, currency },
      fxUyuPerUsd: fx,
      batteryWarrantyKm: DEFAULTS.batteryWarrantyKm,
    };
    return simulate(input);
  }, [
    noCar, resaleUsd, liters, fuelPrice, fixedCurrent, tesla, fixedTesla,
    kmPerMonth, wallbox, homeShare, extraDownUsd, loanRate, loanMonths, currency, fx,
  ]);

  return (
    <main className="mx-auto min-h-screen max-w-lg px-5 pb-28 pt-8">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">¿Te rinde un Tesla?</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Calculá si te conviene cambiar tu auto por un Tesla en Uruguay. Con números, no con onda.
        </p>
      </header>

      {/* Progreso */}
      <div className="mb-6 flex gap-1.5">
        {STEPS.map((s, i) => (
          <button
            key={s}
            onClick={() => setStep(i)}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              i <= step ? "bg-accent" : "bg-neutral-200"
            }`}
            aria-label={s}
          />
        ))}
      </div>
      <p className="mb-4 text-xs font-medium uppercase tracking-wide text-neutral-400">
        Paso {step + 1} de 4 · {STEPS[step]}
      </p>

      {/* ---------------- Paso 1 ---------------- */}
      {step === 0 && (
        <div className="animate-fade-up space-y-5">
          <Toggle checked={noCar} onChange={setNoCar} label="No entrego ningún auto" />

          {!noCar && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Marca">
                  <Select
                    value={brand}
                    onChange={pickBrand}
                    options={CAR_BRANDS.map((b) => ({ value: b, label: b }))}
                  />
                </Field>
                <Field label="Modelo">
                  <Select
                    value={carId}
                    onChange={(id) => applyCar(id, null)}
                    options={modelsForBrand(brand).map((c) => ({ value: c.id, label: c.model }))}
                  />
                </Field>
              </div>

              {availableYears.length > 0 && (
                <Field label="Año" hint="afina el precio">
                  <Select
                    value={year == null ? "" : String(year)}
                    onChange={(v) => applyCar(carId, v === "" ? null : Number(v))}
                    options={[
                      { value: "", label: "Cualquiera / no sé" },
                      ...availableYears.map((y) => ({ value: String(y), label: String(y) })),
                    ]}
                  />
                </Field>
              )}

              <Field label="¿Cuánto pedirías por él?" hint="editable">
                <NumberInput value={resaleUsd} onChange={setResaleUsd} prefix="US$" step={500} />
                {yearInfo ? (
                  <p className="mt-1.5 text-xs text-neutral-400">
                    Precio medio {year} en MercadoLibre: {usd(yearInfo.median)} · {yearInfo.count} avisos ·
                    al {USED_PRICES_AS_OF}
                  </p>
                ) : (
                  priceInfo && (
                    <p className="mt-1.5 text-xs text-neutral-400">
                      Precio medio en MercadoLibre: {usd(priceInfo.median)} · {priceInfo.count} avisos
                      (todos los años) · al {USED_PRICES_AS_OF}
                    </p>
                  )
                )}
              </Field>
              <Field label="Consumo" hint="editable">
                <NumberInput value={liters} onChange={setLiters} suffix="L/100 km" step={0.1} />
              </Field>
            </>
          )}

          <Field label={`Precio de${fuel === "diesel" ? "l gasoil" : " la nafta"}`}>
            <NumberInput value={fuelBase} onChange={setFuelBase} prefix="$" suffix="/ L" step={1} />
          </Field>
          <Toggle checked={border} onChange={setBorder} label={`Cargo ${fuelLabel} más barato en la frontera`} />

          <div className="rounded-2xl border border-neutral-200 bg-cloud p-5">
            <div className="flex items-baseline justify-between">
              <span className="text-sm font-medium">¿Cuánto manejás?</span>
              <span className="text-lg font-semibold text-accent">{km(kmPerMonth)}/mes</span>
            </div>
            <div className="mt-3">
              <Slider value={kmPerMonth} onChange={setKmPerMonth} min={200} max={8000} step={100} />
            </div>
            <p className="mt-2 text-xs text-neutral-400">
              ≈ {km(Math.round(kmPerMonth / 30))}/día · {km(kmPerMonth * 12)}/año
            </p>
          </div>
        </div>
      )}

      {/* ---------------- Paso 2 ---------------- */}
      {step === 1 && (
        <div className="animate-fade-up space-y-3">
          <p className="text-sm text-neutral-500">
            Elegí el modelo. Precios y autonomía oficiales de Tesla Uruguay.
          </p>
          {TESLA_MODELS.map((m) => {
            const active = m.id === teslaId;
            return (
              <button
                key={m.id}
                onClick={() => setTeslaId(m.id)}
                className={`flex w-full items-center justify-between rounded-xl border p-4 text-left transition-all ${
                  active
                    ? "border-accent ring-1 ring-accent bg-white shadow-card"
                    : "border-neutral-200 bg-white hover:border-neutral-300"
                }`}
              >
                <div>
                  <p className="font-medium text-ink">{m.name}</p>
                  <p className="text-xs text-neutral-400">{km(m.rangeKm)} de autonomía</p>
                </div>
                <p className="text-lg font-semibold text-ink">{usd(m.priceUsd)}</p>
              </button>
            );
          })}
        </div>
      )}

      {/* ---------------- Paso 3 ---------------- */}
      {step === 2 && (
        <div className="animate-fade-up space-y-5">
          <Field label="¿Ponés plata extra además del usado?" hint="entrega adicional">
            <NumberInput value={extraDownUsd} onChange={setExtraDownUsd} prefix="US$" step={500} />
          </Field>

          <div className="rounded-xl border border-neutral-200 bg-cloud p-4">
            <p className="text-sm text-neutral-500">Necesitás un préstamo de</p>
            <p className="text-2xl font-semibold text-ink">{usd(result.loanPrincipalUsd)}</p>
            <p className="mt-0.5 text-xs text-neutral-400">
              {usd(tesla.priceUsd)} del Tesla − {usd((noCar ? 0 : resaleUsd) + extraDownUsd)} que ponés
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Moneda del préstamo">
              <Select
                value={currency}
                onChange={(v) => pickCurrency(v as "UI" | "USD")}
                options={[
                  { value: "USD", label: "USD (Tesla)" },
                  { value: "UI", label: "UI (banco)" },
                ]}
              />
            </Field>
            <Field label="Plazo">
              <Select
                value={String(loanMonths)}
                onChange={(v) => setLoanMonths(Number(v))}
                options={[24, 36, 48, 60, 72].map((m) => ({ value: String(m), label: `${m} meses` }))}
              />
            </Field>
          </div>
          <Field label="Tasa anual" hint="editable">
            <NumberInput value={loanRate} onChange={setLoanRate} suffix="% anual" step={0.5} />
            {currency === "USD" && (
              <p className="mt-1.5 text-xs text-neutral-400">
                Financiación oficial Tesla (Crédito Convencional): TIN 5,80% anual en USD, sistema
                francés, anticipo 20%. Un préstamo bancario en UI suele ser más caro.
              </p>
            )}
          </Field>

          <hr className="border-neutral-100" />

          <Toggle
            checked={wallbox}
            onChange={setWallbox}
            label="Puedo cargar en casa (enchufe / wallbox)"
          />
          {wallbox && (
            <div className="rounded-xl border border-neutral-200 bg-cloud p-4">
              <div className="flex items-baseline justify-between">
                <span className="text-sm">Carga en casa</span>
                <span className="font-semibold text-accent">{homeShare}%</span>
              </div>
              <div className="mt-3">
                <Slider value={homeShare} onChange={setHomeShare} min={0} max={100} step={5} />
              </div>
              <p className="mt-2 text-xs text-neutral-400">
                El resto en cargadores públicos (más caros). Cargar de 00 a 07 en tarifa valle es lo más barato.
              </p>
            </div>
          )}

          <details className="rounded-xl border border-neutral-200 bg-white p-4">
            <summary className="cursor-pointer text-sm font-medium text-neutral-600">
              Ajustes finos (patente, seguro, cotización)
            </summary>
            <div className="mt-4 space-y-4">
              <Field label="Costos fijos mensuales de tu auto" hint="patente + seguro + service">
                <NumberInput value={fixedCurrent} onChange={setFixedCurrent} prefix="$" step={500} />
              </Field>
              <Field label="Costos fijos mensuales del Tesla" hint="patente + seguro + service">
                <NumberInput value={fixedTesla} onChange={setFixedTesla} prefix="$" step={500} />
              </Field>
              <Field label="Cotización del dólar">
                <NumberInput value={fx} onChange={setFx} prefix="$" suffix="/ US$" step={0.5} />
              </Field>
            </div>
          </details>
        </div>
      )}

      {/* ---------------- Paso 4 ---------------- */}
      {step === 3 && (
        <div className="space-y-4">
          <Verdict r={result} />
          <p className="px-1 text-xs leading-relaxed text-neutral-400">
            Estimación orientativa, no es asesoramiento financiero. Precios de referencia al {PRICES_AS_OF}
            {" "}(Tesla Uruguay, tarifas UTE, nafta ANCAP). El valor del usado es la mediana de avisos
            publicados en MercadoLibre Uruguay (todos los años y versiones); ajustá todo a tu caso.
          </p>
        </div>
      )}

      {/* Navegación */}
      <div className="fixed inset-x-0 bottom-0 border-t border-neutral-100 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-lg gap-3 px-5 py-3">
          {step > 0 && (
            <button
              onClick={() => setStep((s) => s - 1)}
              className="rounded-full border border-neutral-300 px-5 py-3 text-sm font-medium text-ink"
            >
              Atrás
            </button>
          )}
          {step < 3 ? (
            <button
              onClick={() => setStep((s) => s + 1)}
              className="flex-1 rounded-full bg-ink px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-black"
            >
              {step === 2 ? "Ver si me rinde" : "Siguiente"}
            </button>
          ) : (
            <button
              onClick={() => setStep(0)}
              className="flex-1 rounded-full border border-neutral-300 px-5 py-3 text-sm font-medium text-ink"
            >
              Empezar de nuevo
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
