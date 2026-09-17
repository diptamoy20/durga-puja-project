import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';

import { errorMessage } from '@/services/api';
import { authService } from '@/services/authService';
import type { AuthUser, LoginCredentials, RegisterPayload, RequestStatus } from '@/types';
import { tokenStorage } from '@/utils/tokenStorage';

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  status: RequestStatus;
  error: string | null;
  /** True until the stored session has been validated against the server. */
  initialising: boolean;
}

/**
 * Seeded from localStorage so a reload renders the shell immediately instead
 * of flashing the login page. `initialising` stays true until `loadSession`
 * confirms the token is still valid.
 */
const storedUser = tokenStorage.getUser();
const hasToken = Boolean(tokenStorage.getAccessToken());

const initialState: AuthState = {
  user: hasToken ? storedUser : null,
  isAuthenticated: hasToken && storedUser !== null,
  status: 'idle',
  error: null,
  initialising: hasToken,
};

export const login = createAsyncThunk<
  AuthUser,
  LoginCredentials,
  { rejectValue: string }
>('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const { user, tokens } = await authService.login(credentials);

    tokenStorage.setTokens(tokens);
    tokenStorage.setUser(user);

    return user;
  } catch (error) {
    return rejectWithValue(errorMessage(error, 'Unable to sign in.'));
  }
});

export const registerAccount = createAsyncThunk<
  AuthUser,
  RegisterPayload,
  { rejectValue: string }
>('auth/register', async (payload, { rejectWithValue }) => {
  try {
    return await authService.register(payload);
  } catch (error) {
    return rejectWithValue(errorMessage(error, 'Unable to create the account.'));
  }
});

/**
 * Re-validates a stored session on boot and refreshes the cached roles and
 * permissions, which may have changed since the token was issued.
 */
export const loadSession = createAsyncThunk<AuthUser | null, void, { rejectValue: string }>(
  'auth/loadSession',
  async (_, { rejectWithValue }) => {
    if (!tokenStorage.getAccessToken()) return null;

    try {
      const user = await authService.me();
      tokenStorage.setUser(user);
      return user;
    } catch (error) {
      // The axios interceptor has already cleared the tokens on a 401.
      tokenStorage.clear();
      return rejectWithValue(errorMessage(error, 'Your session could not be restored.'));
    }
  },
);

export const logout = createAsyncThunk<void, void>('auth/logout', async () => {
  const refreshToken = tokenStorage.getRefreshToken();

  if (refreshToken) {
    try {
      await authService.logout(refreshToken);
    } catch {
      // Revoking server-side is best-effort: the local session is cleared
      // regardless, so a network failure cannot trap the user signed in.
    }
  }

  tokenStorage.clear();
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuthError(state) {
      state.error = null;
    },

    /** Called by the axios interceptor when refreshing fails. */
    sessionExpired(state) {
      state.user = null;
      state.isAuthenticated = false;
      state.initialising = false;
      state.error = 'Your session has expired. Please sign in again.';
    },

    setUser(state, action: PayloadAction<AuthUser>) {
      state.user = action.payload;
      tokenStorage.setUser(action.payload);
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload;
        state.isAuthenticated = true;
        state.initialising = false;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? 'Unable to sign in.';
        state.isAuthenticated = false;
        state.user = null;
      })

      .addCase(registerAccount.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(registerAccount.fulfilled, (state) => {
        state.status = 'succeeded';
      })
      .addCase(registerAccount.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? 'Unable to create the account.';
      })

      .addCase(loadSession.pending, (state) => {
        state.initialising = true;
      })
      .addCase(loadSession.fulfilled, (state, action) => {
        state.initialising = false;

        if (action.payload) {
          state.user = action.payload;
          state.isAuthenticated = true;
        }
      })
      .addCase(loadSession.rejected, (state) => {
        state.initialising = false;
        state.user = null;
        state.isAuthenticated = false;
      })

      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.status = 'idle';
        state.error = null;
        state.initialising = false;
      });
  },
});

export const { clearAuthError, sessionExpired, setUser } = authSlice.actions;
export default authSlice.reducer;
