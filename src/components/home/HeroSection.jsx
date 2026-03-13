import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export default function HeroSection() {
  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1585747860019-8030e2039dd2?w=1920&q=80)',
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0A]/70 via-[#0A0A0A]/50 to-[#0A0A0A]" />

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <div className="mb-8">
            <p className="text-[#C5A059] text-[10px] tracking-[0.5em] uppercase mb-2" style={{fontFamily:"'Lora', serif"}}>Est. 2023</p>
            <h1 className="text-6xl md:text-8xl lg:text-9xl font-black tracking-[0.05em] leading-[0.85] mb-1" style={{fontFamily:"'Roboto Condensed', 'Arial Narrow', sans-serif"}}>
              TIP TOP
            </h1>
            <p className="text-xl md:text-2xl tracking-[0.5em] uppercase text-[#C5A059] mb-6" style={{fontFamily:"'Lora', serif"}}>Barbershop</p>
          </div>
          <p className="text-white/50 text-lg md:text-xl max-w-xl mx-auto mb-10 leading-relaxed" style={{fontFamily:"'Lora', serif"}}>
            Expert cuts, classic shaves, and a grooming experience tailored to the modern gentleman.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/Contact"
              className="group px-10 py-4 font-bold text-sm tracking-wider uppercase flex items-center gap-3 transition-colors"
              style={{backgroundColor:'#C5A059', color:'#1A1A1A', fontFamily:"'Roboto Condensed', sans-serif"}}
            >
              Book Appointment
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/Services"
              className="px-10 py-4 border border-white/20 text-white text-sm tracking-wider uppercase hover:border-white/40 transition-colors"
              style={{fontFamily:"'Roboto Condensed', sans-serif"}}
            >
              Our Services
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="w-px h-12 bg-gradient-to-b from-transparent to-[#C8A55C]/50" />
      </motion.div>
    </section>
  );
}