// src/app/layout.tsx
import "@/styles/globals.css";
import React from "react";
import Providers from "./providers"; // client-only logic moved here
import { Literata } from "next/font/google";

const literata = Literata({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-literata",
});

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${literata.variable} min-h-screen bg-muted font-serif antialiased flex justify-center items-center`}
      >
        <Providers>
          <main className=" rounded-lg shadow-xl text-center w-full">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
