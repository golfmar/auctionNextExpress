import Auction from "./../models/Auction.js";
import jwt from "jsonwebtoken";
import User from "./../models/User.js";

export default (io, socket) => {
  const closeAuction = async (auctionId) => {
    try {
      const auction = await Auction.findById(auctionId).populate(
        "bids.user",
        "userName"
      );
      if (!auction || auction.status !== "active") return;

      let winner = null;
      if (auction.bids && auction.bids.length > 0) {
        winner = auction.bids.reduce((maxBid, bid) =>
          bid.amount > maxBid.amount ? bid : maxBid
        );
      }

      await Auction.updateOne(
        { _id: auction._id },
        {
          status: "ended",
          ...(winner && {
            winner: { user: winner.user._id, amount: winner.amount },
          }),
        }
      );

      console.log(
        `Auction ${auction._id} ended. Winner: ${
          winner ? winner.user.userName : "None"
        }`
      );
      io.emit("auctionClosed", {
        auctionId: auction._id,
        winner: winner
          ? { user: winner.user.userName, amount: winner.amount }
          : null,
      });
    } catch (error) {
      console.error("Error closing auction:", error);
    }
  };
  // Функция для установки таймера с поддержкой дальних дат
  const setAuctionTimer = (auctionId, endTime) => {
    const MAX_DELAY = 2147483647; // Максимальная задержка setTimeout (~24.8 дня)

    const checkAndCloseAuction = () => {
      const now = new Date();
      const timeLeft = new Date(endTime) - now;

      if (timeLeft <= 0) {
        closeAuction(auctionId); // Завершаем аукцион, если время вышло
      } else if (timeLeft > MAX_DELAY) {
        // Промежуточный таймер для больших интервалов
        setTimeout(checkAndCloseAuction, MAX_DELAY);
      } else {
        // Точный таймер для оставшегося времени
        setTimeout(() => closeAuction(auctionId), timeLeft);
      }
    };

    checkAndCloseAuction(); // Начинаем проверку сразу
  };

  // Восстановление таймеров при старте сервера
  const restoreAuctionTimers = async () => {
    try {
      const activeAuctions = await Auction.find({ status: "active" });
      const now = new Date();

      for (const auction of activeAuctions) {
        const timeLeft = new Date(auction.endTime) - now;
        if (timeLeft > 0) {
          setAuctionTimer(auction._id, auction.endTime);
          console.log(
            `Restored timer for auction ${auction._id}, time left: ${timeLeft}ms`
          );
        } else {
          closeAuction(auction._id); // Если аукцион уже просрочен
        }
      }
    } catch (error) {
      console.error("Error restoring auction timers:", error);
    }
  };
  restoreAuctionTimers();

  socket.on("addAuction", async (payload) => {
    console.log("===Adding new auction:====", payload);
    const { auctionData, token } = payload;
    const data = auctionData || payload; // Совместимость со старой структурой
    console.log("===Extracted data:====", data);

    // Проверка наличия токена
    if (!token) {
      console.log("===Validation error:====", "Token is required");
      return io.emit("erroraddingauction", "Authentication required");
    }

    // Проверка и декодирование токена
    let creatorId;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      creatorId = decoded.userId;
      const creator = await User.findById(creatorId);
      console.log("=====creator=====", creator);

      if (!creator) {
        console.log("===Validation error:====", "User not found");
        return io.emit("erroraddingauction", "User not found");
      }
    } catch (error) {
      console.error("Token verification error:", error);
      return io.emit("erroraddingauction", "Invalid token");
    }

    // Подготовка данных аукциона
    const sanitizedData = {
      title: String(data.title),
      startPrice: Number(data.startPrice),
      endTime: new Date(data.endTime),
      imageUrl: data.imageUrl || "",
      creator: creatorId,
      currentBid: null,
      bids: [],
    };

    try {
      // Проверка на существующий аукцион
      const existingAuction = await Auction.findOne({
        title: sanitizedData.title,
        status: "active",
      });
      if (existingAuction) {
        const errorMessage = `Auction with title "${sanitizedData.title}" already exists`;
        console.log("===Validation error:====", errorMessage);
        return io.emit("erroraddingauction", errorMessage);
      }

      // Создание и сохранение нового аукциона
      const newAuction = new Auction(sanitizedData);
      console.log("===New auction instance:====", newAuction);
      await newAuction.save();
      console.log("===Auction saved:====", newAuction);

      // Установка таймера завершения аукциона
      const now = new Date();
      const timeLeft = new Date(newAuction.endTime) - now;
      if (timeLeft > 0) {
        setAuctionTimer(newAuction._id, newAuction.endTime);
        console.log(
          `Timer set for auction ${newAuction._id}, time left: ${timeLeft}ms`
        );
      } else {
        console.log(`Auction ${newAuction._id} already expired on creation`);
        await closeAuction(newAuction._id);
      }

      // Отправка обновленного списка аукционов
      const auctions = await Auction.find({ status: "active" }).populate(
        "creator",
        "userName"
      );
      console.log("===Sending auctions list:====", auctions);
      io.emit("auctionsList", auctions);
      io.emit("auctionAdded", { message: "Auction added successfully" });
    } catch (error) {
      console.error("Error adding auction:", error);
      io.emit("erroraddingauction", error.message || "Failed to add auction");
    }
  });
};
