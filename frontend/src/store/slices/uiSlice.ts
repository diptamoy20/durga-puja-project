import { createSlice, nanoid, type PayloadAction } from '@reduxjs/toolkit';

export type ToastVariant = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  variant: ToastVariant;
  message: string;
}

interface UiState {
  sidebarOpen: boolean;
  toasts: Toast[];
}

const initialState: UiState = {
  // Collapsed by default on small screens; the layout opens it on desktop.
  sidebarOpen: false,
  toasts: [],
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar(state) {
      state.sidebarOpen = !state.sidebarOpen;
    },

    setSidebarOpen(state, action: PayloadAction<boolean>) {
      state.sidebarOpen = action.payload;
    },

    /**
     * `nanoid()` is called in a `prepare` callback rather than the reducer:
     * reducers must be pure, and generating the id inside one would make it
     * non-deterministic.
     */
    pushToast: {
      reducer(state, action: PayloadAction<Toast>) {
        state.toasts.push(action.payload);
      },
      prepare(message: string, variant: ToastVariant = 'info') {
        return { payload: { id: nanoid(), message, variant } };
      },
    },

    dismissToast(state, action: PayloadAction<string>) {
      state.toasts = state.toasts.filter((toast) => toast.id !== action.payload);
    },
  },
});

export const { dismissToast, pushToast, setSidebarOpen, toggleSidebar } = uiSlice.actions;
export default uiSlice.reducer;
