import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Scissors, SprayCan, Sparkles } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const SERVICES = [
  {
    icon: Scissors,
    title: 'Precision Haircut',
    description: 'Tailored cuts designed to complement your face shape, style, and personality.',
    price: '$35',
  },
  {
    icon: SprayCan,
    title: 'Hot Towel Shave',
    description: 'A luxurious straight-razor shave with hot towels and premium aftercare products.',
    price: '$30',
  },
  {
    icon: Sparkles,
    title: 'The Full Experience',
    description: 'Haircut, beard trim, hot towel shave, and a relaxing scalp massage — the works.',
    price: '$65',
  },
];

export default function ServicesPreview() {
  const { txt } = useLanguage();

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
          <p className="text-[#C5A059] text-xs tracking-[0.4em] uppercase mb-4" style={{fontFamily:"'Lora', serif"}}>{txt('Wat Wij Aanbieden', 'What We Offer')}</p>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight" style={{fontFamily:"'Roboto Condensed', sans-serif"}}>{txt('Onze Diensten', 'Our Services')}</h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {SERVICES.map((service, i) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="group bg-[#141414] border border-[#2A2A2A] p-8 md:p-10 hover:border-[#C5A059]/40 transition-all duration-500"
            >
              <service.icon className="w-8 h-8 text-[#C5A059] mb-6" />
              <div className="flex items-baseline justify-between mb-4">
                <h3 className="text-xl font-black" style={{fontFamily:"'Roboto Condensed', sans-serif"}}>{service.title}</h3>
                <span className="text-[#C5A059] font-bold text-lg" style={{fontFamily:"'Roboto Condensed', sans-serif"}}>{service.price}</span>
              </div>
              <p className="text-white/40 text-sm leading-relaxed" style={{fontFamily:"'Lora', serif"}}>{service.description}</p>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link
            to="/Services"
            className="text-[#C5A059] text-sm tracking-widest uppercase hover:text-[#D4B470] transition-colors"
            style={{fontFamily:"'Roboto Condensed', sans-serif"}}
          >
            {txt('Bekijk Alle Diensten', 'View All Services')} →
          </Link>
        </div>
      </div>
    </section>
  );
}