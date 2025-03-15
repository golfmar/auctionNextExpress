"use client";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { io } from "socket.io-client";
import { setSocket, disconnectSocket } from "@/app/redux/slices/socketSlice";
import { setAuctions } from "@/app/redux/slices/auctionsSlice";

const SocketInitializer: React.FC = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const serverUrl =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    const socket = io(serverUrl, {
      transports: ["websocket"],
    });

    socket.on("connect", () => {
      console.log("Connected to server with id:", socket.id);
      dispatch(setSocket(socket));
      socket.emit("getAuctions");

      socket.on("auctionsList", (auctions) => {
        console.log("Received auctions:", auctions);
        dispatch(setAuctions(auctions));
      });
    });

    socket.on("connect_error", (error) => {
      console.error("Connection error:", error.message);
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from server");
      dispatch(disconnectSocket());
    });

    return () => {
      socket.disconnect();
      dispatch(disconnectSocket());
    };
  }, [dispatch]);

  return null;
};

export default SocketInitializer;
