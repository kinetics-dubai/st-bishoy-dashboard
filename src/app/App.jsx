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
import ArticlesList from '@/pages/articles/ArticlesList';
import ArticleDetail from '@/pages/articles/ArticleDetail';
import ArticleForm from '@/pages/articles/ArticleForm';
import EntitiesList from '@/pages/entities/EntitiesList';
import EntityDetail from '@/pages/entities/EntityDetail';
import EntityForm from '@/pages/entities/EntityForm';
import EntityGalleryForm from '@/pages/entities/EntityGalleryForm';
import MonksList from '@/pages/monks/MonksList';
import MonkDetail from '@/pages/monks/MonkDetail';
import MonkForm from '@/pages/monks/MonkForm';
import SaintsList from '@/pages/saints/SaintsList';
import SaintDetail from '@/pages/saints/SaintDetail';
import SaintForm from '@/pages/saints/SaintForm';
import HomePage from '@/pages/home/HomePage';
import MonasteryPage from '@/pages/monastery/MonasteryPage';
import CopticPage from '@/pages/coptic/CopticPage';
import ProjectsList from '@/pages/projects/ProjectsList';
import ProjectDetail from '@/pages/projects/ProjectDetail';
import ProjectForm from '@/pages/projects/ProjectForm';
import ProductsList from '@/pages/products/ProductsList';
import ProductDetail from '@/pages/products/ProductDetail';
import ProductForm from '@/pages/products/ProductForm';
import SermonsList from '@/pages/sermons/SermonsList';
import SermonDetail from '@/pages/sermons/SermonDetail';
import SermonForm from '@/pages/sermons/SermonForm';
import EventsList from '@/pages/events/EventsList';
import EventDetail from '@/pages/events/EventDetail';
import EventForm from '@/pages/events/EventForm';
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
                      <Route index element={<Navigate to="/home" replace />} />

                      <Route path="home" element={<ProtectedRoute requiredRole="Admin"><HomePage /></ProtectedRoute>} />
                      <Route path="monastery" element={<ProtectedRoute requiredRole="Admin"><MonasteryPage /></ProtectedRoute>} />
                      <Route path="coptic" element={<ProtectedRoute requiredRole="Admin"><CopticPage /></ProtectedRoute>} />

                      <Route path="monks" element={<ProtectedRoute requiredRole="Admin"><MonksList /></ProtectedRoute>} />
                      <Route path="monks/create" element={<ProtectedRoute requiredRole="Admin"><MonkForm /></ProtectedRoute>} />
                      <Route path="monks/:id" element={<ProtectedRoute requiredRole="Admin"><MonkDetail /></ProtectedRoute>} />
                      <Route path="monks/:id/edit" element={<ProtectedRoute requiredRole="Admin"><MonkForm /></ProtectedRoute>} />

                      <Route path="saints" element={<ProtectedRoute requiredRole="Admin"><SaintsList /></ProtectedRoute>} />
                      <Route path="saints/create" element={<ProtectedRoute requiredRole="Admin"><SaintForm /></ProtectedRoute>} />
                      <Route path="saints/:id" element={<ProtectedRoute requiredRole="Admin"><SaintDetail /></ProtectedRoute>} />
                      <Route path="saints/:id/edit" element={<ProtectedRoute requiredRole="Admin"><SaintForm /></ProtectedRoute>} />

                      <Route path="articles" element={<ProtectedRoute requiredRole="Admin"><ArticlesList /></ProtectedRoute>} />
                      <Route path="articles/create" element={<ProtectedRoute requiredRole="Admin"><ArticleForm /></ProtectedRoute>} />
                      <Route path="articles/:id" element={<ProtectedRoute requiredRole="Admin"><ArticleDetail /></ProtectedRoute>} />
                      <Route path="articles/:id/edit" element={<ProtectedRoute requiredRole="Admin"><ArticleForm /></ProtectedRoute>} />

                      <Route path="entities" element={<ProtectedRoute requiredRole="Admin"><EntitiesList /></ProtectedRoute>} />
                      <Route path="entities/create" element={<ProtectedRoute requiredRole="Admin"><EntityForm /></ProtectedRoute>} />
                      <Route path="entities/:id" element={<ProtectedRoute requiredRole="Admin"><EntityDetail /></ProtectedRoute>} />
                      <Route path="entities/:id/edit" element={<ProtectedRoute requiredRole="Admin"><EntityForm /></ProtectedRoute>} />
                      <Route path="entities/:id/gallery" element={<ProtectedRoute requiredRole="Admin"><EntityGalleryForm /></ProtectedRoute>} />

                      <Route path="projects" element={<ProtectedRoute requiredRole="Admin"><ProjectsList /></ProtectedRoute>} />
                      <Route path="projects/create" element={<ProtectedRoute requiredRole="Admin"><ProjectForm /></ProtectedRoute>} />
                      <Route path="projects/:id" element={<ProtectedRoute requiredRole="Admin"><ProjectDetail /></ProtectedRoute>} />
                      <Route path="projects/:id/edit" element={<ProtectedRoute requiredRole="Admin"><ProjectForm /></ProtectedRoute>} />

                      <Route path="products" element={<ProtectedRoute requiredRole="Admin"><ProductsList /></ProtectedRoute>} />
                      <Route path="products/create" element={<ProtectedRoute requiredRole="Admin"><ProductForm /></ProtectedRoute>} />
                      <Route path="products/:slug" element={<ProtectedRoute requiredRole="Admin"><ProductDetail /></ProtectedRoute>} />
                      <Route path="products/:slug/edit" element={<ProtectedRoute requiredRole="Admin"><ProductForm /></ProtectedRoute>} />

                      <Route path="sermons" element={<ProtectedRoute requiredRole="Admin"><SermonsList /></ProtectedRoute>} />
                      <Route path="sermons/create" element={<ProtectedRoute requiredRole="Admin"><SermonForm /></ProtectedRoute>} />
                      <Route path="sermons/:id" element={<ProtectedRoute requiredRole="Admin"><SermonDetail /></ProtectedRoute>} />
                      <Route path="sermons/:id/edit" element={<ProtectedRoute requiredRole="Admin"><SermonForm /></ProtectedRoute>} />

                      <Route path="events" element={<ProtectedRoute requiredRole="Admin"><EventsList /></ProtectedRoute>} />
                      <Route path="events/create" element={<ProtectedRoute requiredRole="Admin"><EventForm /></ProtectedRoute>} />
                      <Route path="events/:slug" element={<ProtectedRoute requiredRole="Admin"><EventDetail /></ProtectedRoute>} />
                      <Route path="events/:slug/edit" element={<ProtectedRoute requiredRole="Admin"><EventForm /></ProtectedRoute>} />

                      <Route path="*" element={<Navigate to="/home" replace />} />
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
