import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
  weight: ["300", "400", "500"],
  style: ["normal", "italic"]
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap"
});

export const metadata: Metadata = {
  title: {
    default: "Mona Tatt — Reservas",
    template: "%s · Mona Tatt"
  },
  description:
    "Estudio de tatuaje fineline y botánico. Agenda tu sesión con Mona Tatt.",
  openGraph: {
    title: "Mona Tatt",
    description:
      "Estudio de tatuaje fineline y botánico. Agenda tu sesión con Mona Tatt.",
    type: "website"
  },
  icons: { icon: "/favicon.ico" }
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${fraunces.variable} ${inter.variable}`}>
      <body>{children}</body>
    </html>
  );
}
