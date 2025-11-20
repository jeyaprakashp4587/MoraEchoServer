import DB1 from "../DB/DB1.js";

export const getModels = async (req, res) => {
  try {
    const collection = await DB1.collection("models");
    const models = await collection.find({}).toArray();
    // console.log("models", models);
    return res.status(200).json(models);
  } catch (error) {
    console.error("Error fetching models:", error);
    return res.status(500).json({ message: "Error fetching models" });
  }
};
