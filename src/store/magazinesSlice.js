import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiService from '@/services/apiService';

export const fetchMagazines = createAsyncThunk(
  'magazines/fetchMagazines',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.get('/magazines');
      return response.data?.data || [];
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchMagazine = createAsyncThunk(
  'magazines/fetchMagazine',
  async (id, { rejectWithValue }) => {
    try {
      const response = await apiService.get(`/magazines/${id}`);
      return response.data?.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createMagazine = createAsyncThunk(
  'magazines/createMagazine',
  async (data, { rejectWithValue }) => {
    try {
      const response = await apiService.post('/magazines', data);
      return response.data?.data || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateMagazine = createAsyncThunk(
  'magazines/updateMagazine',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await apiService.patch(`/magazines/${id}`, data);
      return response.data?.data || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteMagazine = createAsyncThunk(
  'magazines/deleteMagazine',
  async (id, { rejectWithValue }) => {
    try {
      await apiService.delete(`/magazines/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createMagazineReleaseYear = createAsyncThunk(
  'magazines/createMagazineReleaseYear',
  async (data, { rejectWithValue }) => {
    try {
      const response = await apiService.post('/magazine-release-years', data);
      return response.data?.data || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateMagazineReleaseYear = createAsyncThunk(
  'magazines/updateMagazineReleaseYear',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await apiService.patch(`/magazine-release-years/${id}`, data);
      return response.data?.data || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const initialState = {
  magazines: [],
  currentMagazine: null,
  loading: false,
  error: null,
  creating: false,
  updating: false,
  deleting: false,
  releasing: false,
};

const magazinesSlice = createSlice({
  name: 'magazines',
  initialState,
  reducers: {
    clearCurrentMagazine: (state) => {
      state.currentMagazine = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Magazines
      .addCase(fetchMagazines.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMagazines.fulfilled, (state, action) => {
        state.loading = false;
        state.magazines = action.payload || [];
      })
      .addCase(fetchMagazines.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch Single Magazine
      .addCase(fetchMagazine.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMagazine.fulfilled, (state, action) => {
        state.loading = false;
        state.currentMagazine = action.payload;
      })
      .addCase(fetchMagazine.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create Magazine
      .addCase(createMagazine.pending, (state) => {
        state.creating = true;
        state.error = null;
      })
      .addCase(createMagazine.fulfilled, (state, action) => {
        state.creating = false;
        if (action.payload) {
          state.magazines.push(action.payload);
          state.total += 1;
        }
      })
      .addCase(createMagazine.rejected, (state, action) => {
        state.creating = false;
        state.error = action.payload;
      })
      
      // Update Magazine
      .addCase(updateMagazine.pending, (state) => {
        state.updating = true;
        state.error = null;
      })
      .addCase(updateMagazine.fulfilled, (state, action) => {
        state.updating = false;
        if (action.payload) {
          const index = state.magazines.findIndex(m => m.id === action.payload.id);
          if (index !== -1) {
            state.magazines[index] = action.payload;
          }
          if (state.currentMagazine?.id === action.payload.id) {
            state.currentMagazine = action.payload;
          }
        }
      })
      .addCase(updateMagazine.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload;
      })
      
      // Delete Magazine
      .addCase(deleteMagazine.pending, (state) => {
        state.deleting = true;
        state.error = null;
      })
      .addCase(deleteMagazine.fulfilled, (state, action) => {
        state.deleting = false;
        state.magazines = state.magazines.filter(m => m.id !== action.payload);
        if (state.total > 0) state.total -= 1;
        if (state.currentMagazine?.id === action.payload) {
          state.currentMagazine = null;
        }
      })
      .addCase(deleteMagazine.rejected, (state, action) => {
        state.deleting = false;
        state.error = action.payload;
      })

      // Create Magazine Release Year
      .addCase(createMagazineReleaseYear.pending, (state) => {
        state.releasing = true;
        state.error = null;
      })
      .addCase(createMagazineReleaseYear.fulfilled, (state) => {
        state.releasing = false;
      })
      .addCase(createMagazineReleaseYear.rejected, (state, action) => {
        state.releasing = false;
        state.error = action.payload;
      })

      // Update Magazine Release Year
      .addCase(updateMagazineReleaseYear.pending, (state) => {
        state.releasing = true;
        state.error = null;
      })
      .addCase(updateMagazineReleaseYear.fulfilled, (state) => {
        state.releasing = false;
      })
      .addCase(updateMagazineReleaseYear.rejected, (state, action) => {
        state.releasing = false;
        state.error = action.payload;
      });
  },
});

export const { clearCurrentMagazine, clearError } = magazinesSlice.actions;
export default magazinesSlice.reducer;
