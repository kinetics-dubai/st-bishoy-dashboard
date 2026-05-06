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
import UsersList from '@/pages/users/UsersList';
import UserDetail from '@/pages/users/UserDetail';
import UserForm from '@/pages/users/UserForm';
import TagsList from '@/pages/tags/TagsList';
import TagForm from '@/pages/tags/TagForm';
import TagDetail from '@/pages/tags/TagDetail';
import ArticlesList from '@/pages/articles/ArticlesList';
import EntitiesList from '@/pages/entities/EntitiesList';
import EntityDetail from '@/pages/entities/EntityDetail';
import EntityForm from '@/pages/entities/EntityForm';
import MonksList from '@/pages/monks/MonksList';
import MonkDetail from '@/pages/monks/MonkDetail';
import MonkForm from '@/pages/monks/MonkForm';
import SaintsList from '@/pages/saints/SaintsList';
import SaintDetail from '@/pages/saints/SaintDetail';
import SaintForm from '@/pages/saints/SaintForm';
import SettingsPage from '@/pages/settings/SettingsPage';
import HomePage from '@/pages/home/HomePage';
import MonasteryPage from '@/pages/monastery/MonasteryPage';
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
      <div
        style={{
          flex: 1,
          minWidth: 0,
          marginLeft: isRTL ? 0 : sidebarWidth,
          marginRight: isRTL ? sidebarWidth : 0,
          transition: 'margin 0.2s',
        }}
      >
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
                    <Route path="/login" element={<LoginPage />} />

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

                      <Route
                        path="articles"
                        element={
                          <ProtectedRoute requiredRole="Admin">
                            <ArticlesList />
                          </ProtectedRoute>
                        }
                      />

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
                        path="entities/:id"
                        element={
                          <ProtectedRoute requiredRole="Admin">
                            <EntityDetail />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="entities/:id/edit"
                        element={
                          <ProtectedRoute requiredRole="Admin">
                            <EntityForm />
                          </ProtectedRoute>
                        }
                      />

                      <Route
                        path="home"
                        element={
                          <ProtectedRoute requiredRole="Admin">
                            <HomePage />
                          </ProtectedRoute>
                        }
                      />

                      <Route
                        path="monastery"
                        element={
                          <ProtectedRoute requiredRole="Admin">
                            <MonasteryPage />
                          </ProtectedRoute>
                        }
                      />

                      <Route
                        path="settings"
                        element={
                          <ProtectedRoute requiredRole="Admin">
                            <SettingsPage />
                          </ProtectedRoute>
                        }
                      />

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

                      <Route
                        path="monks"
                        element={
                          <ProtectedRoute requiredRole="Admin">
                            <MonksList />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="monks/create"
                        element={
                          <ProtectedRoute requiredRole="Admin">
                            <MonkForm />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="monks/:id"
                        element={
                          <ProtectedRoute requiredRole="Admin">
                            <MonkDetail />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="monks/:id/edit"
                        element={
                          <ProtectedRoute requiredRole="Admin">
                            <MonkForm />
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
