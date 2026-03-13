import { motion } from 'framer-motion';
import { Scissors, SprayCan, Sparkles, Crown, Paintbrush, Baby } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

const SERVICES = [
  {
    icon: Scissors,
    titleNl: 'Klassieke Coupe',
    titleEn: 'Classic Haircut',
    price: 'EUR 35',
    duration: '30 min',
    descriptionNl: 'Een strakke coupe op maat van jouw stijl, inclusief wassen en styling.',
    descriptionEn: 'A precision cut tailored to your style, includes wash and styling.',
  },
  {
    icon: Crown,
    titleNl: 'Premium Coupe',
    titleEn: 'Premium Haircut',
    price: 'EUR 50',
    duration: '45 min',
    descriptionNl: 'Uitgebreid consult, knippen, wassen, styling en premium afwerking.',
    descriptionEn: 'Extended consultation, cut, wash, styling, and finishing products.',
  },
  {
    icon: SprayCan,
    titleNl: 'Hot Towel Shave',
    titleEn: 'Hot Towel Shave',
    price: 'EUR 30',
    duration: '30 min',
    descriptionNl: 'Traditionele scheerbeurt met hot towels en premium oliën.',
    descriptionEn: 'Traditional straight-razor shave with hot towels and premium oils.',
  },
  {
    icon: Paintbrush,
    titleNl: 'Baard Trim & Vorm',
    titleEn: 'Beard Trim & Shape',
    price: 'EUR 20',
    duration: '20 min',
    descriptionNl: 'Vakkundig modelleren en trimmen voor een verzorgde, strakke look.',
    descriptionEn: 'Expert beard sculpting and trimming for a clean, defined look.',
  },
  {
    icon: Sparkles,
    titleNl: 'Complete Ervaring',
    titleEn: 'The Full Experience',
    price: 'EUR 65',
    duration: '60 min',
    descriptionNl: 'Coupe, baardtrim, hot towel shave en ontspannende hoofdmassage.',
    descriptionEn: 'Haircut, beard trim, hot towel shave, and relaxing scalp massage.',
  },
  {
    icon: Baby,
    titleNl: 'Kinderknipbeurt',
    titleEn: 'Kids Cut',
    price: 'EUR 25',
    duration: '20 min',
    descriptionNl: 'Een rustige en fijne knipbeurt voor kinderen tot 12 jaar.',
    descriptionEn: 'A fun, patient haircut experience for kids 12 and under.',
  },
];

export default function Services() {
  const { txt } = useLanguage();

  return (
    <div className="brand-page">
      {/* Header */}
      <section className="brand-section brand-hero-header">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <p className="brand-kicker">{txt('Wat Wij Aanbieden', 'What We Offer')}</p>
          <h1 className="brand-title">{txt('Diensten & Prijzen', 'Services & Pricing')}</h1>
        </motion.div>
      </section>

      {/* Services Grid */}
      <section className="brand-section pb-32">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          {SERVICES.map((service, i) => (
            <motion.div
              key={service.titleEn}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="group brand-card"
            >
              <div className="flex items-start justify-between mb-5">
                <service.icon className="w-7 h-7 text-[#C5A059]" />
                <div className="text-right">
                  <span className="text-[#C5A059] text-2xl font-bold" style={{fontFamily:"'Roboto Condensed', sans-serif"}}>{service.price}</span>
                  <p className="text-white/30 text-xs mt-1" style={{fontFamily:"'Lora', serif"}}>{service.duration}</p>
                </div>
              </div>
                <h3 className="text-xl font-black mb-3" style={{fontFamily:"'Roboto Condensed', sans-serif"}}>{txt(service.titleNl, service.titleEn)}</h3>
              <p className="text-white/40 text-sm leading-relaxed" style={{fontFamily:"'Lora', serif"}}>{txt(service.descriptionNl, service.descriptionEn)}</p>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-16">
          <Link
            to="/Contact"
            className="brand-button"
          >
            {txt('Boek Een Afspraak', 'Book an Appointment')}
          </Link>
        </div>
      </section>
    </div>
  );
}