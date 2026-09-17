import { configureStore } from '@reduxjs/toolkit';

import authReducer from './slices/authSlice';
import dashboardReducer from './slices/dashboardSlice';
import registrationReducer from './slices/registrationSlice';
import uiReducer from './slices/uiSlice';
import usersReducer from './slices/usersSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    users: usersReducer,
    dashboard: dashboardReducer,
    registration: registrationReducer,
    ui: uiReducer,
  },

  devTools: import.meta.env.DEV,
});

export type AppStore = typeof store;
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
