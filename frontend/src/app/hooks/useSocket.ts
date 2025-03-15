import { useEffect } from "react";
import { io } from "socket.io-client";
import { useAppDispatch } from "../redux/store";
import { setSocket, disconnectSocket } from "../redux/slices/socketSlice";

const serverUrl = process.env.NEXT_PUBLIC_API_URL!;

export const useSocket = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const socket = io(serverUrl);
    dispatch(setSocket(socket));

    socket.on("connect", () => {
      console.log("Connected to server with id:", socket.id);
    });

    return () => {
      socket.disconnect();
      dispatch(disconnectSocket());
    };
  }, [dispatch]);
};
