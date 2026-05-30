import webPush from 'web-push';

const VAPID_PUBLIC_KEY =
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ||
  'BHve1i3dDoczjd4lVAzL2V075ZzSS1KoopsEMDZQO9CYk4-r_NDWKGMKBoU3JC_F5imrhrzfbS9uAFj-eOKO4GY';
const VAPID_PRIVATE_KEY =
  process.env.VAPID_PRIVATE_KEY ||
  '09VPEkSny5iG4HT81ETLhanxaDvqGFTe6RCHywbFlOA';
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:pi@app.local';

webPush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

// In-memory store — replace with DB in production
const subscriptions: PushSubscriptionJSON[] = [];

export function registerSubscription(sub: PushSubscriptionJSON): void {
  const idx = subscriptions.findIndex((s) => s.endpoint === sub.endpoint);
  if (idx >= 0) {
    subscriptions[idx] = sub;
  } else {
    subscriptions.push(sub);
  }
}

export interface PushPayload {
  title: string;
  body: string;
  icon?: string;
  data?: Record<string, unknown>;
}

export async function triggerPushNotification(
  payload: PushPayload
): Promise<any[]> {
  const results: any[] = [];
  const body = JSON.stringify({
    title: payload.title,
    body: payload.body,
    icon: payload.icon || '/icon-192.png',
    ...payload.data,
  });

  for (const sub of subscriptions) {
    try {
      const res = await webPush.sendNotification(sub as any, body, { TTL: 60 });
      results.push(res);
    } catch (err) {
      console.error('Push failed for subscription:', err);
    }
  }
  return results;
}

// Used by API routes
export async function triggerPush(
  payload: PushPayload
): Promise<any[]> {
  return triggerPushNotification(payload);
}
