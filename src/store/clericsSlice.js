import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiService from '@/services/apiService';
import { buildQuery } from '@/lib/queryHelper';

export const fetchClerics = createAsyncThunk(
  'clerics/fetchClerics',
  async (params = {}, { rejectWithValue }) => {
    try {
      const queryString = buildQuery(params);
      const url = queryString ? `/clerics?${queryString}` : '/clerics';
      const response = await apiService.get(url);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchCleric = createAsyncThunk(
  'clerics/fetchCleric',
  async (id, { rejectWithValue }) => {
    try {
      const response = await apiService.get(`/clerics/${id}`);
      return response.data?.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createCleric = createAsyncThunk(
  'clerics/createCleric',
  async (data, { rejectWithValue }) => {
    try {
      const response = await apiService.post('/clerics', data);
      return response.data?.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateCleric = createAsyncThunk(
  'clerics/updateCleric',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await apiService.patch(`/clerics/${id}`, data);
      return response.data?.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteCleric = createAsyncThunk(
  'clerics/deleteCleric',
  async (id, { rejectWithValue }) => {
    try {
      await apiService.delete(`/clerics/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const initialState = {
  clerics: [],
  currentCleric: null,
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

const clericsSlice = createSlice({
  name: 'clerics',
  initialState,
  reducers: {
    clearCurrentCleric: (state) => {
      state.currentCleric = null;
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
      // Fetch Clerics
      .addCase(fetchClerics.pending, (state, action) => {
        state.loading = true;
        state.error = null;
        state.currentListRequestId = action.meta.requestId;
      })
      .addCase(fetchClerics.fulfilled, (state, action) => {
        if (state.currentListRequestId !== action.meta.requestId) {
          return;
        }

        state.loading = false;
        state.clerics = action.payload?.data || [];
        // Use totalCount from API response, fallback to data length
        state.total = action.payload?.totalCount || action.payload?.data?.length || 0;
        state.currentListRequestId = null;
      })
      .addCase(fetchClerics.rejected, (state, action) => {
        if (state.currentListRequestId !== action.meta.requestId) {
          return;
        }

        state.loading = false;
        state.error = action.payload;
        state.currentListRequestId = null;
      })
      
      // Fetch Single Cleric
      .addCase(fetchCleric.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCleric.fulfilled, (state, action) => {
        state.loading = false;
        state.currentCleric = action.payload;
      })
      .addCase(fetchCleric.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create Cleric
      .addCase(createCleric.pending, (state) => {
        state.creating = true;
        state.error = null;
      })
      .addCase(createCleric.fulfilled, (state, action) => {
        state.creating = false;
        if (action.payload) {
          state.clerics.push(action.payload);
          state.total += 1;
        }
      })
      .addCase(createCleric.rejected, (state, action) => {
        state.creating = false;
        state.error = action.payload;
      })
      
      // Update Cleric
      .addCase(updateCleric.pending, (state) => {
        state.updating = true;
        state.error = null;
      })
      .addCase(updateCleric.fulfilled, (state, action) => {
        state.updating = false;
        if (action.payload) {
          const index = state.clerics.findIndex(c => c.id === action.payload.id);
          if (index !== -1) {
            state.clerics[index] = action.payload;
          }
          if (state.currentCleric?.id === action.payload.id) {
            state.currentCleric = action.payload;
          }
        }
      })
      .addCase(updateCleric.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload;
      })
      
      // Delete Cleric
      .addCase(deleteCleric.pending, (state) => {
        state.deleting = true;
        state.error = null;
      })
      .addCase(deleteCleric.fulfilled, (state, action) => {
        state.deleting = false;
        state.clerics = state.clerics.filter(c => c.id !== action.payload);
        if (state.total > 0) state.total -= 1;
        if (state.currentCleric?.id === action.payload) {
          state.currentCleric = null;
        }
      })
      .addCase(deleteCleric.rejected, (state, action) => {
        state.deleting = false;
        state.error = action.payload;
      });
  },
});

export const { clearCurrentCleric, clearError, setPage, setLimit, setTotal } = clericsSlice.actions;
export default clericsSlice.reducer;
