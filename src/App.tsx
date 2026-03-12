import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { BookingProvider } from "./context/BookingContext";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import HomePage from "./pages/HomePage";
import BookingPage from "./pages/BookingPage";
import BarberLoginPage from "./pages/BarberLoginPage";
import BarberDashboardPage from "./pages/BarberDashboardPage";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <BookingProvider>
          <Navbar />
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
          </Routes>
        </BookingProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
