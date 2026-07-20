# Calculadora Tesla Uruguay 🇺🇾⚡

**¿Te conviene cambiar tu auto por un Tesla en Uruguay?** Una calculadora gratis
y sin registro que hace la cuenta completa con datos reales: nafta vs. luz, la
cuota del préstamo, la patente, el seguro y el service — y te da un veredicto
claro con el desglose.

👉 **[calculadoratesla.uy](https://calculadoratesla.uy)**

Proyecto open source. Nació de [un hilo de Twitter](https://x.com/SigloXXcap/status/2078193698857205835)
donde alguien preguntaba si le rendía vender su auto para pasarse a un Tesla.

## Qué la hace distinta

No te dice *qué* Tesla comprar: te dice **si te conviene**, con tus números. Y
los datos no son inventados ni estáticos — se actualizan solos cada semana:

| Dato | Fuente |
|---|---|
| Valor de tu auto usado (por año) | Mediana de avisos de **MercadoLibre Uruguay** |
| Precio, specs y tasa del Tesla | **Tesla Uruguay** (financiación oficial, 5,80% TIN USD) |
| Consumo del Tesla (kWh/100 km) | **EV Database** + pérdidas de carga |
| Consumo de tu auto | Pruebas reales (autotest, km77) |
| Nafta / gasoil | **ANCAP** |
| Cotización del dólar | En tiempo real |
| Patente | Fórmula **SUCIVE** (aforo × alícuota, EV 3% vs 4,5%) |
| Tarifas de carga | Pliego **UTE** |

## Cómo funciona

- **Motor de cálculo puro y testeado** (`src/calc.ts`): cuota francés (con opción
  balloon del Crédito Inteligente de Tesla), costo de energía, veredicto,
  breakeven, TCO a 5 años y el umbral de km desde el que empieza a rendir.
- **UI** Next.js (App Router) + Tailwind, mobile-first, wizard de 4 pasos.
- **Ingesta offline** (`scripts/`): scrapea MercadoLibre (por año), FX y ANCAP;
  un scheduled task semanal la corre, pasa un gate de sanidad (`test/data.test.ts`)
  y commitea — Vercel redeploya solo. Sin datos frágiles en runtime.
- **Compartir**: cada resultado tiene su URL (`/r/<slug>`) con una imagen OG
  dinámica que muestra tu ahorro y veredicto.

## Correr local

```bash
npm install
npm run dev    # http://localhost:3000
npm test       # motor de cálculo + sanidad de datos
npm run build  # build de producción
```

## Estructura

```
src/
  calc.ts              # motor de cálculo (puro, testeado)
  data.ts              # precios Tesla, tarifas UTE, alícuotas, defaults
  data/
    car-catalog.json   # fuente única de autos (UI + scraper)
    used-prices.json   # medianas ML por modelo y año (generado)
    market-data.json   # FX + combustible (generado)
  app/                 # rutas Next (wizard, /r/[slug], OG images, robots, sitemap)
  components/           # UI
scripts/
  ingest-prices.mjs    # scrape de usados desde MercadoLibre
  ingest-market.mjs    # FX (open.er-api.com) + ANCAP (datosuruguay.com)
```

## Contribuir

Issues y PRs bienvenidos. Ideas útiles: sumar modelos de auto al catálogo,
afinar consumos, o mejorar las fuentes de datos.

## Aviso

Estimación orientativa, **no es asesoramiento financiero**. Sitio **no afiliado a
Tesla**; "Tesla" es marca de Tesla, Inc.

## Licencia

MIT.
