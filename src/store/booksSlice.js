import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiService from '@/services/apiService';
import { buildQuery } from '@/lib/queryHelper';

const normalizeBookListItem = (item = {}) => {
  const base = item.base || {};
  const translation = item.translation || {};

  return {
    id: base.id ?? translation.book_id ?? translation.id,
    testament: base.testament,
    title: translation.title || '',
    translationId: translation.id ?? null,
    languageId: translation.language_id ?? null,
    bookId: translation.book_id ?? base.id ?? null,
    translationMissing: Boolean(item.translation_missing),
    publishedAt: translation.publishedAt || base.publishedAt || null,
    base,
    translation,
  };
};

const normalizeChapterItem = (item = {}) => {
  const base = item.base || {};
  const translation = item.translation || {};

  return {
    id: base.id ?? translation.chapter_id ?? translation.id,
    book_id: base.book_id ?? null,
    title: translation.title || '',
    content: translation.content || '',
    translationId: translation.id ?? null,
    languageId: translation.language_id ?? null,
    chapterId: translation.chapter_id ?? base.id ?? null,
    translationMissing: Boolean(item.translation_missing),
    publishedAt: translation.publishedAt || base.publishedAt || null,
    base,
    translation,
  };
};

const normalizeBookDetail = (item = {}) => {
  const normalized = normalizeBookListItem(item);
  const chapters = item.base?.chapters || [];

  return {
    ...normalized,
    chapters: chapters.map(normalizeChapterItem),
  };
};

const normalizeBookTranslationItem = (item = {}) => ({
  id: item.id ?? null,
  title: item.title || '',
  language_id: item.language_id ?? null,
  book_id: item.book_id ?? item.book?.id ?? null,
  publishedAt: item.publishedAt || null,
  language: item.language || null,
  book: item.book || null,
});

