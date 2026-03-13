import { Outlet, Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { Menu, X, Scissors, Phone, MapPin, Clock, Instagram, Facebook } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const NAV_LINKS = [
  { label: 'Home', path: '/Home' },
  { label: 'Services', path: '/Services' },
  { label: 'Gallery', path: '/Gallery' },
  { label: 'About', path: '/About' },
  { label: 'Contact', path: '/Contact' },
];

const STAFF_LINKS = [
  { label: 'TV', path: '/tv' },
  { label: 'Dashboard', path: '/barber/dashboard' },
];

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen bg-[#1A1A1A] text-white">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;900&family=Roboto+Condensed:wght@400;700&family=Lora:ital,wght@0,400;0,600;1,400&display=swap');

        :root {
          --gold: #C5A059;
          --gold-light: #D4B470;
          --cream: #FDFCF0;
          --dark: #1A1A1A;
          --dark-card: #141414;
          --dark-border: #2A2A2A;
          --slate: #4D4D4D;
        }

        body {
          background-color: #1A1A1A;
        }

        h1, h2, h3, h4, h5, h6, .heading-font {
          font-family: 'Roboto Condensed', 'Arial Narrow', sans-serif;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        p, span, a, li, .body-font {
          font-family: 'Lora', Georgia, serif;
        }
      `}</style>

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#1A1A1A]/95 backdrop-blur-md border-b border-[#2A2A2A]">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/Home" className="flex items-center gap-2.5">
            <Scissors className="w-6 h-6 text-[#C5A059]" />
            <div className="flex flex-col leading-tight">
              <span className="text-xl font-black tracking-[0.15em] uppercase" style={{fontFamily:"'Roboto Condensed', sans-serif", color:'#C5A059'}}>TIP TOP</span>
              <span className="text-[9px] tracking-[0.35em] uppercase text-white/60" style={{fontFamily:"'Lora', serif"}}>Barbershop</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map(link => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm tracking-widest uppercase transition-colors duration-300`}
                style={{
                  fontFamily: "'Roboto Condensed', sans-serif",
                  color: location.pathname === link.path ? '#C5A059' : undefined,
                  opacity: location.pathname === link.path ? 1 : undefined,
                }}
                onMouseEnter={e => { if(location.pathname !== link.path) e.target.style.color='#fff'; }}
                onMouseLeave={e => { if(location.pathname !== link.path) e.target.style.color=''; }}
              >
                {link.label}
              </Link>
            ))}
            <div className="h-5 w-px bg-[#2A2A2A]" />
            {STAFF_LINKS.map(link => (
              <Link
                key={link.path}
                to={link.path}
                className="text-xs tracking-[0.2em] uppercase transition-colors duration-300 text-white/50 hover:text-[#C5A059]"
                style={{ fontFamily: "'Roboto Condensed', sans-serif" }}
              >
                {link.label}
              </Link>
            ))}
            <Link
              to="/book"
              className="ml-4 px-6 py-2.5 text-[#1A1A1A] text-sm font-bold tracking-wider uppercase rounded-none transition-colors"
              style={{backgroundColor:'#C5A059', fontFamily:"'Roboto Condensed', sans-serif"}}
              onMouseEnter={e=>e.currentTarget.style.backgroundColor='#D4B470'}
              onMouseLeave={e=>e.currentTarget.style.backgroundColor='#C5A059'}
            >
              Book Now
            </Link>
          </div>

          {/* Mobile Toggle */}
          <button
            className="md:hidden text-white/80"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Nav */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-[#0A0A0A] border-t border-[#1E1E1E] overflow-hidden"
            >
              <div className="px-6 py-6 flex flex-col gap-4">
                {NAV_LINKS.map(link => (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setMobileOpen(false)}
                    className={`text-sm tracking-widest uppercase py-2 ${
                      location.pathname === link.path ? 'text-[#C5A059]' : 'text-white/60'
                    }`}
              style={{fontFamily:"'Roboto Condensed', sans-serif"}}
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="mt-1 pt-3 border-t border-[#1E1E1E]" />
                {STAFF_LINKS.map(link => (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setMobileOpen(false)}
                    className="text-xs tracking-[0.2em] uppercase py-2 text-white/50 hover:text-[#C5A059]"
                    style={{ fontFamily: "'Roboto Condensed', sans-serif" }}
                  >
                    {link.label}
                  </Link>
                ))}
                <Link
                  to="/book"
                  onClick={() => setMobileOpen(false)}
                  className="mt-2 px-6 py-3 text-[#1A1A1A] text-sm font-bold tracking-wider uppercase text-center"
                  style={{backgroundColor:'#C5A059', fontFamily:"'Roboto Condensed', sans-serif"}}
                >
                  Book Now
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Main Content */}
      <main className="pt-20">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-[#111111] border-t border-[#2A2A2A]">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="md:col-span-1">
              <div className="flex items-center gap-2.5 mb-4">
                <Scissors className="w-5 h-5 text-[#C5A059]" />
                <div className="flex flex-col leading-tight">
                  <span className="text-lg font-black tracking-[0.15em] uppercase" style={{fontFamily:"'Roboto Condensed', sans-serif", color:'#C5A059'}}>TIP TOP</span>
                  <span className="text-[8px] tracking-[0.35em] uppercase text-white/50" style={{fontFamily:"'Lora', serif"}}>Barbershop</span>
                </div>
              </div>
              <p className="text-white/40 text-sm leading-relaxed" style={{fontFamily:"'Lora', serif"}}>
                Premium grooming experience for the modern gentleman. Crafted cuts, classic shaves, timeless style.
              </p>
            </div>

            <div>
              <h4 className="text-[#C5A059] text-xs tracking-widest uppercase mb-4" style={{fontFamily:"'Roboto Condensed', sans-serif"}}>Quick Links</h4>
              <div className="flex flex-col gap-2.5">
                {NAV_LINKS.map(link => (
                  <Link key={link.path} to={link.path} className="text-sm text-white/40 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-[#C5A059] text-xs tracking-widest uppercase mb-4" style={{fontFamily:"'Roboto Condensed', sans-serif"}}>Hours</h4>
              <div className="flex flex-col gap-2.5 text-sm text-white/40">
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Mon – Fri: 9AM – 8PM</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Saturday: 9AM – 6PM</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Sunday: 10AM – 4PM</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-[#C5A059] text-xs tracking-widest uppercase mb-4" style={{fontFamily:"'Roboto Condensed', sans-serif"}}>Contact</h4>
              <div className="flex flex-col gap-2.5 text-sm text-white/40">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5" />
                  <span>(555) 123-4567</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>123 Main Street, Downtown</span>
                </div>
                <div className="flex items-center gap-3 mt-3">
                  <a href="#" className="text-white/40 hover:text-[#C5A059] transition-colors">
                    <Instagram className="w-5 h-5" />
                  </a>
                  <a href="#" className="text-white/40 hover:text-[#C5A059] transition-colors">
                    <Facebook className="w-5 h-5" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-[#2A2A2A] text-center text-xs text-white/20 tracking-wider" style={{fontFamily:"'Roboto Condensed', sans-serif"}}>
            © 2026 TIP TOP BARBERSHOP. ALL RIGHTS RESERVED.
          </div>
        </div>
      </footer>
    </div>
  );
}