import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://maxiautomotores.com"), // Ajustá esto cuando tengas tu dominio
  title: "MaxiAutomotores | Compra y venta de autos",
  description: "Compramos tu vehículo en cualquier estado y vendemos unidades con alto potencial de rentabilidad para talleristas.",
  icons: {
    icon: "/logo.png", 
    apple: "/logo.png",
  },
  openGraph: {
    title: "MaxiAutomotores | Compra y Venta de Vehículos",
    description: "El stock más grande de autos con detalles, siniestrados y oportunidades de inversión en Zona Oeste.",
    siteName: "MaxiAutomotores",
    images: ["/logo.png"],
    locale: "es_AR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} min-h-full flex flex-col antialiased`}>
        {children}
      </body>
    </html>
  );
}