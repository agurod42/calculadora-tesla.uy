"use client";

import { useMemo, useState } from "react";
import { useOpenPanel } from "@openpanel/nextjs";
import { simulate, type SimulationInput } from "@/calc";
import { DEFAULTS, PRICES_AS_OF, TESLA_MODELS } from "@/data";
import { CAR_BRANDS, CAR_PRESETS, carById, modelsForBrand } from "@/data/cars";
import { USED_PRICES_AS_OF, suggestedPrice, usedPriceFor, yearsFor } from "@/data/used-prices";
import { MARKET_FUEL, MARKET_FX, marketFuelPrice } from "@/data/market";
import { Verdict } from "@/components/Verdict";
import { Field, NumberInput, Select, Slider, Toggle } from "@/components/ui";
import { km, uyu, usd } from "@/lib/format";

const STEPS = ["Tu auto hoy", "Tu Tesla", "Plata y costos", "Veredicto"];

export default function Page() {
  const op = useOpenPanel();
  const [step, setStep] = useState(0);

  // Paso 1 — auto actual. Cascade marca → modelo → año.
  const firstCar = CAR_PRESETS[0]!;
  const [brand, setBrand] = useState(firstCar.brand);
  const [carId, setCarId] = useState(firstCar.id);
  const [year, setYear] = useState<number | null>(null); // null = cualquier año
  const [resaleUsd, setResaleUsd] = useState(usedPriceFor(firstCar.id)?.median ?? firstCar.resaleUsd);
  const [liters, setLiters] = useState(firstCar.litersPer100Km);
  const [border, setBorder] = useState(false);
  const [fuelBase, setFuelBase] = useState<number>(MARKET_FUEL.nafta);
  const [kmPerMonth, setKmPerMonth] = useState(1500);

  // Paso 2 — Tesla
  const [teslaId, setTeslaId] = useState(TESLA_MODELS[0]!.id);

  // Paso 3 — financiamiento y costos
  const [extraDownUsd, setExtraDownUsd] = useState(0);
  const [currency, setCurrency] = useState<"UI" | "USD">("USD");
  const [loanRate, setLoanRate] = useState<number>(DEFAULTS.loanRateUsdPct);
  const [loanMonths, setLoanMonths] = useState<number>(DEFAULTS.loanMonths);
  const [financingMode, setFinancingMode] = useState<"convencional" | "inteligente">("convencional");
  const [wallbox, setWallbox] = useState(true);
  const [homeShare, setHomeShare] = useState(90);
  const [seguroServiceCurrent, setSeguroServiceCurrent] = useState<number>(DEFAULTS.seguroServiceUsedUyu);
  const [seguroServiceTesla, setSeguroServiceTesla] = useState<number>(DEFAULTS.seguroServiceEvUyu);
  const [fx, setFx] = useState<number>(MARKET_FX.uyuPerUsd);

  const tesla = TESLA_MODELS.find((m) => m.id === teslaId)!;
  const fuelPrice = border ? fuelBase * (1 - DEFAULTS.borderDiscount) : fuelBase;

  // Patente mensual = aforo (≈ valor) × alícuota / 12. Usado 4,5 %, Tesla EV 3 %.
  const currentPatenteMo = (resaleUsd * fx * DEFAULTS.patenteRateUsed) / 12;
  const teslaPatenteMo = (tesla.priceUsd * fx * DEFAULTS.patenteRateEv) / 12;
  const fixedCurrent = currentPatenteMo + seguroServiceCurrent;
  const fixedTesla = teslaPatenteMo + seguroServiceTesla;

  // Aplica un modelo + año: actualiza consumo, combustible y valor sugerido.
  function applyCar(id: string, yr: number | null) {
    const c = carById(id);
    if (!c) return;
    setCarId(id);
    setYear(yr);
    setLiters(c.litersPer100Km);
    setFuelBase(marketFuelPrice(c.fuel));
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

  // Crédito Inteligente de Tesla: cuota final (balloon) del 20% del precio,
  // 24 cuotas, en USD a la tasa de Tesla.
  function pickFinancingMode(m: "convencional" | "inteligente") {
    setFinancingMode(m);
    if (m === "inteligente") {
      setCurrency("USD");
      setLoanRate(DEFAULTS.loanRateUsdPct);
      setLoanMonths(24);
    }
  }

  const residualUsd = financingMode === "inteligente" ? 0.2 * tesla.priceUsd : 0;

  // Avanza de paso; al llegar al veredicto trackea el cálculo (datos no personales).
  function goNext() {
    if (step === 2) {
      op.track("calculo_veredicto", {
        veredicto: result.verdict,
        tesla: tesla.name,
        auto_marca: brand,
        auto_modelo: carById(carId)?.model ?? null,
        anio: year,
        km_mes: kmPerMonth,
        ahorro_neto_mes_uyu: Math.round(result.netMonthlyDuringLoanUyu),
        breakeven_meses: Number.isFinite(result.breakevenMonths) ? result.breakevenMonths : null,
        moneda: currency,
        carga_en_casa: wallbox,
      });
    }
    setStep((s) => s + 1);
  }

  const result = useMemo(() => {
    const input: SimulationInput = {
      currentCar: {
        resaleValueUsd: resaleUsd,
        litersPer100Km: liters,
        fuelPriceUyuPerLiter: fuelPrice,
        fixedMonthlyUyu: fixedCurrent,
      },
      tesla,
      teslaCosts: { fixedMonthlyUyu: fixedTesla },
      usage: {
        kmPerMonth,
        homeChargeShare: wallbox ? homeShare / 100 : 0,
        homeTariffUyuPerKwh: DEFAULTS.homeTariffUyuPerKwh,
        publicTariffUyuPerKwh: DEFAULTS.publicTariffUyuPerKwh,
      },
      financing: { extraDownUsd, annualRatePct: loanRate, months: loanMonths, currency, residualUsd },
      fxUyuPerUsd: fx,
      batteryWarrantyKm: DEFAULTS.batteryWarrantyKm,
    };
    return simulate(input);
  }, [
    resaleUsd, liters, fuelPrice, fixedCurrent, tesla, fixedTesla,
    kmPerMonth, wallbox, homeShare, extraDownUsd, loanRate, loanMonths, currency, residualUsd, fx,
  ]);

  return (
    <main className="mx-auto min-h-screen max-w-lg px-5 pb-28 pt-8">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">
          ¿Te rinde un Tesla? Calculadora para Uruguay
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          Descubrí si te conviene cambiar tu auto por un Tesla en Uruguay. Comparamos nafta contra
          electricidad, la cuota del préstamo, la patente y el seguro con precios reales, y te damos
          un veredicto claro. Gratis y sin registro.
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

          <Field label={`Precio de${fuel === "diesel" ? "l gasoil" : " la nafta"}`}>
            <NumberInput value={fuelBase} onChange={setFuelBase} prefix="$" suffix="/ L" step={1} />
            {MARKET_FUEL.asOf && (
              <p className="mt-1.5 text-xs text-neutral-400">
                Precio ANCAP {fuel === "diesel" ? "Gasoil 50S" : "Súper 95"} al {MARKET_FUEL.asOf}
              </p>
            )}
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

          {/* Contenido SEO — visible en la landing y crawleable en el HTML inicial */}
          <section className="mt-4 space-y-5 border-t border-neutral-100 pt-6 text-sm leading-relaxed text-neutral-600">
            <div>
              <h2 className="text-base font-medium text-ink">
                ¿Conviene un Tesla en Uruguay?
              </h2>
              <p className="mt-1.5">
                Con la llegada de Tesla a Uruguay, muchos se preguntan si les rinde vender su auto a
                nafta y pasarse a un eléctrico. La respuesta depende de tus kilómetros, de si podés
                cargar en casa de madrugada y del valor de tu auto actual. Esta calculadora hace la
                cuenta completa: el ahorro de combustible, la cuota del préstamo, la patente (los
                eléctricos pagan 3% en vez de 4,5%), el seguro y el service.
              </p>
            </div>

            <div>
              <h2 className="text-base font-medium text-ink">Preguntas frecuentes</h2>
              <div className="mt-2 space-y-3">
                <div>
                  <h3 className="font-medium text-ink">¿Cuánto sale un Tesla en Uruguay?</h3>
                  <p className="mt-0.5">
                    El Model 3 arranca en USD 32.990 y el Model Y en USD 36.490 (precios oficiales de
                    Tesla Uruguay). La calculadora usa los precios vigentes y la financiación oficial.
                  </p>
                </div>
                <div>
                  <h3 className="font-medium text-ink">¿Cuánto se ahorra pasando de nafta a eléctrico?</h3>
                  <p className="mt-0.5">
                    Cargando en casa en horario valle, la energía cuesta una fracción de la nafta.
                    Sumá menos patente y menos service. El monto exacto depende de tu uso: probalo arriba.
                  </p>
                </div>
                <div>
                  <h3 className="font-medium text-ink">¿De dónde salen los datos?</h3>
                  <p className="mt-0.5">
                    El valor de tu usado es la mediana de avisos de MercadoLibre por modelo y año; los
                    precios y la tasa del Tesla son oficiales; la nafta y el gasoil de ANCAP; el dólar
                    en tiempo real; y el consumo del Tesla de EV Database. Se actualizan solos cada semana.
                  </p>
                </div>
              </div>
            </div>
          </section>
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
          <Field label="Modalidad de financiación">
            <Select
              value={financingMode}
              onChange={(v) => pickFinancingMode(v as "convencional" | "inteligente")}
              options={[
                { value: "convencional", label: "Préstamo convencional" },
                { value: "inteligente", label: "Crédito Inteligente (cuota final)" },
              ]}
            />
            {financingMode === "inteligente" && (
              <p className="mt-1.5 text-xs text-neutral-400">
                Modalidad Tesla: 24 cuotas más bajas y una cuota final (pago global) de{" "}
                {usd(result.residualUyu / fx)} al mes 24. Cuota mensual menor, pero un pago grande al final.
              </p>
            )}
          </Field>

          <Field label="¿Ponés plata extra además del usado?" hint="entrega adicional">
            <NumberInput value={extraDownUsd} onChange={setExtraDownUsd} prefix="US$" step={500} />
          </Field>

          <div className="rounded-xl border border-neutral-200 bg-cloud p-4">
            <p className="text-sm text-neutral-500">Necesitás un préstamo de</p>
            <p className="text-2xl font-semibold text-ink">{usd(result.loanPrincipalUsd)}</p>
            <p className="mt-0.5 text-xs text-neutral-400">
              {usd(tesla.priceUsd)} del Tesla − {usd(resaleUsd + extraDownUsd)} que ponés
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
                Financiación oficial Tesla ({financingMode === "inteligente" ? "Crédito Inteligente" : "Crédito Convencional"}):
                TIN 5,80% anual en USD, sistema francés. Un préstamo bancario en UI suele ser más caro.
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
              <div className="rounded-lg border border-neutral-200 bg-cloud p-3 text-xs text-neutral-500">
                <div className="flex justify-between">
                  <span>Patente de tu auto (4,5% del valor)</span>
                  <span className="font-medium text-ink">{uyu(currentPatenteMo)}/mes</span>
                </div>
                <div className="mt-1 flex justify-between">
                  <span>Patente del Tesla (3% — EV)</span>
                  <span className="font-medium text-ink">{uyu(teslaPatenteMo)}/mes</span>
                </div>
                <p className="mt-1.5 text-[11px] text-neutral-400">
                  Calculada como aforo (≈ valor) × alícuota (SUCIVE 2026). Los EV pagan 3% vs 4,5%.
                </p>
              </div>
              <Field label="Seguro + service de tu auto" hint="mensual, editable">
                <NumberInput
                  value={seguroServiceCurrent}
                  onChange={setSeguroServiceCurrent}
                  prefix="$"
                  step={500}
                />
              </Field>
              <Field label="Seguro + service del Tesla" hint="mensual, editable">
                <NumberInput
                  value={seguroServiceTesla}
                  onChange={setSeguroServiceTesla}
                  prefix="$"
                  step={500}
                />
              </Field>
              <Field label="Cotización del dólar">
                <NumberInput value={fx} onChange={setFx} prefix="$" suffix="/ US$" step={0.5} />
                {MARKET_FX.asOf && (
                  <p className="mt-1.5 text-xs text-neutral-400">Cotización al {MARKET_FX.asOf}</p>
                )}
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
              onClick={goNext}
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
