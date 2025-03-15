// app/auctions/[id]/page.tsx
"use client";
import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useAppSelector } from "@/app/redux/store";

interface Bid {
  user: { _id: string; userName: string };
  amount: number;
  timestamp: string;
}

interface Auction {
  _id: string;
  title: string;
  startPrice: number;
  endTime: string;
  imageUrl: string;
  status: string;
  creator: { _id: string; userName: string };
  currentBid?: number;
  bids: Bid[];
  winner?: { user: string; amount: number };
}

const AuctionDetailPage: React.FC = () => {
  const { id } = useParams();
  const socket = useAppSelector((state) => state.socket.socket);
  const [auction, setAuction] = useState<Auction | null>(null);
  const [error, setError] = useState("");
  const [timeLeft, setTimeLeft] = useState<string>(""); // Добавляем таймер

  // Таймер обратного отсчёта
  useEffect(() => {
    if (auction) {
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
          if (days > 0) timeString += `${days} day${days > 1 ? "s" : ""}, `;
          if (hours > 0 || days > 0)
            timeString += `${hours} hour${hours > 1 ? "s" : ""}, `;
          timeString += `${minutes} minute${minutes > 1 ? "s" : ""}, `;
          timeString += `${seconds} second${seconds > 1 ? "s" : ""}`;
          setTimeLeft(timeString.trim());
        }
      };

      updateTimer();
      const interval = setInterval(updateTimer, 1000);

      return () => clearInterval(interval);
    }
  }, [auction]);

  useEffect(() => {
    if (socket && id) {
      socket.emit("getAuctionDetails", { auctionId: id });

      socket.on("auctionDetails", (data: { auction: Auction }) => {
        setAuction(data.auction);
      });

      socket.on("auctionError", (message: string) => {
        setError(message);
      });

      socket.on(
        "bidUpdated",
        (data: { auctionId: string; currentBid: number; bidder: string }) => {
          if (data.auctionId === id) {
            setAuction((prev) =>
              prev ? { ...prev, currentBid: data.currentBid } : prev
            );
          }
        }
      );

      socket.on(
        "auctionClosed",
        (data: {
          auctionId: string;
          winner?: { user: string; amount: number };
        }) => {
          if (data.auctionId === id) {
            setAuction((prev) =>
              prev ? { ...prev, status: "ended", winner: data.winner } : prev
            );
            setTimeLeft("Ended"); // Синхронизация с завершением
          }
        }
      );

      return () => {
        socket.off("auctionDetails");
        socket.off("auctionError");
        socket.off("bidUpdated");
        socket.off("auctionClosed");
      };
    }
  }, [socket, id]);

  if (error) return <div className="text-red-500 text-center">{error}</div>;
  if (!auction) return <div className="text-center">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">{auction.title}</h1>
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <img
            src={auction.imageUrl}
            alt={auction.title}
            className="w-full h-64 object-cover rounded"
          />
        </div>
        <div>
          <p>
            <strong>Creator:</strong> {auction.creator.userName}
          </p>
          <p>
            <strong>Starting Price:</strong> ${auction.startPrice}
          </p>
          <p>
            <strong>Current Bid:</strong> ${auction.currentBid || "No bids yet"}
          </p>
          <p>
            <strong>Time Left:</strong> {timeLeft}
          </p>
          <p>
            <strong>Ends:</strong> {new Date(auction.endTime).toLocaleString()}
          </p>
          <p>
            <strong>Status:</strong> {auction.status}
          </p>
          {auction.winner && (
            <p>
              <strong>Winner:</strong> {auction.winner.user} ($
              {auction.winner.amount})
            </p>
          )}
        </div>
      </div>

      <h2 className="text-2xl font-semibold mt-6 mb-2">Bid History</h2>
      {auction.bids.length > 0 ? (
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2">User</th>
              <th className="border p-2">Amount</th>
              <th className="border p-2">Time</th>
            </tr>
          </thead>
          <tbody>
            {auction.bids.map((bid) => (
              <tr key={bid.timestamp}>
                <td className="border p-2">{bid.user.userName}</td>
                <td className="border p-2">${bid.amount}</td>
                <td className="border p-2">
                  {new Date(bid.timestamp).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No bids yet.</p>
      )}
    </div>
  );
};

export default AuctionDetailPage;
