import { google } from "googleapis";
import axios from "axios";

const androidPublisher = google.androidpublisher("v3");

export async function verifyAndroidPurchase(receipt, productId) {
  const packageName = "com.moraecho";
  const purchaseToken = receipt.purchaseToken;

  const authClient = await google.auth.getClient({
    scopes: ["https://www.googleapis.com/auth/androidpublisher"],
  });

  const res = await androidPublisher.purchases.products.get({
    auth: authClient,
    packageName,
    productId,
    token: purchaseToken,
  });

  return res.data;
}

export async function verifyIosPurchase(receiptData) {
  const endpoint = "https://buy.itunes.apple.com/verifyReceipt";
  const res = await axios.post(endpoint, {
    "receipt-data": receiptData,
    password: "your_shared_secret",
  });
  return res.data;
}
