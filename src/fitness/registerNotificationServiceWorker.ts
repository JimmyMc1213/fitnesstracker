const NOTIFICATION_SW_URL = "/notification-sw.js";
const NOTIFICATION_ICON = "/favicon.svg";

let registrationPromise: Promise<ServiceWorkerRegistration | null> | null = null;

/** Register the notification SW once on app boot (idempotent). */
export function registerNotificationServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    return Promise.resolve(null);
  }

  if (!registrationPromise) {
    registrationPromise = navigator.serviceWorker
      .register(NOTIFICATION_SW_URL)
      .catch((err) => {
        console.warn("[Fitcoach] Notification SW registration failed:", err);
        registrationPromise = null;
        return null;
      });
  }

  return registrationPromise;
}

export type FitcoachNotificationTag = "fitcoach-workout" | "fitcoach-nutrition";

/** Show a Web Notification via the active SW, or fall back to the Notification API. */
export async function showFitcoachNotification(
  title: string,
  body: string,
  tag: FitcoachNotificationTag,
): Promise<void> {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return;
  }
  if (Notification.permission !== "granted") {
    return;
  }

  const options: NotificationOptions = {
    body,
    tag,
    icon: NOTIFICATION_ICON,
  };

  try {
    const registration = await registerNotificationServiceWorker();
    if (registration?.active) {
      await registration.showNotification(title, options);
      return;
    }
    if (registration) {
      await navigator.serviceWorker.ready;
      const worker = registration.active ?? navigator.serviceWorker.controller;
      if (worker) {
        worker.postMessage({ type: "SHOW_NOTIFICATION", title, options });
        return;
      }
    }
  } catch {
    // Fall through to direct Notification API when SW path fails.
  }

  new Notification(title, options);
}
