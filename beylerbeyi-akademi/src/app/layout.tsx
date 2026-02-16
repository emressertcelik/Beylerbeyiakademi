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
  title: "Beylerbeyi Akademi",
  description: "Beylerbeyi Akademi Yönetim Sistemi",
  manifest: "/manifest.json",
  themeColor: "#c4111d",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "BB Akademi",
  },
  icons: {
    icon: "/Logo_S.png",
    apple: [
      { url: "/icons/icon-152x152.png", sizes: "152x152" },
      { url: "/icons/icon-192x192.png", sizes: "192x192" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="BB Akademi" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js', { updateViaCache: 'none' })
                    .then(function(reg) {
                      // Her sayfa yüklemesinde SW güncellemesini kontrol et
                      reg.update();
                      // Yeni SW aktif olduğunda sayfayı yenile
                      var refreshing = false;
                      navigator.serviceWorker.addEventListener('controllerchange', function() {
                        if (!refreshing) {
                          refreshing = true;
                          window.location.reload();
                        }
                      });
                    });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
