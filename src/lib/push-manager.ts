const VAPID_PUBLIC_KEY =
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ||
  'BONWQ70Wuw9PSXO2dlaJHAqG20nNBJ88jJ6MPH6RfG2DwHsBIeT/2jFXsSbiOvX3qQw7mqHJWdqzRVHJBJCjQHE';
const VAPID_PRIVATE_KEY =
  process.env.VAPID_PRIVATE_KEY ||
  'jR0yI0sFwBdO8SjOoIVUfWqMYGbjlDdRAI8aGjJQROE';
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:pi@app.local';

export async function getPublicKeyBase64(): Promise<string> {
  return VAPID_PUBLIC_KEY;
}

export async function urlBase64ToUint8Array(base64String: string): Promise<Uint8Array> {
  const padding = '='.repeat(4 - (base64String.length % 4));
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export async function subscribeUser(): Promise<PushSubscription | null> {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    return null;
  }

  const registration = await navigator.serviceWorker.ready;
  const existingSubscription = await registration.pushManager.getSubscription();
  if (existingSubscription) {
    return existingSubscription;
  }

  const applicationServerKey = await urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey,
  });

  return subscription;
}

export async function unsubscribeUser(): Promise<void> {
  if (!('serviceWorker' in navigator)) return;
  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();
  if (subscription) {
    await subscription.unsubscribe();
  }
}

export async function sendPushNotification(
  subscription: PushSubscription,
  payload: { title: string; body: string; icon?: string; data?: Record<string, unknown> }
): Promise<void> {
  const webPush = await import('web-push');
  webPush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
  await webPush.sendNotification(
    subscription as unknown as webPush.PushSubscription,
    JSON.stringify(payload),
    { TTL: 60 }
  );
}
