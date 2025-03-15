import { Socket } from "socket.io";
import Auction from "./../models/Auction.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import User from "./../models/User.js";
import axios from "axios";

export default (io, socket) => {
  socket.on("placeBid", async (payload) => {
    console.log("===Placing bid:====", payload);
    const { auctionId, amount, token } = payload;
    // Проверка входных данных
    if (!auctionId || !amount || !token) {
      console.log("===Validation error:====", "Missing required fields");
      return socket.emit(
        "bidError",
        "Auction ID, amount, and token are required"
      );
    }
    // Проверка токена
    let userId;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      userId = decoded.userId;
      const user = await User.findById(userId);
      if (!user) {
        console.log("===Validation error:====", "User not found");
        return socket.emit("bidError", "User not found");
      }
    } catch (error) {
      console.error("Token verification error:", error);
      return socket.emit("bidError", "Invalid token");
    }
    try {
      // Находим аукцион
      const auction = await Auction.findById(auctionId);
      if (!auction) {
        console.log("===Validation error:====", "Auction not found");
        return socket.emit("bidError", "Auction not found");
      }
      // Проверки перед ставкой
      if (auction.status !== "active") {
        return socket.emit("bidError", "Auction is not active");
      }
      if (new Date() > auction.endTime) {
        auction.status = "ended";
        await auction.save();
        return socket.emit("bidError", "Auction has ended");
      }
      const minBid = auction.currentBid || auction.startPrice;
      if (amount <= minBid) {
        return socket.emit("bidError", `Bid must be higher than ${minBid}`);
      }
      if (auction.creator.toString() === userId) {
        return socket.emit("bidError", "You cannot bid on your own auction");
      }
      // Обновляем аукцион
      auction.currentBid = amount;
      auction.bids.push({
        user: userId,
        amount,
        timestamp: new Date(),
      });
      await auction.save();
      console.log("===Bid placed:====", auction);
      // Обновляем список аукционов для всех клиентов
      const auctions = await Auction.find({ status: "active" }).populate(
        "creator",
        "userName"
      );
      io.emit("auctionsList", auctions);
      io.emit("bidPlaced", {
        auctionId,
        currentBid: amount,
        userId,
        message: "Bid placed successfully",
      });
    } catch (error) {
      console.error("Error placing bid:", error);
      socket.emit("bidError", "Server error while placing bid");
    }
  });
};
