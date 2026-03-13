import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

const TESTIMONIALS = [
  {
    name: 'Marcus J.',
    text: 'Best barbershop in town, hands down. The attention to detail is unmatched. I won\'t go anywhere else.',
    rating: 5,
  },
  {
    name: 'David R.',
    text: 'The hot towel shave is an experience every man should have. Felt like a king walking out of there.',
    rating: 5,
  },
  {
    name: 'James T.',
    text: 'Clean, professional, and the vibes are immaculate. My barber always knows exactly what I want.',
    rating: 5,
  },
];

export default function TestimonialsSection() {
  return (
    <section className="py-24 md:py-32 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-[#C5A059] text-xs tracking-[0.4em] uppercase mb-4" style={{fontFamily:"'Lora', serif"}}>Testimonials</p>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight" style={{fontFamily:"'Roboto Condensed', sans-serif"}}>What Clients Say</h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="bg-[#141414] border border-[#2A2A2A] p-8"
            >
              <div className="flex gap-1 mb-5">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} className="w-4 h-4 fill-[#C5A059] text-[#C5A059]" />
                ))}
              </div>
              <p className="text-white/50 text-sm leading-relaxed mb-6 italic" style={{fontFamily:"'Lora', serif"}}>"{t.text}"</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#C5A059]/10 flex items-center justify-center">
                  <span className="text-[#C5A059] font-semibold text-sm">{t.name[0]}</span>
                </div>
                <span className="text-sm font-medium" style={{fontFamily:"'Roboto Condensed', sans-serif"}}>{t.name}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}