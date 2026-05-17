import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ExpenseIQ Workstation",
  description: "Enterprise Ledger Platform",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#070a13" />
      </head>
      <body>{children}</body>
    </html>
  );
}
