"use client";
import React, { useState, useEffect } from "react";
import styles from "./Lot.module.scss";
import { useSelector } from "react-redux";
import Link from "next/link";
import { RootState } from "@/app/redux/store"; // Предполагаем, что RootState экспортирован
import { Socket } from "socket.io-client"; // Импортируем тип Socket из socket.io-client

// Интерфейс создателя лота
interface Creator {
  userName: string;
  _id?: string; // Опционально, если есть ID
}

// Интерфейс лота
interface Lot {
  _id: string;
  title: string;
  createdAt: string;
  endTime: string;
  imageUrl: string;
  startPrice: number;
  status: "active" | "ended" | "pending"; // Ограничиваем возможные статусы
  creator: Creator; // Обновляем тип creator
  currentBid?: number; // Опционально, так как может отсутствовать
}

// Интерфейс пропсов компонента Lot
interface LotProps {
  auction: Lot;
}

// Тип для состояния сокета в Redux
interface SocketState {
  socket: Socket | null;
}

// Компонент Lot
const Lot: React.FC<LotProps> = ({ auction }) => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [bidAmount, setBidAmount] = useState<number | "">("");
  const [error, setError] = useState<string | null>(null);
  const socket = useSelector(
    (state: RootState) => state.socket.socket
  ) as Socket | null;
  const [timeLeft, setTimeLeft] = useState<string>("");

  // Таймер окончания аукциона
  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const end = new Date(auction.endTime);
      const diff = end.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft("Ended");
      } else {
        const days = Math.floor(diff / 86400000);
        const hours = Math.floor((diff % 86400000) / 3600000);
        const minutes = Math.floor((diff % 3600000) / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);

        let timeString = "";
        if (days > 0) timeString += `${days} d/`;
        if (hours > 0 || days > 0) timeString += `${hours} h/`;
        timeString += `${minutes} m/`;
        timeString += `${seconds} s`;
        setTimeLeft(timeString.trim());
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [auction.endTime]);

  // Логирование auction
  useEffect(() => {
    console.log("===auction===", auction);
  }, [auction]);

  // Открытие/закрытие модалки
  const openModal = (): void => setIsModalOpen(true);
  const closeModal = (): void => {
    setIsModalOpen(false);
    setBidAmount("");
    setError(null);
  };

  // Обработка ввода ставки
  const handleBidChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const value = e.target.value;
    setBidAmount(value === "" ? "" : Number(value));
  };

  // Отправка ставки
  const placeBid = (): void => {
    console.log("=====bid=====");
    if (!bidAmount || bidAmount <= (auction.currentBid || auction.startPrice)) {
      setError(
        `Bid must be higher than $${auction.currentBid || auction.startPrice}`
      );
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setError("Please log in to place a bid");
      return;
    }

    if (socket) {
      socket.emit("placeBid", {
        auctionId: auction._id,
        amount: bidAmount,
        token,
      });

      socket.on("bidPlaced", (data: { message?: string; bid?: number }) => {
        console.log("Bid placed:", data);
        closeModal();
      });

      socket.on("bidError", (message: string) => {
        setError(message);
      });
    }
  };

  // Очистка слушателей сокета
  useEffect(() => {
    if (!socket) return;

    return () => {
      socket.off("bidPlaced");
      socket.off("bidError");
    };
  }, [socket]);

  return (
    <li
      className="
    bg-white 
    shadow-[0_0_8px_rgba(0,0,0,0.2)] 
    rounded-xl 
    p-6 
    flex 
    flex-col 
    items-center  
    gap-6 
    md:grid 
    md:grid-cols-2
    md:items-center 
    w-full  
    md:min-w-[410px]
    "
    >
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Place a Bid on "{auction.title}"
            </h3>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Your Bid ($)</label>
              <input
                type="number"
                value={bidAmount}
                onChange={handleBidChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder={`Enter more than $${
                  auction.currentBid || auction.startPrice
                }`}
                min={auction.currentBid || auction.startPrice}
              />
              {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            </div>
            <div className="flex gap-4">
              <button
                onClick={placeBid}
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors duration-200"
              >
                Submit Bid
              </button>
              <button
                onClick={closeModal}
                className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors duration-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {auction.imageUrl ? (
        <Link
          href={`/auctions/${auction._id}`}
          className="grid place-items-center"
        >
          <img
            src={auction.imageUrl}
            alt={auction.title}
            className="w-60 h-60 object-cover rounded-lg hover:scale-105 transition-transform duration-200 cursor-pointer"
          />
        </Link>
      ) : (
        <div className="w-40 h-40 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500">
          No Image
        </div>
      )}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {auction.title}
          </h2>
          <p className="text-sm text-gray-500">
            Start Price: ${auction.startPrice}
          </p>
          {auction.currentBid && (
            <p className="text-sm text-gray-500">
              Current Bid: ${auction.currentBid}
            </p>
          )}
          <div className="text-sm text-gray-600">
            Ends: <p>{new Date(auction.endTime).toLocaleString()}</p>
          </div>
          <div className="text-sm text-gray-500">
            Time Left: <p>{timeLeft}</p>
          </div>
          <p className="text-sm text-gray-500">Status: {auction.status}</p>
          <p className="text-sm text-gray-500">
            Creator:{" "}
            <span className="ml-[5px]">
              {auction.creator.userName || "Unknown"}
            </span>
          </p>
          <p className="text-sm text-gray-500">
            Created: {new Date(auction.createdAt).toLocaleDateString()}
          </p>
        </div>
        <button
          onClick={openModal}
          className="mt-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors duration-200 disabled:bg-gray-400"
          disabled={auction.status !== "active"}
        >
          Place Bid
        </button>
      </div>
    </li>
  );
};

export default Lot;
