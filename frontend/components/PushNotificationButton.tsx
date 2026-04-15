"use client";

import { useState, useEffect } from "react";

const API = process.env.NEXT_PUBLIC_API_URL;
const VAPID_PUBLIC_KEY = "BAAijTn2I-lF75AKi9IvTqQAIFBKlvoxYdw4CQeFJYspmv_ZZGIF3zCfuNhhR2USTcS91i9r4lYF0VTa114nzf4";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map(c => c.charCodeAt(0)));
}

export default function PushNotificationButton() {
  const [status, setStatus] = useState<"unknown" | "granted" | "denied" | "unsupported">("unknown");
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!("Notification" in window) || !("serviceWorker" in navigator)) {
      setStatus("unsupported");
      return;
    }
    setStatus(Notification.permission as any);
    // Check if already subscribed
    navigator.serviceWorker.ready.then(reg =>
      reg.pushManager.getSubscription().then(sub => setSubscribed(!!sub))
    );
  }, []);

  const subscribe = async () => {
    if (!("serviceWorker" in navigator)) return;
    setLoading(true);
    try {
      // Register service worker
      const reg = await navigator.serviceWorker.register("/sw.js");
      await navigator.serviceWorker.ready;

      // Request permission
      const permission = await Notification.requestPermission();
      setStatus(permission as any);
      if (permission !== "granted") { setLoading(false); return; }

      // Subscribe to push
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });

      // Send to backend
      const subJson = sub.toJSON();
      await fetch(`${API}/api/v1/push/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          endpoint: subJson.endpoint,
          keys: { p256dh: subJson.keys?.p256dh, auth: subJson.keys?.auth },
        }),
      });

      setSubscribed(true);
    } catch (err) {
      console.error("Push subscribe error:", err);
    }
    setLoading(false);
  };

  const unsubscribe = async () => {
    setLoading(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await fetch(`${API}/api/v1/push/unsubscribe`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        });
        await sub.unsubscribe();
      }
      setSubscribed(false);
    } catch (err) {
      console.error("Unsubscribe error:", err);
    }
    setLoading(false);
  };

  if (status === "unsupported") return null;
  if (status === "denied") return (
    <span className="text-xs text-gray-500 px-3 py-1.5 rounded-full border border-gray-700">
      🔕 सूचना बंद है
    </span>
  );

  return subscribed ? (
    <button
      onClick={unsubscribe}
      disabled={loading}
      title="सूचना बंद करें"
      className="flex items-center gap-1.5 text-xs bg-green-900/30 hover:bg-red-900/30 border border-green-700/40 hover:border-red-700/40 text-green-400 hover:text-red-400 px-3 py-1.5 rounded-full transition-all"
    >
      {loading ? "..." : "🔔 सूचना चालू है"}
    </button>
  ) : (
    <button
      onClick={subscribe}
      disabled={loading}
      className="flex items-center gap-1.5 text-xs bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 text-orange-400 hover:text-orange-300 px-3 py-1.5 rounded-full transition-all"
    >
      {loading ? "..." : "🔔 ब्रेकिंग न्यूज़ अलर्ट"}
    </button>
  );
}