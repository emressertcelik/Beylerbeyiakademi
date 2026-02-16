"use client";

import { useState, useEffect } from "react";
import { X, Share, PlusSquare, Download } from "lucide-react";

export default function InstallPrompt() {
  const [show, setShow] = useState(false);
  const [platform, setPlatform] = useState<"ios" | "android" | null>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<Event | null>(null);

  useEffect(() => {
    // Zaten yüklüyse (standalone modda) gösterme
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as unknown as { standalone?: boolean }).standalone === true;
    if (isStandalone) return;

    // Daha önce kapatıldıysa 3 gün bekle
    const dismissed = localStorage.getItem("pwa-install-dismissed");
    if (dismissed) {
      const dismissedAt = parseInt(dismissed, 10);
      const threeDays = 3 * 24 * 60 * 60 * 1000;
      if (Date.now() - dismissedAt < threeDays) return;
    }

    const ua = navigator.userAgent;
    const isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    const isAndroid = /Android/.test(ua);

    if (isIOS) {
      // iOS Safari'de mi kontrol et (Chrome/Firefox iOS'ta PWA yükleyemez)
      const isSafari = /Safari/.test(ua) && !/CriOS|FxiOS|OPiOS/.test(ua);
      if (isSafari) {
        setPlatform("ios");
        setShow(true);
      }
    } else if (isAndroid) {
      setPlatform("android");
      // Android'de beforeinstallprompt event'ini dinle
      const handler = (e: Event) => {
        e.preventDefault();
        setDeferredPrompt(e);
        setShow(true);
      };
      window.addEventListener("beforeinstallprompt", handler);
      return () => window.removeEventListener("beforeinstallprompt", handler);
    }
  }, []);

  const handleDismiss = () => {
    setShow(false);
    localStorage.setItem("pwa-install-dismissed", Date.now().toString());
  };

  const handleInstallAndroid = async () => {
    if (!deferredPrompt) return;
    (deferredPrompt as Event & { prompt: () => void }).prompt();
    handleDismiss();
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[9999] animate-slide-up">
      <div className="bg-white border border-[#e2e5e9] rounded-2xl shadow-2xl shadow-black/15 p-4 max-w-sm mx-auto">
        {/* Kapat butonu */}
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-full bg-[#f1f3f5] hover:bg-[#e2e5e9] transition-colors"
        >
          <X size={14} className="text-[#5a6170]" />
        </button>

        <div className="flex items-start gap-3">
          {/* App icon */}
          <img
            src="/icons/icon-96x96.png"
            alt="BB Akademi"
            className="w-12 h-12 rounded-xl shrink-0"
          />
          <div className="min-w-0 flex-1 pr-6">
            <h3 className="text-sm font-bold text-[#1a1a2e]">BB Akademi&apos;yi Yükle</h3>
            <p className="text-xs text-[#8c919a] mt-0.5">
              Ana ekrana ekleyerek uygulama gibi kullan
            </p>
          </div>
        </div>

        {platform === "ios" ? (
          <div className="mt-3 bg-[#f8f9fb] rounded-xl p-3 space-y-2.5">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-[#c4111d]/10 flex items-center justify-center shrink-0">
                <span className="text-xs font-bold text-[#c4111d]">1</span>
              </div>
              <p className="text-xs text-[#1a1a2e]">
                Alt menüden <Share size={13} className="inline text-[#007AFF] -mt-0.5" /> <strong>Paylaş</strong> butonuna dokun
              </p>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-[#c4111d]/10 flex items-center justify-center shrink-0">
                <span className="text-xs font-bold text-[#c4111d]">2</span>
              </div>
              <p className="text-xs text-[#1a1a2e]">
                <PlusSquare size={13} className="inline text-[#007AFF] -mt-0.5" /> <strong>Ana Ekrana Ekle</strong> seçeneğine dokun
              </p>
            </div>
          </div>
        ) : (
          <button
            onClick={handleInstallAndroid}
            className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#c4111d] hover:bg-[#9b0d16] text-white text-sm font-semibold rounded-xl transition-all duration-200"
          >
            <Download size={16} />
            Uygulamayı Yükle
          </button>
        )}
      </div>
    </div>
  );
}
