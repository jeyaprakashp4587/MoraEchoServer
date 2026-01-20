import { google } from "googleapis";

const auth = new google.auth.GoogleAuth({
  credentials: {
    type: process.env.type,
    project_id: process.env.project_id,
    private_key_id: process.env.private_key_id,
    client_email: process.env.client_email,
    client_id: process.env.client_id,
    private_key: process.env.process_key?.replace(/\\n/g, "\n"),
  },
  scopes: ["https://www.googleapis.com/auth/androidpublisher"],
});

const androidpublisher = google.androidpublisher({
  version: "v3",
  auth,
});

export async function verifyAndroidSubscription({
  packageName,
  productId,
  purchaseToken,
}) {
  const res = await androidpublisher.purchases.subscriptions.get({
    packageName,
    subscriptionId: productId,
    token: purchaseToken,
  });

  const data = res.data;

  if (data.paymentState !== 1) {
    throw new Error("Payment not completed");
  }

  if (Date.now() > Number(data.expiryTimeMillis)) {
    throw new Error("Subscription expired");
  }

  return {
    startDate: new Date(Number(data.startTimeMillis)),
    expiryDate: new Date(Number(data.expiryTimeMillis)),
    autoRenew: data.autoRenewing,
    basePlanId: data.basePlanId || null,
    raw: data,
  };
}

export async function verifyIosPurchase(receiptData) {
  const endpoint = "https://buy.itunes.apple.com/verifyReceipt";
  const res = await axios.post(endpoint, {
    "receipt-data": receiptData,
    password: "your_shared_secret",
  });
  return res.data;
}
