"use client";

import type { SimulationResult, Verdict as VerdictType } from "@/calc";
import { months, uyu } from "@/lib/format";

const VERDICT_COPY: Record<VerdictType, { title: string; sub: string; tone: string }> = {
  rinde: {
    title: "Te rinde",
    sub: "El ahorro cubre la cuota del préstamo y te sobra.",
    tone: "bg-emerald-50 text-emerald-900 border-emerald-200",
  },
  depende: {
    title: "Depende",
    sub: "El ahorro es real, pero durante el préstamo la cuota lo supera. Recuperás la diferencia con el tiempo.",
    tone: "bg-amber-50 text-amber-900 border-amber-200",
  },
  no_rinde: {
    title: "No te rinde",
    sub: "Con estos números el cambio no se paga solo.",
    tone: "bg-rose-50 text-rose-900 border-rose-200",
  },
};

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm text-neutral-500">{label}</span>
      <span className={strong ? "font-semibold text-ink" : "text-ink"}>{value}</span>
    </div>
  );
}

export function Verdict({ r }: { r: SimulationResult }) {
  const c = VERDICT_COPY[r.verdict];
  const net = r.netMonthlyDuringLoanUyu;

  return (
    <div className="animate-fade-up space-y-4">
      <div className={`rounded-2xl border p-6 ${c.tone}`}>
        <p className="text-3xl font-semibold tracking-tight">{c.title}</p>
        <p className="mt-1 text-sm opacity-80">{c.sub}</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-neutral-200 bg-white p-4">
          <p className="text-xs text-neutral-400">Ahorro neto mensual</p>
          <p className={`mt-1 text-xl font-semibold ${net >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
            {net >= 0 ? "+" : "−"}
            {uyu(Math.abs(net))}
          </p>
          <p className="mt-0.5 text-xs text-neutral-400">durante el préstamo</p>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white p-4">
          <p className="text-xs text-neutral-400">Te pagás el cambio en</p>
          <p className="mt-1 text-xl font-semibold text-ink">{months(r.breakevenMonths)}</p>
          <p className="mt-0.5 text-xs text-neutral-400">recuperás la inversión</p>
        </div>
      </div>

      <div className="rounded-xl border border-neutral-200 bg-white px-4 py-2 divide-y divide-neutral-100">
        <Row label="Nafta hoy" value={`${uyu(r.fuelMonthlyUyu)} / mes`} />
        <Row label="Luz con el Tesla" value={`${uyu(r.evMonthlyUyu)} / mes`} />
        <Row label="Ahorro de energía" value={`${uyu(r.energySavingsUyu)} / mes`} strong />
        {r.loanPaymentUyu > 0 && (
          <Row label="Cuota del préstamo" value={`${uyu(r.loanPaymentUyu)} / mes`} />
        )}
        {r.fixedDeltaUyu !== 0 && (
          <Row
            label="Δ patente + seguro + service"
            value={`${r.fixedDeltaUyu > 0 ? "+" : "−"}${uyu(Math.abs(r.fixedDeltaUyu))} / mes`}
          />
        )}
      </div>

      <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-neutral-400">
          Costo total a 5 años
        </p>
        <div className="flex items-end gap-3">
          <div className="flex-1">
            <p className="text-xs text-neutral-500">Seguís con tu auto</p>
            <p className="text-lg font-semibold text-ink">{uyu(r.tco5yCurrentUyu)}</p>
          </div>
          <div className="flex-1">
            <p className="text-xs text-neutral-500">Te pasás al Tesla</p>
            <p
              className={`text-lg font-semibold ${
                r.tco5yTeslaUyu <= r.tco5yCurrentUyu ? "text-emerald-600" : "text-rose-600"
              }`}
            >
              {uyu(r.tco5yTeslaUyu)}
            </p>
          </div>
        </div>
      </div>

      {r.warnings.length > 0 && (
        <ul className="space-y-2">
          {r.warnings.map((w) => (
            <li
              key={w.code}
              className="flex gap-2 rounded-lg border border-neutral-200 bg-white p-3 text-sm text-neutral-600"
            >
              <span aria-hidden className="text-neutral-400">
                {w.code === "funding-gap-none" ? "✓" : "!"}
              </span>
              <span>{w.detail}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
