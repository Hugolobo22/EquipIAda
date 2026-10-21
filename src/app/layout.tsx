import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "EquipIAda — A IA que não quer trabalhar",
  description: "Protótipo de mascote animado com olhos que seguem o cursor, expressões, falas e botão fugitivo.",
};

export default function RootLayout({children}:{children:ReactNode}) {
  return <html lang="pt-BR"><body>{children}</body></html>;
}
