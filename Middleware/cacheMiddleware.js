import NodeCache from "node-cache";
import User from "../models/User.js";

const userCache = new NodeCache({ stdTTL: 3600 }); // 1 hour cache

// 🟢 Cache middleware for non-JWT apps
export const cacheUserData = async (req, res, next) => {
  try {
    // get userId either from req.body, req.query, or headers
    const userId =
      req.body.userId || req.query.userId || req.headers["x-user-id"];

    if (!userId) {
      console.log("No userId found in request");
      return next();
    }

    // 1️⃣ Check cache first
    let cachedUser = userCache.get(userId);
    if (cachedUser) {
      req.cachedUser = cachedUser;
      return next();
    }

    // 2️⃣ Fetch from DB
    const user = await User.findById(userId).select("name language email");
    if (!user) {
      console.log("User not found in DB");
      return next();
    }

    // 3️⃣ Save in cache
    userCache.set(userId, user);

    // 4️⃣ Attach to request
    req.cachedUser = user;

    next();
  } catch (err) {
    console.error("Cache middleware error:", err);
    next();
  }
};

// 🧹 Clear cache if user logs out or updates profile
export const clearUserCache = (userId) => {
  userCache.del(userId);
};
