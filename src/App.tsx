import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { BookingProvider } from "./context/BookingContext";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import HomePage from "./pages/HomePage";
import BookingPage from "./pages/BookingPage";
import BarberLoginPage from "./pages/BarberLoginPage";
import BarberDashboardPage from "./pages/BarberDashboardPage";
import TVDisplayPage from "./pages/TVDisplayPage";
import RemoteControlPage from "./pages/RemoteControlPage";

function AppLayout() {
  const location = useLocation();
  const hideNavbar = location.pathname === "/tv" || location.pathname === "/remote";

  return (
    <>
      {!hideNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/book" element={<BookingPage />} />
        <Route path="/barber/login" element={<BarberLoginPage />} />
        <Route
          path="/barber/dashboard"
          element={
            <ProtectedRoute>
              <BarberDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route path="/tv" element={<TVDisplayPage />} />
        <Route path="/remote" element={<RemoteControlPage />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <BookingProvider>
          <AppLayout />
        </BookingProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
