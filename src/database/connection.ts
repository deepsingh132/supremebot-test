import { connect } from "mongoose";

export const connectDB = async () => {
  try {
    await connect(process.env.MONGO_URI || "")
      .then(() => {
      console.log("Connected to the database");
    });
  } catch (error) {
    console.error("Error connecting to the database: ", error);
  }
};