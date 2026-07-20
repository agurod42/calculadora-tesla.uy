# Contribuir

Gracias por el interés. Issues y PRs bienvenidos. Lo más útil suele ser sumar
modelos de auto al catálogo, afinar consumos o mejorar las fuentes de datos.

## Correr local

```bash
npm install
npm run dev    # http://localhost:3000
npm test       # motor de cálculo + sanidad de datos
npm run build  # build de producción
```

## Cómo funciona

- **Motor de cálculo puro y testeado** (`src/calc.ts`): cuota francés (con opción
  balloon del Crédito Inteligente de Tesla), costo de energía, veredicto,
  breakeven, TCO a 5 años y el umbral de km desde el que empieza a rendir. No
  toca red ni DOM — todo lo que decide el resultado se testea en `test/`.
- **UI**: Next.js (App Router) + Tailwind, mobile-first, wizard de 4 pasos.
- **Ingesta offline** (`scripts/`): scrapea MercadoLibre (por modelo y año), la
  cotización del dólar y los precios de ANCAP. Un scheduled task semanal la
  corre, pasa un gate de sanidad (`test/data.test.ts`) y commitea — Vercel
  redeploya solo. Nada frágil corre en runtime.
- **Compartir**: cada resultado tiene su URL (`/r/<slug>`) con una imagen OG
  dinámica que muestra el ahorro y el veredicto.

## Fuentes de datos

| Dato | Fuente | Cómo se obtiene |
|---|---|---|
| Valor del usado (por año) | MercadoLibre Uruguay | `scripts/ingest-prices.mjs` (mediana de avisos) |
| Precio / specs / tasa Tesla | Tesla Uruguay | Verificado en el scheduled task (Tesla bloquea el fetch directo) |
| Consumo del Tesla | EV Database | Curado en `src/data.ts` (+ pérdidas de carga) |
| Consumo de tu auto | Pruebas reales (autotest, km77) | Curado en `car-catalog.json` |
| Nafta / gasoil | ANCAP (datosuruguay.com) | `scripts/ingest-market.mjs` |
| Cotización del dólar | open.er-api.com | `scripts/ingest-market.mjs` |
| Patente | Fórmula SUCIVE | Calculada (aforo ≈ valor × alícuota) |
| Tarifas de carga | Pliego UTE | Curado en `src/data.ts` |

## Estructura

```
src/
  calc.ts              # motor de cálculo (puro, testeado)
  data.ts              # precios Tesla, tarifas UTE, alícuotas, defaults
  data/
    car-catalog.json   # fuente única de autos (la usan la UI y el scraper)
    used-prices.json   # medianas de ML por modelo y año (generado)
    market-data.json   # FX + combustible (generado)
    silhouettes.ts     # siluetas SVG (sedán / SUV)
  app/                 # rutas: wizard, /r/[slug], OG images, robots, sitemap
  components/          # UI
  lib/                 # formato, estado compartible
scripts/
  ingest-prices.mjs    # scrape de usados desde MercadoLibre
  ingest-market.mjs    # FX (open.er-api.com) + ANCAP (datosuruguay.com)
test/                  # motor de cálculo + sanidad de datos
```

## Sumar un modelo de auto

1. Agregá una entrada en `src/data/car-catalog.json` con `id`, `brand`, `model`,
   `mlSlug` (la ruta en `autos.mercadolibre.com.uy/<mlSlug>`), `fuel`,
   `litersPer100Km` y un `resaleUsd` de fallback.
2. Corré `node scripts/ingest-prices.mjs` para poblar `used-prices.json`.
3. `npm test` para verificar que los datos quedaron en rango.

La UI (`cars.ts`) y el scraper leen del mismo catálogo, así que no se
desincronizan.

## Convenciones

- Commits en inglés, Conventional Commits (`feat:`, `fix:`, `docs:`, …).
- `npm test` y `npm run build` en verde antes de un PR.
