// components/ModalAuctionClosed.tsx
"use client";
import React, { useEffect } from "react";
import styles from "./ModalAuctionClosed.module.scss";
interface ModalAuctionClosedProps {
  auction: {
    title?: string;
    winner?: string;
    amount?: number;
  };
  onClose: () => void;
}

const ModalAuctionClosed: React.FC<ModalAuctionClosedProps> = ({
  auction,
  onClose,
}) => {
  useEffect(() => {
    console.log("<====auction====>", auction);
  }, [auction]);
  return (
    <div className="bg-black bg-opacity-40 flex justify-center items-center fixed inset-0 z-500">
      <div className="bg-white p-4 rounded">
        <h2 className="text-2xl font-bold">Auction Ended!</h2>
        <p className="mt-2">
          Auction: <strong>{auction.title}</strong>
        </p>
        {auction.winner ? (
          <>
            <p className="mt-2">
              Winner: <strong>{auction.winner}</strong>
            </p>

            <p className="mt-2">
              with bid: <strong>${auction.amount}</strong>
            </p>
          </>
        ) : (
          <p className="mt-2">No winner - no bids were placed.</p>
        )}
        <button
          onClick={onClose}
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded transition-colors cursor-pointer 
          transition-duration-300 hover:bg-blue-600"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default ModalAuctionClosed;
