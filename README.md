# calculadora-tesla.uy

¿Te rinde cambiar tu auto por un Tesla? Calculadora para Uruguay: nafta vs. luz,
préstamo, patente/seguro/service, veredicto con breakeven y TCO a 5 años.

Estado: **etapa 2** — motor de cálculo (`src/calc.ts`, testeado) + UI Next.js
(wizard de 4 pasos, mobile-first, estética Tesla). Falta: lookup MercadoLibre
(etapa 3) y deploy en Vercel + dominio (etapa 4). Ver `PLAN.md`.

```bash
npm install
npm run dev    # http://localhost:3000
npm test       # motor de cálculo
npm run build  # build de producción
```

## Estructura

- `src/calc.ts` — motor puro (cuota, energía, veredicto, TCO). Testeado.
- `src/data.ts` — precios Tesla / tarifas UTE / nafta / fx, con fecha de vigencia.
- `src/data/cars.ts` — presets de autos populares (consumo + valor fallback).
- `src/data/used-prices.json` — medianas de precio por modelo y año, generadas por `scripts/ingest-prices.mjs` desde MercadoLibre Uruguay.
- `src/data/market-data.json` — FX (open.er-api.com) + combustible ANCAP (datosuruguay.com), generado por `scripts/ingest-market.mjs`.

Ambos datasets se refrescan solos cada semana (scheduled task en el host `calculadora-tesla-precios-refresh`), con un gate de sanidad (`test/data.test.ts`) antes de commitear. Precios/specs/tasa de Tesla se verifican en el mismo task vía navegador (Tesla bloquea el fetch directo).
- `src/app/page.tsx` — wizard.
- `src/components/` — UI.

Los datos que cambian con el tiempo (precios Tesla UY, tarifas UTE, nafta, fx)
viven en `src/data.ts` con fecha de vigencia.
