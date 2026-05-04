import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiService from '@/services/apiService';
import { buildQuery } from '@/lib/queryHelper';

const normalizeTag = (tag) => {
  if (!tag) return null;

  return {
    ...tag,
    id: tag.base?.id ?? tag.id,
    slug: tag.base?.slug ?? tag.slug,
    category: tag.base?.category ?? tag.category,
    name: tag.translation?.name ?? tag.name,
    language_id: tag.translation?.language_id ?? tag.language_id,
    translation_missing: tag.translation_missing ?? false,
  };
};

const normalizeEntity = (entity) => {
  if (!entity) return entity;

  const base = entity.base || entity;
  const translation = entity.translation || {};

  return {
    ...entity,
    base: {
      ...base,
      id: base.id ?? entity.id,
      tags: (base.tags || entity.tags || []).map(normalizeTag).filter(Boolean),
    },
    translation,
    id: base.id ?? entity.id,
    slug: base.slug ?? entity.slug,
    category: base.category ?? entity.category,
    logo: base.logo ?? entity.logo ?? null,
    isActive: base.isActive ?? entity.isActive ?? false,
    social_links: base.social_links ?? entity.social_links ?? null,
    location: base.location ?? entity.location ?? null,
    publishedAt: base.publishedAt ?? entity.publishedAt ?? null,
    name: translation.name ?? entity.name ?? base.name ?? '',
    translation_id: translation.id ?? entity.translation_id ?? null,
    language_id: translation.language_id ?? entity.language_id ?? null,
    dynamic_data: translation.dynamic_data ?? entity.dynamic_data ?? null,
    translation_missing: entity.translation_missing ?? false,
    tags: (base.tags || entity.tags || []).map(normalizeTag).filter(Boolean),
  };
};

const initialState = {
  entities: [],
  currentEntity: null,
  page: 1,
  limit: 10,
  total: 0,
  loading: false,
  error: null,
  creating: false,
  updating: false,
  deleting: false,
};

export const fetchEntities = createAsyncThunk(
  'entities/fetchEntities',
  async (params = {}, { rejectWithValue }) => {
    try {
      const queryString = buildQuery(params);
      const url = queryString ? `/entities?${queryString}` : '/entities';
      const response = await apiService.get(url);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchEntity = createAsyncThunk(
  'entities/fetchEntity',
  async (id, { rejectWithValue }) => {
    try {
      const response = await apiService.get(`/entities/${id}`);
      return normalizeEntity(response.data?.data || response.data);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createEntity = createAsyncThunk(
  'entities/createEntity',
  async (data, { rejectWithValue }) => {
    try {
      const response = await apiService.post('/entities', data);
      return normalizeEntity(response.data?.data || response.data);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateEntity = createAsyncThunk(
  'entities/updateEntity',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await apiService.patch(`/entities/${id}`, data);
      return normalizeEntity(response.data?.data || response.data);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteEntity = createAsyncThunk(
  'entities/deleteEntity',
  async (id, { rejectWithValue }) => {
    try {
      await apiService.delete(`/entities/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const entitiesSlice = createSlice({
  name: 'entities',
  initialState,
  reducers: {
    clearCurrentEntity: (state) => {
      state.currentEntity = null;
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
      .addCase(fetchEntities.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEntities.fulfilled, (state, action) => {
        state.loading = false;
        state.entities = (action.payload?.data || []).map(normalizeEntity);
        state.total = action.payload?.totalCount || action.payload?.data?.length || 0;
      })
      .addCase(fetchEntities.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchEntity.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEntity.fulfilled, (state, action) => {
        state.loading = false;
        state.currentEntity = action.payload;
      })
      .addCase(fetchEntity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createEntity.pending, (state) => {
        state.creating = true;
        state.error = null;
      })
      .addCase(createEntity.fulfilled, (state, action) => {
        state.creating = false;
        if (action.payload) {
          state.entities.unshift(action.payload);
          state.total += 1;
        }
      })
      .addCase(createEntity.rejected, (state, action) => {
        state.creating = false;
        state.error = action.payload;
      })
      .addCase(updateEntity.pending, (state) => {
        state.updating = true;
        state.error = null;
      })
      .addCase(updateEntity.fulfilled, (state, action) => {
        state.updating = false;
        if (action.payload) {
          const index = state.entities.findIndex((entity) => entity.id === action.payload.id);
          if (index !== -1) {
            state.entities[index] = action.payload;
          }
          if (state.currentEntity?.id === action.payload.id) {
            state.currentEntity = {
              ...state.currentEntity,
              ...action.payload,
              base: {
                ...state.currentEntity.base,
                ...action.payload.base,
              },
            };
          }
        }
      })
      .addCase(updateEntity.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload;
      })
      .addCase(deleteEntity.pending, (state) => {
        state.deleting = true;
        state.error = null;
      })
      .addCase(deleteEntity.fulfilled, (state, action) => {
        state.deleting = false;
        state.entities = state.entities.filter((entity) => entity.id !== action.payload);
        if (state.total > 0) state.total -= 1;
        if (state.currentEntity?.id === action.payload) {
          state.currentEntity = null;
        }
      })
      .addCase(deleteEntity.rejected, (state, action) => {
        state.deleting = false;
        state.error = action.payload;
      });
  },
});

export const { clearCurrentEntity, clearError, setPage, setLimit } = entitiesSlice.actions;
export default entitiesSlice.reducer;
