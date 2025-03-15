import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    await mongoose.connect(
      "mongodb+srv://yushinbox:RqjhCxdpGz2VipH3@clusterauction.6vrob.mongodb.net/auction?retryWrites=true&w=majority"
    );
    console.log("MongoDB auctionclaster connected");
  } catch (error) {
    console.log("Error connecting to MongoDB", error);
    process.exit(1);
  }
};
