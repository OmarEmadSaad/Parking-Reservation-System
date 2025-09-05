import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UiState {
  sidebarOpen: boolean;
  loading: boolean;
  error: string | null;
  success: string | null;
  wsConnected: boolean;
}

const initialState: UiState = {
  sidebarOpen: false,
  loading: false,
  error: null,
  success: null,
  wsConnected: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setSuccess: (state, action: PayloadAction<string | null>) => {
      state.success = action.payload;
    },
    clearMessages: (state) => {
      state.error = null;
      state.success = null;
    },
    setWsConnected: (state, action: PayloadAction<boolean>) => {
      state.wsConnected = action.payload;
    },
  },
});

export const { setSidebarOpen, setLoading, setError, setSuccess, clearMessages, setWsConnected } = uiSlice.actions;
export default uiSlice.reducer;