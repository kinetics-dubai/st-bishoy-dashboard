import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import apiService from '@/services/apiService';
import { buildQuery } from '@/lib/queryHelper';

const normalizeSynaxarium = (item = {}) => ({
  ...item,
  id: item.id ?? null,
  synaxarium_date: item.synaxarium_date ?? null,
  isActive: item.isActive ?? false,
  events: Array.isArray(item.events) ? item.events : [],
});

const normalizeReading = (item = {}) => ({
  ...item,
  id: item.id ?? null,
  title: item.title ?? '',
  book_reference: item.book_reference ?? null,
  chapter_id: item.chapter_id ?? null,
  chapter: item.chapter ?? null,
  verse_range: item.verse_range ?? null,
  reading_type: item.reading_type ?? '',
  synaxarium_id: item.synaxarium_id ?? null,
  content: item.content ?? null,
  isActive: item.isActive ?? false,
});

export const fetchSynaxariums = createAsyncThunk(
  'synaxarium/fetchSynaxariums',
  async (params = {}, { rejectWithValue }) => {
    try {
      const queryString = buildQuery(params);
      const url = queryString ? `/synaxarium?${queryString}` : '/synaxarium';
      const response = await apiService.get(url);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchSynaxarium = createAsyncThunk(
  'synaxarium/fetchSynaxarium',
  async (id, { rejectWithValue }) => {
    try {
      const response = await apiService.get(`/synaxarium/${id}`);
      return normalizeSynaxarium(response.data?.data || response.data);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createSynaxarium = createAsyncThunk(
  'synaxarium/createSynaxarium',
  async (data, { rejectWithValue }) => {
    try {
      const response = await apiService.post('/synaxarium', data);
      return normalizeSynaxarium(response.data?.data || response.data);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateSynaxarium = createAsyncThunk(
  'synaxarium/updateSynaxarium',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await apiService.patch(`/synaxarium/${id}`, data);
      return normalizeSynaxarium(response.data?.data || response.data);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteSynaxarium = createAsyncThunk(
  'synaxarium/deleteSynaxarium',
  async (id, { rejectWithValue }) => {
    try {
      await apiService.delete(`/synaxarium/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchSynaxariumReadings = createAsyncThunk(
  'synaxarium/fetchSynaxariumReadings',
  async (synaxariumId, { rejectWithValue }) => {
    try {
      const queryString = buildQuery({ synaxarium_id: synaxariumId });
      const response = await apiService.get(`/readings?${queryString}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createSynaxariumReading = createAsyncThunk(
  'synaxarium/createSynaxariumReading',
  async (data, { rejectWithValue }) => {
    try {
      const response = await apiService.post('/readings', data);
      return normalizeReading(response.data?.data || response.data);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateSynaxariumReading = createAsyncThunk(
  'synaxarium/updateSynaxariumReading',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await apiService.patch(`/readings/${id}`, data);
      return normalizeReading(response.data?.data || response.data);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteSynaxariumReading = createAsyncThunk(
  'synaxarium/deleteSynaxariumReading',
  async (id, { rejectWithValue }) => {
    try {
      await apiService.delete(`/readings/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const initialState = {
  synaxariums: [],
  currentSynaxarium: null,
  readings: [],
  page: 1,
  limit: 10,
  total: 0,
  readingsTotal: 0,
  loading: false,
  readingsLoading: false,
  creating: false,
  updating: false,
  deleting: false,
  creatingReading: false,
  updatingReading: false,
  deletingReading: false,
  error: null,
};

const synaxariumSlice = createSlice({
  name: 'synaxarium',
  initialState,
  reducers: {
    clearCurrentSynaxarium: (state) => {
      state.currentSynaxarium = null;
    },
    clearSynaxariumReadings: (state) => {
      state.readings = [];
      state.readingsTotal = 0;
    },
    clearSynaxariumError: (state) => {
      state.error = null;
    },
    setSynaxariumPage: (state, action) => {
      state.page = action.payload;
    },
    setSynaxariumLimit: (state, action) => {
      state.limit = action.payload;
      state.page = 1;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSynaxariums.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSynaxariums.fulfilled, (state, action) => {
        state.loading = false;
        state.synaxariums = (action.payload?.data || []).map(normalizeSynaxarium);
        state.total = action.payload?.totalCount || action.payload?.data?.length || 0;
      })
      .addCase(fetchSynaxariums.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchSynaxarium.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSynaxarium.fulfilled, (state, action) => {
        state.loading = false;
        state.currentSynaxarium = action.payload;
      })
      .addCase(fetchSynaxarium.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createSynaxarium.pending, (state) => {
        state.creating = true;
        state.error = null;
      })
      .addCase(createSynaxarium.fulfilled, (state, action) => {
        state.creating = false;
        if (action.payload) {
          state.synaxariums.unshift(action.payload);
          state.total += 1;
        }
      })
      .addCase(createSynaxarium.rejected, (state, action) => {
        state.creating = false;
        state.error = action.payload;
      })
      .addCase(updateSynaxarium.pending, (state) => {
        state.updating = true;
        state.error = null;
      })
      .addCase(updateSynaxarium.fulfilled, (state, action) => {
        state.updating = false;
        if (action.payload) {
          const index = state.synaxariums.findIndex((item) => String(item.id) === String(action.payload.id));
          if (index !== -1) {
            state.synaxariums[index] = action.payload;
          }
          if (String(state.currentSynaxarium?.id) === String(action.payload.id)) {
            state.currentSynaxarium = action.payload;
          }
        }
      })
      .addCase(updateSynaxarium.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload;
      })
      .addCase(deleteSynaxarium.pending, (state) => {
        state.deleting = true;
        state.error = null;
      })
      .addCase(deleteSynaxarium.fulfilled, (state, action) => {
        state.deleting = false;
        state.synaxariums = state.synaxariums.filter((item) => String(item.id) !== String(action.payload));
        if (String(state.currentSynaxarium?.id) === String(action.payload)) {
          state.currentSynaxarium = null;
          state.readings = [];
          state.readingsTotal = 0;
        }
        if (state.total > 0) {
          state.total -= 1;
        }
      })
      .addCase(deleteSynaxarium.rejected, (state, action) => {
        state.deleting = false;
        state.error = action.payload;
      })
      .addCase(fetchSynaxariumReadings.pending, (state) => {
        state.readingsLoading = true;
        state.error = null;
      })
      .addCase(fetchSynaxariumReadings.fulfilled, (state, action) => {
        state.readingsLoading = false;
        state.readings = (action.payload?.data || []).map(normalizeReading);
        state.readingsTotal = action.payload?.totalCount || action.payload?.data?.length || 0;
      })
      .addCase(fetchSynaxariumReadings.rejected, (state, action) => {
        state.readingsLoading = false;
        state.error = action.payload;
      })
      .addCase(createSynaxariumReading.pending, (state) => {
        state.creatingReading = true;
        state.error = null;
      })
      .addCase(createSynaxariumReading.fulfilled, (state, action) => {
        state.creatingReading = false;
        if (action.payload) {
          state.readings.unshift(action.payload);
          state.readingsTotal += 1;
        }
      })
      .addCase(createSynaxariumReading.rejected, (state, action) => {
        state.creatingReading = false;
        state.error = action.payload;
      })
      .addCase(updateSynaxariumReading.pending, (state) => {
        state.updatingReading = true;
        state.error = null;
      })
      .addCase(updateSynaxariumReading.fulfilled, (state, action) => {
        state.updatingReading = false;
        if (action.payload) {
          const index = state.readings.findIndex((item) => String(item.id) === String(action.payload.id));
          if (index !== -1) {
            state.readings[index] = {
              ...state.readings[index],
              ...action.payload,
            };
          }
        }
      })
      .addCase(updateSynaxariumReading.rejected, (state, action) => {
        state.updatingReading = false;
        state.error = action.payload;
      })
      .addCase(deleteSynaxariumReading.pending, (state) => {
        state.deletingReading = true;
        state.error = null;
      })
      .addCase(deleteSynaxariumReading.fulfilled, (state, action) => {
        state.deletingReading = false;
        state.readings = state.readings.filter((item) => String(item.id) !== String(action.payload));
        if (state.readingsTotal > 0) {
          state.readingsTotal -= 1;
        }
      })
      .addCase(deleteSynaxariumReading.rejected, (state, action) => {
        state.deletingReading = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearCurrentSynaxarium,
  clearSynaxariumReadings,
  clearSynaxariumError,
  setSynaxariumPage,
  setSynaxariumLimit,
} = synaxariumSlice.actions;

export default synaxariumSlice.reducer;
