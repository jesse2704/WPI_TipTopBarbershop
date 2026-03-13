import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const linkClass = (path: string) =>
    `px-3 py-2 text-sm font-heading font-medium transition-colors ${
      location.pathname === path
        ? "text-antique-gold border-b-2 border-antique-gold"
        : "text-vintage-cream hover:text-antique-gold"
    }`;

  return (
    <nav className="bg-deep-black border-b border-slate-grey/40 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <span className="font-heading text-xl font-bold text-antique-gold tracking-wider">
              TIP TOP
            </span>
            <span className="font-heading text-sm text-vintage-cream/70 tracking-widest uppercase">
              Barbershop
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden sm:flex items-center gap-1">
            <Link to="/" className={linkClass("/")}>
              Home
            </Link>
            <Link to="/book" className={linkClass("/book")}>
              Book Now
            </Link>
            {isAuthenticated ? (
              <>
                <Link to="/barber/dashboard" className={linkClass("/barber/dashboard")}>
                  Dashboard
                </Link>
                <button
                  onClick={logout}
                  className="px-3 py-2 text-sm font-heading font-medium text-vintage-cream hover:text-antique-gold transition-colors"
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

          {/* Mobile hamburger */}
          <button
            className="sm:hidden flex flex-col gap-1 p-2 text-vintage-cream"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            <span className="block w-5 h-0.5 bg-current" />
            <span className="block w-5 h-0.5 bg-current" />
            <span className="block w-5 h-0.5 bg-current" />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="sm:hidden bg-deep-black border-t border-slate-grey/30 px-4 pb-4 space-y-1">
          <Link to="/" className="block py-2 text-sm font-heading text-vintage-cream hover:text-antique-gold" onClick={() => setMenuOpen(false)}>Home</Link>
          <Link to="/book" className="block py-2 text-sm font-heading text-vintage-cream hover:text-antique-gold" onClick={() => setMenuOpen(false)}>Book Now</Link>
          {isAuthenticated ? (
            <>
              <Link to="/barber/dashboard" className="block py-2 text-sm font-heading text-vintage-cream hover:text-antique-gold" onClick={() => setMenuOpen(false)}>Dashboard</Link>
              <button onClick={() => { logout(); setMenuOpen(false); }} className="block py-2 text-sm font-heading text-vintage-cream hover:text-antique-gold">Logout</button>
            </>
          ) : (
            <Link to="/barber/login" className="block py-2 text-sm font-heading text-vintage-cream hover:text-antique-gold" onClick={() => setMenuOpen(false)}>Barber Login</Link>
          )}
        </div>
      )}
    </nav>
  );
}
