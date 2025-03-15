"use client";
import React from "react";
import { Provider, useDispatch } from "react-redux";
import { store } from "@/app/redux/store";
import SocketInitializer from "./SocketInitializer";
import { setUser } from "@/app/redux/slices/authSlice";

// Компонент для восстановления юзера
const AuthInitializer: React.FC = () => {
  const dispatch = useDispatch();

  React.useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");

    if (storedUser && storedToken) {
      const user = JSON.parse(storedUser);
      dispatch(setUser({ user, token: storedToken }));
      console.log("Restored user from localStorage:", user);
    }
  }, [dispatch]);

  return null; // Компонент ничего не рендерит
};

interface ClientWrapperProps {
  children: React.ReactNode;
}

const ClientWrapper: React.FC<ClientWrapperProps> = ({ children }) => {
  return (
    <Provider store={store}>
      <AuthInitializer />
      <SocketInitializer />
      {children}
    </Provider>
  );
};

export default ClientWrapper;
