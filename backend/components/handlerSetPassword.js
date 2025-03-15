import { Socket } from "socket.io";
import Auction from "./../models/Auction.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import User from "./../models/User.js";
import axios from "axios";

export default (io, socket) => {
   socket.on("setPassword", async (data) => {
     const { email, password, userName, googleId, avatarUrl } = data;
     if (!email || !password) {
       socket.emit("registrationError", {
         message: "Email and password are required.",
       });
       return;
     }
     try {
       const existingUser = await User.findOne({ email });
       if (existingUser) {
         socket.emit("registrationError", { message: "User already exists." });
         return;
       }
       const hashedPassword = await bcrypt.hash(password, 10);
       let avatarBase64 = null;
       if (avatarUrl) {
         avatarBase64 = await downloadAvatarAsBase64(avatarUrl);
       }
       const newUser = new User({
         userName,
         email,
         passwordHash: hashedPassword,
         avatar: avatarBase64,
         googleId,
       });
       await newUser.save();
       console.log("User saved to DB:", newUser); // Проверяем, что сохранилось
       const savedUser = await User.findOne({ email });
       console.log("User from DB:", savedUser); // Проверяем, что реально в базе
       const jwtToken = jwt.sign(
         { userId: newUser._id, email: newUser.email },
         process.env.JWT_SECRET,
         { expiresIn: "10h" }
       );
       socket.emit("googleRegisterSuccess", {
         message: "Registration successful!",
         user: newUser,
         token: jwtToken,
       });
     } catch (error) {
       console.error("Error setting password:", error);
       socket.emit("registrationError", { message: "Error setting password." });
     }
   });
};
