import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AppErrorBoundary } from './components/AppErrorBoundary'
import { Layout } from './components/Layout'
import { ScrollToTop } from './components/ScrollToTop'
import { ToastProvider } from './components/Toast'
import { FoundItProvider } from './store/FoundItProvider'
import { DiscoverPage } from './pages/DiscoverPage'
import { ReportPage } from './pages/ReportPage'
import { ItemDetailPage } from './pages/ItemDetailPage'
import { ClaimPage } from './pages/ClaimPage'
import { EditListingPage } from './pages/EditListingPage'
import { ActivityPage } from './pages/ActivityPage'
import { NotFoundPage } from './pages/NotFoundPage'

export default function App() {
  return (
    <AppErrorBoundary>
      <BrowserRouter>
        <FoundItProvider>
          <ToastProvider>
            <ScrollToTop />
            <Routes>
              <Route element={<Layout />}>
                <Route index element={<DiscoverPage />} />
                <Route path="report" element={<ReportPage />} />
                <Route path="items/:id" element={<ItemDetailPage />} />
                <Route path="items/:id/claim" element={<ClaimPage />} />
                <Route path="items/:id/edit" element={<EditListingPage />} />
                <Route path="activity" element={<ActivityPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Route>
            </Routes>
          </ToastProvider>
        </FoundItProvider>
      </BrowserRouter>
    </AppErrorBoundary>
  )
}
