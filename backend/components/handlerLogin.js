import { Socket } from "socket.io";
import Auction from "./../models/Auction.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import User from "./../models/User.js";
import axios from "axios";

export default (io, socket) => {
  socket.on("login", async (data) => {
    const { email, password } = data;
    console.log("===--- login ---====", email, password);
    if (!email || !password) {
      socket.emit("loginError", {
        message: "Both email and password are required.",
      });
      return;
    }
    try {
      const existingUser = await User.findOne({ email });
      if (!existingUser) {
        socket.emit("loginError", {
          message: "User with this email does not exist.",
        });
        return;
      }
      // Проверка пароля
      const isPasswordValid = await bcrypt.compare(
        password,
        existingUser.passwordHash
      );
      if (!isPasswordValid) {
        socket.emit("loginError", {
          message: "Incorrect password.",
        });
        return;
      }
      // Генерация JWT токена
      const token = jwt.sign(
        { userId: existingUser._id, email: existingUser.email },
        process.env.JWT_SECRET, // Это должен быть ваш секретный ключ
        { expiresIn: "10h" } // Срок действия токена — 10 час
      );
      socket.emit("loginSuccess", {
        message: "Login successful!",
        user: existingUser,
        token: token,
      });
    } catch (error) {
      console.error("Error during login:", error);
      socket.emit("loginError", {
        message: "Error during login from server. ",
        currentemail: email,
        passwordrequired: true,
      });
    }
  });
};
