import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiService from '@/services/apiService';
import { buildQuery } from '@/lib/queryHelper';

export const fetchCommittees = createAsyncThunk(
  'committees/fetchCommittees',
  async (params = {}, { rejectWithValue }) => {
    try {
      const queryString = buildQuery(params);
      const url = queryString ? `/committees?${queryString}` : '/committees';
      const response = await apiService.get(url);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchCommittee = createAsyncThunk(
  'committees/fetchCommittee',
  async (id, { rejectWithValue }) => {
    try {
      const response = await apiService.get(`/committees/${id}`);
      return response.data?.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createCommittee = createAsyncThunk(
  'committees/createCommittee',
  async (data, { rejectWithValue }) => {
    try {
      const response = await apiService.post('/committees', data);
      return response.data?.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateCommittee = createAsyncThunk(
  'committees/updateCommittee',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await apiService.patch(`/committees/${id}`, data);
      return response.data?.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteCommittee = createAsyncThunk(
  'committees/deleteCommittee',
  async (id, { rejectWithValue }) => {
    try {
      await apiService.delete(`/committees/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const addCommitteeMember = createAsyncThunk(
  'committees/addCommitteeMember',
  async (data, { rejectWithValue }) => {
    try {
      const response = await apiService.post('/committee-members', data);
      return response.data?.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const removeCommitteeMember = createAsyncThunk(
  'committees/removeCommitteeMember',
  async (memberId, { rejectWithValue }) => {
    try {
      await apiService.delete(`/committee-members/${memberId}`);
      return memberId;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const initialState = {
  committees: [],
  currentCommittee: null,
  page: 1,
  limit: 10,
  total: 0,
  loading: false,
  error: null,
  // Add individual loading states for better UX
  creating: false,
  updating: false,
  deleting: false,
  addingMember: false,
  removingMember: false,
};

const committeesSlice = createSlice({
  name: 'committees',
  initialState,
  reducers: {
    clearCurrentCommittee: (state) => {
      state.currentCommittee = null;
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
      // Fetch Committees
      .addCase(fetchCommittees.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCommittees.fulfilled, (state, action) => {
        state.loading = false;
        state.committees = action.payload?.data || [];
        state.total = action.payload?.totalCount || action.payload?.data?.length || 0;
      })
      .addCase(fetchCommittees.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch Single Committee
      .addCase(fetchCommittee.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCommittee.fulfilled, (state, action) => {
        state.loading = false;
        state.currentCommittee = action.payload;
      })
      .addCase(fetchCommittee.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create Committee
      .addCase(createCommittee.pending, (state) => {
        state.creating = true;
        state.error = null;
      })
      .addCase(createCommittee.fulfilled, (state, action) => {
        state.creating = false;
        if (action.payload) {
          state.committees.push(action.payload);
          state.total += 1;
        }
      })
      .addCase(createCommittee.rejected, (state, action) => {
        state.creating = false;
        state.error = action.payload;
      })
      
      // Update Committee
      .addCase(updateCommittee.pending, (state) => {
        state.updating = true;
        state.error = null;
      })
      .addCase(updateCommittee.fulfilled, (state, action) => {
        state.updating = false;
        if (action.payload) {
          const index = state.committees.findIndex(c => c.id === action.payload.id);
          if (index !== -1) {
            state.committees[index] = action.payload;
          }
          if (state.currentCommittee?.id === action.payload.id) {
            state.currentCommittee = action.payload;
          }
        }
      })
      .addCase(updateCommittee.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload;
      })
      
      // Delete Committee
      .addCase(deleteCommittee.pending, (state) => {
        state.deleting = true;
        state.error = null;
      })
      .addCase(deleteCommittee.fulfilled, (state, action) => {
        state.deleting = false;
        state.committees = state.committees.filter(c => c.id !== action.payload);
        if (state.total > 0) state.total -= 1;
        if (state.currentCommittee?.id === action.payload) {
          state.currentCommittee = null;
        }
      })
      .addCase(deleteCommittee.rejected, (state, action) => {
        state.deleting = false;
        state.error = action.payload;
      })
      
      // Add Committee Member
      .addCase(addCommitteeMember.pending, (state) => {
        state.addingMember = true;
        state.error = null;
      })
      .addCase(addCommitteeMember.fulfilled, (state, action) => {
        state.addingMember = false;
        if (action.payload && state.currentCommittee) {
          if (!state.currentCommittee.committee_members) {
            state.currentCommittee.committee_members = [];
          }
          state.currentCommittee.committee_members.push(action.payload);
        }
      })
      .addCase(addCommitteeMember.rejected, (state, action) => {
        state.addingMember = false;
        state.error = action.payload;
      })
      
      // Remove Committee Member
      .addCase(removeCommitteeMember.pending, (state) => {
        state.removingMember = true;
        state.error = null;
      })
      .addCase(removeCommitteeMember.fulfilled, (state, action) => {
        state.removingMember = false;
        if (state.currentCommittee?.committee_members) {
          state.currentCommittee.committee_members = state.currentCommittee.committee_members.filter(
            m => m.id !== action.payload
          );
        }
      })
      .addCase(removeCommitteeMember.rejected, (state, action) => {
        state.removingMember = false;
        state.error = action.payload;
      });
  },
});

export const { clearCurrentCommittee, clearError, setPage, setLimit, setTotal } = committeesSlice.actions;
export default committeesSlice.reducer;
