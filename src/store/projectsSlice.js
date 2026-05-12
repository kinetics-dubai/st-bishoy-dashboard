import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import apiService from '@/services/apiService';

const normalizeProject = (project) => {
  if (!project) return project;
  return {
    id: project.id,
    title: project.title || '',
    title_ar: project.title_ar || '',
    description: project.description || '',
    description_ar: project.description_ar || '',
    thumbnail: project.thumbnail || '',
  };
};

export const fetchProjects = createAsyncThunk(
  'projects/fetchProjects',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.get('/projects');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchProject = createAsyncThunk(
  'projects/fetchProject',
  async (id, { rejectWithValue }) => {
    try {
      const response = await apiService.get(`/projects/${id}`);
      return normalizeProject(response.data?.data || response.data);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createProject = createAsyncThunk(
  'projects/createProject',
  async (data, { rejectWithValue }) => {
    try {
      const response = await apiService.post('/projects', data);
      return normalizeProject(response.data?.data || response.data);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateProject = createAsyncThunk(
  'projects/updateProject',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await apiService.put(`/projects/${id}`, data);
      return normalizeProject(response.data?.data || response.data);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteProject = createAsyncThunk(
  'projects/deleteProject',
  async (id, { rejectWithValue }) => {
    try {
      await apiService.delete(`/projects/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const initialState = {
  projects: [],
  currentProject: null,
  loading: false,
  creating: false,
  updating: false,
  deleting: false,
  error: null,
};

const projectsSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    clearCurrentProject: (state) => {
      state.currentProject = null;
    },
    clearProjectError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProjects.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.loading = false;
        const raw = Array.isArray(action.payload)
          ? action.payload
          : action.payload?.data || [];
        state.projects = raw.map(normalizeProject);
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchProject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProject.fulfilled, (state, action) => {
        state.loading = false;
        state.currentProject = action.payload;
      })
      .addCase(fetchProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createProject.pending, (state) => {
        state.creating = true;
        state.error = null;
      })
      .addCase(createProject.fulfilled, (state, action) => {
        state.creating = false;
        if (action.payload) {
          state.projects.unshift(action.payload);
        }
      })
      .addCase(createProject.rejected, (state, action) => {
        state.creating = false;
        state.error = action.payload;
      })
      .addCase(updateProject.pending, (state) => {
        state.updating = true;
        state.error = null;
      })
      .addCase(updateProject.fulfilled, (state, action) => {
        state.updating = false;
        if (action.payload) {
          const index = state.projects.findIndex((p) => p.id === action.payload.id);
          if (index !== -1) state.projects[index] = action.payload;
          if (String(state.currentProject?.id) === String(action.payload.id)) {
            state.currentProject = action.payload;
          }
        }
      })
      .addCase(updateProject.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload;
      })
      .addCase(deleteProject.pending, (state) => {
        state.deleting = true;
        state.error = null;
      })
      .addCase(deleteProject.fulfilled, (state, action) => {
        state.deleting = false;
        state.projects = state.projects.filter((p) => p.id !== action.payload);
        if (String(state.currentProject?.id) === String(action.payload)) {
          state.currentProject = null;
        }
      })
      .addCase(deleteProject.rejected, (state, action) => {
        state.deleting = false;
        state.error = action.payload;
      });
  },
});

export const { clearCurrentProject, clearProjectError } = projectsSlice.actions;
export default projectsSlice.reducer;
