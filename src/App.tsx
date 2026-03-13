import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider as BarberAuthProvider } from './context/AuthContext';
import { BookingProvider } from './context/BookingContext';
import { PhoneAuthProvider } from './context/PhoneAuthContext';
import { LanguageProvider } from './context/LanguageContext';
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
import BarberClientsPage from './pages/BarberClientsPage';
import Layout from './components/Layout';

const AuthenticatedApp = () => {
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
      <Route
        path="/barber/clients"
        element={
          <ProtectedRoute>
            <BarberClientsPage />
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
    <LanguageProvider>
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
    </LanguageProvider>
  )
}

export default App
