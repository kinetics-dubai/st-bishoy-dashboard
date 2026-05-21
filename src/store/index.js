import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import authReducer from './authSlice';
import monksReducer from './monksSlice';
import usersReducer from './usersSlice';
import tagsReducer from './tagsSlice';
import articlesReducer from './articlesSlice';
import entitiesReducer from './entitiesSlice';
import saintsReducer from './saintsSlice';
import projectsReducer from './projectsSlice';
import productsReducer from './productsSlice';
import sermonsReducer from './sermonsSlice';
import eventsReducer from './eventsSlice';

const persistConfig = {
  key: 'auth',
  storage,
  transforms: [
    {
      in: (inboundState) => inboundState,
      out: (outboundState) => {
        if (outboundState && typeof outboundState === 'object') {
          const parsedState = { ...outboundState };

          if (parsedState.user && typeof parsedState.user === 'string') {
            try {
              parsedState.user = JSON.parse(parsedState.user);
            } catch (e) {
              // Keep persisted value as-is if parse fails.
            }
          }

          if (parsedState.token && typeof parsedState.token === 'string') {
            parsedState.token = parsedState.token.replace(/^"(.*)"$/, '$1');
          }
          if (parsedState.language && typeof parsedState.language === 'string') {
            parsedState.language = parsedState.language.replace(/^"(.*)"$/, '$1');
          }
          if (parsedState.direction && typeof parsedState.direction === 'string') {
            parsedState.direction = parsedState.direction.replace(/^"(.*)"$/, '$1');
          }
          if (parsedState.theme && typeof parsedState.theme === 'string') {
            parsedState.theme = parsedState.theme.replace(/^"(.*)"$/, '$1');
          }

          return parsedState;
        }

        return outboundState;
      },
    },
  ],
};

const persistedAuthReducer = persistReducer(persistConfig, authReducer);

export const store = configureStore({
  reducer: {
    auth: persistedAuthReducer,
    monks: monksReducer,
    users: usersReducer,
    tags: tagsReducer,
    articles: articlesReducer,
    entities: entitiesReducer,
    saints: saintsReducer,
    projects: projectsReducer,
    products: productsReducer,
    sermons: sermonsReducer,
    events: eventsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE', 'persist/REGISTER'],
        ignoredPaths: ['auth._persist'],
      },
    }),
  devTools: import.meta.env.DEV,
});

export const persistor = persistStore(store);

export default store;
