import { getApps, initializeApp, cert } from "firebase-admin/app";
import { getMessaging } from "firebase-admin/messaging";

const initFirebase = () => {
  if (getApps().length === 0) {
    initializeApp({
      credential: cert({
        type: "service_account",
        project_id: process.env.FIREBASE_PROJECT_ID,
        private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
      }),
    });
  }
  return getMessaging();
};

export const sendPushNotification = async (
  fcmToken,
  title,
  body,
  data = {},
) => {
  if (!fcmToken) return;

  try {
    const messaging = initFirebase();
    await messaging.send({
      token: fcmToken,
      notification: { title, body },
      data,
    });
    console.log(`Notification sent`);
  } catch (err) {
    console.error("FCM error:", err.message);
  }
};
