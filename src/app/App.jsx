import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { App as AntApp } from 'antd';
import { I18nextProvider } from 'react-i18next';
import { useSelector } from 'react-redux';
import i18n from '@/i18n';
import { ReduxProvider } from '@/providers/ReduxProvider';
import { AuthProvider } from '@/providers/AuthProvider';
import { RTLProvider } from '@/components/RTLProvider';
import ProtectedRoute from '@/pages/auth/ProtectedRoute';
import LoginPage from '@/pages/auth/LoginPage';
import AppLayout from '@/components/layout/AppLayout';
import StaticSidebar from '@/components/layout/StaticSidebar';
import AnalyticsPage from '@/pages/analytics/AnalyticsPage';
import FaqsList from '@/pages/faqs/FaqsList';
import FaqDetail from '@/pages/faqs/FaqDetail';
import FaqForm from '@/pages/faqs/FaqForm';
import SaintsList from '@/pages/saints/SaintsList';
import SaintDetail from '@/pages/saints/SaintDetail';
import SaintForm from '@/pages/saints/SaintForm';
import SynaxariumList from '@/pages/synaxarium/SynaxariumList';
import SynaxariumDetail from '@/pages/synaxarium/SynaxariumDetail';
import SynaxariumForm from '@/pages/synaxarium/SynaxariumForm';
import PortalSuggestionsList from '@/pages/portalSuggestions/PortalSuggestionsList';
import AskThePopeList from '@/pages/askThePope/AskThePopeList';
import AskThePopeDetail from '@/pages/askThePope/AskThePopeDetail';
import UsersList from '@/pages/users/UsersList';
import UserDetail from '@/pages/users/UserDetail';
import UserForm from '@/pages/users/UserForm';
import PapalDecisionsList from '@/pages/papalDecisions/PapalDecisionsList';
import PapalDecisionsYear from '@/pages/papalDecisions/PapalDecisionsYear';
import PapalDecisionDetail from '@/pages/papalDecisions/PapalDecisionDetail';
import MagazinesList from '@/pages/magazines/MagazinesList';
import MagazineDetail from '@/pages/magazines/MagazineDetail';
import MagazineForm from '@/pages/magazines/MagazineForm';
import MagazineReleaseYearDetail from '@/pages/magazines/MagazineReleaseYearDetail';
import ReleaseTranslation from '@/pages/magazines/ReleaseTranslation';
import TagsList from '@/pages/tags/TagsList';
import TagForm from '@/pages/tags/TagForm';
import TagDetail from '@/pages/tags/TagDetail';
import ArticlesList from '@/pages/articles/ArticlesList';
import EntitiesList from '@/pages/entities/EntitiesList';
import EntityDetail from '@/pages/entities/EntityDetail';
import EntityForm from '@/pages/entities/EntityForm';
import EntityTranslationDetail from '@/pages/entities/EntityTranslationDetail';
import EntityTranslationForm from '@/pages/entities/EntityTranslationForm';
import CommitteesList from '@/pages/committees/CommitteesList';
import CommitteeDetail from '@/pages/committees/CommitteeDetail';
import CommitteeForm from '@/pages/committees/CommitteeForm';
import ClericsList from '@/pages/clerics/ClericsList';
import ClericDetail from '@/pages/clerics/ClericDetail';
import ClericForm from '@/pages/clerics/ClericForm';
import BooksList from '@/pages/bible/BooksList';
import BookDetail from '@/pages/bible/BookDetail';
import BookForm from '@/pages/bible/BookForm';
import BookTranslationsList from '@/pages/bible/BookTranslationsList';
import BookTranslationDetail from '@/pages/bible/BookTranslationDetail';
import BookTranslationForm from '@/pages/bible/BookTranslationForm';
import ChapterForm from '@/pages/bible/ChapterForm';
import ChapterDetail from '@/pages/bible/ChapterDetail';
import VerseGroupForm from '@/pages/bible/VerseGroupForm';
import VerseGroupDetail from '@/pages/bible/VerseGroupDetail';
import SettingsPage from '@/pages/settings/SettingsPage';
import LogsList from '@/pages/logs/LogsList';
import LogDetails from '@/pages/logs/LogDetails';
import ErrorBoundary from '@/components/ErrorBoundary';
import '@/styles/index.css';

function LayoutWithSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { direction } = useSelector((state) => state.auth);
  const isRTL = direction === 'rtl';
  const sidebarWidth = collapsed ? 80 : 270;

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <StaticSidebar collapsed={collapsed} />
      <div style={{
        flex: 1,
        minWidth: 0,
        marginLeft: isRTL ? 0 : sidebarWidth,
        marginRight: isRTL ? sidebarWidth : 0,
        transition: 'margin 0.2s'
      }}>
        <AppLayout collapsed={collapsed} setCollapsed={setCollapsed}>
          <Outlet />
        </AppLayout>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <I18nextProvider i18n={i18n}>
        <ReduxProvider>
          <BrowserRouter>
            <AuthProvider>
              <RTLProvider>
                <AntApp>
                  <Routes>
                    {/* Public Routes */}
                    <Route path="/login" element={<LoginPage />} />

                    {/* Protected Routes - Layout with nested routes */}
                    <Route
                      path="/"
                      element={
                        <ProtectedRoute>
                          <LayoutWithSidebar />
                        </ProtectedRoute>
                      }
                    >
                      <Route index element={<Navigate to="/dashboard" replace />} />
                      <Route
                        path="dashboard"
                        element={
                          <ProtectedRoute requiredRole="Admin">
                            <AnalyticsPage />
                          </ProtectedRoute>
                        }
                      />

                      {/* Articles Routes */}
                      <Route
                        path="articles"
                        element={
                          <ProtectedRoute requiredRole="Admin">
                            <ArticlesList />
                          </ProtectedRoute>
                        }
                      />

                      {/* Entities Routes */}
                      <Route
                        path="entities"
                        element={
                          <ProtectedRoute requiredRole="Admin">
                            <EntitiesList />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="entities/create"
                        element={
                          <ProtectedRoute requiredRole="Admin">
                            <EntityForm />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="entities/:slug"
                        element={
                          <ProtectedRoute requiredRole="Admin">
                            <EntityDetail />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="entities/:slug/edit"
                        element={
                          <ProtectedRoute requiredRole="Admin">
                            <EntityForm />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="entities/:slug/translations/create"
                        element={
                          <ProtectedRoute requiredRole="Admin">
                            <EntityTranslationForm />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="entities/:slug/translations/:translationId"
                        element={
                          <ProtectedRoute requiredRole="Admin">
                            <EntityTranslationDetail />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="entities/:slug/translations/:translationId/edit"
                        element={
                          <ProtectedRoute requiredRole="Admin">
                            <EntityTranslationForm />
                          </ProtectedRoute>
                        }
                      />

                      {/* FAQs Routes */}
                      <Route
                        path="ask-the-pope"
                        element={
                          <ProtectedRoute requiredRole="Admin">
                            <AskThePopeList />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="ask-the-pope/:id"
                        element={
                          <ProtectedRoute requiredRole="Admin">
                            <AskThePopeDetail />
                          </ProtectedRoute>
                        }
                      />

                      <Route
                        path="portal-suggestions"
                        element={
                          <ProtectedRoute requiredRole="Admin">
                            <PortalSuggestionsList />
                          </ProtectedRoute>
                        }
                      />

                      <Route
                        path="synaxarium"
                        element={
                          <ProtectedRoute requiredRole="Admin">
                            <SynaxariumList />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="synaxarium/create"
                        element={
                          <ProtectedRoute requiredRole="Admin">
                            <SynaxariumForm />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="synaxarium/:id"
                        element={
                          <ProtectedRoute requiredRole="Admin">
                            <SynaxariumDetail />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="synaxarium/:id/edit"
                        element={
                          <ProtectedRoute requiredRole="Admin">
                            <SynaxariumForm />
                          </ProtectedRoute>
                        }
                      />

                      <Route
                        path="saints"
                        element={
                          <ProtectedRoute requiredRole="Admin">
                            <SaintsList />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="saints/create"
                        element={
                          <ProtectedRoute requiredRole="Admin">
                            <SaintForm />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="saints/:id"
                        element={
                          <ProtectedRoute requiredRole="Admin">
                            <SaintDetail />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="saints/:id/edit"
                        element={
                          <ProtectedRoute requiredRole="Admin">
                            <SaintForm />
                          </ProtectedRoute>
                        }
                      />

                      <Route
                        path="faqs"
                        element={
                          <ProtectedRoute requiredRole="Admin">
                            <FaqsList />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="faqs/create"
                        element={
                          <ProtectedRoute requiredRole="Admin">
                            <FaqForm />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="faqs/:id"
                        element={
                          <ProtectedRoute requiredRole="Admin">
                            <FaqDetail />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="faqs/:id/edit"
                        element={
                          <ProtectedRoute requiredRole="Admin">
                            <FaqForm />
                          </ProtectedRoute>
                        }
                      />

                      {/* Settings Routes */}
                      <Route
                        path="settings"
                        element={
                          <ProtectedRoute requiredRole="Admin">
                            <SettingsPage />
                          </ProtectedRoute>
                        }
                      />

                      <Route
                        path="logs"
                        element={
                          <ProtectedRoute requiredRole="Admin">
                            <LogsList />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="logs/logDetails"
                        element={
                          <ProtectedRoute requiredRole="Admin">
                            <LogDetails />
                          </ProtectedRoute>
                        }
                      />

                      {/* Users Routes */}
                      <Route
                        path="users"
                        element={
                          <ProtectedRoute requiredRole="Admin">
                            <UsersList />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="users/create"
                        element={
                          <ProtectedRoute requiredRole="Admin">
                            <UserForm />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="users/:id"
                        element={
                          <ProtectedRoute requiredRole="Admin">
                            <UserDetail />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="users/:id/edit"
                        element={
                          <ProtectedRoute requiredRole="Admin">
                            <UserForm />
                          </ProtectedRoute>
                        }
                      />

                      {/* Papal Decisions Routes */}
                      <Route
                        path="papal-decisions"
                        element={
                          <ProtectedRoute requiredRole="Admin">
                            <PapalDecisionsList />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="papal-decisions/:year"
                        element={
                          <ProtectedRoute requiredRole="Admin">
                            <PapalDecisionsYear />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="papal-decisions/:year/:decisionId"
                        element={
                          <ProtectedRoute requiredRole="Admin">
                            <PapalDecisionDetail />
                          </ProtectedRoute>
                        }
                      />

                      {/* Magazines Routes */}
                      <Route
                        path="magazines"
                        element={
                          <ProtectedRoute requiredRole="Admin">
                            <MagazinesList />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="magazines/create"
                        element={
                          <ProtectedRoute requiredRole="Admin">
                            <MagazineForm />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="magazines/:id"
                        element={
                          <ProtectedRoute requiredRole="Admin">
                            <MagazineDetail />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="magazines/:id/edit"
                        element={
                          <ProtectedRoute requiredRole="Admin">
                            <MagazineForm />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="magazines/:id/release-years/:releaseYearId"
                        element={
                          <ProtectedRoute requiredRole="Admin">
                            <MagazineReleaseYearDetail />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="magazines/:id/release-years/:releaseYearId/releases/:releaseId/translations"
                        element={
                          <ProtectedRoute requiredRole="Admin">
                            <ReleaseTranslation />
                          </ProtectedRoute>
                        }
                      />

                      {/* Tags Routes */}
                      <Route
                        path="tags"
                        element={
                          <ProtectedRoute requiredRole="Admin">
                            <TagsList />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="tags/create"
                        element={
                          <ProtectedRoute requiredRole="Admin">
                            <TagForm />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="tags/:id"
                        element={
                          <ProtectedRoute requiredRole="Admin">
                            <TagDetail />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="tags/:id/edit"
                        element={
                          <ProtectedRoute requiredRole="Admin">
                            <TagForm />
                          </ProtectedRoute>
                        }
                      />

                      {/* Committees Routes */}
                      <Route
                        path="committees"
                        element={
                          <ProtectedRoute requiredRole="Admin">
                            <CommitteesList />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="committees/create"
                        element={
                          <ProtectedRoute requiredRole="Admin">
                            <CommitteeForm />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="committees/:id"
                        element={
                          <ProtectedRoute requiredRole="Admin">
                            <CommitteeDetail />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="committees/:id/edit"
                        element={
                          <ProtectedRoute requiredRole="Admin">
                            <CommitteeForm />
                          </ProtectedRoute>
                        }
                      />

                      {/* Clerics Routes */}
                      <Route
                        path="clerics"
                        element={
                          <ProtectedRoute requiredRole="Admin">
                            <ClericsList />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="clerics/create"
                        element={
                          <ProtectedRoute requiredRole="Admin">
                            <ClericForm />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="clerics/:id"
                        element={
                          <ProtectedRoute requiredRole="Admin">
                            <ClericDetail />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="clerics/:id/edit"
                        element={
                          <ProtectedRoute requiredRole="Admin">
                            <ClericForm />
                          </ProtectedRoute>
                        }
                      />

                      {/* Bible Routes */}
                      <Route
                        path="bible"
                        element={
                          <ProtectedRoute requiredRole="Admin">
                            <BooksList />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="bible/books/create"
                        element={
                          <ProtectedRoute requiredRole="Admin">
                            <BookForm />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="bible/books/:id"
                        element={
                          <ProtectedRoute requiredRole="Admin">
                            <BookDetail />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="bible/books/:id/edit"
                        element={
                          <ProtectedRoute requiredRole="Admin">
                            <BookForm />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="bible/books/:id/translations"
                        element={
                          <ProtectedRoute requiredRole="Admin">
                            <BookTranslationsList />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="bible/books/:id/translations/create"
                        element={
                          <ProtectedRoute requiredRole="Admin">
                            <BookTranslationForm />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="bible/books/:id/translations/:translationId"
                        element={
                          <ProtectedRoute requiredRole="Admin">
                            <BookTranslationDetail />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="bible/books/:id/translations/:translationId/edit"
                        element={
                          <ProtectedRoute requiredRole="Admin">
                            <BookTranslationForm />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="bible/chapters/create"
                        element={
                          <ProtectedRoute requiredRole="Admin">
                            <ChapterForm />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="bible/chapters/:id"
                        element={
                          <ProtectedRoute requiredRole="Admin">
                            <ChapterDetail />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="bible/chapters/:id/edit"
                        element={
                          <ProtectedRoute requiredRole="Admin">
                            <ChapterForm />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="bible/verse-groups/create"
                        element={
                          <ProtectedRoute requiredRole="Admin">
                            <VerseGroupForm />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="bible/verse-groups/:id"
                        element={
                          <ProtectedRoute requiredRole="Admin">
                            <VerseGroupDetail />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="bible/verse-groups/:id/edit"
                        element={
                          <ProtectedRoute requiredRole="Admin">
                            <VerseGroupForm />
                          </ProtectedRoute>
                        }
                      />

                      {/* Catch all - redirect to dashboard */}
                      <Route path="*" element={<Navigate to="/dashboard" replace />} />
                    </Route>
                  </Routes>
                </AntApp>
              </RTLProvider>
            </AuthProvider>
          </BrowserRouter>
        </ReduxProvider>
      </I18nextProvider>
    </ErrorBoundary>
  );
}
