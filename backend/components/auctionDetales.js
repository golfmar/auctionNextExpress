import Auction from "./../models/Auction.js";

export default (io, socket) => {
  socket.on("getAuctionDetails", async ({ auctionId }) => {
    try {
      const auction = await Auction.findById(auctionId)
        .populate("creator", "userName") // Имя создателя
        .populate("bids.user", "userName"); // Имя пользователей в ставках
      if (!auction) {
        return socket.emit("auctionError", "Auction not found");
      }
      socket.emit("auctionDetails", { auction });
    } catch (error) {
      console.error("Error fetching auction details:", error);
      socket.emit("auctionError", "Failed to load auction details");
    }
  });
};
