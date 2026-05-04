import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import apiService from '@/services/apiService';
import { buildQuery } from '@/lib/queryHelper';

const normalizeSaint = (saint) => {
  if (!saint) return saint;

  const base = saint.base || saint;
  const translation = saint.translation || {};

  return {
    ...saint,
    id: base.id ?? saint.id,
    slug: base.slug ?? saint.slug,
    image: base.image ?? saint.image ?? null,
    saint_day: base.saint_day ?? saint.saint_day ?? null,
    isActive: base.isActive ?? saint.isActive ?? false,
    publishedAt: base.publishedAt ?? saint.publishedAt ?? null,
    name: translation.name ?? saint.name ?? '',
    subtitle: translation.subtitle ?? saint.subtitle ?? null,
    biography: translation.biography ?? saint.biography ?? null,
    excerpt: translation.excerpt ?? saint.excerpt ?? null,
    translation_id: translation.id ?? saint.translation_id ?? null,
    language_id: translation.language_id ?? saint.language_id ?? null,
    translation_missing: saint.translation_missing ?? false,
    base,
    translation,
  };
};

const normalizeSaintTranslation = (translation) => {
  if (!translation) return translation;

  return {
    ...translation,
    id: translation.id ?? translation.translation?.id,
    name: translation.name ?? translation.translation?.name ?? '',
    subtitle: translation.subtitle ?? translation.translation?.subtitle ?? null,
    biography: translation.biography ?? translation.translation?.biography ?? null,
    excerpt: translation.excerpt ?? translation.translation?.excerpt ?? null,
    language_id: translation.language_id ?? translation.translation?.language_id ?? null,
    saint_id: translation.saint_id ?? translation.translation?.saint_id ?? null,
    language: translation.language ?? translation.translation?.language ?? null,
    saint: translation.saint ?? translation.translation?.saint ?? null,
  };
};

