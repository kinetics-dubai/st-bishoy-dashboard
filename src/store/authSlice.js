import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null,
  token: null,
  loading: true,
  direction: 'rtl',
  language: 'ar',
  theme: 'light',
  redirectAfterLogin: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
    },
    setToken: (state, action) => {
      state.token = action.payload;
    },
    setLanguage: (state, action) => {
      state.language = action.payload;
      state.direction = action.payload === 'ar' ? 'rtl' : 'ltr';
    },
    setTheme: (state, action) => {
      state.theme = action.payload;
    },
    setRedirectAfterLogin: (state, action) => {
      state.redirectAfterLogin = action.payload;
    },
    login: (state, action) => {
      const { user, token } = action.payload;
      state.user = user;
      state.token = token;
      state.loading = false;
      state.redirectAfterLogin = null;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.loading = false;
      state.redirectAfterLogin = null;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
  },
});

export const {
  setUser,
  setToken,
  setLanguage,
  setTheme,
  setRedirectAfterLogin,
  login,
  logout,
  setLoading,
} = authSlice.actions;

export default authSlice.reducer;
