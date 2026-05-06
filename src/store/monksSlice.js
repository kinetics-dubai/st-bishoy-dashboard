import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiService from '@/services/apiService';
import { buildQuery } from '@/lib/queryHelper';

const normalizeMonk = (monk) => {
  if (!monk) return monk;

  return {
    id: monk.id,
    name: monk.name || '',
    name_ar: monk.name_ar || '',
    rank: monk.rank || '',
    position: monk.position || '',
    position_ar: monk.position_ar || '',
    bio: monk.bio || '',
    bio_ar: monk.bio_ar || '',
    departed: Boolean(monk.departed),
    ...monk,
  };
};

export const fetchMonks = createAsyncThunk(
  'monks/fetchMonks',
  async (params = {}, { rejectWithValue }) => {
    try {
      const queryString = buildQuery(params);
      const url = queryString ? `/monks?${queryString}` : '/monks';
      const response = await apiService.get(url);
      return {
        ...response.data,
        data: (response.data?.data || []).map(normalizeMonk),
      };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchMonk = createAsyncThunk(
  'monks/fetchMonk',
  async (id, { rejectWithValue }) => {
    try {
      const response = await apiService.get(`/monks/${id}`);
      return normalizeMonk(response.data?.data || response.data);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createMonk = createAsyncThunk(
  'monks/createMonk',
  async (data, { rejectWithValue }) => {
    try {
      const response = await apiService.post('/monks', data);
      return normalizeMonk(response.data?.data || response.data);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateMonk = createAsyncThunk(
  'monks/updateMonk',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await apiService.patch(`/monks/${id}`, data);
      return normalizeMonk(response.data?.data || response.data);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteMonk = createAsyncThunk(
  'monks/deleteMonk',
  async (id, { rejectWithValue }) => {
    try {
      await apiService.delete(`/monks/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const initialState = {
  monks: [],
  currentMonk: null,
  page: 1,
  limit: 10,
  total: 0,
  loading: false,
  error: null,
  // Add individual loading states for better UX
  creating: false,
  updating: false,
  deleting: false,
  currentListRequestId: null,
};

const monksSlice = createSlice({
  name: 'monks',
  initialState,
  reducers: {
    clearCurrentMonk: (state) => {
      state.currentMonk = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    setPage: (state, action) => {
      state.page = action.payload;
    },
    setLimit: (state, action) => {
      state.limit = action.payload;
      state.page = 1;
    },
    setTotal: (state, action) => {
      state.total = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMonks.pending, (state, action) => {
        state.loading = true;
        state.error = null;
        state.currentListRequestId = action.meta.requestId;
      })
      .addCase(fetchMonks.fulfilled, (state, action) => {
        if (state.currentListRequestId !== action.meta.requestId) {
          return;
        }

        state.loading = false;
        state.monks = action.payload?.data || [];
        state.total = action.payload?.totalCount || action.payload?.data?.length || 0;
        state.currentListRequestId = null;
      })
      .addCase(fetchMonks.rejected, (state, action) => {
        if (state.currentListRequestId !== action.meta.requestId) {
          return;
        }

        state.loading = false;
        state.error = action.payload;
        state.currentListRequestId = null;
      })
      .addCase(fetchMonk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMonk.fulfilled, (state, action) => {
        state.loading = false;
        state.currentMonk = action.payload;
      })
      .addCase(fetchMonk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createMonk.pending, (state) => {
        state.creating = true;
        state.error = null;
      })
      .addCase(createMonk.fulfilled, (state, action) => {
        state.creating = false;
        if (action.payload) {
          state.monks.push(action.payload);
          state.total += 1;
        }
      })
      .addCase(createMonk.rejected, (state, action) => {
        state.creating = false;
        state.error = action.payload;
      })
      .addCase(updateMonk.pending, (state) => {
        state.updating = true;
        state.error = null;
      })
      .addCase(updateMonk.fulfilled, (state, action) => {
        state.updating = false;
        if (action.payload) {
          const index = state.monks.findIndex((m) => m.id === action.payload.id);
          if (index !== -1) {
            state.monks[index] = action.payload;
          }
          if (state.currentMonk?.id === action.payload.id) {
            state.currentMonk = action.payload;
          }
        }
      })
      .addCase(updateMonk.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload;
      })
      .addCase(deleteMonk.pending, (state) => {
        state.deleting = true;
        state.error = null;
      })
      .addCase(deleteMonk.fulfilled, (state, action) => {
        state.deleting = false;
        state.monks = state.monks.filter((m) => m.id !== action.payload);
        if (state.total > 0) state.total -= 1;
        if (state.currentMonk?.id === action.payload) {
          state.currentMonk = null;
        }
      })
      .addCase(deleteMonk.rejected, (state, action) => {
        state.deleting = false;
        state.error = action.payload;
      });
  },
});

export const { clearCurrentMonk, clearError, setPage, setLimit, setTotal } = monksSlice.actions;
export default monksSlice.reducer;
