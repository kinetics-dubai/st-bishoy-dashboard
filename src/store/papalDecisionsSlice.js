import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiService from '@/services/apiService';
import { buildQuery } from '@/lib/queryHelper';

export const fetchPapalDecisions = createAsyncThunk(
  'papalDecisions/fetchPapalDecisions',
  async (params = {}, { rejectWithValue }) => {
    try {
      const queryString = buildQuery(params);
      const url = queryString ? `/papal-decisions?${queryString}` : '/papal-decisions';
      const response = await apiService.get(url);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createPapalDecision = createAsyncThunk(
  'papalDecisions/createPapalDecision',
  async (data, { rejectWithValue }) => {
    try {
      const { language_id, ...decisionData } = data;
      // Extract year from issued_at and add it as decision_year
      const processedData = {
        ...decisionData,
        decision_year: new Date(data.issued_at).getFullYear()
      };
      const response = await apiService.post('/papal-decisions', processedData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updatePapalDecision = createAsyncThunk(
  'papalDecisions/updatePapalDecision',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      // Extract year from issued_at and add it as decision_year
      const processedData = {
        ...data,
        decision_year: new Date(data.issued_at).getFullYear()
      };
      const response = await apiService.patch(`/papal-decisions/${id}`, processedData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deletePapalDecision = createAsyncThunk(
  'papalDecisions/deletePapalDecision',
  async (id, { rejectWithValue }) => {
    try {
      await apiService.delete(`/papal-decisions/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const initialState = {
  decisionsByYear: {},
  page: 1,
  limit: 10,
  total: 0,
  loading: false,
  error: null,
  creating: false,
  updating: false,
  deleting: false,
  duplicateError: null,
};

const papalDecisionsSlice = createSlice({
  name: 'papalDecisions',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
      state.duplicateError = null;
    },
    clearDuplicateError: (state) => {
      state.duplicateError = null;
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
      // Fetch Papal Decisions
      .addCase(fetchPapalDecisions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPapalDecisions.fulfilled, (state, action) => {
        state.loading = false;
        state.decisionsByYear = action.payload?.data || {};
        // Use totalCount from API response, fallback to calculated total
        const calculatedTotal = Object.values(action.payload?.data || {}).reduce(
          (total, decisions) => total + (decisions?.length || 0), 0
        );
        state.total = action.payload?.totalCount || calculatedTotal;
      })
      .addCase(fetchPapalDecisions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create Papal Decision
      .addCase(createPapalDecision.pending, (state) => {
        state.creating = true;
        state.error = null;
        state.duplicateError = null;
      })
      .addCase(createPapalDecision.fulfilled, (state, action) => {
        state.creating = false;
        const newDecision = action.payload;
        const year = newDecision.decision_year;
        
        if (!state.decisionsByYear[year]) {
          state.decisionsByYear[year] = [];
        }
        state.decisionsByYear[year].push(newDecision);
        state.total += 1;
      })
      .addCase(createPapalDecision.rejected, (state, action) => {
        state.creating = false;
        const error = action.payload;
        
        // Check for duplicate decision error
        if (typeof error === 'string' && error.includes('already exists')) {
          state.duplicateError = error;
        } else {
          state.error = error;
        }
      })
      
      // Update Papal Decision
      .addCase(updatePapalDecision.pending, (state) => {
        state.updating = true;
        state.error = null;
        state.duplicateError = null;
      })
      .addCase(updatePapalDecision.fulfilled, (state, action) => {
        state.updating = false;
        const updatedDecision = action.payload;
        const year = updatedDecision.decision_year;
        
        if (state.decisionsByYear[year]) {
          const index = state.decisionsByYear[year].findIndex(
            decision => decision.id === updatedDecision.id
          );
          if (index !== -1) {
            state.decisionsByYear[year][index] = updatedDecision;
          }
        }
      })
      .addCase(updatePapalDecision.rejected, (state, action) => {
        state.updating = false;
        const error = action.payload;
        
        // Check for duplicate decision error
        if (typeof error === 'string' && error.includes('already exists')) {
          state.duplicateError = error;
        } else {
          state.error = error;
        }
      })
      
      // Delete Papal Decision
      .addCase(deletePapalDecision.pending, (state) => {
        state.deleting = true;
        state.error = null;
      })
      .addCase(deletePapalDecision.fulfilled, (state, action) => {
        state.deleting = false;
        const deletedId = action.payload;
        
        // Find and remove the decision from all years
        Object.keys(state.decisionsByYear).forEach(year => {
          state.decisionsByYear[year] = state.decisionsByYear[year].filter(
            decision => decision.id !== deletedId
          );
          
          // Remove year if no decisions left
          if (state.decisionsByYear[year].length === 0) {
            delete state.decisionsByYear[year];
          }
        });
        if (state.total > 0) state.total -= 1;
      })
      .addCase(deletePapalDecision.rejected, (state, action) => {
        state.deleting = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearDuplicateError, setPage, setLimit, setTotal } = papalDecisionsSlice.actions;
export default papalDecisionsSlice.reducer;
