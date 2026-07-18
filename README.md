# calculadora-tesla.uy

¿Te rinde cambiar tu auto por un Tesla? Calculadora para Uruguay: nafta vs. luz,
préstamo, patente/seguro/service, veredicto con breakeven y TCO a 5 años.

Estado: **etapa 1** — motor de cálculo puro (`src/calc.ts`) con tests. La UI
(Next.js, deploy en Vercel) viene en etapa 2; ver `PLAN.md`.

```bash
npm install
npm test
```

Los datos que cambian con el tiempo (precios Tesla UY, tarifas UTE, nafta, fx)
viven en `src/data.ts` con fecha de vigencia.
