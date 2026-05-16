import type { Metadata } from "next";
import { Inter, Space_Grotesk, Source_Code_Pro } from "next/font/google";
import "./globals.css";

// Load the fonts
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space" });
const sourceCodePro = Source_Code_Pro({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "Enterprise Expense Engine",
  description: "Self-hosted financial tracking",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${spaceGrotesk.variable} ${sourceCodePro.variable} font-sans bg-gray-950 text-gray-100 antialiased`}>
        {children}
      </body>
    </html>
  );
}
