import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { committeeService, diasporaService } from '@/services/registrationService';
import type { CommitteeStats, DiasporaStats } from '@/types/registration';
import type { RequestStatus } from '@/types';

interface RegistrationState {
  diasporaStats: DiasporaStats | null;
  committeeStats: CommitteeStats | null;
  status: RequestStatus;
  error: string | null;
}

const initialState: RegistrationState = {
  diasporaStats: null,
  committeeStats: null,
  status: 'idle',
  error: null,
};

export const fetchRegistrationStats = createAsyncThunk(
  'registration/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const [diasporaStats, committeeStats] = await Promise.all([
        diasporaService.stats(),
        committeeService.stats(),
      ]);
      return { diasporaStats, committeeStats };
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : 'Failed to fetch registration stats');
    }
  },
);

const registrationSlice = createSlice({
  name: 'registration',
  initialState,
  reducers: {
    clearRegistrationError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRegistrationStats.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchRegistrationStats.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.diasporaStats = action.payload.diasporaStats;
        state.committeeStats = action.payload.committeeStats;
      })
      .addCase(fetchRegistrationStats.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });
  },
});

export const { clearRegistrationError } = registrationSlice.actions;
export default registrationSlice.reducer;
