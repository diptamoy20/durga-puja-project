import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { dashboardService } from '@/services/dashboardService';
import { errorMessage } from '@/services/api';
import type { DashboardSummary, RequestStatus } from '@/types';

interface DashboardState {
  summary: DashboardSummary | null;
  status: RequestStatus;
  error: string | null;
}

const initialState: DashboardState = {
  summary: null,
  status: 'idle',
  error: null,
};

export const fetchDashboardSummary = createAsyncThunk<
  DashboardSummary,
  void,
  { rejectValue: string }
>('dashboard/fetchSummary', async (_, { rejectWithValue }) => {
  try {
    return await dashboardService.summary();
  } catch (error) {
    return rejectWithValue(errorMessage(error, 'Unable to load the dashboard summary.'));
  }
});

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardSummary.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchDashboardSummary.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.summary = action.payload;
      })
      .addCase(fetchDashboardSummary.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? 'Unable to load the dashboard summary.';
      });
  },
});

export default dashboardSlice.reducer;
