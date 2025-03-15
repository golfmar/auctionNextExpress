"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";

const HomePage = () => {
  return (
    <div>
      <h1 className="text-3xl font-semibold italic text-gray-800 text-center">
        Project Description
      </h1>
      <div className="max-w-6xl mx-auto p-4">
        <section className="mb-8">
          <p className="text-gray-700">
            Pet project — a real-time auction platform built to showcase
            full-stack development skills. <br />
            <strong>Stack:</strong> Frontend — Next.js (App Router) with
            TypeScript, Redux for state management (`auth`, `socket`), styled
            with Tailwind CSS and SCSS. Backend — Node.js with Socket.IO for
            real-time, MongoDB (Mongoose) for storage. <br />
            <strong>Mechanics:</strong> <br />- <strong>Authorization:</strong>{" "}
            Page `/login` — form sends `email` and `password` via Socket.IO
            (`login`), server returns `user` and JWT token. Google authorization
            via `@react-oauth/google` sends a token (`googleLogin`), server
            responds similarly. Data is stored in Redux and `localStorage`.{" "}
            <br />- <strong>Auction Creation:</strong> Page `/add-auction` —
            form sends auction data to MongoDB via Socket.IO, `creator` is taken
            from the JWT token in Redux. Images are uploaded to Cloudinary, with
            only URLs stored in MongoDB.
            <br />- <strong>Auction List:</strong> Main page `/auctions`
            requests active auctions via Socket.IO (`getAuctions`), server
            returns data with usernames, rendered in `Lot`. <br />-{" "}
            <strong>Bidding:</strong> In `Lot`, the "Place Bid" button sends a
            bid via Socket.IO (`placeBid`). Server updates the auction in
            MongoDB and broadcasts changes to all clients via `bidUpdated`.{" "}
            <br />- <strong>Timer:</strong> Client-side `useEffect` in `Lot` and
            `/auctions/[id]` displays a timer ("X days, Y hours, Z min, W sec").
            Server ends the auction via `closeAuction` and notifies all clients
            via `auctionClosed`. <br />- <strong>Auction Details:</strong> Page
            `/auctions/[id]` requests data via `getAuctionDetails` (Socket.IO),
            displays bid history and timer, updated via `bidUpdated`. <br />-{" "}
            <strong>Profile:</strong> Page `/profile` requests data via
            `getProfileData` (Socket.IO), shows user data from Redux and auction
            lists (created, bids, won). <br />
            <strong>Features:</strong> Real-time via Socket.IO, JWT
            authorization, TypeScript, modular components (`Lot`, `Profile`).{" "}
            <br />
            <strong>Data:</strong> MongoDB: `users` (name, email, avatar),
            `auctions` (title, bids, winner). <br />
            <strong>Deployment:</strong> Frontend — Vercel, backend — Railway
            with MongoDB Atlas.
          </p>
        </section>
      </div>
    </div>
  );
};

export default HomePage;
