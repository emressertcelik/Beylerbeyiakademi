import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import InstallPrompt from "@/components/InstallPrompt";

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
    statusBarStyle: "black-translucent",
    title: "BB Akademi",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/icon-72x72.png", sizes: "72x72" },
      { url: "/icons/icon-96x96.png", sizes: "96x96" },
      { url: "/icons/icon-128x128.png", sizes: "128x128" },
      { url: "/icons/icon-144x144.png", sizes: "144x144" },
      { url: "/icons/icon-152x152.png", sizes: "152x152" },
      { url: "/icons/icon-192x192.png", sizes: "192x192" },
      { url: "/icons/icon-384x384.png", sizes: "384x384" },
      { url: "/icons/icon-512x512.png", sizes: "512x512" },
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
        {/* Android PWA */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#c4111d" />
        
        {/* iOS PWA */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="BB Akademi" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <link rel="apple-touch-icon" sizes="72x72" href="/icons/icon-72x72.png" />
        <link rel="apple-touch-icon" sizes="96x96" href="/icons/icon-96x96.png" />
        <link rel="apple-touch-icon" sizes="128x128" href="/icons/icon-128x128.png" />
        <link rel="apple-touch-icon" sizes="144x144" href="/icons/icon-144x144.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icons/icon-152x152.png" />
        <link rel="apple-touch-icon" sizes="192x192" href="/icons/icon-192x192.png" />
        <link rel="apple-touch-icon" sizes="384x384" href="/icons/icon-384x384.png" />
        <link rel="apple-touch-icon" sizes="512x512" href="/icons/icon-512x512.png" />
        
        {/* iOS Splash Screen */}
        <meta name="apple-mobile-web-app-title" content="BB Akademi" />
        
        {/* Genel */}
        <meta name="application-name" content="BB Akademi" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <InstallPrompt />
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
