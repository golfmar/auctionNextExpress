"use client";
import React, { useState, useEffect, useMemo } from "react";
import styles from "./Auctions.module.scss";
import { RootState, useAppSelector, useAppDispatch } from "@/app/redux/store";
import Lot from "@/components/Lot/Lot";
import Select from "@/components/ui/Select/Select";
import Pagination from "@/components/Pagination/Pagination";
import { useSelector } from "react-redux";
import ModalAuctionClosed from "@/components/ModalAuctionClosed/ModalAuctionClosed";

interface Auction {
  _id: string;
  title: string;
  startPrice: number;
  endTime: string;
  imageUrl: string;
  status: string;
  creator: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
  currentBid?: number;
  winner?: { user: string; amount: number };
}

interface SelectItem {
  name: string;
  value: string;
}

const updateAuctionStatus = (payload: {
  id: string;
  status: string;
  winner?: { user: string; amount: number };
}) => ({
  type: "auctions/updateStatus",
  payload,
});

const Auctions: React.FC = () => {
  const auctions = useAppSelector((state) => state.auctions.auctions);
  const socket = useSelector((state: any) => state.socket.socket);
  const dispatch = useAppDispatch();
  const [currentAuctions, setCurrentAuctions] = useState<Auction[]>([]);
  const [tempAuctions, setTempAuctions] = useState<Auction[]>(auctions);

  const selectItems: SelectItem[] = [
    { name: "Newest First", value: "desc" },
    { name: "Oldest First", value: "asc" },
  ];
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | "">("");
  const [sortOrderEndTime, setSortOrderEndTime] = useState<"asc" | "desc" | "">(
    ""
  );
  const [activeSortType, setActiveSortType] = useState<
    "createdAt" | "endTime" | "none"
  >("none");
  const [closedAuction, setClosedAuction] = useState<Auction | null>(null);
  // ---------------------
  useEffect(() => {
    console.log("<====auctions====>", auctions);
    console.log("<====tempAuctions====>", tempAuctions);
  }, [auctions, tempAuctions]);

  // ---------------------
  const isAuctionActive = (auction: Auction) => {
    const now = new Date();
    const endTime = new Date(auction.endTime);
    return endTime > now && auction.status === "active";
  };

  useEffect(() => {
    socket?.on(
      "auctionClosed",
      (data: {
        auctionId: string;
        winner?: { user: string; amount: number };
      }) => {
        if (auctions) {
          dispatch(
            updateAuctionStatus({
              id: data.auctionId,
              status: "ended",
              winner: data.winner,
            })
          );
          console.log(
            "<====winner====>",
            data.winner?.user,
            data.winner?.amount
          );
          console.log("<====auctions====>", auctions);
          console.log("<====data.auctionId====>", data.auctionId);
          const endedAuction = auctions.filter(
            (a) => a._id?.toString() === data.auctionId.toString()
          );
          console.log("<====endedAuction====>", endedAuction);
          console.log("<====endedAuction.title====>", endedAuction[0].title);
          if (endedAuction) {
            setClosedAuction({
              title: endedAuction[0].title,
              winner: data.winner?.user,
              amount: data.winner?.amount,
            });
          }
        }
      }
    );
    return () => {
      socket?.off("auctionClosed");
    };
  }, [dispatch, socket, auctions]);

  useEffect(() => {
    console.log("<====auctions====>", auctions);
    console.log("<====closedAuction====>", closedAuction);
  }, [closedAuction, auctions]);

  // useEffect(() => {
  //   if (!socket) return; // Ждем, пока socket будет готов
  //   const handleAuctionClosed = (data: {
  //     auctionId: string;
  //     winner?: { user: string; amount: number };
  //   }) => {
  //     dispatch(
  //       updateAuctionStatus({
  //         id: data.auctionId,
  //         status: "ended",
  //         winner: data.winner,
  //       })
  //     );
  //     const endedAuction = auctions.find((a) => a._id === data.auctionId);
  //     if (endedAuction) {
  //       setClosedAuction({
  //         ...endedAuction,
  //         status: "ended",
  //         winner: data.winner?.user,
  //       });
  //     }
  //   };
  //   socket.on("auctionClosed", handleAuctionClosed);
  //   return () => {
  //     socket.off("auctionClosed", handleAuctionClosed);
  //   };
  // }, [dispatch, socket, auctions]);

  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 5;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  const sortAuctions = useMemo(() => {
    if (!sortOrder) return auctions.filter(isAuctionActive);
    const newAuctions = [...auctions].filter(isAuctionActive).sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return sortOrder === "asc"
        ? dateA.getTime() - dateB.getTime()
        : dateB.getTime() - dateA.getTime();
    });
    return newAuctions;
  }, [auctions, sortOrder]);

  const sortEndTime = useMemo(() => {
    if (!sortOrderEndTime) return auctions.filter(isAuctionActive);
    const newAuctions = [...auctions].filter(isAuctionActive).sort((a, b) => {
      const dateA = new Date(a.endTime);
      const dateB = new Date(b.endTime);
      return sortOrderEndTime === "asc"
        ? dateA.getTime() - dateB.getTime()
        : dateB.getTime() - dateA.getTime();
    });
    return newAuctions;
  }, [auctions, sortOrderEndTime]);

  useEffect(() => {
    if (activeSortType === "createdAt") {
      setTempAuctions(sortAuctions);
      setCurrentAuctions(sortAuctions.slice(indexOfFirstItem, indexOfLastItem));
    }
  }, [sortAuctions, indexOfFirstItem, indexOfLastItem, activeSortType]);

  useEffect(() => {
    if (activeSortType === "endTime") {
      setTempAuctions(sortEndTime);
      setCurrentAuctions(sortEndTime.slice(indexOfFirstItem, indexOfLastItem));
    }
  }, [sortEndTime, indexOfFirstItem, indexOfLastItem, activeSortType]);

  useEffect(() => {
    if (activeSortType === "none") {
      const activeAuctions = auctions.filter(isAuctionActive);
      setTempAuctions(activeAuctions);
      setCurrentAuctions(
        activeAuctions.slice(indexOfFirstItem, indexOfLastItem)
      );
    }
  }, [auctions, activeSortType, indexOfFirstItem, indexOfLastItem]);

  const handleSortOrderChange = (value: "asc" | "desc" | "") => {
    setSortOrder(value);
    setActiveSortType(value ? "createdAt" : "none");
  };

  const handleSortOrderEndTimeChange = (value: "asc" | "desc" | "") => {
    setSortOrderEndTime(value);
    setActiveSortType(value ? "endTime" : "none");
  };

  const closeModal = () => {
    setClosedAuction(null);
  };

  return (
    <div>
      <h1 className="text-3xl font-semibold italic text-gray-800 text-center">
        Auction List
      </h1>
      {currentAuctions.length > 0 ? (
        <div className="mt-3 grid grid-rows-2 gap-2 md:flex md:gap-4">
          <div className="flex gap-2 items-center md:flex-col">
            <h3 className="italic">Sorting by creation date:</h3>
            <Select
              setSortOrder={handleSortOrderChange}
              selectItems={selectItems}
            />
          </div>
          <div className="flex gap-2 items-center md:flex-col">
            <h3 className="italic">Sorting by end date:</h3>
            <Select
              setSortOrder={handleSortOrderEndTimeChange}
              selectItems={selectItems}
            />
          </div>
        </div>
      ) : null}

      <ul className="mt-4 grid md:grid-cols-[repeat(auto-fill,minmax(410px,1fr))] gap-4  justify-center">
        {currentAuctions.length > 0 ? (
          currentAuctions.map((auction) => (
            <Lot key={auction._id} auction={auction} />
          ))
        ) : (
          <p className="text-center text-indigo-800 font-bold text-[20px]">
            No active auctions
          </p>
        )}
      </ul>
      {closedAuction && (
        <ModalAuctionClosed auction={closedAuction} onClose={closeModal} />
      )}
      {currentAuctions.length > 0 && (
        <Pagination
          items={tempAuctions}
          itemsPerPage={itemsPerPage}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
        />
      )}
    </div>
  );
};

export default Auctions;
