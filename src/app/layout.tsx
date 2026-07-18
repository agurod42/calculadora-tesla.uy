import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

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
      <body className="font-sans">{children}</body>
    </html>
  );
}
