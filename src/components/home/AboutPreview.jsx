import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useLanguage } from '../../context/LanguageContext';

export default function AboutPreview() {
  const { txt } = useLanguage();

  return (
    <section className="py-24 md:py-32 px-6 bg-[#111111]">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
        {/* Image */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="relative"
        >
          <div className="relative aspect-[4/5] overflow-hidden group">
            {/* Gold border frame */}
            <div className="absolute inset-0 border-2 border-[#C5A059] z-10 pointer-events-none" />
            
            {/* Corner accents */}
            <div className="absolute -top-4 -left-4 w-8 h-8 border-t-2 border-l-2 border-[#C5A059] z-20" />
            <div className="absolute -top-4 -right-4 w-8 h-8 border-t-2 border-r-2 border-[#C5A059] z-20" />
            <div className="absolute -bottom-4 -left-4 w-8 h-8 border-b-2 border-l-2 border-[#C5A059] z-20" />
            <div className="absolute -bottom-4 -right-4 w-8 h-8 border-b-2 border-r-2 border-[#C5A059] z-20" />
            
            {/* Main image */}
            <img
              src="/images/barber-consultation.png"
              alt="Barber consultation"
              className="w-full h-full object-cover group-hover:brightness-110 transition-all duration-500"
            />
            
            {/* Subtle vignette overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/20 pointer-events-none" />
          </div>
          
          {/* Decorative corner frame element */}
          <div className="absolute -bottom-8 -right-8 w-40 h-40 border-2 border-[#C5A059]/10 hidden lg:block" />
        </motion.div>

        {/* Text */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <p className="text-[#C5A059] text-xs tracking-[0.4em] uppercase mb-3 font-semibold" style={{fontFamily:"'Lora', serif"}}>{txt('Ons Verhaal', 'Our Story')}</p>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-6 leading-tight" style={{fontFamily:"'Roboto Condensed', sans-serif"}}>
            {txt('Ambachtelijke Klasse,', 'Crafted Excellence,')}<br />{txt('Gebouwd op Zorg', 'Built on Care')}
          </h2>
          <p className="text-white/60 leading-relaxed mb-5" style={{fontFamily:"'Lora', serif"}}>
            {txt(
              'Tip Top Barbershop is meer dan alleen een plek voor een knipbeurt. Het is een plek waar traditioneel vakmanschap en oprechte gastvrijheid samenkomen. Ons team let op elk detail, van de precisie van de coupe tot de warmte van het contact.',
              "Tip Top Barbershop isn't just another place to get a haircut. We're a sanctuary where traditional barber craftsmanship meets genuine hospitality. Our team takes pride in every detail — from the precision of the cut to the warmth of the conversation."
            )}
          </p>
          <p className="text-white/60 leading-relaxed mb-8" style={{fontFamily:"'Lora', serif"}}>
            {txt(
              'Er goed uitzien gaat om zelfvertrouwen. Daarom investeren we in premium producten, continue training en vooral in het goed luisteren naar jouw wensen. In onze stoel ben je niet zomaar klant, je bent onderdeel van de Tip Top familie.',
              "We believe that looking sharp is about feeling confident. That's why we invest in premium products, continuous training, and most importantly, taking time to understand what you want. When you sit in our chair, you're not just a customer — you're part of the Tip Top family."
            )}
          </p>
          <Link
            to="/About"
            className="inline-block px-8 py-3.5 border-2 border-[#C5A059] text-[#C5A059] text-sm tracking-wider uppercase font-semibold hover:bg-[#C5A059] hover:text-[#111111] transition-all duration-300"
            style={{fontFamily:"'Roboto Condensed', sans-serif"}}
          >
            {txt('Onze Reis', 'Our Journey')}
          </Link>
        </motion.div>
      </div>
    </section>
  );
}