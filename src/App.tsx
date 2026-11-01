import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom'
import { AppErrorBoundary } from './components/AppErrorBoundary'
import { Layout } from './components/Layout'
import { ScrollToTop } from './components/ScrollToTop'
import { ToastProvider } from './components/Toast'
import { DemoAuthProvider, useDemoAuth } from './auth/DemoAuthProvider'
import { FoundItProvider } from './store/FoundItProvider'
import { DiscoverPage } from './pages/DiscoverPage'
import { ReportPage } from './pages/ReportPage'
import { ItemDetailPage } from './pages/ItemDetailPage'
import { ClaimPage } from './pages/ClaimPage'
import { EditListingPage } from './pages/EditListingPage'
import { ActivityPage } from './pages/ActivityPage'
import { LoginPage } from './pages/LoginPage'
import { NotFoundPage } from './pages/NotFoundPage'

function RequireDemoUser() {
  const { demoUser } = useDemoAuth()
  const location = useLocation()

  if (!demoUser) {
    const from = `${location.pathname}${location.search}${location.hash}`
    return <Navigate to="/login" replace state={{ from }} />
  }

  return <Outlet />
}

export default function App() {
  return (
    <AppErrorBoundary>
      <BrowserRouter>
        <DemoAuthProvider>
          <ToastProvider>
            <ScrollToTop />
            <Routes>
              <Route path="login" element={<LoginPage />} />
              <Route element={<RequireDemoUser />}>
                <Route
                  element={
                    <FoundItProvider>
                      <Layout />
                    </FoundItProvider>
                  }
                >
                  <Route index element={<DiscoverPage />} />
                  <Route path="report" element={<ReportPage />} />
                  <Route path="items/:id" element={<ItemDetailPage />} />
                  <Route path="items/:id/claim" element={<ClaimPage />} />
                  <Route path="items/:id/edit" element={<EditListingPage />} />
                  <Route path="activity" element={<ActivityPage />} />
                  <Route path="*" element={<NotFoundPage />} />
                </Route>
              </Route>
            </Routes>
          </ToastProvider>
        </DemoAuthProvider>
      </BrowserRouter>
    </AppErrorBoundary>
  )
}
