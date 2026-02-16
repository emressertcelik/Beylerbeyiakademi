import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kullanım Kılavuzu - Beylerbeyi Akademi",
  description: "Beylerbeyi Akademi Yönetim Sistemi Kullanım Kılavuzu",
};

export default function KilavuzLayout({ children }: { children: React.ReactNode }) {
  return children;
}
