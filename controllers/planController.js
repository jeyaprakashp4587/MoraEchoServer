import {
  verifyAndroidSubscription,
  verifyIosPurchase,
} from "../AppStores/verifyStore.js";
import DB1 from "../DB/DB1.js";
import User from "../models/User.js";

export const getPlans = async (req, res) => {
  try {
    const collection = await DB1.collection("plans").find({}).toArray();
    if (collection) {
      return res.status(200).json({ plans: collection[0].plans });
    }
  } catch (error) {
    console.log("error on get plans", error);
  }
};

export const purchaseSubs = async (req, res) => {
  const { platform, transactionId, productId, purchaseToken } = req.body;
  const userId = req.userId;
  try {
    // verify with app stores
    let packageName = composer.moraecho;
    // find user
    const user = await User.findById(userId);
    if (platform === "android") {
      const verify = await verifyAndroidSubscription({
        packageName,
        productId,
        purchaseToken,
      });
      // set up with user data
      if (user && verify) {
        user.isSubscriped = true;
        user.subscription = {
          planId: productId,
          basePlanId: productId,
          purchaseToken: purchaseToken,
          startDate: verify.startDate,
          expiryDate: verify.expiryDate,
          autoRenew: verify.autoRenew,
          status: "active",
        };
        await user.save();
        return res.status(200).json({ msg: "Sucessfully purchased" });
      } else {
        return res.status(400).json({ msg: "Verification failed" });
      }
    } else {
      const verify = await verifyIosPurchase({ transactionId });
    }
  } catch (error) {
    return res.status(500).json({ msg: "internal server error" });
  }
};
