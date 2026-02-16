import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Beylerbeyi Akademi — Futbol Akademi Yönetim Sistemi",
  description:
    "Beylerbeyi Spor Kulübü altyapı akademisinin oyuncu takibi, maç yönetimi, performans analizi ve istatistik platformu.",
};

export default function TanitimLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
