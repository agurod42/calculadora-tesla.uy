import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { OpenPanelComponent } from "@openpanel/nextjs";
import "./globals.css";

// clientId de OpenPanel: es público (identifica el proyecto, solo permite
// ENVIAR eventos). El client secret NO va acá — es server-side.
const OPENPANEL_CLIENT_ID = "6ec8d021-1781-480f-b7fd-779aa4c0b658";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "¿Te rinde un Tesla? · Calculadora para Uruguay",
  description:
    "Calculá si te conviene cambiar tu auto por un Tesla en Uruguay: nafta vs. luz, préstamo, patente y seguro. Con veredicto y números reales.",
  openGraph: {
    title: "¿Te rinde un Tesla?",
    description:
      "Calculá si te conviene cambiar tu auto por un Tesla en Uruguay, con números reales.",
    locale: "es_UY",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-UY" className={inter.variable}>
      <body className="font-sans">
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
