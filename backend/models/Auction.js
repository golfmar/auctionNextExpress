import mongoose from "mongoose";

const auctionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    startPrice: {
      type: Number,
      required: true, // Предполагаю, что это обязательно
    },
    endTime: {
      type: Date,
      required: true,
    },
    currentBid: {
      type: Number,
      default: null, // Нет ставки в начале
    },
    bids: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        amount: {
          type: Number,
          required: true,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    imageUrl: {
      type: String,
      required: true,
    },
    status: { type: String, enum: ["active", "ended"], default: "active" },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Ссылка на модель User
      required: true, // Создатель обязателен
    },
    winner: {
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      amount: { type: Number },
    },
  },
  { timestamps: true }
);
const Auction = mongoose.model("Auction", auctionSchema);
export default Auction;
