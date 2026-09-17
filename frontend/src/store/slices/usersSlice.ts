import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';

import { errorMessage } from '@/services/api';
import { userService } from '@/services/userService';
import type {
  CreatedUser,
  PaginationMeta,
  RequestStatus,
  User,
  UserFormValues,
  UserListQuery,
  UserStats,
  UserStatus,
} from '@/types';

interface UsersState {
  items: User[];
  pagination: PaginationMeta | null;
  query: UserListQuery;
  stats: UserStats | null;

  listStatus: RequestStatus;
  listError: string | null;

  /** Tracked separately so a failed save does not blank the loaded table. */
  saveStatus: RequestStatus;
  saveError: string | null;

  selected: User | null;
  selectedStatus: RequestStatus;

  /** Ids ticked for a bulk action. */
  selectedIds: number[];

  /** Shown once after a create or reset; never persisted. */
  generatedPassword: string | null;
}

/**
 * Thunks that read state, or dispatch each other, must agree on the state
 * shape. Only this slice is declared, rather than `RootState`, to avoid a
 * circular type reference through the store.
 */
interface UsersThunkConfig {
  state: { users: UsersState };
  rejectValue: string;
}

const DEFAULT_QUERY: UserListQuery = {
  page: 1,
  perPage: 15,
  sortBy: 'createdAt',
  sortDir: 'desc',
};

const initialState: UsersState = {
  items: [],
  pagination: null,
  query: DEFAULT_QUERY,
  stats: null,
  listStatus: 'idle',
  listError: null,
  saveStatus: 'idle',
  saveError: null,
  selected: null,
  selectedStatus: 'idle',
  selectedIds: [],
  generatedPassword: null,
};

export const fetchUsers = createAsyncThunk<
  { items: User[]; pagination: PaginationMeta },
  UserListQuery | undefined,
  UsersThunkConfig
>('users/fetchAll', async (query, { getState, rejectWithValue }) => {
  // Merging with the stored query means callers can dispatch a partial change
  // (just the page, or just the search) without restating every filter.
  const merged = { ...getState().users.query, ...(query ?? {}) };

  try {
    return await userService.list(merged);
  } catch (error) {
    return rejectWithValue(errorMessage(error, 'Unable to load users.'));
  }
});

export const fetchUserStats = createAsyncThunk<UserStats, void, { rejectValue: string }>(
  'users/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      return await userService.stats();
    } catch (error) {
      return rejectWithValue(errorMessage(error, 'Unable to load user statistics.'));
    }
  },
);

export const fetchUser = createAsyncThunk<User, number, { rejectValue: string }>(
  'users/fetchOne',
  async (id, { rejectWithValue }) => {
    try {
      return await userService.get(id);
    } catch (error) {
      return rejectWithValue(errorMessage(error, 'Unable to load that user.'));
    }
  },
);

export const createUser = createAsyncThunk<CreatedUser, UserFormValues, { rejectValue: string }>(
  'users/create',
  async (values, { rejectWithValue }) => {
    try {
      return await userService.create(values);
    } catch (error) {
      return rejectWithValue(errorMessage(error, 'Unable to create the user.'));
    }
  },
);

export const updateUser = createAsyncThunk<
  User,
  { id: number; values: Partial<UserFormValues> },
  { rejectValue: string }
>('users/update', async ({ id, values }, { rejectWithValue }) => {
  try {
    return await userService.update(id, values);
  } catch (error) {
    return rejectWithValue(errorMessage(error, 'Unable to update the user.'));
  }
});

export const deleteUser = createAsyncThunk<number, number, { rejectValue: string }>(
  'users/delete',
  async (id, { rejectWithValue }) => {
    try {
      await userService.remove(id);
      return id;
    } catch (error) {
      return rejectWithValue(errorMessage(error, 'Unable to delete the user.'));
    }
  },
);

export const bulkDeleteUsers = createAsyncThunk<
  { deleted: number; skipped: number[] },
  number[],
  UsersThunkConfig
>('users/bulkDelete', async (ids, { rejectWithValue, dispatch }) => {
  try {
    const result = await userService.bulkRemove(ids);
    // Refetch rather than splicing locally: the server may have skipped rows
    // (your own account, the last Super Admin) and the counts would drift.
    await dispatch(fetchUsers());
    return result;
  } catch (error) {
    return rejectWithValue(errorMessage(error, 'Unable to delete the selected users.'));
  }
});

export const bulkUpdateUserStatus = createAsyncThunk<
  { updated: number },
  { ids: number[]; status: UserStatus },
  UsersThunkConfig
