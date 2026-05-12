import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import apiService from '@/services/apiService';
import { buildQuery } from '@/lib/queryHelper';

const normalizeSermon = (sermon) => {
  if (!sermon) return sermon;
  return {
    id: sermon.id,
    title: sermon.title || '',
    title_ar: sermon.title_ar || '',
    date: sermon.date || '',
    video_url: sermon.video_url || '',
  };
};

export const fetchSermons = createAsyncThunk(
  'sermons/fetchSermons',
  async (params = {}, { rejectWithValue }) => {
    try {
      const queryString = buildQuery(params);
      const url = queryString ? `/sermons?${queryString}` : '/sermons';
      const response = await apiService.get(url);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchSermon = createAsyncThunk(
  'sermons/fetchSermon',
  async (id, { rejectWithValue }) => {
    try {
      const response = await apiService.get(`/sermons/${id}`);
      return normalizeSermon(response.data?.data || response.data);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createSermon = createAsyncThunk(
  'sermons/createSermon',
  async (data, { rejectWithValue }) => {
    try {
      const response = await apiService.post('/sermons', data);
      return normalizeSermon(response.data?.data || response.data);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateSermon = createAsyncThunk(
  'sermons/updateSermon',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await apiService.put(`/sermons/${id}`, data);
      return normalizeSermon(response.data?.data || response.data);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteSermon = createAsyncThunk(
  'sermons/deleteSermon',
  async (id, { rejectWithValue }) => {
    try {
      await apiService.delete(`/sermons/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const initialState = {
  sermons: [],
  currentSermon: null,
  page: 1,
  limit: 10,
  total: 0,
  loading: false,
  creating: false,
  updating: false,
  deleting: false,
  error: null,
  currentListRequestId: null,
};

const sermonsSlice = createSlice({
  name: 'sermons',
  initialState,
  reducers: {
    clearCurrentSermon: (state) => {
      state.currentSermon = null;
    },
    clearSermonError: (state) => {
      state.error = null;
    },
    setSermonsPage: (state, action) => {
      state.page = action.payload;
    },
    setSermonsLimit: (state, action) => {
      state.limit = action.payload;
      state.page = 1;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSermons.pending, (state, action) => {
        state.loading = true;
        state.error = null;
        state.currentListRequestId = action.meta.requestId;
      })
      .addCase(fetchSermons.fulfilled, (state, action) => {
        if (state.currentListRequestId !== action.meta.requestId) return;
        state.loading = false;
        state.sermons = (action.payload?.data || []).map(normalizeSermon);
        state.total = action.payload?.pagination?.total || action.payload?.data?.length || 0;
        state.currentListRequestId = null;
      })
      .addCase(fetchSermons.rejected, (state, action) => {
        if (state.currentListRequestId !== action.meta.requestId) return;
        state.loading = false;
        state.error = action.payload;
        state.currentListRequestId = null;
      })
      .addCase(fetchSermon.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSermon.fulfilled, (state, action) => {
        state.loading = false;
        state.currentSermon = action.payload;
      })
      .addCase(fetchSermon.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createSermon.pending, (state) => {
        state.creating = true;
        state.error = null;
      })
      .addCase(createSermon.fulfilled, (state, action) => {
        state.creating = false;
        if (action.payload) {
          state.sermons.unshift(action.payload);
          state.total += 1;
        }
      })
      .addCase(createSermon.rejected, (state, action) => {
        state.creating = false;
        state.error = action.payload;
      })
      .addCase(updateSermon.pending, (state) => {
        state.updating = true;
        state.error = null;
      })
      .addCase(updateSermon.fulfilled, (state, action) => {
        state.updating = false;
        if (action.payload) {
          const index = state.sermons.findIndex((s) => s.id === action.payload.id);
          if (index !== -1) state.sermons[index] = action.payload;
          if (String(state.currentSermon?.id) === String(action.payload.id)) {
            state.currentSermon = action.payload;
          }
        }
      })
      .addCase(updateSermon.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload;
      })
      .addCase(deleteSermon.pending, (state) => {
        state.deleting = true;
        state.error = null;
      })
      .addCase(deleteSermon.fulfilled, (state, action) => {
        state.deleting = false;
        state.sermons = state.sermons.filter((s) => s.id !== action.payload);
        if (state.total > 0) state.total -= 1;
        if (String(state.currentSermon?.id) === String(action.payload)) {
          state.currentSermon = null;
        }
      })
      .addCase(deleteSermon.rejected, (state, action) => {
        state.deleting = false;
        state.error = action.payload;
      });
  },
});

export const { clearCurrentSermon, clearSermonError, setSermonsPage, setSermonsLimit } = sermonsSlice.actions;
export default sermonsSlice.reducer;
