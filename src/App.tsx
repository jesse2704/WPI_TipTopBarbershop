import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider as AppAuthProvider, useAuth } from '@/lib/AuthContext';
import { AuthProvider as BarberAuthProvider } from './context/AuthContext';
import { BookingProvider } from './context/BookingContext';
import { PhoneAuthProvider } from './context/PhoneAuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Services from './pages/Services';
import Gallery from './pages/Gallery';
import About from './pages/About';
import Contact from './pages/Contact';
import BookingPage from './pages/BookingPage';
import TVDisplayPage from './pages/TVDisplayPage';
import RemoteControlPage from './pages/RemoteControlPage';
import BarberLoginPage from './pages/BarberLoginPage';
import BarberDashboardPage from './pages/BarberDashboardPage';
import Layout from './components/Layout';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
  return (
    <Routes>
      <Route path="/book" element={<BookingPage />} />
      <Route path="/tv" element={<TVDisplayPage />} />
      <Route path="/remote" element={<RemoteControlPage />} />
      <Route path="/barber/login" element={<BarberLoginPage />} />
      <Route
        path="/barber/dashboard"
        element={
          <ProtectedRoute>
            <BarberDashboardPage />
          </ProtectedRoute>
        }
      />
      <Route element={<Layout />}>
        <Route path="/" element={<Navigate to="/Home" replace />} />
        <Route path="/Home" element={<Home />} />
        <Route path="/Services" element={<Services />} />
        <Route path="/Gallery" element={<Gallery />} />
        <Route path="/About" element={<About />} />
        <Route path="/Contact" element={<Contact />} />
        <Route path="*" element={<PageNotFound />} />
      </Route>
    </Routes>
  );
};

function App() {

  return (
    <AppAuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <BarberAuthProvider>
          <BookingProvider>
            <PhoneAuthProvider>
              <Router>
                <AuthenticatedApp />
              </Router>
            </PhoneAuthProvider>
          </BookingProvider>
        </BarberAuthProvider>
        <Toaster />
      </QueryClientProvider>
    </AppAuthProvider>
  )
}

export default App
