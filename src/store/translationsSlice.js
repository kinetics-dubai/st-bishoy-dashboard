import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiService from '@/services/apiService';

const normalizeTagTranslation = (translation) => {
  if (!translation) return translation;

  return {
    ...translation,
    id: translation.id ?? translation.translation?.id,
    name: translation.name ?? translation.translation?.name,
    language_id: translation.language_id ?? translation.translation?.language_id,
    tag_id: translation.tag_id ?? translation.translation?.tag_id,
    publishedAt: translation.publishedAt ?? translation.translation?.publishedAt,
    language: translation.language ?? translation.translation?.language,
  };
};

const normalizeEntityTranslation = (translation) => {
  if (!translation) return translation;

  return {
    ...translation,
    id: translation.id ?? null,
    name: translation.name ?? '',
    language_id: translation.language_id ?? null,
    entity_id: translation.entity_id ?? null,
    dynamic_data: translation.dynamic_data ?? null,
    publishedAt: translation.publishedAt ?? null,
    language: translation.language ?? null,
  };
};

// Fetch languages
export const fetchLanguages = createAsyncThunk(
  'translations/fetchLanguages',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await apiService.get('/Languages/get-Languages', {
        params,
        skipAuthReset: true,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Fetch tag translations
export const fetchTagTranslations = createAsyncThunk(
  'translations/fetchTagTranslations',
  async (tagId, { rejectWithValue }) => {
    try {
      const response = await apiService.get(`/tag-translations?tag_id=${tagId}`, {
        skipAuthReset: true,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Create tag translation
export const createTagTranslation = createAsyncThunk(
  'translations/createTagTranslation',
  async (data, { rejectWithValue }) => {
    try {
      const response = await apiService.post('/tag-translations', data, {
        skipAuthReset: true,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Delete tag translation
export const deleteTagTranslation = createAsyncThunk(
  'translations/deleteTagTranslation',
  async (id, { rejectWithValue }) => {
    try {
      await apiService.delete(`/tag-translations/${id}`, {
        skipAuthReset: true,
      });
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchEntityTranslations = createAsyncThunk(
  'translations/fetchEntityTranslations',
  async (entityId, { rejectWithValue }) => {
    try {
      const response = await apiService.get(`/entity-translations?entity_id=${entityId}`, {
        skipAuthReset: true,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createEntityTranslation = createAsyncThunk(
  'translations/createEntityTranslation',
  async (data, { rejectWithValue }) => {
    try {
      const response = await apiService.post('/entity-translations', data, {
        skipAuthReset: true,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateEntityTranslation = createAsyncThunk(
  'translations/updateEntityTranslation',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await apiService.patch(`/entity-translations/${id}`, data, {
        skipAuthReset: true,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteEntityTranslation = createAsyncThunk(
  'translations/deleteEntityTranslation',
  async (id, { rejectWithValue }) => {
    try {
      await apiService.delete(`/entity-translations/${id}`, {
        skipAuthReset: true,
      });
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Fetch papal decision translations
export const fetchPapalDecisionTranslations = createAsyncThunk(
  'translations/fetchPapalDecisionTranslations',
  async (papalDecisionId, { rejectWithValue }) => {
    try {
      const response = await apiService.get(`/papal-decision-translations?papal_decision_id=${papalDecisionId}`, {
        skipAuthReset: true,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Create papal decision translation
export const createPapalDecisionTranslation = createAsyncThunk(
  'translations/createPapalDecisionTranslation',
  async (data, { rejectWithValue }) => {
    try {
      const response = await apiService.post('/papal-decision-translations', data, {
        skipAuthReset: true,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Fetch magazine release translations
export const fetchMagazineReleaseTranslations = createAsyncThunk(
  'translations/fetchMagazineReleaseTranslations',
  async (magazineReleaseId, { rejectWithValue }) => {
    try {
      const response = await apiService.get(`/magazine-release-translations?magazine_release_id=${magazineReleaseId}`, {
        skipAuthReset: true,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Create magazine release translation
export const createMagazineReleaseTranslation = createAsyncThunk(
  'translations/createMagazineReleaseTranslation',
  async (data, { rejectWithValue }) => {
    try {
      const response = await apiService.post('/magazine-release-translations', data, {
        skipAuthReset: true,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Update magazine release translation
export const updateMagazineReleaseTranslation = createAsyncThunk(
  'translations/updateMagazineReleaseTranslation',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await apiService.patch(`/magazine-release-translations/${id}`, data, {
        skipAuthReset: true,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Delete magazine release translation
export const deleteMagazineReleaseTranslation = createAsyncThunk(
  'translations/deleteMagazineReleaseTranslation',
  async (id, { rejectWithValue }) => {
    try {
      await apiService.delete(`/magazine-release-translations/${id}`, {
        skipAuthReset: true,
      });
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Update papal decision translation
export const updatePapalDecisionTranslation = createAsyncThunk(
  'translations/updatePapalDecisionTranslation',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await apiService.patch(`/papal-decision-translations/${id}`, data, {
        skipAuthReset: true,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Delete papal decision translation
export const deletePapalDecisionTranslation = createAsyncThunk(
  'translations/deletePapalDecisionTranslation',
  async (id, { rejectWithValue }) => {
    try {
      await apiService.delete(`/papal-decision-translations/${id}`, {
        skipAuthReset: true,
      });
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const initialState = {
  languages: [],
  translations: [],
  currentTagTranslations: [],
  currentEntityTranslations: [],
  currentDecisionTranslations: [],
  currentMagazineReleaseTranslations: [],
  loading: false,
  languagesLoading: false,
  translationsLoading: false,
  creating: false,
  updating: false,
  deleting: false,
  error: null,
};

const translationsSlice = createSlice({
  name: 'translations',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentDecisionTranslations: (state) => {
      state.currentDecisionTranslations = [];
    },
    clearCurrentTagTranslations: (state) => {
      state.currentTagTranslations = [];
    },
    clearCurrentEntityTranslations: (state) => {
      state.currentEntityTranslations = [];
    },
    clearCurrentMagazineReleaseTranslations: (state) => {
      state.currentMagazineReleaseTranslations = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Languages
      .addCase(fetchLanguages.pending, (state) => {
        state.languagesLoading = true;
        state.error = null;
      })
      .addCase(fetchLanguages.fulfilled, (state, action) => {
        state.languagesLoading = false;
        state.languages = action.payload.Languages || [];
      })
      .addCase(fetchLanguages.rejected, (state, action) => {
        state.languagesLoading = false;
        state.error = action.payload;
      })

      // Fetch Tag Translations
      .addCase(fetchTagTranslations.pending, (state) => {
        state.translationsLoading = true;
        state.error = null;
      })
      .addCase(fetchTagTranslations.fulfilled, (state, action) => {
        state.translationsLoading = false;
        state.currentTagTranslations = (action.payload?.data || []).map(normalizeTagTranslation);
      })
      .addCase(fetchTagTranslations.rejected, (state, action) => {
        state.translationsLoading = false;
        state.error = action.payload;
      })

      // Create Tag Translation
      .addCase(createTagTranslation.pending, (state) => {
        state.creating = true;
        state.error = null;
      })
      .addCase(createTagTranslation.fulfilled, (state, action) => {
        state.creating = false;
        const translation = normalizeTagTranslation(action.payload?.data || action.payload);
        if (translation) {
          state.currentTagTranslations.push(translation);
        }
      })
      .addCase(createTagTranslation.rejected, (state, action) => {
        state.creating = false;
        state.error = action.payload;
      })

      // Delete Tag Translation
      .addCase(deleteTagTranslation.pending, (state) => {
        state.deleting = true;
        state.error = null;
      })
      .addCase(deleteTagTranslation.fulfilled, (state, action) => {
        state.deleting = false;
        state.currentTagTranslations = state.currentTagTranslations.filter(
          (translation) => translation.id !== action.payload
        );
      })
      .addCase(deleteTagTranslation.rejected, (state, action) => {
        state.deleting = false;
        state.error = action.payload;
      })

      // Fetch Entity Translations
      .addCase(fetchEntityTranslations.pending, (state) => {
        state.translationsLoading = true;
        state.error = null;
      })
      .addCase(fetchEntityTranslations.fulfilled, (state, action) => {
        state.translationsLoading = false;
        state.currentEntityTranslations = (action.payload?.data || []).map(normalizeEntityTranslation);
      })
      .addCase(fetchEntityTranslations.rejected, (state, action) => {
        state.translationsLoading = false;
        state.error = action.payload;
      })

      // Create Entity Translation
      .addCase(createEntityTranslation.pending, (state) => {
        state.creating = true;
        state.error = null;
      })
      .addCase(createEntityTranslation.fulfilled, (state, action) => {
        state.creating = false;
        const translation = normalizeEntityTranslation(action.payload?.data || action.payload);
        if (translation) {
          state.currentEntityTranslations.push(translation);
        }
      })
      .addCase(createEntityTranslation.rejected, (state, action) => {
        state.creating = false;
        state.error = action.payload;
      })

      // Update Entity Translation
      .addCase(updateEntityTranslation.pending, (state) => {
        state.updating = true;
        state.error = null;
      })
      .addCase(updateEntityTranslation.fulfilled, (state, action) => {
        state.updating = false;
        const translation = normalizeEntityTranslation(action.payload?.data || action.payload);
        const index = state.currentEntityTranslations.findIndex((item) => item.id === translation?.id);
        if (index !== -1 && translation) {
          state.currentEntityTranslations[index] = translation;
        }
      })
      .addCase(updateEntityTranslation.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload;
      })

      // Delete Entity Translation
      .addCase(deleteEntityTranslation.pending, (state) => {
        state.deleting = true;
        state.error = null;
      })
      .addCase(deleteEntityTranslation.fulfilled, (state, action) => {
        state.deleting = false;
        state.currentEntityTranslations = state.currentEntityTranslations.filter(
          (translation) => translation.id !== action.payload
        );
      })
      .addCase(deleteEntityTranslation.rejected, (state, action) => {
        state.deleting = false;
        state.error = action.payload;
      })

      // Fetch Papal Decision Translations
      .addCase(fetchPapalDecisionTranslations.pending, (state) => {
        state.translationsLoading = true;
        state.error = null;
      })
      .addCase(fetchPapalDecisionTranslations.fulfilled, (state, action) => {
        state.translationsLoading = false;
        state.currentDecisionTranslations = action.payload.data || [];
      })
      .addCase(fetchPapalDecisionTranslations.rejected, (state, action) => {
        state.translationsLoading = false;
        state.error = action.payload;
      })

      // Create Papal Decision Translation
      .addCase(createPapalDecisionTranslation.pending, (state) => {
        state.creating = true;
        state.error = null;
      })
      .addCase(createPapalDecisionTranslation.fulfilled, (state, action) => {
        state.creating = false;
        state.currentDecisionTranslations.push(action.payload);
      })
      .addCase(createPapalDecisionTranslation.rejected, (state, action) => {
        state.creating = false;
        state.error = action.payload;
      })

      // Update Papal Decision Translation
      .addCase(updatePapalDecisionTranslation.pending, (state) => {
        state.updating = true;
        state.error = null;
      })
      .addCase(updatePapalDecisionTranslation.fulfilled, (state, action) => {
        state.updating = false;
        const index = state.currentDecisionTranslations.findIndex(
          translation => translation.id === action.payload.id
        );
        if (index !== -1) {
          state.currentDecisionTranslations[index] = action.payload;
        }
      })
      .addCase(updatePapalDecisionTranslation.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload;
      })

      // Delete Papal Decision Translation
      .addCase(deletePapalDecisionTranslation.pending, (state) => {
        state.deleting = true;
        state.error = null;
      })
      .addCase(deletePapalDecisionTranslation.fulfilled, (state, action) => {
        state.deleting = false;
        state.currentDecisionTranslations = state.currentDecisionTranslations.filter(
          translation => translation.id !== action.payload
        );
      })
      .addCase(deletePapalDecisionTranslation.rejected, (state, action) => {
        state.deleting = false;
        state.error = action.payload;
      })

      // Fetch Magazine Release Translations
      .addCase(fetchMagazineReleaseTranslations.pending, (state) => {
        state.translationsLoading = true;
        state.error = null;
      })
      .addCase(fetchMagazineReleaseTranslations.fulfilled, (state, action) => {
        state.translationsLoading = false;
        state.currentMagazineReleaseTranslations = action.payload.data || [];
      })
      .addCase(fetchMagazineReleaseTranslations.rejected, (state, action) => {
        state.translationsLoading = false;
        state.error = action.payload;
      })

      // Create Magazine Release Translation
      .addCase(createMagazineReleaseTranslation.pending, (state) => {
        state.creating = true;
        state.error = null;
      })
      .addCase(createMagazineReleaseTranslation.fulfilled, (state, action) => {
        state.creating = false;
        const translation = action.payload?.data || action.payload;
        if (translation) {
          state.currentMagazineReleaseTranslations.push(translation);
        }
      })
      .addCase(createMagazineReleaseTranslation.rejected, (state, action) => {
        state.creating = false;
        state.error = action.payload;
      })

      // Update Magazine Release Translation
      .addCase(updateMagazineReleaseTranslation.pending, (state) => {
        state.updating = true;
        state.error = null;
      })
      .addCase(updateMagazineReleaseTranslation.fulfilled, (state, action) => {
        state.updating = false;
        const translation = action.payload?.data || action.payload;
        const index = state.currentMagazineReleaseTranslations.findIndex(
          (item) => item.id === translation?.id
        );
        if (index !== -1 && translation) {
          state.currentMagazineReleaseTranslations[index] = translation;
        }
      })
      .addCase(updateMagazineReleaseTranslation.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload;
      })

      // Delete Magazine Release Translation
      .addCase(deleteMagazineReleaseTranslation.pending, (state) => {
        state.deleting = true;
        state.error = null;
      })
      .addCase(deleteMagazineReleaseTranslation.fulfilled, (state, action) => {
        state.deleting = false;
        state.currentMagazineReleaseTranslations = state.currentMagazineReleaseTranslations.filter(
          (translation) => translation.id !== action.payload
        );
      })
      .addCase(deleteMagazineReleaseTranslation.rejected, (state, action) => {
        state.deleting = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearError,
  clearCurrentDecisionTranslations,
  clearCurrentTagTranslations,
  clearCurrentEntityTranslations,
  clearCurrentMagazineReleaseTranslations,
} = translationsSlice.actions;
export default translationsSlice.reducer;