export const fetchSaints = createAsyncThunk(
  'saints/fetchSaints',
  async (params = {}, { rejectWithValue }) => {
    try {
      const queryString = buildQuery(params);
      const url = queryString ? `/saints?${queryString}` : '/saints';
      const response = await apiService.get(url);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchSaint = createAsyncThunk(
  'saints/fetchSaint',
  async (id, { rejectWithValue }) => {
    try {
      const response = await apiService.get(`/saints/${id}`);
      return normalizeSaint(response.data?.data);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createSaint = createAsyncThunk(
  'saints/createSaint',
  async (data, { rejectWithValue }) => {
    try {
      const response = await apiService.post('/saints', data);
      return normalizeSaint(response.data?.data || response.data);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateSaint = createAsyncThunk(
  'saints/updateSaint',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await apiService.patch(`/saints/${id}`, data);
      return normalizeSaint(response.data?.data || response.data);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteSaint = createAsyncThunk(
  'saints/deleteSaint',
  async (id, { rejectWithValue }) => {
    try {
      await apiService.delete(`/saints/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchSaintTranslations = createAsyncThunk(
  'saints/fetchSaintTranslations',
  async (id, { rejectWithValue }) => {
    try {
      const response = await apiService.get(`/saints/${id}/translations`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createSaintTranslation = createAsyncThunk(
  'saints/createSaintTranslation',
  async (data, { rejectWithValue }) => {
    try {
      const response = await apiService.post('/saints-translations', data);
      return normalizeSaintTranslation(response.data?.data || response.data);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateSaintTranslation = createAsyncThunk(
  'saints/updateSaintTranslation',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await apiService.patch(`/saints-translations/${id}`, data);
      return normalizeSaintTranslation(response.data?.data || response.data);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteSaintTranslation = createAsyncThunk(
  'saints/deleteSaintTranslation',
  async (id, { rejectWithValue }) => {
    try {
      await apiService.delete(`/saints-translations/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const initialState = {
  saints: [],
  currentSaint: null,
  currentSaintTranslations: [],
  page: 1,
  limit: 10,
  total: 0,
  loading: false,
  translationsLoading: false,
  creating: false,
  updating: false,
  deleting: false,
  creatingTranslation: false,
  updatingTranslation: false,
  deletingTranslation: false,
  error: null,
};

const saintsSlice = createSlice({
  name: 'saints',
  initialState,
  reducers: {
    clearCurrentSaint: (state) => {
      state.currentSaint = null;
    },
    clearCurrentSaintTranslations: (state) => {
      state.currentSaintTranslations = [];
    },
    clearSaintError: (state) => {
      state.error = null;
    },
    setSaintsPage: (state, action) => {
      state.page = action.payload;
    },
    setSaintsLimit: (state, action) => {
      state.limit = action.payload;
      state.page = 1;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSaints.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSaints.fulfilled, (state, action) => {
        state.loading = false;
        state.saints = (action.payload?.data || []).map(normalizeSaint);
        state.total = action.payload?.totalCount || action.payload?.data?.length || 0;
      })
      .addCase(fetchSaints.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchSaint.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSaint.fulfilled, (state, action) => {
        state.loading = false;
        state.currentSaint = action.payload;
      })
      .addCase(fetchSaint.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createSaint.pending, (state) => {
        state.creating = true;
        state.error = null;
      })
      .addCase(createSaint.fulfilled, (state, action) => {
        state.creating = false;
        if (action.payload) {
          state.saints.unshift(action.payload);
          state.total += 1;
        }
      })
      .addCase(createSaint.rejected, (state, action) => {
        state.creating = false;
        state.error = action.payload;
      })
      .addCase(updateSaint.pending, (state) => {
        state.updating = true;
        state.error = null;
      })
      .addCase(updateSaint.fulfilled, (state, action) => {
        state.updating = false;
        if (action.payload) {
          const index = state.saints.findIndex((saint) => saint.id === action.payload.id);
          if (index !== -1) {
            state.saints[index] = action.payload;
          }
          if (String(state.currentSaint?.id) === String(action.payload.id)) {
            state.currentSaint = action.payload;
          }
        }
      })
      .addCase(updateSaint.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload;
      })
      .addCase(deleteSaint.pending, (state) => {
        state.deleting = true;
        state.error = null;
      })
      .addCase(deleteSaint.fulfilled, (state, action) => {
        state.deleting = false;
        state.saints = state.saints.filter((saint) => saint.id !== action.payload);
        state.currentSaintTranslations = String(state.currentSaint?.id) === String(action.payload)
          ? []
          : state.currentSaintTranslations;
        if (state.total > 0) {
          state.total -= 1;
        }
        if (String(state.currentSaint?.id) === String(action.payload)) {
          state.currentSaint = null;
        }
      })
      .addCase(deleteSaint.rejected, (state, action) => {
        state.deleting = false;
        state.error = action.payload;
      })
      .addCase(fetchSaintTranslations.pending, (state) => {
        state.translationsLoading = true;
        state.error = null;
      })
      .addCase(fetchSaintTranslations.fulfilled, (state, action) => {
        state.translationsLoading = false;
        state.currentSaintTranslations = (action.payload?.data || []).map(normalizeSaintTranslation);
      })
      .addCase(fetchSaintTranslations.rejected, (state, action) => {
        state.translationsLoading = false;
        state.error = action.payload;
      })
      .addCase(createSaintTranslation.pending, (state) => {
        state.creatingTranslation = true;
        state.error = null;
      })
      .addCase(createSaintTranslation.fulfilled, (state, action) => {
        state.creatingTranslation = false;
        if (action.payload) {
          state.currentSaintTranslations.push(action.payload);
        }
      })
      .addCase(createSaintTranslation.rejected, (state, action) => {
        state.creatingTranslation = false;
        state.error = action.payload;
      })
      .addCase(updateSaintTranslation.pending, (state) => {
        state.updatingTranslation = true;
        state.error = null;
      })
      .addCase(updateSaintTranslation.fulfilled, (state, action) => {
        state.updatingTranslation = false;
        if (action.payload) {
          const index = state.currentSaintTranslations.findIndex(
            (translation) => translation.id === action.payload.id
          );
          if (index !== -1) {
            state.currentSaintTranslations[index] = action.payload;
          }
        }
      })
      .addCase(updateSaintTranslation.rejected, (state, action) => {
        state.updatingTranslation = false;
        state.error = action.payload;
      })
      .addCase(deleteSaintTranslation.pending, (state) => {
        state.deletingTranslation = true;
        state.error = null;
      })
      .addCase(deleteSaintTranslation.fulfilled, (state, action) => {
        state.deletingTranslation = false;
        state.currentSaintTranslations = state.currentSaintTranslations.filter(
          (translation) => translation.id !== action.payload
        );
      })
      .addCase(deleteSaintTranslation.rejected, (state, action) => {
        state.deletingTranslation = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearCurrentSaint,
  clearCurrentSaintTranslations,
  clearSaintError,
  setSaintsPage,
  setSaintsLimit,
} = saintsSlice.actions;

export default saintsSlice.reducer;
