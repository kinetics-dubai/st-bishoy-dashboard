import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import apiService from "@/services/apiService";
import { buildQuery } from "@/lib/queryHelper";

const normalizeEvent = (event) => {
  if (!event) return event;

  return {
    id: event.id,
    title: event.title || "",
    title_ar: event.title_ar || "",
    slug: event.slug || "",
    excerpt: event.excerpt || "",
    excerpt_ar: event.excerpt_ar || "",
    content: event.content || "",
    content_ar: event.content_ar || "",
    cover_image: event.cover_image || "",
    thumbnail: event.thumbnail || "",
    start_at: event.start_at || null,
    end_at: event.end_at || null,
    venue: event.venue || "",
    venue_ar: event.venue_ar || "",
    is_virtual: Boolean(event.is_virtual),
    online_link: event.online_link || "",
    location: event.location || null,
    published: Boolean(event.published),
    ...event,
  };
};

export const fetchEvents = createAsyncThunk(
  "events/fetchEvents",
  async (params = {}, { rejectWithValue }) => {
    try {
      const queryString = buildQuery(params);
      const url = queryString ? `/events/admin?${queryString}` : "/events/admin";
      const response = await apiService.get(url);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const fetchEvent = createAsyncThunk(
  "events/fetchEvent",
  async (slug, { rejectWithValue }) => {
    try {
      const response = await apiService.get(`/events/admin/${slug}`);
      return normalizeEvent(response.data?.data || response.data);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const createEvent = createAsyncThunk(
  "events/createEvent",
  async (data, { rejectWithValue }) => {
    try {
      const response = await apiService.post("/events", data);
      return normalizeEvent(response.data?.data || response.data);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const updateEvent = createAsyncThunk(
  "events/updateEvent",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await apiService.put(`/events/${id}`, data);
      return normalizeEvent(response.data?.data || response.data);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const deleteEvent = createAsyncThunk(
  "events/deleteEvent",
  async (id, { rejectWithValue }) => {
    try {
      await apiService.delete(`/events/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

const initialState = {
  events: [],
  currentEvent: null,
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

const eventsSlice = createSlice({
  name: "events",
  initialState,
  reducers: {
    clearCurrentEvent: (state) => {
      state.currentEvent = null;
    },
    clearEventError: (state) => {
      state.error = null;
    },
    setEventsPage: (state, action) => {
      state.page = action.payload;
    },
    setEventsLimit: (state, action) => {
      state.limit = action.payload;
      state.page = 1;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEvents.pending, (state, action) => {
        state.loading = true;
        state.error = null;
        state.currentListRequestId = action.meta.requestId;
      })
      .addCase(fetchEvents.fulfilled, (state, action) => {
        if (state.currentListRequestId !== action.meta.requestId) return;
        state.loading = false;
        state.events = (action.payload?.data || []).map(normalizeEvent);
        state.total =
          action.payload?.pagination?.total || action.payload?.data?.length || 0;
        state.currentListRequestId = null;
      })
      .addCase(fetchEvents.rejected, (state, action) => {
        if (state.currentListRequestId !== action.meta.requestId) return;
        state.loading = false;
        state.error = action.payload;
        state.currentListRequestId = null;
      })
      .addCase(fetchEvent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEvent.fulfilled, (state, action) => {
        state.loading = false;
        state.currentEvent = action.payload;
      })
      .addCase(fetchEvent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createEvent.pending, (state) => {
        state.creating = true;
        state.error = null;
      })
      .addCase(createEvent.fulfilled, (state, action) => {
        state.creating = false;
        if (action.payload) {
          state.events.unshift(action.payload);
          state.total += 1;
        }
      })
      .addCase(createEvent.rejected, (state, action) => {
        state.creating = false;
        state.error = action.payload;
      })
      .addCase(updateEvent.pending, (state) => {
        state.updating = true;
        state.error = null;
      })
      .addCase(updateEvent.fulfilled, (state, action) => {
        state.updating = false;
        if (action.payload) {
          const index = state.events.findIndex(
            (e) => e.id === action.payload.id,
          );
          if (index !== -1) state.events[index] = action.payload;
          if (String(state.currentEvent?.id) === String(action.payload.id)) {
            state.currentEvent = action.payload;
          }
        }
      })
      .addCase(updateEvent.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload;
      })
      .addCase(deleteEvent.pending, (state) => {
        state.deleting = true;
        state.error = null;
      })
      .addCase(deleteEvent.fulfilled, (state, action) => {
        state.deleting = false;
        state.events = state.events.filter((e) => e.id !== action.payload);
        if (state.total > 0) state.total -= 1;
        if (String(state.currentEvent?.id) === String(action.payload)) {
          state.currentEvent = null;
        }
      })
      .addCase(deleteEvent.rejected, (state, action) => {
        state.deleting = false;
        state.error = action.payload;
      });
  },
});

export const { clearCurrentEvent, clearEventError, setEventsPage, setEventsLimit } =
  eventsSlice.actions;

export default eventsSlice.reducer;
