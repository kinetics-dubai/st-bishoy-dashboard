import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiService from '@/services/apiService';
import { buildQuery } from '@/lib/queryHelper';

const normalizeTag = (tag) => {
  if (!tag) return tag;

  const hasNestedShape = tag.base || tag.translation;
  if (!hasNestedShape) return tag;

  return {
    ...tag,
    id: tag.base?.id ?? tag.id,
    slug: tag.base?.slug ?? tag.slug,
    category: tag.base?.category ?? tag.category,
    name: tag.translation?.name ?? tag.name,
    translation_id: tag.translation?.id ?? tag.translation_id,
    language_id: tag.translation?.language_id ?? tag.language_id,
    publishedAt: tag.translation?.publishedAt ?? tag.publishedAt,
    translation_missing: tag.translation_missing ?? false,
  };
};

const normalizeTags = (tags = []) => tags.map(normalizeTag);

export const fetchTags = createAsyncThunk(
  'tags/fetchTags',
  async (params = {}, { rejectWithValue }) => {
    try {
      const queryString = buildQuery(params);
      const url = queryString ? `/tags?${queryString}` : '/tags';
      const response = await apiService.get(url);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchTag = createAsyncThunk(
  'tags/fetchTag',
  async (id, { rejectWithValue }) => {
    try {
      const response = await apiService.get(`/tags/${id}`);
      return normalizeTag(response.data?.data);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createTag = createAsyncThunk(
  'tags/createTag',
  async (data, { rejectWithValue }) => {
    try {
      const response = await apiService.post('/tags', data);
      return normalizeTag(response.data?.data || response.data);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateTag = createAsyncThunk(
  'tags/updateTag',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await apiService.put(`/tags/${id}`, data);
      return normalizeTag(response.data?.data || response.data);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteTag = createAsyncThunk(
  'tags/deleteTag',
  async (id, { rejectWithValue }) => {
    try {
      await apiService.delete(`/tags/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const initialState = {
  tags: [],
  currentTag: null,
  page: 1,
  limit: 10,
  total: 0,
  loading: false,
  error: null,
  creating: false,
  updating: false,
  deleting: false,
};

const tagsSlice = createSlice({
  name: 'tags',
  initialState,
  reducers: {
    clearCurrentTag: (state) => {
      state.currentTag = null;
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
      // Fetch Tags
      .addCase(fetchTags.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTags.fulfilled, (state, action) => {
        state.loading = false;
        state.tags = normalizeTags(action.payload?.data || []);
        state.total = action.payload?.totalCount || action.payload?.data?.length || 0;
      })
      .addCase(fetchTags.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch Single Tag
      .addCase(fetchTag.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTag.fulfilled, (state, action) => {
        state.loading = false;
        state.currentTag = action.payload;
      })
      .addCase(fetchTag.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create Tag
      .addCase(createTag.pending, (state) => {
        state.creating = true;
        state.error = null;
      })
      .addCase(createTag.fulfilled, (state, action) => {
        state.creating = false;
        if (action.payload) {
          state.tags.push(action.payload);
          state.total += 1;
        }
      })
      .addCase(createTag.rejected, (state, action) => {
        state.creating = false;
        state.error = action.payload;
      })
      
      // Update Tag
      .addCase(updateTag.pending, (state) => {
        state.updating = true;
        state.error = null;
      })
      .addCase(updateTag.fulfilled, (state, action) => {
        state.updating = false;
        if (action.payload) {
          const index = state.tags.findIndex(t => t.id === action.payload.id);
          if (index !== -1) {
            state.tags[index] = action.payload;
          }
          if (state.currentTag?.id === action.payload.id) {
            state.currentTag = action.payload;
          }
        }
      })
      .addCase(updateTag.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload;
      })
      
      // Delete Tag
      .addCase(deleteTag.pending, (state) => {
        state.deleting = true;
        state.error = null;
      })
      .addCase(deleteTag.fulfilled, (state, action) => {
        state.deleting = false;
        state.tags = state.tags.filter(t => t.id !== action.payload);
        if (state.total > 0) state.total -= 1;
        if (state.currentTag?.id === action.payload) {
          state.currentTag = null;
        }
      })
      .addCase(deleteTag.rejected, (state, action) => {
        state.deleting = false;
        state.error = action.payload;
      });
  },
});

export const { clearCurrentTag, clearError, setPage, setLimit, setTotal } = tagsSlice.actions;
export default tagsSlice.reducer;
