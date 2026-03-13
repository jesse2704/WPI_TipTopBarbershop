import { motion } from 'framer-motion';
import { Phone, MapPin, Clock, Mail } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const INFO_ITEMS = [
  {
    icon: MapPin,
    labelNl: 'Adres',
    labelEn: 'Address',
    valueNl: 'Tip Top Barbershop\nBekijk locatie op Google Maps',
    valueEn: 'Tip Top Barbershop\nView location on Google Maps',
    href: 'https://maps.google.com/maps?vet=10CAAQoqAOahcKEwj4p-aJnJ2TAxUAAAAAHQAAAAAQDA..i&sca_esv=d087776caa853f74&pvq=Cg0vZy8xMXZqMjZ2aGh2IhYKEHRpcHRvcGJhcmJlcnNob3AQAhgD&lqi=ChB0aXB0b3BiYXJiZXJzaG9wSPr7tKPAuoCACFoWEAAYACIQdGlwdG9wYmFyYmVyc2hvcJIBEnVuaXNleF9oYWlyZHJlc3Nlcg&fvr=1&cs=0&um=1&ie=UTF-8&fb=1&gl=nl&sa=X&ftid=0x47c5b7575fdf3cef:0xb5293e770dbdf116',
  },
  {
    icon: Phone,
    labelNl: 'Telefoon',
    labelEn: 'Phone',
    valueNl: '06 17886799',
    valueEn: '06 17886799',
    href: 'tel:+31617886799',
  },
  {
    icon: Mail,
    labelNl: 'Instagram',
    labelEn: 'Instagram',
    valueNl: '@tiptopbarbershopnl',
    valueEn: '@tiptopbarbershopnl',
    href: 'https://www.instagram.com/tiptopbarbershopnl/',
  },
  {
    icon: Mail,
    labelNl: 'E-mail',
    labelEn: 'Email',
    valueNl: 'info@tiptopbarbershop.nl',
    valueEn: 'info@tiptopbarbershop.nl',
    href: 'mailto:info@tiptopbarbershop.nl',
  },
  {
    icon: Clock,
    labelNl: 'Openingstijden',
    labelEn: 'Hours',
    valueNl: 'Di–Vr: 12:00–20:00\nZa: 12:00–18:00 · Zo: 12:00–16:00\nMa: Gesloten',
    valueEn: 'Tue–Fri: 12PM–8PM\nSat: 12PM–6PM · Sun: 12PM–4PM\nMon: Closed',
  },
];

export default function Contact() {
  const { txt } = useLanguage();

  return (
    <div className="brand-page">
      {/* Header */}
      <section className="brand-section brand-hero-header text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <p className="brand-kicker">{txt('Neem Contact Op', 'Get In Touch')}</p>
          <h1 className="brand-title">{txt('Contact', 'Contact Us')}</h1>
        </motion.div>
      </section>

      {/* Content */}
      <section className="brand-section pb-32">
        <div className="max-w-6xl mx-auto grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-20">
          {/* Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="brand-card"
          >
            <h2 className="text-2xl font-bold mb-8">{txt('Kom Langs Of Stuur Een Bericht', 'Visit Us or Drop a Line')}</h2>
            <div className="space-y-8">
              {INFO_ITEMS.map(item => (
                <div key={item.labelEn} className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#C5A059]/10 flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-5 h-5 text-[#C5A059]" />
                  </div>
                  <div>
                    <p className="text-sm text-[#C5A059] tracking-wider uppercase mb-1" style={{fontFamily:"'Roboto Condensed', sans-serif"}}>{txt(item.labelNl, item.labelEn)}</p>
                    {item.href ? (
                      <a
                        href={item.href}
                        target="_blank"
                        rel="noreferrer"
                        className="text-white/50 text-sm whitespace-pre-line leading-relaxed underline-offset-4 hover:text-white hover:underline"
                      >
                        {txt(item.valueNl, item.valueEn)}
                      </a>
                    ) : (
                      <p className="text-white/50 text-sm whitespace-pre-line leading-relaxed">{txt(item.valueNl, item.valueEn)}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Map */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="mt-10 overflow-hidden border border-[#1E1E1E] bg-[#141414] shadow-2xl">
              <iframe
                title="Tip Top Barbershop location"
                src="https://www.google.com/maps?q=Tip+Top+Barbershop+NL&output=embed"
                className="h-[420px] w-full"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
              <a
                href="https://maps.google.com/maps?vet=10CAAQoqAOahcKEwj4p-aJnJ2TAxUAAAAAHQAAAAAQDA..i&sca_esv=d087776caa853f74&pvq=Cg0vZy8xMXZqMjZ2aGh2IhYKEHRpcHRvcGJhcmJlcnNob3AQAhgD&lqi=ChB0aXB0b3BiYXJiZXJzaG9wSPr7tKPAuoCACFoWEAAYACIQdGlwdG9wYmFyYmVyc2hvcJIBEnVuaXNleF9oYWlyZHJlc3Nlcg&fvr=1&cs=0&um=1&ie=UTF-8&fb=1&gl=nl&sa=X&ftid=0x47c5b7575fdf3cef:0xb5293e770dbdf116"
                target="_blank"
                rel="noreferrer"
                className="block border-t border-[#1E1E1E] px-4 py-3 text-center text-xs uppercase tracking-widest text-[#C5A059] transition-colors hover:bg-[#1A1A1A]"
                style={{fontFamily:"'Roboto Condensed', sans-serif"}}
              >
                {txt('Open In Google Maps', 'Open in Google Maps')}
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}