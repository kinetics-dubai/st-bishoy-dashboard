import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import apiService from '@/services/apiService';
import { buildQuery } from '@/lib/queryHelper';

const normalizeArticle = (article) => {
  if (!article) return article;
  return {
    id: article.id,
    title: article.title || '',
    title_ar: article.title_ar || '',
    content: article.content || '',
    content_ar: article.content_ar || '',
    cover_image: article.cover_image || '',
    thumbnail: article.thumbnail || '',
    published: Boolean(article.published),
  };
};

export const fetchArticles = createAsyncThunk(
  'articles/fetchArticles',
  async (params = {}, { rejectWithValue }) => {
    try {
      const queryString = buildQuery(params);
      const url = queryString ? `/articles/admin?${queryString}` : '/articles/admin';
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
      const response = await apiService.get(`/articles/admin/${id}`);
      return normalizeArticle(response.data?.data || response.data);
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
      return normalizeArticle(response.data?.data || response.data);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateArticle = createAsyncThunk(
  'articles/updateArticle',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await apiService.put(`/articles/${id}`, data);
      return normalizeArticle(response.data?.data || response.data);
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
  creating: false,
  updating: false,
  deleting: false,
  error: null,
  currentListRequestId: null,
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
      .addCase(fetchArticles.pending, (state, action) => {
        state.loading = true;
        state.error = null;
        state.currentListRequestId = action.meta.requestId;
      })
      .addCase(fetchArticles.fulfilled, (state, action) => {
        if (state.currentListRequestId !== action.meta.requestId) return;
        state.loading = false;
        state.articles = (action.payload?.data || []).map(normalizeArticle);
        state.total = action.payload?.pagination?.total || action.payload?.data?.length || 0;
        state.currentListRequestId = null;
      })
      .addCase(fetchArticles.rejected, (state, action) => {
        if (state.currentListRequestId !== action.meta.requestId) return;
        state.loading = false;
        state.error = action.payload;
        state.currentListRequestId = null;
      })
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
      .addCase(createArticle.pending, (state) => {
        state.creating = true;
        state.error = null;
      })
      .addCase(createArticle.fulfilled, (state, action) => {
        state.creating = false;
        if (action.payload) {
          state.articles.unshift(action.payload);
          state.total += 1;
        }
      })
      .addCase(createArticle.rejected, (state, action) => {
        state.creating = false;
        state.error = action.payload;
      })
      .addCase(updateArticle.pending, (state) => {
        state.updating = true;
        state.error = null;
      })
      .addCase(updateArticle.fulfilled, (state, action) => {
        state.updating = false;
        if (action.payload) {
          const index = state.articles.findIndex((a) => a.id === action.payload.id);
          if (index !== -1) state.articles[index] = action.payload;
          if (String(state.currentArticle?.id) === String(action.payload.id)) {
            state.currentArticle = action.payload;
          }
        }
      })
      .addCase(updateArticle.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload;
      })
      .addCase(deleteArticle.pending, (state) => {
        state.deleting = true;
        state.error = null;
      })
      .addCase(deleteArticle.fulfilled, (state, action) => {
        state.deleting = false;
        state.articles = state.articles.filter((a) => a.id !== action.payload);
        if (state.total > 0) state.total -= 1;
        if (String(state.currentArticle?.id) === String(action.payload)) {
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
