import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import apiService from '@/services/apiService';
import { buildQuery } from '@/lib/queryHelper';

const normalizeProduct = (product) => {
  if (!product) return product;
  return {
    id: product.id,
    title: product.title || '',
    title_ar: product.title_ar || '',
    slug: product.slug || '',
    description: product.description || '',
    description_ar: product.description_ar || '',
    image: product.image || '',
    categoryId: product.categoryId || null,
    category: product.category || null,
  };
};

export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (params = {}, { rejectWithValue }) => {
    try {
      const queryString = buildQuery(params);
      const url = queryString ? `/products?${queryString}` : '/products';
      const response = await apiService.get(url);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchProduct = createAsyncThunk(
  'products/fetchProduct',
  async (slug, { rejectWithValue }) => {
    try {
      const response = await apiService.get(`/products/${slug}`);
      return normalizeProduct(response.data?.data || response.data);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createProduct = createAsyncThunk(
  'products/createProduct',
  async (data, { rejectWithValue }) => {
    try {
      const response = await apiService.post('/products', data);
      return normalizeProduct(response.data?.data || response.data);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateProduct = createAsyncThunk(
  'products/updateProduct',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await apiService.put(`/products/${id}`, data);
      return normalizeProduct(response.data?.data || response.data);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteProduct = createAsyncThunk(
  'products/deleteProduct',
  async (id, { rejectWithValue }) => {
    try {
      await apiService.delete(`/products/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const initialState = {
  products: [],
  currentProduct: null,
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

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    clearCurrentProduct: (state) => {
      state.currentProduct = null;
    },
    clearProductError: (state) => {
      state.error = null;
    },
    setProductsPage: (state, action) => {
      state.page = action.payload;
    },
    setProductsLimit: (state, action) => {
      state.limit = action.payload;
      state.page = 1;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state, action) => {
        state.loading = true;
        state.error = null;
        state.currentListRequestId = action.meta.requestId;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        if (state.currentListRequestId !== action.meta.requestId) return;
        state.loading = false;
        state.products = (action.payload?.data || []).map(normalizeProduct);
        state.total = action.payload?.pagination?.total || action.payload?.data?.length || 0;
        state.currentListRequestId = null;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        if (state.currentListRequestId !== action.meta.requestId) return;
        state.loading = false;
        state.error = action.payload;
        state.currentListRequestId = null;
      })
      .addCase(fetchProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.currentProduct = action.payload;
      })
      .addCase(fetchProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createProduct.pending, (state) => {
        state.creating = true;
        state.error = null;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.creating = false;
        if (action.payload) {
          state.products.unshift(action.payload);
          state.total += 1;
        }
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.creating = false;
        state.error = action.payload;
      })
      .addCase(updateProduct.pending, (state) => {
        state.updating = true;
        state.error = null;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.updating = false;
        if (action.payload) {
          const index = state.products.findIndex((p) => p.id === action.payload.id);
          if (index !== -1) state.products[index] = action.payload;
          if (String(state.currentProduct?.id) === String(action.payload.id)) {
            state.currentProduct = action.payload;
          }
        }
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload;
      })
      .addCase(deleteProduct.pending, (state) => {
        state.deleting = true;
        state.error = null;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.deleting = false;
        state.products = state.products.filter((p) => p.id !== action.payload);
        if (state.total > 0) state.total -= 1;
        if (String(state.currentProduct?.id) === String(action.payload)) {
          state.currentProduct = null;
        }
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.deleting = false;
        state.error = action.payload;
      });
  },
});

export const { clearCurrentProduct, clearProductError, setProductsPage, setProductsLimit } = productsSlice.actions;
export default productsSlice.reducer;
