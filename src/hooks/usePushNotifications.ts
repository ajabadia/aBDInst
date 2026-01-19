"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";

export function usePushNotifications() {
    const [isSupported, setIsSupported] = useState(false);
    const [subscription, setSubscription] = useState<PushSubscription | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if ("serviceWorker" in navigator && "PushManager" in window) {
            setIsSupported(true);
            registerServiceWorker();
        }
    }, []);

    async function registerServiceWorker() {
        try {
            const registration = await navigator.serviceWorker.ready;
            const sub = await registration.pushManager.getSubscription();
            setSubscription(sub);
        } catch (error) {
            console.error("Service Worker registration failed", error);
        }
    }

    async function subscribeToPush() {
        setLoading(true);
        try {
            const registration = await navigator.serviceWorker.ready;
            // const response = await fetch("/api/push/vpc", { cache: "no-store" }); // Unused

            const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
            if (!vapidKey) throw new Error("Missing VAPID Key");

            const convertedVapidKey = urlBase64ToUint8Array(vapidKey);

            const sub = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: convertedVapidKey,
            });

            // Send to server
            const saveRes = await fetch("/api/push/subscribe", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ subscription: sub }),
            });

            if (!saveRes.ok) throw new Error("Failed to save subscription");

            setSubscription(sub);
            toast.success("¡Notificaciones activadas!");
        } catch (error) {
            console.error("Subscription failed", error);
            toast.error("Error al activar notificaciones");
        } finally {
            setLoading(false);
        }
    }

    return { isSupported, subscription, subscribeToPush, loading };
}

function urlBase64ToUint8Array(base64String: string) {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/\-/g, "+").replace(/_/g, "/");
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}
