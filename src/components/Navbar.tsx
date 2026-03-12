import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { isAuthenticated, logout } = useAuth();
  const location = useLocation();

  const linkClass = (path: string) =>
    `px-3 py-2 text-sm font-heading transition-colors ${
      location.pathname === path
        ? "text-antique-gold border-b-2 border-antique-gold"
        : "text-vintage-cream hover:text-antique-gold"
    }`;

  return (
    <nav className="bg-deep-black border-b border-slate-grey">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <span className="font-heading text-xl font-bold text-antique-gold tracking-wider">
              TIP TOP
            </span>
            <span className="font-heading text-sm text-vintage-cream tracking-widest uppercase">
              Barbershop
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <Link to="/" className={linkClass("/")}>
              Home
            </Link>
            <Link to="/book" className={linkClass("/book")}>
              Book Now
            </Link>
            {isAuthenticated ? (
              <>
                <Link
                  to="/barber/dashboard"
                  className={linkClass("/barber/dashboard")}
                >
                  Dashboard
                </Link>
                <button
                  onClick={logout}
                  className="px-3 py-2 text-sm font-heading text-vintage-cream hover:text-antique-gold transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link to="/barber/login" className={linkClass("/barber/login")}>
                Barber Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
