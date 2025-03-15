import { Socket } from "socket.io";
import Auction from "./../models/Auction.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import User from "./../models/User.js";
import axios from "axios";

export default (io, socket) => {
  socket.on("register", async (data) => {
    const { username, email, password } = data;
    console.log("===--- register ---====", email, password, username);
    if (!email || !password || !username) {
      socket.emit("registrationError", {
        message: "All fields are required to be filled in.",
      });
      return;
    }
    try {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        socket.emit("registrationError", {
          message: "The user with this email already exists.",
        });
        return;
      }
      // Хеширование пароля перед сохранением
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      const newUser = new User({
        email: email,
        userName: username,
        passwordHash: hashedPassword,
        avatar: "",
        googleId: email,
      });
      await newUser.save();
      socket.emit("registrationSuccess", {
        message: "Registration was successful!",
        user: newUser,
      });
    } catch (error) {
      console.error("Error during registration:", error);
      socket.emit("registrationError", {
        message: "Error during registration.",
        error: error.message,
      });
    }
  });
};
