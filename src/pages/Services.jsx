import { motion } from 'framer-motion';
import { Scissors, SprayCan, Sparkles, Crown, Paintbrush, Baby } from 'lucide-react';
import { Link } from 'react-router-dom';

const SERVICES = [
  { icon: Scissors, title: 'Classic Haircut', price: '$35', duration: '30 min', description: 'A precision cut tailored to your style, includes wash and styling.' },
  { icon: Crown, title: 'Premium Haircut', price: '$50', duration: '45 min', description: 'Extended consultation, cut, wash, styling, and finishing products.' },
  { icon: SprayCan, title: 'Hot Towel Shave', price: '$30', duration: '30 min', description: 'Traditional straight-razor shave with hot towels and premium oils.' },
  { icon: Paintbrush, title: 'Beard Trim & Shape', price: '$20', duration: '20 min', description: 'Expert beard sculpting and trimming for a clean, defined look.' },
  { icon: Sparkles, title: 'The Full Experience', price: '$65', duration: '60 min', description: 'Haircut, beard trim, hot towel shave, and relaxing scalp massage.' },
  { icon: Baby, title: 'Kids Cut', price: '$25', duration: '20 min', description: 'A fun, patient haircut experience for kids 12 and under.' },
];

export default function Services() {
  return (
    <div>
      {/* Header */}
      <section className="pt-32 pb-16 px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-[#C5A059] text-xs tracking-[0.4em] uppercase mb-4" style={{fontFamily:"'Lora', serif"}}>What We Offer</p>
          <h1 className="text-5xl md:text-6xl font-black tracking-tight" style={{fontFamily:"'Roboto Condensed', sans-serif"}}>Services & Pricing</h1>
        </motion.div>
      </section>

      {/* Services Grid */}
      <section className="pb-32 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          {SERVICES.map((service, i) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="group bg-[#141414] border border-[#2A2A2A] p-8 hover:border-[#C5A059]/40 transition-all duration-500"
            >
              <div className="flex items-start justify-between mb-5">
                <service.icon className="w-7 h-7 text-[#C5A059]" />
                <div className="text-right">
                  <span className="text-[#C5A059] text-2xl font-bold" style={{fontFamily:"'Roboto Condensed', sans-serif"}}>{service.price}</span>
                  <p className="text-white/30 text-xs mt-1" style={{fontFamily:"'Lora', serif"}}>{service.duration}</p>
                </div>
              </div>
              <h3 className="text-xl font-black mb-3" style={{fontFamily:"'Roboto Condensed', sans-serif"}}>{service.title}</h3>
              <p className="text-white/40 text-sm leading-relaxed" style={{fontFamily:"'Lora', serif"}}>{service.description}</p>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-16">
          <Link
            to="/Contact"
            className="inline-flex items-center gap-3 px-10 py-4 font-bold text-sm tracking-wider uppercase transition-colors"
              style={{backgroundColor:'#C5A059', color:'#1A1A1A', fontFamily:"'Roboto Condensed', sans-serif"}}
          >
            Book an Appointment
          </Link>
        </div>
      </section>
    </div>
  );
}