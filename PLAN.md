# Plan — calculadora-tesla.uy

Acordado 2026-07-17 (chat Assistant). Origen: hilo de @SigloXXcap sobre vender
un VW Nivus para pasarse a Tesla.

## Producto

One-pager responsive es-UY, mobile-first (tráfico de Twitter/WhatsApp). El
usuario carga su situación en <2 min y sale con un veredicto con números.
Resultado compartible (estado en URL + card OG).

## Flujo (4 pasos, estética configurador Tesla)

1. **Tu auto hoy** — autocomplete marca/modelo/año → valor promedio vía
   MercadoLibre (mediana de listados MLU, año ±1), overrideable; opción "no
   entrego auto". Consumo L/100 km pre-cargado editable, precio nafta (toggle
   frontera con % descuento), **km/mes como slider protagonista**.
2. **Tu Tesla** — cards espejando los planes de tesla.com/uy (Model 3
   Standard/Premium/Performance, Model Y): precio, autonomía, foto.
3. **Financiamiento y costos** — entrega = usado + extra → préstamo por la
   diferencia (el gap queda explícito). Moneda UI/USD, tasa y plazo editables →
   cuota francés. Carga: ¿wallbox en casa? + % carga pública. Δpatente,
   Δseguro, Δservice con defaults editables.
4. **Veredicto** — "Te rinde / No te rinde / Depende" + ahorro neto mensual,
   breakeven, TCO 5 años lado a lado. Warnings condicionales: garantía de
   batería si km/año altos, sin carga en casa, presión de autonomía en ruta.

## Arquitectura

- Next.js (App Router) + TypeScript + Tailwind + shadcn/ui; deploy Vercel.
- `src/calc.ts`: motor puro testeado (vitest); fixtures = casos reales del hilo.
- `app/api/usado/route.ts`: serverless para MLU (token client_credentials,
  cache agresivo por modelo-año). Fallback desde el día 1: JSON curado con los
  ~50 usados más vendidos en UY.
- `src/data.ts`: precios Tesla / tarifas UTE / nafta / fx en un solo archivo
  con fecha de vigencia visible en la UI.
- Estado en URL params → compartible; OG image dinámica con el veredicto.
- Sin DB en v1. Vercel Analytics.

## Riesgos

- API de MercadoLibre (auth, cuotas, listados sin precio) → mediana, filtro de
  outliers, fallback estático.
- Precios cambian seguido → todo en `data.ts` + "precios al YYYY-MM-DD".
- Disclaimer visible: estimación, no asesoramiento financiero.

## Etapas

1. ✅ Motor de cálculo + tests.
2. UI completa client-side (valor usado manual).
3. Lookup MLU + fallback.
4. Polish: OG cards, SEO, dominio calculadora-tesla.uy, deploy.