>('users/bulkStatus', async ({ ids, status }, { rejectWithValue, dispatch }) => {
  try {
    const result = await userService.bulkStatus(ids, status);
    // Refetched for the same reason as a bulk delete: the server decides which
    // rows it would actually change.
    await dispatch(fetchUsers());
    return result;
  } catch (error) {
    return rejectWithValue(errorMessage(error, 'Unable to update the selected users.'));
  }
});

export const resetUserPassword = createAsyncThunk<
  { id: number; generatedPassword?: string },
  { id: number; password?: string },
  { rejectValue: string }
>('users/resetPassword', async ({ id, password }, { rejectWithValue }) => {
  try {
    return await userService.resetPassword(id, password);
  } catch (error) {
    return rejectWithValue(errorMessage(error, 'Unable to reset the password.'));
  }
});

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    setQuery(state, action: PayloadAction<Partial<UserListQuery>>) {
      // Any filter change returns to page 1; staying on page 7 of a newly
      // filtered result set usually shows an empty table.
      const resetsPage = Object.keys(action.payload).some((key) => key !== 'page');

      state.query = {
        ...state.query,
        ...action.payload,
        ...(resetsPage && action.payload.page === undefined ? { page: 1 } : {}),
      };
    },

    resetQuery(state) {
      state.query = DEFAULT_QUERY;
    },

    toggleSelected(state, action: PayloadAction<number>) {
      const id = action.payload;

      state.selectedIds = state.selectedIds.includes(id)
        ? state.selectedIds.filter((value) => value !== id)
        : [...state.selectedIds, id];
    },

    toggleSelectAll(state) {
      state.selectedIds =
        state.selectedIds.length === state.items.length ? [] : state.items.map((user) => user.id);
    },

    clearSelection(state) {
      state.selectedIds = [];
    },

    clearGeneratedPassword(state) {
      state.generatedPassword = null;
    },

    clearSaveError(state) {
      state.saveError = null;
      state.saveStatus = 'idle';
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.listStatus = 'loading';
        state.listError = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.listStatus = 'succeeded';
        state.items = action.payload.items;
        state.pagination = action.payload.pagination;
        // Drop ticks for rows no longer on screen.
        state.selectedIds = state.selectedIds.filter((id) =>
          action.payload.items.some((user) => user.id === id),
        );
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.listStatus = 'failed';
        state.listError = action.payload ?? 'Unable to load users.';
      })

      .addCase(fetchUserStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      })

      .addCase(fetchUser.pending, (state) => {
        state.selectedStatus = 'loading';
        state.selected = null;
      })
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.selectedStatus = 'succeeded';
        state.selected = action.payload;
      })
      .addCase(fetchUser.rejected, (state) => {
        state.selectedStatus = 'failed';
      })

      .addCase(createUser.pending, (state) => {
        state.saveStatus = 'loading';
        state.saveError = null;
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.saveStatus = 'succeeded';
        state.generatedPassword = action.payload.generatedPassword ?? null;
      })
      .addCase(createUser.rejected, (state, action) => {
        state.saveStatus = 'failed';
        state.saveError = action.payload ?? 'Unable to create the user.';
      })

      .addCase(updateUser.pending, (state) => {
        state.saveStatus = 'loading';
        state.saveError = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.saveStatus = 'succeeded';
        state.selected = action.payload;
        state.items = state.items.map((user) =>
          user.id === action.payload.id ? action.payload : user,
        );
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.saveStatus = 'failed';
        state.saveError = action.payload ?? 'Unable to update the user.';
      })

      .addCase(deleteUser.fulfilled, (state, action) => {
        state.items = state.items.filter((user) => user.id !== action.payload);
        state.selectedIds = state.selectedIds.filter((id) => id !== action.payload);

        if (state.pagination) {
          state.pagination.total = Math.max(0, state.pagination.total - 1);
        }
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.listError = action.payload ?? 'Unable to delete the user.';
      })

      .addCase(bulkDeleteUsers.fulfilled, (state) => {
        state.selectedIds = [];
      })
      .addCase(bulkDeleteUsers.rejected, (state, action) => {
        state.listError = action.payload ?? 'Unable to delete the selected users.';
      })

      .addCase(resetUserPassword.fulfilled, (state, action) => {
        state.generatedPassword = action.payload.generatedPassword ?? null;
      })
      .addCase(resetUserPassword.rejected, (state, action) => {
        state.saveError = action.payload ?? 'Unable to reset the password.';
      });
  },
});

export const {
  clearGeneratedPassword,
  clearSaveError,
  clearSelection,
  resetQuery,
  setQuery,
  toggleSelectAll,
  toggleSelected,
} = usersSlice.actions;

export default usersSlice.reducer;
