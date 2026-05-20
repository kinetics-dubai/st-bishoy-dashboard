import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import apiService from "@/services/apiService";
import { buildQuery } from "@/lib/queryHelper";

function normalizeEntitySection(section) {
  return {
    description: section?.description || "",
    description_ar: section?.description_ar || "",
    image: section?.image || "",
  };
}

function normalizeEntityLink(entity) {
  if (!entity) return null;

  return {
    id: entity.id,
    name: entity.name || "",
    name_ar: entity.name_ar || "",
    excerpt: entity.excerpt || "",
    excerpt_ar: entity.excerpt_ar || "",
    thumbnail: entity.thumbnail || "",
    hasDetails: Boolean(entity.hasDetails),
    parentId: entity.parentId ?? null,
  };
}

function normalizeEntity(entity) {
  if (!entity) return entity;

  const normalizedChildren = Array.isArray(entity.children)
    ? entity.children.map(normalizeEntityLink).filter(Boolean)
    : [];

  const normalizedParent = entity.parent
    ? normalizeEntityLink(entity.parent)
    : null;
  const overview = normalizeEntitySection(entity.overview);
  const history = normalizeEntitySection(entity.history);
  const details = normalizeEntitySection(entity.details);
  const location = normalizeEntitySection(entity.location);
  const landmarks = normalizeEntitySection(entity.landmarks);

  return {
    id: entity.id,
    name: entity.name || "",
    name_ar: entity.name_ar || "",
    excerpt: entity.excerpt || "",
    excerpt_ar: entity.excerpt_ar || "",
    cover_image: entity.cover_image || "",
    overview_description: entity.overview_description || overview.description,
    overview_description_ar:
      entity.overview_description_ar || overview.description_ar,
    overview_image: entity.overview_image || overview.image,
    entity_history: entity.entity_history || history.description,
    entity_history_ar: entity.entity_history_ar || history.description_ar,
    entity_history_image: entity.entity_history_image || history.image,
    entity_description: entity.entity_description || details.description,
    entity_description_ar:
      entity.entity_description_ar || details.description_ar,
    entity_description_image: entity.entity_description_image || details.image,
    entity_location_description:
      entity.entity_location_description || location.description,
    entity_location_description_ar:
      entity.entity_location_description_ar || location.description_ar,
    entity_landmarks_description:
      entity.entity_landmarks_description || landmarks.description,
    entity_landmarks_description_ar:
      entity.entity_landmarks_description_ar || landmarks.description_ar,
    entity_landmarks_image: entity.entity_landmarks_image || landmarks.image,
    thumbnail: entity.thumbnail || "",
    hasDetails: Boolean(entity.hasDetails),
    parentId: entity.parentId ?? normalizedParent?.id ?? null,
    parent: normalizedParent,
    children: normalizedChildren,
    childrenCount:
      typeof entity.childrenCount === "number"
        ? entity.childrenCount
        : normalizedChildren.length,
    gallery: entity.gallery || null,
  };
}

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
  currentListRequestId: null,
};

export const fetchEntities = createAsyncThunk(
  "entities/fetchEntities",
  async (params = {}, { rejectWithValue }) => {
    try {
      const queryString = buildQuery(params);
      const url = queryString ? `/entities?${queryString}` : "/entities";
      const response = await apiService.get(url);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const fetchEntity = createAsyncThunk(
  "entities/fetchEntity",
  async (id, { rejectWithValue }) => {
    try {
      const response = await apiService.get(`/entities/${id}`);
      return normalizeEntity(response.data?.data || response.data);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const createEntity = createAsyncThunk(
  "entities/createEntity",
  async (data, { rejectWithValue }) => {
    try {
      const response = await apiService.post("/entities", data);
      return normalizeEntity(response.data?.data || response.data);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const updateEntity = createAsyncThunk(
  "entities/updateEntity",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await apiService.put(`/entities/${id}`, data);
      return normalizeEntity(response.data?.data || response.data);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const deleteEntity = createAsyncThunk(
  "entities/deleteEntity",
  async (id, { rejectWithValue }) => {
    try {
      await apiService.delete(`/entities/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

const entitiesSlice = createSlice({
  name: "entities",
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
      .addCase(fetchEntities.pending, (state, action) => {
        state.loading = true;
        state.error = null;
        state.currentListRequestId = action.meta.requestId;
      })
      .addCase(fetchEntities.fulfilled, (state, action) => {
        if (state.currentListRequestId !== action.meta.requestId) {
          return;
        }

        state.loading = false;
        state.entities = (action.payload?.data || []).map(normalizeEntity);
        state.total =
          action.payload?.totalCount || action.payload?.data?.length || 0;
        state.currentListRequestId = null;
      })
      .addCase(fetchEntities.rejected, (state, action) => {
        if (state.currentListRequestId !== action.meta.requestId) {
          return;
        }

        state.loading = false;
        state.error = action.payload;
        state.currentListRequestId = null;
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
          const index = state.entities.findIndex(
            (entity) => entity.id === action.payload.id,
          );
          if (index !== -1) {
            state.entities[index] = action.payload;
          }
          if (state.currentEntity?.id === action.payload.id) {
            state.currentEntity = action.payload;
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
        state.entities = state.entities.filter(
          (entity) => entity.id !== action.payload,
        );
        if (state.total > 0) {
          state.total -= 1;
        }
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

export const { clearCurrentEntity, clearError, setPage, setLimit } =
  entitiesSlice.actions;
export default entitiesSlice.reducer;
