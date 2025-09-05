import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface Zone {
  zoneId: string;
  name: string;
  categoryId: string;
  totalSlots: number;
  occupied: number;
  free: number;
  reserved: number;
  availableForVisitors: number;
  availableForSubscribers: number;
  rateNormal: number;
  rateSpecial: number;
  open: boolean;
  specialActive?: boolean;
}

interface Gate {
  id: string;
  name: string;
}

interface Ticket {
  id: string;
  zoneId: string;
  type: "visitor" | "subscriber";
  checkinAt: string;
}

interface GateState {
  zones: Zone[];
  gates: Gate[];
  currentGate: Gate | null;
  currentTicket: Ticket | null;
  selectedZone: string | null;
  userType: "visitor" | "subscriber" | null;
  subscriptionId: string | null;
  showTicketModal: boolean;
}

const initialState: GateState = {
  zones: [],
  gates: [],
  currentGate: null,
  currentTicket: null,
  selectedZone: null,
  userType: null,
  subscriptionId: null,
  showTicketModal: false,
};

const gateSlice = createSlice({
  name: "gate",
  initialState,
  reducers: {
    setZones: (state, action: PayloadAction<Zone[]>) => {
      state.zones = action.payload;
    },
    updateZone: (state, action: PayloadAction<Zone>) => {
      const index = state.zones.findIndex(
        (z) => z.zoneId === action.payload.zoneId
      );
      if (index !== -1) {
        state.zones[index] = action.payload;
      } else {
        state.zones.push(action.payload);
      }
    },
    setGates: (state, action: PayloadAction<Gate[]>) => {
      state.gates = action.payload;
    },
    setCurrentGate: (state, action: PayloadAction<Gate | null>) => {
      state.currentGate = action.payload;
    },
    setCurrentTicket: (state, action: PayloadAction<Ticket | null>) => {
      state.currentTicket = action.payload;
    },
    setSelectedZone: (state, action: PayloadAction<string | null>) => {
      state.selectedZone = action.payload;
    },
    setUserType: (
      state,
      action: PayloadAction<"visitor" | "subscriber" | null>
    ) => {
      state.userType = action.payload;
    },
    setSubscriptionId: (state, action: PayloadAction<string | null>) => {
      state.subscriptionId = action.payload;
    },
    setShowTicketModal: (state, action: PayloadAction<boolean>) => {
      state.showTicketModal = action.payload;
    },
    resetGateState: (state) => {
      state.currentTicket = null;
      state.selectedZone = null;
      state.userType = null;
      state.subscriptionId = null;
      state.showTicketModal = false;
    },
  },
});

export const {
  setZones,
  updateZone,
  setGates,
  setCurrentGate,
  setCurrentTicket,
  setSelectedZone,
  setUserType,
  setSubscriptionId,
  setShowTicketModal,
  resetGateState,
} = gateSlice.actions;

export default gateSlice.reducer;
