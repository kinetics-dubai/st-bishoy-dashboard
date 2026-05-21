import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import apiService from "@/services/apiService";
import { buildQuery, PAGE_SIZE } from "@/lib/queryHelper";

const normalizeSaint = (saint) => {
  if (!saint) return saint;

  return {
    id: saint.id,
    name: saint.name || "",
    name_ar: saint.name_ar || "",
    rank: saint.rank || "",
    departed: Boolean(saint.departed),
    image: saint.image || "",
    description: saint.description || "",
    description_ar: saint.description_ar || "",
    hasDetails: Boolean(saint.hasDetails),
    first_paragraph: saint.first_paragraph || "",
    first_image: saint.first_image || "",
    second_paragraph: saint.second_paragraph || "",
    second_image: saint.second_image || "",
    ...saint,
  };
};

export const fetchSaints = createAsyncThunk(
  "saints/fetchSaints",
  async (params = {}, { rejectWithValue }) => {
    try {
      const queryString = buildQuery({ ...params, limit: PAGE_SIZE });
      const url = queryString ? `/saints?${queryString}` : "/saints";
      const response = await apiService.get(url);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const fetchSaint = createAsyncThunk(
  "saints/fetchSaint",
  async (id, { rejectWithValue }) => {
    try {
      const response = await apiService.get(`/saints/${id}`);
      return normalizeSaint(response.data?.data || response.data);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const createSaint = createAsyncThunk(
  "saints/createSaint",
  async (data, { rejectWithValue }) => {
    try {
      const response = await apiService.post("/saints", data);
      return normalizeSaint(response.data?.data || response.data);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const updateSaint = createAsyncThunk(
  "saints/updateSaint",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await apiService.put(`/saints/${id}`, data);
      return normalizeSaint(response.data?.data || response.data);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const deleteSaint = createAsyncThunk(
  "saints/deleteSaint",
  async (id, { rejectWithValue }) => {
    try {
      await apiService.delete(`/saints/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

const initialState = {
  saints: [],
  currentSaint: null,
  page: 1,
  total: 0,
  loading: false,
  creating: false,
  updating: false,
  deleting: false,
  error: null,
  currentListRequestId: null,
};

const saintsSlice = createSlice({
  name: "saints",
  initialState,
  reducers: {
    clearCurrentSaint: (state) => {
      state.currentSaint = null;
    },
    clearSaintError: (state) => {
      state.error = null;
    },
    setSaintsPage: (state, action) => {
      state.page = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSaints.pending, (state, action) => {
        state.loading = true;
        state.error = null;
        state.currentListRequestId = action.meta.requestId;
      })
      .addCase(fetchSaints.fulfilled, (state, action) => {
        if (state.currentListRequestId !== action.meta.requestId) {
          return;
        }

        state.loading = false;
        state.saints = (action.payload?.data || []).map(normalizeSaint);
        state.total =
          action.payload?.pagination?.total ||
          action.payload?.totalCount ||
          action.payload?.data?.length ||
          0;
        state.currentListRequestId = null;
      })
      .addCase(fetchSaints.rejected, (state, action) => {
        if (state.currentListRequestId !== action.meta.requestId) {
          return;
        }

        state.loading = false;
        state.error = action.payload;
        state.currentListRequestId = null;
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
          const index = state.saints.findIndex(
            (saint) => saint.id === action.payload.id,
          );
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
        state.saints = state.saints.filter(
          (saint) => saint.id !== action.payload,
        );
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
      });
  },
});

export const {
  clearCurrentSaint,
  clearSaintError,
  setSaintsPage,
} = saintsSlice.actions;

export default saintsSlice.reducer;
