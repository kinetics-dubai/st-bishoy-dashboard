import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import apiService from '@/services/apiService';
import { buildQuery } from '@/lib/queryHelper';

const extractLogsPayload = (payload) => {
  const collections = [
    payload?.logs,
    payload?.data?.logs,
    payload?.data?.items,
    payload?.data,
    payload?.items,
    payload?.logHistory,
  ];

  const logs = collections.find((value) => Array.isArray(value)) || [];

  const total =
    payload?.totalCount ??
    payload?.total ??
    payload?.count ??
    payload?.data?.totalCount ??
    payload?.data?.total ??
    payload?.data?.count ??
    payload?.meta?.total ??
    payload?.pagination?.total ??
    logs.length;

  return {
    logs,
    total,
  };
};

export const fetchLogs = createAsyncThunk(
  'logs/fetchLogs',
  async (params = {}, { rejectWithValue }) => {
    try {
      const queryString = buildQuery(params);
      const url = queryString
        ? `/logs/get-log-history?${queryString}`
        : '/logs/get-log-history';
      const response = await apiService.get(url);
      return extractLogsPayload(response.data);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchLogDetails = createAsyncThunk(
  'logs/fetchLogDetails',
  async (id, { rejectWithValue }) => {
    try {
      const queryString = buildQuery({ id });
      const url = queryString ? `/logs?${queryString}` : '/logs';
      const response = await apiService.get(url);

      return (
        response.data?.logHistory ||
        response.data?.data?.logHistory ||
        response.data?.data ||
        response.data
      );
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const initialState = {
  logs: [],
  currentLogDetails: null,
  page: 1,
  limit: 10,
  total: 0,
  loading: false,
  detailsLoading: false,
  error: null,
  detailsError: null,
};

const logsSlice = createSlice({
  name: 'logs',
  initialState,
  reducers: {
    clearLogsError: (state) => {
      state.error = null;
    },
    clearLogDetails: (state) => {
      state.currentLogDetails = null;
      state.detailsError = null;
    },
    setLogsPage: (state, action) => {
      state.page = action.payload;
    },
    setLogsLimit: (state, action) => {
      state.limit = action.payload;
      state.page = 1;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLogs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLogs.fulfilled, (state, action) => {
        state.loading = false;
        state.logs = action.payload?.logs || [];
        state.total = action.payload?.total || 0;
      })
      .addCase(fetchLogs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchLogDetails.pending, (state) => {
        state.detailsLoading = true;
        state.detailsError = null;
      })
      .addCase(fetchLogDetails.fulfilled, (state, action) => {
        state.detailsLoading = false;
        state.currentLogDetails = action.payload || null;
      })
      .addCase(fetchLogDetails.rejected, (state, action) => {
        state.detailsLoading = false;
        state.detailsError = action.payload;
      });
  },
});

export const { clearLogsError, clearLogDetails, setLogsPage, setLogsLimit } = logsSlice.actions;
export default logsSlice.reducer;
