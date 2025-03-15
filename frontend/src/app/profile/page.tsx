"use client";
import React, { useState, useEffect } from "react";
import "./Profile.scss";
import { useSelector } from "react-redux";
import Link from "next/link";
import Click from "@/assets/svg/click.svg";

interface User {
  _id?: string;
  userName: string;
  email: string;
  avatar: string;
  createdAt: string;
}

interface Bid {
  user: { _id: string; userName: string };
  amount: number;
  timestamp: string;
}

interface Auction {
  _id: string;
  title: string;
  startPrice: number;
  endTime: string;
  imageUrl: string;
  status: string;
  creator: { _id: string; userName: string };
  currentBid?: number;
  bids: Bid[];
  winner?: { user: string; amount: number };
}

interface ProfileData {
  user: { userName: string };
  createdAuctions: Auction[];
  auctionsWithBids: Auction[];
  wonAuctions: Auction[];
}

const Profile: React.FC = () => {
  const user = useSelector((state: any) => state.auth.user as User);
  const socket = useSelector((state: any) => state.socket.socket);
  const token = useSelector((state: any) => state.auth.token);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (socket && token) {
      socket.emit("getProfileData", { token });

      socket.on("profileData", (data: ProfileData) => {
        setProfileData(data);
      });

      socket.on("profileError", (message: string) => {
        setError(message);
      });

      return () => {
        socket.off("profileData");
        socket.off("profileError");
      };
    }
  }, [socket, token]);

  return (
    <div className="profile">
      <div className="border border-gray-200 rounded-2xl overflow-hidden  shadow-[0_0_8px_rgba(0,0,0,0.1)]">
        <div className="bg-[#f8f9fa] p-2 text-center border-b border-[#e9ecef]">
          <h2 className="text-2xl text-[#212529] font-semibold m-4">
            {user?.userName}
          </h2>
          <div className="w-30 h-30 mx-auto rounded-full overflow-hidden">
            {user?.avatar ? (
              <img
                src={user?.avatar}
                alt="User avatar"
                crossOrigin="anonymous"
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="w-full h-full bg-[#4a90e2] text-white flex items-center justify-center text-2xl ">
                {user?.userName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        </div>

        {user ? (
          <div className="p-3 flex flex-col gap-2">
            <div className="">
              <label className="italic text-[#6c757d]">Email:</label>
              <p className="">{user?.email}</p>
            </div>

            <div className="">
              <label className="italic text-[#6c757d]">User ID:</label>
              <p className="">{user?._id}</p>
            </div>

            <div className="">
              <label className="italic text-[#6c757d]">Member since:</label>
              <p className="">
                {" "}
                {new Date(user?.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>

            {error && <p className="profile-error">{error}</p>}
            {!profileData && !error && (
              <div className="profile-loading">Loading auction data...</div>
            )}

            {profileData && (
              <div className="mt-6 border border-gray-200 rounded-2xl overflow-hidden bg-[#f8f9fa]  p-2">
                <div>
                  <label className="italic text-[#6c757d]">
                    Created Auctions:
                  </label>
                  {profileData.createdAuctions.length > 0 ? (
                    <ul className="">
                      {profileData.createdAuctions.map((auction) => (
                        <li key={auction._id} className="relative pl-4">
                          <Link
                            href={`/auctions/${auction._id}`}
                            className="relative"
                          >
                            Title: {auction.title}, status: ({auction.status})
                          </Link>
                          <Click className="w-3 h-3 absolute top-[50%] left-[0px] transform translate-y-[-50%]" />
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>No auctions created yet.</p>
                  )}
                </div>

                <div className="">
                  <label className="italic text-[#6c757d]">
                    Auctions with Your Bids:
                  </label>

                  {profileData.auctionsWithBids.length > 0 ? (
                    <ul className="">
                      {profileData.auctionsWithBids.map((auction) => (
                        <li key={auction._id} className="relative pl-4">
                          <Link href={`/auctions/${auction._id}`} className="">
                            Title: {auction.title} - Current Bid: $
                            {auction.currentBid || "No bids yet"}
                          </Link>
                          <Click className="w-3 h-3 absolute top-[50%] left-[0px] transform translate-y-[-50%]" />
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>No active bids yet.</p>
                  )}
                </div>

                <div className="">
                  <label className="italic text-[#6c757d]">Won Auctions</label>
                  {profileData.wonAuctions.length > 0 ? (
                    <ul className="flex flex-col">
                      {profileData.wonAuctions.map((auction) => (
                        <li key={auction._id} className="relative pl-4">
                          <Link href={`/auctions/${auction._id}`}>
                            Title: {auction.title} - Won for $
                            {auction.winner?.amount}
                          </Link>
                          <Click className="w-3 h-3 absolute top-[50%] left-[0px] transform translate-y-[-50%]" />
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>No auctions won yet.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="profile-loading">Loading user data...</div>
        )}
      </div>
    </div>
  );
};

export default Profile;
