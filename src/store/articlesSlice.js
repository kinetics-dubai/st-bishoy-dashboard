import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiService from '@/services/apiService';
import { buildQuery } from '@/lib/queryHelper';

export const fetchArticles = createAsyncThunk(
  'articles/fetchArticles',
  async (params = {}, { rejectWithValue }) => {
    try {
      const queryString = buildQuery(params);
      const url = queryString ? `/articles?${queryString}` : '/articles';
      const response = await apiService.get(url);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchArticle = createAsyncThunk(
  'articles/fetchArticle',
  async (id, { rejectWithValue }) => {
    try {
      const response = await apiService.get(`/articles/${id}`);
      return response.data?.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createArticle = createAsyncThunk(
  'articles/createArticle',
  async (data, { rejectWithValue }) => {
    try {
      const response = await apiService.post('/articles', data);
      return response.data?.data || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateArticle = createAsyncThunk(
  'articles/updateArticle',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await apiService.patch(`/articles/${id}`, data);
      return response.data?.data || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteArticle = createAsyncThunk(
  'articles/deleteArticle',
  async (id, { rejectWithValue }) => {
    try {
      await apiService.delete(`/articles/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const initialState = {
  articles: [],
  currentArticle: null,
  page: 1,
  limit: 10,
  total: 0,
  loading: false,
  error: null,
  creating: false,
  updating: false,
  deleting: false,
};

const articlesSlice = createSlice({
  name: 'articles',
  initialState,
  reducers: {
    clearCurrentArticle: (state) => {
      state.currentArticle = null;
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
  },
  extraReducers: (builder) => {
    builder
      // Fetch Articles
      .addCase(fetchArticles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchArticles.fulfilled, (state, action) => {
        state.loading = false;
        state.articles = action.payload?.data || [];
        state.total = action.payload?.totalCount || action.payload?.data?.length || 0;
      })
      .addCase(fetchArticles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch Single Article
      .addCase(fetchArticle.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchArticle.fulfilled, (state, action) => {
        state.loading = false;
        state.currentArticle = action.payload;
      })
      .addCase(fetchArticle.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create Article
      .addCase(createArticle.pending, (state) => {
        state.creating = true;
        state.error = null;
      })
      .addCase(createArticle.fulfilled, (state, action) => {
        state.creating = false;
        if (action.payload) {
          state.articles.push(action.payload);
          state.total += 1;
        }
      })
      .addCase(createArticle.rejected, (state, action) => {
        state.creating = false;
        state.error = action.payload;
      })
      
      // Update Article
      .addCase(updateArticle.pending, (state) => {
        state.updating = true;
        state.error = null;
      })
      .addCase(updateArticle.fulfilled, (state, action) => {
        state.updating = false;
        if (action.payload) {
          const index = state.articles.findIndex(a => a.base?.id === action.payload.base?.id);
          if (index !== -1) {
            state.articles[index] = action.payload;
          }
          if (state.currentArticle?.base?.id === action.payload.base?.id) {
            state.currentArticle = action.payload;
          }
        }
      })
      .addCase(updateArticle.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload;
      })
      
      // Delete Article
      .addCase(deleteArticle.pending, (state) => {
        state.deleting = true;
        state.error = null;
      })
      .addCase(deleteArticle.fulfilled, (state, action) => {
        state.deleting = false;
        state.articles = state.articles.filter(a => a.base?.id !== action.payload);
        if (state.total > 0) state.total -= 1;
        if (state.currentArticle?.base?.id === action.payload) {
          state.currentArticle = null;
        }
      })
      .addCase(deleteArticle.rejected, (state, action) => {
        state.deleting = false;
        state.error = action.payload;
      });
  },
});

export const { clearCurrentArticle, clearError, setPage, setLimit } = articlesSlice.actions;
export default articlesSlice.reducer;
