import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import apiService from "@/services/apiService";

export const fetchGalleryByEntity = createAsyncThunk(
  "galleries/fetchByEntity",
  async (entityId, { rejectWithValue }) => {
    try {
      const response = await apiService.get(`/entities/${entityId}`);
      const data = response.data?.data || response.data;
      return data?.gallery || null;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const createGallery = createAsyncThunk(
  "galleries/create",
  async ({ record_id, title, title_ar }, { rejectWithValue }) => {
    try {
      const response = await apiService.post("/galleries", { record_model: "ENTITY", record_id, title, title_ar });
      return response.data?.data || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const updateGalleryTitles = createAsyncThunk(
  "galleries/updateTitles",
  async ({ id, title, title_ar }, { rejectWithValue }) => {
    try {
      const response = await apiService.put(`/galleries/${id}`, { title, title_ar });
      return response.data?.data || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const deleteGallery = createAsyncThunk(
  "galleries/delete",
  async (id, { rejectWithValue }) => {
    try {
      await apiService.delete(`/galleries/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const bulkAddGalleryItems = createAsyncThunk(
  "galleries/bulkAddItems",
  async ({ galleryId, items }, { rejectWithValue }) => {
    try {
      const response = await apiService.post(`/galleries/${galleryId}/items/bulk`, { items });
      return response.data?.data || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const updateGalleryItem = createAsyncThunk(
  "galleries/updateItem",
  async ({ galleryId, itemId, ...data }, { rejectWithValue }) => {
    try {
      const response = await apiService.put(`/galleries/${galleryId}/items/${itemId}`, data);
      return response.data?.data || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const deleteGalleryItem = createAsyncThunk(
  "galleries/deleteItem",
  async ({ galleryId, itemId }, { rejectWithValue }) => {
    try {
      await apiService.delete(`/galleries/${galleryId}/items/${itemId}`);
      return itemId;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

const galleriesSlice = createSlice({
  name: "galleries",
  initialState: {
    currentGallery: null,
    loading: false,
    creating: false,
    updating: false,
    deleting: false,
    uploadingItems: false,
    updatingItem: false,
    deletingItem: false,
    error: null,
  },
  reducers: {
    clearCurrentGallery: (state) => {
      state.currentGallery = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchGalleryByEntity.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGalleryByEntity.fulfilled, (state, action) => {
        state.loading = false;
        state.currentGallery = action.payload;
      })
      .addCase(fetchGalleryByEntity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createGallery.pending, (state) => {
        state.creating = true;
        state.error = null;
      })
      .addCase(createGallery.fulfilled, (state, action) => {
        state.creating = false;
        state.currentGallery = action.payload;
      })
      .addCase(createGallery.rejected, (state, action) => {
        state.creating = false;
        state.error = action.payload;
      })
      .addCase(updateGalleryTitles.pending, (state) => {
        state.updating = true;
        state.error = null;
      })
      .addCase(updateGalleryTitles.fulfilled, (state, action) => {
        state.updating = false;
        state.currentGallery = action.payload;
      })
      .addCase(updateGalleryTitles.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload;
      })
      .addCase(deleteGallery.pending, (state) => {
        state.deleting = true;
        state.error = null;
      })
      .addCase(deleteGallery.fulfilled, (state) => {
        state.deleting = false;
        state.currentGallery = null;
      })
      .addCase(deleteGallery.rejected, (state, action) => {
        state.deleting = false;
        state.error = action.payload;
      })
      .addCase(bulkAddGalleryItems.pending, (state) => {
        state.uploadingItems = true;
        state.error = null;
      })
      .addCase(bulkAddGalleryItems.fulfilled, (state) => {
        state.uploadingItems = false;
      })
      .addCase(bulkAddGalleryItems.rejected, (state, action) => {
        state.uploadingItems = false;
        state.error = action.payload;
      })
      .addCase(updateGalleryItem.pending, (state) => {
        state.updatingItem = true;
        state.error = null;
      })
      .addCase(updateGalleryItem.fulfilled, (state) => {
        state.updatingItem = false;
      })
      .addCase(updateGalleryItem.rejected, (state, action) => {
        state.updatingItem = false;
        state.error = action.payload;
      })
      .addCase(deleteGalleryItem.pending, (state) => {
        state.deletingItem = true;
        state.error = null;
      })
      .addCase(deleteGalleryItem.fulfilled, (state) => {
        state.deletingItem = false;
      })
      .addCase(deleteGalleryItem.rejected, (state, action) => {
        state.deletingItem = false;
        state.error = action.payload;
      });
  },
});

export const { clearCurrentGallery } = galleriesSlice.actions;
export default galleriesSlice.reducer;
