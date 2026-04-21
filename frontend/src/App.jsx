import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ClerkProvider, SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react';
import { Toaster } from 'react-hot-toast';
import { AppProvider } from './context/AppContext';

import DashboardLayout from './components/layout/DashboardLayout';
import AllLinks from './pages/AllLinks';
import Collections from './pages/Collections';
import CollectionDetail from './pages/CollectionDetail';
import PublicPageView from './pages/PublicPageView';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import LandingPage from './pages/LandingPage';
import PublicProfile from './pages/PublicProfile';
import PublicCollection from './pages/PublicCollection';
import Teams from './pages/Teams';

import { useAuth } from '@clerk/clerk-react';
import { setTokenFetcher } from './lib/api';
import { useEffect } from 'react';

function AuthInterceptor({ children }) {
  const { getToken } = useAuth();
  useEffect(() => {
    setTokenFetcher(getToken);
  }, [getToken]);
  return <>{children}</>;
}

function ProtectedRoute({ children }) {
  return (
    <>
      <SignedIn>{children}</SignedIn>
      <SignedOut><RedirectToSignIn /></SignedOut>
    </>
  );
}

const CLERK_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || 'pk_test_placeholder';

export default function App() {
  return (
    <ClerkProvider publishableKey={CLERK_KEY} afterSignInUrl="/links" afterSignUpUrl="/links">
      <AuthInterceptor>
        <AppProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            style: { borderRadius: '12px', fontSize: '14px', fontFamily: 'DM Sans, sans-serif' },
            success: { iconTheme: { primary: '#5353E8', secondary: '#fff' } },
          }}
        />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/u/:username" element={<PublicProfile />} />
            <Route path="/u/:username/c/:slug" element={<PublicCollection />} />
            <Route path="/" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
              <Route path="links" element={<AllLinks />} />
              <Route path="collections" element={<Collections />} />
              <Route path="collections/:id" element={<CollectionDetail />} />
              <Route path="public-page" element={<PublicPageView />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="settings" element={<Settings />} />
              <Route path="teams" element={<Teams />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AppProvider>
      </AuthInterceptor>
    </ClerkProvider>
  );
}
