import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface Auction {
  _id?: string;
  title: string;
  startPrice: number;
  endTime: string;
  imageUrl: string;
  status?: string;
  winner?: { user: string; amount: number };
}

interface AuctionsState {
  auctions: Auction[];
}

const initialState: AuctionsState = {
  auctions: [],
};

const auctionsSlice = createSlice({
  name: "auctions",
  initialState,
  reducers: {
    setAuctions(state, action: PayloadAction<Auction[]>) {
      state.auctions = action.payload;
    },
    updateStatus: (
      state,
      action: PayloadAction<{
        id: string;
        status: string;
        winner?: { user: string; amount: number };
      }>
    ) => {
      const { id, status, winner } = action.payload; 
      const auction = state.auctions.find((a) => a._id === id);
      if (auction) {
        auction.status = status;
        if (winner) auction.winner = winner; // Теперь winner определён
      }
    },
  },
});

export const { setAuctions } = auctionsSlice.actions;
export default auctionsSlice.reducer;
