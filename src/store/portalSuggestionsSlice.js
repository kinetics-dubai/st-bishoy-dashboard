import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import apiService from '@/services/apiService';
import { buildQuery } from '@/lib/queryHelper';

export const fetchPortalSuggestions = createAsyncThunk(
  'portalSuggestions/fetchPortalSuggestions',
  async (params = {}, { rejectWithValue }) => {
    try {
      const queryString = buildQuery(params);
      const url = queryString ? `/portal-suggestions?${queryString}` : '/portal-suggestions';
      const response = await apiService.get(url);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createPortalSuggestion = createAsyncThunk(
  'portalSuggestions/createPortalSuggestion',
  async (data, { rejectWithValue }) => {
    try {
      const response = await apiService.post('/portal-suggestions', data);
      return response.data?.data || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updatePortalSuggestion = createAsyncThunk(
  'portalSuggestions/updatePortalSuggestion',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await apiService.patch(`/portal-suggestions/${id}`, data);
      return response.data?.data || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deletePortalSuggestion = createAsyncThunk(
  'portalSuggestions/deletePortalSuggestion',
  async (id, { rejectWithValue }) => {
    try {
      await apiService.delete(`/portal-suggestions/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const initialState = {
  suggestions: [],
  page: 1,
  limit: 10,
  total: 0,
  loading: false,
  creating: false,
  updating: false,
  deleting: false,
  error: null,
};

const portalSuggestionsSlice = createSlice({
  name: 'portalSuggestions',
  initialState,
  reducers: {
    clearPortalSuggestionsError: (state) => {
      state.error = null;
    },
    setPortalSuggestionsPage: (state, action) => {
      state.page = action.payload;
    },
    setPortalSuggestionsLimit: (state, action) => {
      state.limit = action.payload;
      state.page = 1;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPortalSuggestions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPortalSuggestions.fulfilled, (state, action) => {
        state.loading = false;
        state.suggestions = action.payload?.data || [];
        state.total = action.payload?.totalCount || action.payload?.data?.length || 0;
        state.page = action.payload?.page || state.page;
        state.limit = action.payload?.limit || state.limit;
      })
      .addCase(fetchPortalSuggestions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createPortalSuggestion.pending, (state) => {
        state.creating = true;
        state.error = null;
      })
      .addCase(createPortalSuggestion.fulfilled, (state) => {
        state.creating = false;
      })
      .addCase(createPortalSuggestion.rejected, (state, action) => {
        state.creating = false;
        state.error = action.payload;
      })
      .addCase(updatePortalSuggestion.pending, (state) => {
        state.updating = true;
        state.error = null;
      })
      .addCase(updatePortalSuggestion.fulfilled, (state) => {
        state.updating = false;
      })
      .addCase(updatePortalSuggestion.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload;
      })
      .addCase(deletePortalSuggestion.pending, (state) => {
        state.deleting = true;
        state.error = null;
      })
      .addCase(deletePortalSuggestion.fulfilled, (state, action) => {
        state.deleting = false;
        state.suggestions = state.suggestions.filter((item) => item.id !== action.payload);
        state.total = Math.max(0, state.total - 1);
      })
      .addCase(deletePortalSuggestion.rejected, (state, action) => {
        state.deleting = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearPortalSuggestionsError,
  setPortalSuggestionsPage,
  setPortalSuggestionsLimit,
} = portalSuggestionsSlice.actions;

export default portalSuggestionsSlice.reducer;
