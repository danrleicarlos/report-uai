import type { Metadata } from "next";
import "./globals.css";
import { ReportProvider } from "@/lib/store/reportStore";

export const metadata: Metadata = {
  title: "Report UAI — Transforme relatórios em insights",
  description:
    "Ferramenta premium de análise de marketing e CRM. Envie seus relatórios e receba um dashboard visual com insights automáticos em segundos.",
  keywords: ["marketing", "dashboard", "analytics", "CRM", "relatório", "insights"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="dark">
      <body className="antialiased">
        <ReportProvider>{children}</ReportProvider>
      </body>
    </html>
  );
}
