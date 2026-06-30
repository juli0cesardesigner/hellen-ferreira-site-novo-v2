import webpush from 'web-push';

let isWebPushConfigured = false;

function configureWebPush() {
  if (isWebPushConfigured) return;

  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT || 'mailto:hellen@hellenferreira.com';

  if (!publicKey || !privateKey) {
    console.warn('Web-push VAPID keys are missing! Push notifications will not be sent.');
    return;
  }

  webpush.setVapidDetails(subject, publicKey, privateKey);
  isWebPushConfigured = true;
}

export async function sendNotificationToDevice(
  subscription: { endpoint: string; keys: { p256dh: string; auth: string } },
  payload: { title: string; body: string; url?: string }
) {
  configureWebPush();
  if (!isWebPushConfigured) {
    console.error('Cannot send push notification: VAPID keys not configured.');
    return { success: false, error: 'VAPID keys not configured' };
  }

  try {
    const pushSubscription = {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth
      }
    };

    const res = await webpush.sendNotification(pushSubscription, JSON.stringify(payload));
    return { success: true, statusCode: res.statusCode };
  } catch (error: any) {
    console.error('Error sending push notification to device:', error);
    if (error.statusCode === 410 || error.statusCode === 404) {
      return { success: false, expired: true, statusCode: error.statusCode };
    }
    return { success: false, error: error.message || 'Unknown error' };
  }
}
