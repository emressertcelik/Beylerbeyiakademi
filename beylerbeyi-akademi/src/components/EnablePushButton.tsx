// src/app/components/EnablePushButton.tsx
"use client";
import { useState } from "react";
import { registerServiceWorker, askNotificationPermission, subscribeUserToPush } from "@/lib/webpush";

// TODO: Replace with your own VAPID public key (from your push server setup)
const VAPID_PUBLIC_KEY = "YOUR_PUBLIC_VAPID_KEY_HERE";

export default function EnablePushButton() {
  const [enabled, setEnabled] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEnable = async () => {
    setError(null);
    await registerServiceWorker();
    const granted = await askNotificationPermission();
    if (!granted) {
      setError("Bildirim izni verilmedi.");
      return;
    }
    try {
      const sub = await subscribeUserToPush(VAPID_PUBLIC_KEY);
      if (sub) {
        // TODO: Send subscription to your backend (Supabase function or API)
        setEnabled(true);
      } else {
        setError("Abonelik başarısız oldu.");
      }
    } catch (e) {
      setError("Push aboneliği başarısız: " + (e as Error).message);
    }
  };

  return (
    <div className="my-4">
      <button
        className="px-4 py-2 rounded bg-blue-600 text-white font-semibold disabled:opacity-60"
        onClick={handleEnable}
        disabled={enabled}
      >
        {enabled ? "Bildirimler Açık" : "Bildirimleri Aç"}
      </button>
      {error && <div className="text-red-500 mt-2 text-sm">{error}</div>}
    </div>
  );
}
