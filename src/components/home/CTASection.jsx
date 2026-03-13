import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export default function CTASection() {
  return (
    <section className="py-24 md:py-32 px-6 bg-[#111111]">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-[#C5A059] text-xs tracking-[0.4em] uppercase mb-4" style={{fontFamily:"'Lora', serif"}}>Ready?</p>
          <h2 className="text-4xl md:text-6xl font-black tracking-tight mb-6" style={{fontFamily:"'Roboto Condensed', sans-serif"}}>
            Your Best Look<br />Starts Here
          </h2>
          <p className="text-white/40 text-lg max-w-lg mx-auto mb-10" style={{fontFamily:"'Lora', serif"}}>
            Walk in or book ahead — either way, you'll leave looking and feeling your absolute best.
          </p>
          <Link
            to="/Contact"
            className="group inline-flex items-center gap-3 px-12 py-5 font-bold text-sm tracking-wider uppercase transition-colors"
              style={{backgroundColor:'#C5A059', color:'#1A1A1A', fontFamily:"'Roboto Condensed', sans-serif"}}
          >
            Book Your Appointment
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}