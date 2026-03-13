import { Outlet, Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { Menu, X, Scissors, Phone, MapPin, Clock, Instagram, Facebook } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';

const NAV_LINKS = [
  { labelNl: 'Home', labelEn: 'Home', path: '/Home' },
  { labelNl: 'Diensten', labelEn: 'Services', path: '/Services' },
  { labelNl: 'Galerij', labelEn: 'Gallery', path: '/Gallery' },
  { labelNl: 'Over Ons', labelEn: 'About', path: '/About' },
  { labelNl: 'Contact', labelEn: 'Contact', path: '/Contact' },
];

const STAFF_LINKS = [
  { labelNl: 'TV', labelEn: 'TV', path: '/tv' },
  { labelNl: 'Dashboard', labelEn: 'Dashboard', path: '/barber/dashboard' },
];

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { language, setLanguage, txt } = useLanguage();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-[#1A1A1A] text-white">
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
                className={`text-sm tracking-widest uppercase transition-colors duration-300 ${
                  location.pathname === link.path ? 'text-[#C5A059]' : 'text-white/65 hover:text-white'
                }`}
                style={{
                  fontFamily: "'Roboto Condensed', sans-serif",
                }}
              >
                {txt(link.labelNl, link.labelEn)}
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
                {txt(link.labelNl, link.labelEn)}
              </Link>
            ))}
            <div className="ml-1 flex items-center rounded-md border border-[#2A2A2A] p-0.5 text-xs">
              <button
                onClick={() => setLanguage('nl')}
                className={`rounded px-2 py-1 transition-colors ${language === 'nl' ? 'bg-[#C5A059] text-[#1A1A1A]' : 'text-white/70 hover:text-white'}`}
              >
                NL
              </button>
              <button
                onClick={() => setLanguage('en')}
                className={`rounded px-2 py-1 transition-colors ${language === 'en' ? 'bg-[#C5A059] text-[#1A1A1A]' : 'text-white/70 hover:text-white'}`}
              >
                EN
              </button>
            </div>
            <Link
              to="/book"
              className="ml-4 px-6 py-2.5 text-[#1A1A1A] text-sm font-bold tracking-wider uppercase rounded-none transition-colors"
              style={{backgroundColor:'#C5A059', fontFamily:"'Roboto Condensed', sans-serif"}}
              onMouseEnter={e=>e.currentTarget.style.backgroundColor='#D4B470'}
              onMouseLeave={e=>e.currentTarget.style.backgroundColor='#C5A059'}
            >
              {txt('Boek Nu', 'Book Now')}
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
                    {txt(link.labelNl, link.labelEn)}
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
                    {txt(link.labelNl, link.labelEn)}
                  </Link>
                ))}
                <div className="mt-1 flex items-center gap-2">
                  <button
                    onClick={() => setLanguage('nl')}
                    className={`rounded border px-2 py-1 text-xs ${language === 'nl' ? 'border-[#C5A059] bg-[#C5A059] text-[#1A1A1A]' : 'border-[#2A2A2A] text-white/70'}`}
                  >
                    NL
                  </button>
                  <button
                    onClick={() => setLanguage('en')}
                    className={`rounded border px-2 py-1 text-xs ${language === 'en' ? 'border-[#C5A059] bg-[#C5A059] text-[#1A1A1A]' : 'border-[#2A2A2A] text-white/70'}`}
                  >
                    EN
                  </button>
                </div>
                <Link
                  to="/book"
                  onClick={() => setMobileOpen(false)}
                  className="mt-2 px-6 py-3 text-[#1A1A1A] text-sm font-bold tracking-wider uppercase text-center"
                  style={{backgroundColor:'#C5A059', fontFamily:"'Roboto Condensed', sans-serif"}}
                >
                  {txt('Boek Nu', 'Book Now')}
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
                {txt(
                  'Premium grooming voor de moderne man. Strakke coupes, klassieke scheerbeurten en tijdloze stijl.',
                  'Premium grooming experience for the modern gentleman. Crafted cuts, classic shaves, timeless style.'
                )}
              </p>
            </div>

            <div>
              <h4 className="text-[#C5A059] text-xs tracking-widest uppercase mb-4" style={{fontFamily:"'Roboto Condensed', sans-serif"}}>{txt('Snelle Links', 'Quick Links')}</h4>
              <div className="flex flex-col gap-2.5">
                {NAV_LINKS.map(link => (
                  <Link key={link.path} to={link.path} className="text-sm text-white/40 hover:text-white transition-colors">
                    {txt(link.labelNl, link.labelEn)}
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-[#C5A059] text-xs tracking-widest uppercase mb-4" style={{fontFamily:"'Roboto Condensed', sans-serif"}}>{txt('Openingstijden', 'Hours')}</h4>
              <div className="flex flex-col gap-2.5 text-sm text-white/40">
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{txt('Di – Vr: 12:00 – 20:00', 'Tue – Fri: 12PM – 8PM')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{txt('Zaterdag: 12:00 – 18:00', 'Saturday: 12PM – 6PM')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{txt('Zondag: 12:00 – 16:00', 'Sunday: 12PM – 4PM')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{txt('Maandag: Gesloten', 'Monday: Closed')}</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-[#C5A059] text-xs tracking-widest uppercase mb-4" style={{fontFamily:"'Roboto Condensed', sans-serif"}}>{txt('Contact', 'Contact')}</h4>
              <div className="flex flex-col gap-2.5 text-sm text-white/40">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5" />
                  <a href="tel:+31617886799" className="hover:text-white transition-colors">06 17886799</a>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5" />
                  <a
                    href="https://maps.google.com/maps?vet=10CAAQoqAOahcKEwj4p-aJnJ2TAxUAAAAAHQAAAAAQDA..i&sca_esv=d087776caa853f74&pvq=Cg0vZy8xMXZqMjZ2aGh2IhYKEHRpcHRvcGJhcmJlcnNob3AQAhgD&lqi=ChB0aXB0b3BiYXJiZXJzaG9wSPr7tKPAuoCACFoWEAAYACIQdGlwdG9wYmFyYmVyc2hvcJIBEnVuaXNleF9oYWlyZHJlc3Nlcg&fvr=1&cs=0&um=1&ie=UTF-8&fb=1&gl=nl&sa=X&ftid=0x47c5b7575fdf3cef:0xb5293e770dbdf116"
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-white transition-colors"
                  >
                    {txt('Bekijk op Google Maps', 'View on Google Maps')}
                  </a>
                </div>
                <div className="flex items-center gap-3 mt-3">
                  <a href="https://www.instagram.com/tiptopbarbershopnl/" target="_blank" rel="noreferrer" className="text-white/40 hover:text-[#C5A059] transition-colors">
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
            {txt('© 2026 TIP TOP BARBERSHOP. ALLE RECHTEN VOORBEHOUDEN.', '© 2026 TIP TOP BARBERSHOP. ALL RIGHTS RESERVED.')}
          </div>
        </div>
      </footer>
    </div>
  );
}