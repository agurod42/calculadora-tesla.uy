import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { OpenPanelComponent } from "@openpanel/nextjs";
import "./globals.css";

// clientId de OpenPanel: es público (identifica el proyecto, solo permite
// ENVIAR eventos). El client secret NO va acá — es server-side.
const OPENPANEL_CLIENT_ID = "6ec8d021-1781-480f-b7fd-779aa4c0b658";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

const SITE_URL = "https://calculadoratesla.uy";
const TITLE = "Calculadora Tesla Uruguay — ¿te conviene cambiar tu auto?";
const DESCRIPTION =
  "Calculadora gratis: descubrí si te rinde cambiar tu auto por un Tesla en Uruguay. Compara nafta vs. luz, cuota del préstamo, patente y seguro con precios reales de MercadoLibre y Tesla, y un veredicto claro.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  applicationName: "Calculadora Tesla Uruguay",
  keywords: [
    "calculadora Tesla Uruguay",
    "conviene un Tesla en Uruguay",
    "Tesla Uruguay precio",
    "cambiar mi auto por un Tesla",
    "ahorro auto eléctrico Uruguay",
    "Tesla Model 3 Uruguay",
    "Tesla Model Y Uruguay",
    "patente auto eléctrico Uruguay",
    "nafta vs eléctrico Uruguay",
    "financiación Tesla Uruguay",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: SITE_URL,
    siteName: "Calculadora Tesla Uruguay",
    locale: "es_UY",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

// Datos estructurados: app + preguntas frecuentes (rich results en Google).
const JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      name: "Calculadora Tesla Uruguay",
      url: SITE_URL,
      applicationCategory: "FinanceApplication",
      operatingSystem: "Web",
      inLanguage: "es-UY",
      description: DESCRIPTION,
      offers: { "@type": "Offer", price: "0", priceCurrency: "UYU" },
    },
    {
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "¿Conviene comprar un Tesla en Uruguay?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Depende de cuántos kilómetros hagas, de si podés cargar en casa de madrugada y del precio de tu auto actual. Con mucho kilometraje y carga domiciliaria, el ahorro de nafta suele cubrir la cuota del préstamo. La calculadora lo estima con tus números.",
          },
        },
        {
          "@type": "Question",
          name: "¿Cuánto sale un Tesla en Uruguay?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "El Tesla Model 3 arranca en USD 32.990 y el Model Y en USD 36.490 (precios oficiales Tesla Uruguay). La calculadora usa los precios vigentes y la financiación oficial (TIN 5,80% anual en USD).",
          },
        },
        {
          "@type": "Question",
          name: "¿Cuánto se ahorra pasando de nafta a un auto eléctrico?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Cargando en casa en horario valle, la energía de un eléctrico cuesta una fracción de lo que gastás en nafta. Además el eléctrico paga menos patente (3% vs 4,5%) y menos service. El monto exacto depende de tu uso.",
          },
        },
        {
          "@type": "Question",
          name: "¿De dónde salen los datos de la calculadora?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "El valor de tu auto usado es la mediana de avisos de MercadoLibre Uruguay por modelo y año; los precios y la tasa del Tesla son oficiales; la nafta y el gasoil de ANCAP; el dólar en tiempo real; y el consumo del Tesla de EV Database. Se actualizan solos cada semana.",
          },
        },
      ],
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-UY" className={inter.variable}>
      <body className="font-sans">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
        />
        <OpenPanelComponent
          clientId={OPENPANEL_CLIENT_ID}
          apiUrl="/api/op"
          scriptUrl="/api/op/op1.js"
          trackScreenViews
          trackOutgoingLinks
        />
        {children}
      </body>
    </html>
  );
}
