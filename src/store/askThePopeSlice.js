import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiService from '@/services/apiService';
import { buildQuery } from '@/lib/queryHelper';

export const fetchAskThePopeQuestions = createAsyncThunk(
  'askThePope/fetchQuestions',
  async (params = {}, { rejectWithValue }) => {
    try {
      const queryString = buildQuery(params);
      const url = queryString ? `/ask-the-pope?${queryString}` : '/ask-the-pope';
      const response = await apiService.get(url);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchAskThePopeQuestion = createAsyncThunk(
  'askThePope/fetchQuestion',
  async (id, { rejectWithValue }) => {
    try {
      const response = await apiService.get(`/ask-the-pope/${id}`);
      return response.data?.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteAskThePopeQuestion = createAsyncThunk(
  'askThePope/deleteQuestion',
  async (id, { rejectWithValue }) => {
    try {
      await apiService.delete(`/ask-the-pope/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const initialState = {
  questions: [],
  currentQuestion: null,
  page: 1,
  limit: 10,
  total: 0,
  loading: false,
  deleting: false,
  error: null,
};

const askThePopeSlice = createSlice({
  name: 'askThePope',
  initialState,
  reducers: {
    clearCurrentQuestion: (state) => {
      state.currentQuestion = null;
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
      .addCase(fetchAskThePopeQuestions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAskThePopeQuestions.fulfilled, (state, action) => {
        state.loading = false;
        state.questions = action.payload?.data || [];
        state.total = action.payload?.totalCount || action.payload?.data?.length || 0;
        state.page = action.payload?.page || state.page;
        state.limit = action.payload?.limit || state.limit;
      })
      .addCase(fetchAskThePopeQuestions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchAskThePopeQuestion.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAskThePopeQuestion.fulfilled, (state, action) => {
        state.loading = false;
        state.currentQuestion = action.payload;
      })
      .addCase(fetchAskThePopeQuestion.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteAskThePopeQuestion.pending, (state) => {
        state.deleting = true;
        state.error = null;
      })
      .addCase(deleteAskThePopeQuestion.fulfilled, (state, action) => {
        state.deleting = false;
        state.questions = state.questions.filter((question) => question.id !== action.payload);
        state.total = Math.max(0, state.total - 1);
        if (state.currentQuestion?.id === action.payload) {
          state.currentQuestion = null;
        }
      })
      .addCase(deleteAskThePopeQuestion.rejected, (state, action) => {
        state.deleting = false;
        state.error = action.payload;
      });
  },
});

export const { clearCurrentQuestion, clearError, setPage, setLimit } = askThePopeSlice.actions;
export default askThePopeSlice.reducer;
