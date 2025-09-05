import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ParkingState {
  zoneId: string;
  name: string;
  categoryId: string;
  totalSlots: number;
  occupied: number;
  free: number;
  reserved: number;
  availableForVisitors: number;
  availableForSubscribers: number;
  subscriberCount: number;
  open: boolean;
}

interface Category {
  id: string;
  name: string;
  description: string;
  rateNormal: number;
  rateSpecial: number;
}

interface AdminUpdate {
  adminId: string;
  action: string;
  targetType: string;
  targetId: string;
  timestamp: string;
  details?: any;
}

interface AdminState {
  parkingStates: ParkingState[];
  categories: Category[];
  auditLog: AdminUpdate[];
  selectedCategory: Category | null;
  showCategoryModal: boolean;
}

const initialState: AdminState = {
  parkingStates: [],
  categories: [],
  auditLog: [],
  selectedCategory: null,
  showCategoryModal: false,
};

const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {
    setParkingStates: (state, action: PayloadAction<ParkingState[]>) => {
      state.parkingStates = action.payload;
    },
    setCategories: (state, action: PayloadAction<Category[]>) => {
      state.categories = action.payload;
    },
    updateCategory: (state, action: PayloadAction<Category>) => {
      const index = state.categories.findIndex(
        (cat) => cat.id === action.payload.id
      );
      if (index !== -1) {
        state.categories[index] = action.payload;
      }
    },
    addAuditLog: (state, action: PayloadAction<AdminUpdate>) => {
      state.auditLog.unshift(action.payload);
      if (state.auditLog.length > 50) {
        state.auditLog = state.auditLog.slice(0, 50);
      }
    },
    setSelectedCategory: (state, action: PayloadAction<Category | null>) => {
      state.selectedCategory = action.payload;
    },
    setShowCategoryModal: (state, action: PayloadAction<boolean>) => {
      state.showCategoryModal = action.payload;
    },
  },
});

export const {
  setParkingStates,
  setCategories,
  updateCategory,
  addAuditLog,
  setSelectedCategory,
  setShowCategoryModal,
} = adminSlice.actions;

export default adminSlice.reducer;
