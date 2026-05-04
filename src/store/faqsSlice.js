import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiService from '@/services/apiService';
import { buildQuery } from '@/lib/queryHelper';

export const fetchFaqs = createAsyncThunk(
  'faqs/fetchFaqs',
  async (params = {}, { rejectWithValue }) => {
    try {
      const queryString = buildQuery(params);
      const url = queryString ? `/faqs?${queryString}` : '/faqs';
      const response = await apiService.get(url);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchFaq = createAsyncThunk(
  'faqs/fetchFaq',
  async (id, { rejectWithValue }) => {
    try {
      const response = await apiService.get(`/faqs/${id}`);
      return response.data?.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createFaq = createAsyncThunk(
  'faqs/createFaq',
  async (data, { rejectWithValue }) => {
    try {
      const response = await apiService.post('/faqs', data);
      return response.data?.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateFaq = createAsyncThunk(
  'faqs/updateFaq',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      // Since there's no individual update endpoint, we'll need to handle this differently
      // For now, let's assume the API supports PATCH /faqs/{id} based on your description
      const response = await apiService.patch(`/faqs/${id}`, data);
      return response.data?.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteFaq = createAsyncThunk(
  'faqs/deleteFaq',
  async (id, { rejectWithValue }) => {
    try {
      // Since there's no individual delete endpoint, we'll need to handle this differently
      // For now, let's assume the API supports DELETE /faqs/{id} based on your description
      await apiService.delete(`/faqs/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const initialState = {
  faqs: [],
  currentFaq: null,
  page: 1,
  limit: 10,
  total: 0,
  loading: false,
  error: null,
  creating: false,
  updating: false,
  deleting: false,
};

const faqsSlice = createSlice({
  name: 'faqs',
  initialState,
  reducers: {
    clearCurrentFaq: (state) => {
      state.currentFaq = null;
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
      // Fetch FAQs
      .addCase(fetchFaqs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFaqs.fulfilled, (state, action) => {
        state.loading = false;
        state.faqs = action.payload?.data || [];
        state.total = action.payload?.totalCount || action.payload?.data?.length || 0;
      })
      .addCase(fetchFaqs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch Single FAQ
      .addCase(fetchFaq.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFaq.fulfilled, (state, action) => {
        state.loading = false;
        state.currentFaq = action.payload;
      })
      .addCase(fetchFaq.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create FAQ
      .addCase(createFaq.pending, (state) => {
        state.creating = true;
        state.error = null;
      })
      .addCase(createFaq.fulfilled, (state, action) => {
        state.creating = false;
        if (action.payload) {
          state.faqs.push(action.payload);
          state.total += 1;
        }
      })
      .addCase(createFaq.rejected, (state, action) => {
        state.creating = false;
        state.error = action.payload;
      })
      
      // Update FAQ
      .addCase(updateFaq.pending, (state) => {
        state.updating = true;
        state.error = null;
      })
      .addCase(updateFaq.fulfilled, (state, action) => {
        state.updating = false;
        if (action.payload) {
          const index = state.faqs.findIndex(f => f.id === action.payload.id);
          if (index !== -1) {
            state.faqs[index] = action.payload;
          }
          if (state.currentFaq?.id === action.payload.id) {
            state.currentFaq = action.payload;
          }
        }
      })
      .addCase(updateFaq.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload;
      })
      
      // Delete FAQ
      .addCase(deleteFaq.pending, (state) => {
        state.deleting = true;
        state.error = null;
      })
      .addCase(deleteFaq.fulfilled, (state, action) => {
        state.deleting = false;
        state.faqs = state.faqs.filter(f => f.id !== action.payload);
        if (state.total > 0) state.total -= 1;
        if (state.currentFaq?.id === action.payload) {
          state.currentFaq = null;
        }
      })
      .addCase(deleteFaq.rejected, (state, action) => {
        state.deleting = false;
        state.error = action.payload;
      });
  },
});

export const { clearCurrentFaq, clearError, setPage, setLimit, setTotal } = faqsSlice.actions;
export default faqsSlice.reducer;
