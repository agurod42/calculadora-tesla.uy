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
- `src/data/cars.ts` — presets de autos populares (fallback; etapa 3 = MercadoLibre).
- `src/app/page.tsx` — wizard.
- `src/components/` — UI.

Los datos que cambian con el tiempo (precios Tesla UY, tarifas UTE, nafta, fx)
viven en `src/data.ts` con fecha de vigencia.
