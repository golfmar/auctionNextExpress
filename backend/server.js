import express from "express";
import http from "http";
import { connectDB } from "./config/db.js";
import { Server } from "socket.io";
import dotenv from "dotenv";
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import cors from "cors";
import Auction from "./models/Auction.js";
import User from "./models/User.js";
import axios from "axios";

import auctionAddHandler from "./components/auctionAddHandler.js";
import auctionPlaceBid from "./components/auctionPlaceBid.js";
import registerHandler from "./components/registerHandler.js";
import handlerSetPassword from "./components/handlerSetPassword.js";
import handlerLogin from "./components/handlerLogin.js";
import auctionDetales from "./components/auctionDetales.js";
import profileHandler from "./components/profileHandler.js";

dotenv.config();
const app = express();
connectDB();
const server = http.createServer(app);
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  },
});

app.use(cors({ origin: "*" }));
app.use(express.json());
app.use((req, res, next) => {
  console.log(
    `Incoming request: method=${req.method} url=${
      req.url
    } body=${JSON.stringify(req.body, null, 2)}`
  );
  next();
});

app.get("/auth/google/callback", async (req, res) => {
  const { code } = req.query;
  if (!code) return res.status(400).send("Code is required");
  try {
    const response = await axios.post("https://oauth2.googleapis.com/token", {
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: "http://localhost:5000/auth/google/callback",
      grant_type: "authorization_code",
    });
    const { access_token, id_token } = response.data;
    const ticket = await client.verifyIdToken({
      idToken: id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const email = payload.email;
    const userName = payload.name;
    const googleId = payload.sub;
    const avatarUrl = payload.picture || null;
    let user = await User.findOne({ email });
    if (!user) {
      const avatarBase64 = avatarUrl
        ? await downloadAvatarAsBase64(avatarUrl)
        : null;
      user = new User({ email, userName, avatar: avatarBase64, googleId });
      await user.save();
    }
    const jwtToken = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "10h" }
    );
    res.redirect(`http://localhost:3000/dashboard?token=${jwtToken}`);
  } catch (error) {
    console.error("Google callback error:", error);
    res.status(500).send("Authentication failed");
  }
});

// app.get("/api/auctions", async (req, res) => {
//   try {
//     const auctions = await Auction.find({ status: "active" });
//     res.json(auctions);
//   } catch (error) {
//     res.status(500).json({ message: "Server error" });
//   }
// });

const downloadAvatarAsBase64 = async (url) => {
  try {
    const response = await axios.get(url, { responseType: "arraybuffer" });
    return `data:image/jpeg;base64,${Buffer.from(response.data).toString(
      "base64"
    )}`;
  } catch (error) {
    console.error("Failed to download avatar:", error);
    return null;
  }
};

// ======================================

io.on("connection", (socket) => {
  console.log(`Client connected: ${socket.id}`);

  socket.on("getAuctions", async () => {
    console.log("<====getAuctions====>");
    const auctions = await Auction.find({ status: "active" }).populate(
      "creator",
      "userName"
    );
    socket.emit("auctionsList", auctions);
  });

  auctionAddHandler(io, socket);
  auctionPlaceBid(io, socket);
  registerHandler(io, socket);
  handlerSetPassword(io, socket);
  handlerLogin(io, socket);
  auctionDetales(io, socket);
  profileHandler(io, socket);
  socket.on("googleRegister", async (data) => {
    const { token } = data;
    if (!token) {
      socket.emit("registrationError", { message: "Token is required." });
      return;
    }
    try {
      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      const email = payload.email;
      const userName = payload.name;
      const googleId = payload.sub;
      const avatarUrl = payload.picture || null;
      let user = await User.findOne({ email });
      if (user) {
        if (!user.googleId) {
          user.googleId = googleId;
          await user.save();
        }
        socket.emit("googleRegisterSuccess", {
          message: "User already exists. Account linked with Google.",
          user,
        });
        return;
      }
      socket.emit("requirePassword", {
        message: "You need to set a password to complete registration.",
        email,
        userName,
        googleId,
        avatarUrl,
      });
    } catch (error) {
      console.error("Google registration error:", error);
      socket.emit("registrationError", {
        message: "Error during Google registration.",
      });
    }
  });

  socket.on("googleLogin", async (data) => {
    const { token } = data;
    if (!token) {
      socket.emit("loginError", { message: "Token is required." });
      return;
    }
    try {
      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      const email = payload.email;
      const userName = payload.name;
      const googleId = payload.sub;
      const avatarUrl = payload.picture || null;
      let user = await User.findOne({ email });
      if (!user) {
        let avatarBase64 = null;
        if (avatarUrl) avatarBase64 = await downloadAvatarAsBase64(avatarUrl);
        user = new User({ email, userName, avatar: avatarBase64, googleId });
        await user.save();
      } else if (!user.googleId) {
        user.googleId = googleId;
        await user.save();
      }
      const jwtToken = jwt.sign(
        { userId: user._id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: "10h" }
      );
      socket.emit("googleLoginSuccess", {
        message: "Google login successful!",
        user,
        token: jwtToken,
      });
    } catch (error) {
      console.error("Google login error:", error);
      socket.emit("googleLoginError", {
        message: "Error during Google login.",
        error: error.message,
      });
    }
  });

  socket.on("disconnect", () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
