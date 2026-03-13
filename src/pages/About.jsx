import { motion } from 'framer-motion';
import { Award, Users, Clock, Heart } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const STATS = [
  { icon: Clock, value: '10+', label: 'Years of Experience' },
  { icon: Users, value: '15,000+', label: 'Happy Clients' },
  { icon: Award, value: '5', label: 'Expert Barbers' },
  { icon: Heart, value: '4.9', label: 'Average Rating' },
];

const TEAM = [
  { name: 'Carlos Rivera', role: 'Master Barber & Founder', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80' },
  { name: 'Marcus Williams', role: 'Senior Barber', image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&q=80' },
  { name: 'Andre Mitchell', role: 'Barber & Stylist', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80' },
];

export default function About() {
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
          <p className="brand-kicker">{txt('Wie Wij Zijn', 'Who We Are')}</p>
          <h1 className="brand-title">{txt('Ons Verhaal', 'Our Story')}</h1>
        </motion.div>
      </section>

      {/* Story */}
      <section className="brand-section pb-24">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="aspect-[4/5] overflow-hidden rounded-lg"
          >
            <img
              src="https://images.unsplash.com/photo-1585747860019-8030e2039dd2?w=800&q=80"
              alt="Barbershop"
              className="w-full h-full object-cover"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <h2 className="text-3xl md:text-4xl font-black mb-6" style={{fontFamily:"'Roboto Condensed', sans-serif"}}>{txt('Waar Traditie', 'Where Tradition')}<br />{txt('Excellentie Ontmoet', 'Meets Excellence')}</h2>
            <p className="text-white/60 leading-relaxed mb-5" style={{fontFamily:"'Lora', serif"}}>
              {txt(
                'Tip Top Barbershop is opgericht vanuit een eenvoudig principe: een kwalitatieve knipbeurt en oprechte aandacht horen samen. Wij leveren niet alleen knip- en scheerdiensten, we bouwen ook zelfvertrouwen.',
                "Tip Top Barbershop was founded on a simple principle: that a quality haircut and genuine human connection should always go hand in hand. We're not just in the business of cuts and shaves — we're in the business of building confidence."
              )}
            </p>
            <p className="text-white/60 leading-relaxed mb-5" style={{fontFamily:"'Lora', serif"}}>
              {txt(
                'Onze barbiers zijn vakmensen die hun werk als kunst zien. Ze combineren klassieke technieken met moderne stijl, zodat elke klant er op zijn best uitziet en zich zo voelt. We luisteren naar je wensen en leveren resultaten die verwachtingen overtreffen.',
                'Our barbers are craftsmen who view their trade as an art form. They combine time-honored techniques with modern sensibilities, ensuring every client leaves looking and feeling their absolute best. We take pride in understanding your style, listening to your needs, and delivering results that exceed expectations.'
              )}
            </p>
            <p className="text-white/60 leading-relaxed" style={{fontFamily:"'Lora', serif"}}>
              {txt(
                'Of je nu vaste klant bent of voor het eerst langskomt, je vindt bij ons professionaliteit, warmte en echte gastvrijheid. We werken met premium producten, blijven ons ontwikkelen en behandelen iedereen met respect en zorg.',
                "Whether you're a regular or visiting for the first time, you'll find an atmosphere of professionalism, warmth, and genuine hospitality. We use only premium products, invest continuously in staying current with trends, and most importantly, we treat every person who walks through our door with respect and care."
              )}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="brand-section py-20 bg-[#111111]">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="text-center"
            >
              <stat.icon className="w-6 h-6 text-[#C5A059] mx-auto mb-3" />
              <p className="text-3xl md:text-4xl font-bold text-white mb-1">{stat.value}</p>
              <p className="text-white/30 text-sm">{txt(
                stat.label === 'Years of Experience' ? 'Jaar Ervaring' :
                stat.label === 'Happy Clients' ? 'Tevreden Klanten' :
                stat.label === 'Expert Barbers' ? 'Expert Barbiers' :
                stat.label === 'Average Rating' ? 'Gemiddelde Score' :
                stat.label,
                stat.label
              )}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Team */}
      <section className="brand-section py-24">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="text-[#C5A059] text-xs tracking-[0.4em] uppercase mb-4" style={{fontFamily:"'Lora', serif"}}>{txt('Het Team', 'The Team')}</p>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight" style={{fontFamily:"'Roboto Condensed', sans-serif"}}>{txt('Ontmoet Onze Barbiers', 'Meet Our Barbers')}</h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {TEAM.map((member, i) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className="group"
              >
                <div className="aspect-[3/4] overflow-hidden mb-5 border border-[#2A2A2A]">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                </div>
                <h3 className="text-lg font-semibold">{member.name}</h3>
                <p className="text-[#C5A059] text-sm" style={{fontFamily:"'Lora', serif"}}>{member.role}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}