export const fetchBooks = createAsyncThunk(
  'books/fetchBooks',
  async (params = {}, { rejectWithValue }) => {
    try {
      const queryString = buildQuery(params);
      const url = queryString ? `/books?${queryString}` : '/books';
      const response = await apiService.get(url);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchBook = createAsyncThunk(
  'books/fetchBook',
  async (id, { rejectWithValue }) => {
    try {
      const response = await apiService.get(`/books/${id}`);
      return response.data?.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createBook = createAsyncThunk(
  'books/createBook',
  async (data, { rejectWithValue }) => {
    try {
      const response = await apiService.post('/books', data);
      return response.data?.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchBookTranslations = createAsyncThunk(
  'books/fetchBookTranslations',
  async (bookId, { rejectWithValue }) => {
    try {
      const response = await apiService.get(`/book-translations?book_id=${bookId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchBookTranslation = createAsyncThunk(
  'books/fetchBookTranslation',
  async (id, { rejectWithValue }) => {
    try {
      const response = await apiService.get(`/book-translations/${id}`);
      return response.data?.data || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createBookTranslation = createAsyncThunk(
  'books/createBookTranslation',
  async (data, { rejectWithValue }) => {
    try {
      const response = await apiService.post('/book-translations', data);
      return response.data?.data || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateBookTranslation = createAsyncThunk(
  'books/updateBookTranslation',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await apiService.patch(`/book-translations/${id}`, data);
      return response.data?.data || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteBookTranslation = createAsyncThunk(
  'books/deleteBookTranslation',
  async (id, { rejectWithValue }) => {
    try {
      await apiService.delete(`/book-translations/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateBook = createAsyncThunk(
  'books/updateBook',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await apiService.patch(`/books/${id}`, data);
      return response.data?.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteChapter = createAsyncThunk(
  'books/deleteChapter',
  async (id, { rejectWithValue }) => {
    try {
      await apiService.delete(`/chapters/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createChapter = createAsyncThunk(
  'books/createChapter',
  async (data, { rejectWithValue }) => {
    try {
      const response = await apiService.post('/chapters', data);
      return response.data?.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateChapter = createAsyncThunk(
  'books/updateChapter',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await apiService.patch(`/chapters/${id}`, data);
      return response.data?.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchChapter = createAsyncThunk(
  'books/fetchChapter',
  async (id, { rejectWithValue }) => {
    try {
      const response = await apiService.get(`/chapters/${id}`);
      return response.data?.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchVerseGroups = createAsyncThunk(
  'books/fetchVerseGroups',
  async (params = {}, { rejectWithValue }) => {
    try {
      const queryString = buildQuery(params);
      const url = queryString ? `/verse-groups?${queryString}` : '/verse-groups';
      const response = await apiService.get(url);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchVerseGroup = createAsyncThunk(
  'books/fetchVerseGroup',
  async (id, { rejectWithValue }) => {
    try {
      const response = await apiService.get(`/verse-groups/${id}`);
      return response.data?.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createVerseGroup = createAsyncThunk(
  'books/createVerseGroup',
  async (data, { rejectWithValue }) => {
    try {
      const response = await apiService.post('/verse-groups', data);
      return response.data?.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateVerseGroup = createAsyncThunk(
  'books/updateVerseGroup',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await apiService.patch(`/verse-groups/${id}`, data);
      return response.data?.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteVerseGroup = createAsyncThunk(
  'books/deleteVerseGroup',
  async (id, { rejectWithValue }) => {
    try {
      await apiService.delete(`/verse-groups/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createVerseGroupTranslation = createAsyncThunk(
  'books/createVerseGroupTranslation',
  async (data, { rejectWithValue }) => {
    try {
      const response = await apiService.post('/verse-group-translations', data);
      return response.data?.data || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateVerseGroupTranslation = createAsyncThunk(
  'books/updateVerseGroupTranslation',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await apiService.patch(`/verse-group-translations/${id}`, data);
      return response.data?.data || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteVerseGroupTranslation = createAsyncThunk(
  'books/deleteVerseGroupTranslation',
  async (id, { rejectWithValue }) => {
    try {
      await apiService.delete(`/verse-group-translations/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteBook = createAsyncThunk(
  'books/deleteBook',
  async (id, { rejectWithValue }) => {
    try {
      await apiService.delete(`/books/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const initialState = {
  books: [],
  currentBook: null,
  bookTranslations: [],
  currentBookTranslation: null,
  currentChapter: null,
  verseGroups: [],
  currentVerseGroup: null,
  verseGroupsTotal: 0,
  page: 1,
  limit: 10,
  total: 0,
  loading: false,
  bookTranslationsLoading: false,
  verseGroupsLoading: false,
  error: null,
  creating: false,
  updating: false,
  deleting: false,
  creatingBookTranslation: false,
  updatingBookTranslation: false,
  deletingBookTranslation: false,
  creatingChapter: false,
  updatingChapter: false,
  deletingChapter: false,
  creatingVerseGroup: false,
  updatingVerseGroup: false,
  deletingVerseGroup: false,
  creatingVerseGroupTranslation: false,
  updatingVerseGroupTranslation: false,
  deletingVerseGroupTranslation: false,
};

const booksSlice = createSlice({
  name: 'books',
  initialState,
  reducers: {
    clearCurrentBook: (state) => {
      state.currentBook = null;
    },
    clearBookTranslations: (state) => {
      state.bookTranslations = [];
    },
    clearCurrentBookTranslation: (state) => {
      state.currentBookTranslation = null;
    },
    clearCurrentChapter: (state) => {
      state.currentChapter = null;
    },
    clearCurrentVerseGroup: (state) => {
      state.currentVerseGroup = null;
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
      // Fetch Books
      .addCase(fetchBooks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBooks.fulfilled, (state, action) => {
        state.loading = false;
        state.books = (action.payload?.data || []).map(normalizeBookListItem);
        state.total = action.payload?.totalCount || action.payload?.data?.length || 0;
      })
      .addCase(fetchBooks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Single Book
      .addCase(fetchBook.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBook.fulfilled, (state, action) => {
        state.loading = false;
        state.currentBook = action.payload ? normalizeBookDetail(action.payload) : null;
      })
      .addCase(fetchBook.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Book Translations
      .addCase(fetchBookTranslations.pending, (state) => {
        state.bookTranslationsLoading = true;
        state.error = null;
      })
      .addCase(fetchBookTranslations.fulfilled, (state, action) => {
        state.bookTranslationsLoading = false;
        state.bookTranslations = (action.payload?.data || []).map(normalizeBookTranslationItem);
      })
      .addCase(fetchBookTranslations.rejected, (state, action) => {
        state.bookTranslationsLoading = false;
        state.error = action.payload;
      })

      // Fetch Single Book Translation
      .addCase(fetchBookTranslation.pending, (state) => {
        state.bookTranslationsLoading = true;
        state.error = null;
      })
      .addCase(fetchBookTranslation.fulfilled, (state, action) => {
        state.bookTranslationsLoading = false;
        state.currentBookTranslation = action.payload ? normalizeBookTranslationItem(action.payload) : null;
      })
      .addCase(fetchBookTranslation.rejected, (state, action) => {
        state.bookTranslationsLoading = false;
        state.error = action.payload;
      })

      // Create Book
      .addCase(createBook.pending, (state) => {
        state.creating = true;
        state.error = null;
      })
      .addCase(createBook.fulfilled, (state, action) => {
        state.creating = false;
        if (action.payload) {
          state.books.push(action.payload);
          state.total += 1;
        }
      })
      .addCase(createBook.rejected, (state, action) => {
        state.creating = false;
        state.error = action.payload;
      })

      // Create Book Translation
      .addCase(createBookTranslation.pending, (state) => {
        state.creatingBookTranslation = true;
        state.error = null;
      })
      .addCase(createBookTranslation.fulfilled, (state, action) => {
        state.creatingBookTranslation = false;
        const translation = normalizeBookTranslationItem(action.payload);
        if (translation) {
          state.bookTranslations.push(translation);
          state.currentBookTranslation = translation;
        }
      })
      .addCase(createBookTranslation.rejected, (state, action) => {
        state.creatingBookTranslation = false;
        state.error = action.payload;
      })

      // Update Book
      .addCase(updateBook.pending, (state) => {
        state.updating = true;
        state.error = null;
      })
      .addCase(updateBook.fulfilled, (state, action) => {
        state.updating = false;
        if (action.payload) {
          const index = state.books.findIndex((book) => book.id === action.payload.id);
          if (index !== -1) {
            state.books[index] = action.payload;
          }
          if (state.currentBook?.id === action.payload.id) {
            state.currentBook = action.payload;
          }
        }
      })
      .addCase(updateBook.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload;
      })

      // Update Book Translation
      .addCase(updateBookTranslation.pending, (state) => {
        state.updatingBookTranslation = true;
        state.error = null;
      })
      .addCase(updateBookTranslation.fulfilled, (state, action) => {
        state.updatingBookTranslation = false;
        const translation = normalizeBookTranslationItem(action.payload);
        if (translation) {
          const index = state.bookTranslations.findIndex((item) => item.id === translation.id);
          if (index !== -1) {
            state.bookTranslations[index] = translation;
          }
          if (state.currentBookTranslation?.id === translation.id) {
            state.currentBookTranslation = translation;
          }
        }
      })
      .addCase(updateBookTranslation.rejected, (state, action) => {
        state.updatingBookTranslation = false;
        state.error = action.payload;
      })

      // Delete Book
      .addCase(deleteBook.pending, (state) => {
        state.deleting = true;
        state.error = null;
      })
      .addCase(deleteBook.fulfilled, (state, action) => {
        state.deleting = false;
        state.books = state.books.filter((book) => book.id !== action.payload);
        if (state.total > 0) state.total -= 1;
        if (state.currentBook?.id === action.payload) {
          state.currentBook = null;
        }
      })
      .addCase(deleteBook.rejected, (state, action) => {
        state.deleting = false;
        state.error = action.payload;
      })

      // Delete Book Translation
      .addCase(deleteBookTranslation.pending, (state) => {
        state.deletingBookTranslation = true;
        state.error = null;
      })
      .addCase(deleteBookTranslation.fulfilled, (state, action) => {
        state.deletingBookTranslation = false;
        state.bookTranslations = state.bookTranslations.filter((item) => item.id !== action.payload);
        if (state.currentBookTranslation?.id === action.payload) {
          state.currentBookTranslation = null;
        }
      })
      .addCase(deleteBookTranslation.rejected, (state, action) => {
        state.deletingBookTranslation = false;
        state.error = action.payload;
      })

      // Fetch Chapter
      .addCase(fetchChapter.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchChapter.fulfilled, (state, action) => {
        state.loading = false;
        state.currentChapter = action.payload;
      })
      .addCase(fetchChapter.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create Chapter
      .addCase(createChapter.pending, (state) => {
        state.creatingChapter = true;
        state.error = null;
      })
      .addCase(createChapter.fulfilled, (state, action) => {
        state.creatingChapter = false;
        if (action.payload) {
          if (state.currentBook?.chapters) {
            state.currentBook.chapters.push(action.payload);
          }
        }
      })
      .addCase(createChapter.rejected, (state, action) => {
        state.creatingChapter = false;
        state.error = action.payload;
      })

      // Update Chapter
      .addCase(updateChapter.pending, (state) => {
        state.updatingChapter = true;
        state.error = null;
      })
      .addCase(updateChapter.fulfilled, (state, action) => {
        state.updatingChapter = false;
        if (action.payload) {
          if (state.currentBook?.chapters) {
            const index = state.currentBook.chapters.findIndex((chapter) => chapter.id === action.payload.id);
            if (index !== -1) {
              state.currentBook.chapters[index] = action.payload;
            }
          }
          if (state.currentChapter?.id === action.payload.id) {
            state.currentChapter = action.payload;
          }
        }
      })
      .addCase(updateChapter.rejected, (state, action) => {
        state.updatingChapter = false;
        state.error = action.payload;
      })

      // Delete Chapter
      .addCase(deleteChapter.pending, (state) => {
        state.deletingChapter = true;
        state.error = null;
      })
      .addCase(deleteChapter.fulfilled, (state, action) => {
        state.deletingChapter = false;
        if (state.currentBook?.chapters) {
          state.currentBook.chapters = state.currentBook.chapters.filter((chapter) => chapter.id !== action.payload);
        }
        if (state.currentChapter?.id === action.payload) {
          state.currentChapter = null;
        }
      })
      .addCase(deleteChapter.rejected, (state, action) => {
        state.deletingChapter = false;
        state.error = action.payload;
      })

      // Fetch Verse Groups
      .addCase(fetchVerseGroups.pending, (state) => {
        state.verseGroupsLoading = true;
        state.error = null;
      })
      .addCase(fetchVerseGroups.fulfilled, (state, action) => {
        state.verseGroupsLoading = false;
        state.verseGroups = action.payload?.data || [];
        state.verseGroupsTotal = action.payload?.totalCount || action.payload?.data?.length || 0;
      })
      .addCase(fetchVerseGroups.rejected, (state, action) => {
        state.verseGroupsLoading = false;
        state.error = action.payload;
      })

      // Fetch Single Verse Group
      .addCase(fetchVerseGroup.pending, (state) => {
        state.verseGroupsLoading = true;
        state.error = null;
      })
      .addCase(fetchVerseGroup.fulfilled, (state, action) => {
        state.verseGroupsLoading = false;
        state.currentVerseGroup = action.payload;
      })
      .addCase(fetchVerseGroup.rejected, (state, action) => {
        state.verseGroupsLoading = false;
        state.error = action.payload;
      })

      // Create Verse Group
      .addCase(createVerseGroup.pending, (state) => {
        state.creatingVerseGroup = true;
        state.error = null;
      })
      .addCase(createVerseGroup.fulfilled, (state, action) => {
        state.creatingVerseGroup = false;
        if (action.payload) {
          state.verseGroups.unshift(action.payload);
          state.verseGroupsTotal += 1;
        }
      })
      .addCase(createVerseGroup.rejected, (state, action) => {
        state.creatingVerseGroup = false;
        state.error = action.payload;
      })

      // Update Verse Group
      .addCase(updateVerseGroup.pending, (state) => {
        state.updatingVerseGroup = true;
        state.error = null;
      })
      .addCase(updateVerseGroup.fulfilled, (state, action) => {
        state.updatingVerseGroup = false;
        if (action.payload) {
          const index = state.verseGroups.findIndex((item) => item.id === action.payload.id);
          if (index !== -1) {
            state.verseGroups[index] = {
              ...state.verseGroups[index],
              ...action.payload,
            };
          }
          if (state.currentVerseGroup?.id === action.payload.id) {
            state.currentVerseGroup = {
              ...state.currentVerseGroup,
              ...action.payload,
            };
          }
        }
      })
      .addCase(updateVerseGroup.rejected, (state, action) => {
        state.updatingVerseGroup = false;
        state.error = action.payload;
      })

      // Delete Verse Group
      .addCase(deleteVerseGroup.pending, (state) => {
        state.deletingVerseGroup = true;
        state.error = null;
      })
      .addCase(deleteVerseGroup.fulfilled, (state, action) => {
        state.deletingVerseGroup = false;
        state.verseGroups = state.verseGroups.filter((item) => item.id !== action.payload);
        if (state.verseGroupsTotal > 0) {
          state.verseGroupsTotal -= 1;
        }
        if (state.currentVerseGroup?.id === action.payload) {
          state.currentVerseGroup = null;
        }
      })
      .addCase(deleteVerseGroup.rejected, (state, action) => {
        state.deletingVerseGroup = false;
        state.error = action.payload;
      })

      // Create Verse Group Translation
      .addCase(createVerseGroupTranslation.pending, (state) => {
        state.creatingVerseGroupTranslation = true;
        state.error = null;
      })
      .addCase(createVerseGroupTranslation.fulfilled, (state, action) => {
        state.creatingVerseGroupTranslation = false;
        if (action.payload && state.currentVerseGroup) {
          const currentTranslations = state.currentVerseGroup.translations || [];
          state.currentVerseGroup.translations = [...currentTranslations, action.payload];
        }
      })
      .addCase(createVerseGroupTranslation.rejected, (state, action) => {
        state.creatingVerseGroupTranslation = false;
        state.error = action.payload;
      })

      // Update Verse Group Translation
      .addCase(updateVerseGroupTranslation.pending, (state) => {
        state.updatingVerseGroupTranslation = true;
        state.error = null;
      })
      .addCase(updateVerseGroupTranslation.fulfilled, (state, action) => {
        state.updatingVerseGroupTranslation = false;
        if (action.payload && state.currentVerseGroup?.translations) {
          const index = state.currentVerseGroup.translations.findIndex(
            (translation) => translation.id === action.payload.id
          );
          if (index !== -1) {
            state.currentVerseGroup.translations[index] = action.payload;
          }
        }
      })
      .addCase(updateVerseGroupTranslation.rejected, (state, action) => {
        state.updatingVerseGroupTranslation = false;
        state.error = action.payload;
      })

      // Delete Verse Group Translation
      .addCase(deleteVerseGroupTranslation.pending, (state) => {
        state.deletingVerseGroupTranslation = true;
        state.error = null;
      })
      .addCase(deleteVerseGroupTranslation.fulfilled, (state, action) => {
        state.deletingVerseGroupTranslation = false;
        if (state.currentVerseGroup?.translations) {
          state.currentVerseGroup.translations = state.currentVerseGroup.translations.filter(
            (translation) => translation.id !== action.payload
          );
        }
      })
      .addCase(deleteVerseGroupTranslation.rejected, (state, action) => {
        state.deletingVerseGroupTranslation = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearCurrentBook,
  clearBookTranslations,
  clearCurrentBookTranslation,
  clearCurrentChapter,
  clearCurrentVerseGroup,
  clearError,
  setPage,
  setLimit,
  setTotal,
} = booksSlice.actions;

export default booksSlice.reducer;
