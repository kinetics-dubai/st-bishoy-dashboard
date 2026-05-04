import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import authReducer from './authSlice';
import committeesReducer from './committeesSlice';
import clericsReducer from './clericsSlice';
import faqsReducer from './faqsSlice';
import saintsReducer from './saintsSlice';
import synaxariumReducer from './synaxariumSlice';
import askThePopeReducer from './askThePopeSlice';
import portalSuggestionsReducer from './portalSuggestionsSlice';
import usersReducer from './usersSlice';
import papalDecisionsReducer from './papalDecisionsSlice';
import magazinesReducer from './magazinesSlice';
import tagsReducer from './tagsSlice';
import booksReducer from './booksSlice';
import articlesReducer from './articlesSlice';
import entitiesReducer from './entitiesSlice';
import translationsReducer from './translationsSlice';
import logsReducer from './logsSlice';

const persistConfig = {
  key: 'auth',
  storage,
  transforms: [
    {
      in: (inboundState) => {
        // Ensure we don't double-stringify
        return inboundState;
      },
      out: (outboundState) => {
        // Ensure we properly parse stored strings
        if (outboundState && typeof outboundState === 'object') {
          const parsedState = { ...outboundState };
          // Parse stringified fields back to objects/strings
          if (parsedState.user && typeof parsedState.user === 'string') {
            try {
              parsedState.user = JSON.parse(parsedState.user);
            } catch (e) {
              // Keep as is if parsing fails
            }
          }
          if (parsedState.token && typeof parsedState.token === 'string') {
            // Remove extra quotes from token
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
    committees: committeesReducer,
    clerics: clericsReducer,
    faqs: faqsReducer,
    saints: saintsReducer,
    synaxarium: synaxariumReducer,
    askThePope: askThePopeReducer,
    portalSuggestions: portalSuggestionsReducer,
    users: usersReducer,
    papalDecisions: papalDecisionsReducer,
    magazines: magazinesReducer,
    tags: tagsReducer,
    articles: articlesReducer,
    entities: entitiesReducer,
    books: booksReducer,
    translations: translationsReducer,
    logs: logsReducer,
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
