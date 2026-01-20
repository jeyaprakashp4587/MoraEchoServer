import DB1 from "../DB/DB1.js";

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
