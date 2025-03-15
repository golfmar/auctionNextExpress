import Auction from "./../models/Auction.js";
import jwt from "jsonwebtoken";
import User from "./../models/User.js";

export default (io, socket) => {
  socket.on("getProfileData", async ({ token }) => {
    try {
      if (!token) {
        return socket.emit("profileError", "Authentication required");
      }
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decoded.userId;

      const user = await User.findById(userId);
      if (!user) {
        return socket.emit("profileError", "User not found");
      }

      const createdAuctions = await Auction.find({ creator: userId })
        .populate("creator", "userName")
        .populate("bids.user", "userName");

      const auctionsWithBids = await Auction.find({
        "bids.user": userId,
        status: "active",
      })
        .populate("creator", "userName")
        .populate("bids.user", "userName");

      const wonAuctions = await Auction.find({
        "winner.user": userId,
        status: "ended",
      })
        .populate("creator", "userName")
        .populate("bids.user", "userName");

      socket.emit("profileData", {
        user: { userName: user.userName },
        createdAuctions,
        auctionsWithBids,
        wonAuctions,
      });
    } catch (error) {
      console.error("Error fetching profile data:", error);
      socket.emit("profileError", "Failed to load profile data");
    }
  });
};
