import { motion } from 'framer-motion';
import { useState } from 'react';
import { X } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const GALLERY_IMAGES = [
  { src: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=600&q=80', alt: 'Classic fade haircut' },
  { src: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=600&q=80', alt: 'Beard trimming' },
  { src: 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=600&q=80', alt: 'Hot towel shave' },
  { src: 'https://images.unsplash.com/photo-1585747860019-8030e2039dd2?w=600&q=80', alt: 'Barbershop interior' },
  { src: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=600&q=80', alt: 'Barber at work' },
  { src: 'https://images.unsplash.com/photo-1587909209111-5097ee578ec3?w=600&q=80', alt: 'Styling details' },
];

export default function Gallery() {
  const { txt } = useLanguage();
  const [lightbox, setLightbox] = useState(null);

  return (
    <div className="brand-page">
      {/* Header */}
      <section className="brand-section brand-hero-header text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <p className="brand-kicker">{txt('Ons Werk', 'Our Work')}</p>
          <h1 className="brand-title">{txt('Galerij', 'Gallery')}</h1>
        </motion.div>
      </section>

      {/* Gallery Grid */}
      <section className="brand-section pb-32">
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {GALLERY_IMAGES.map((img, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="aspect-square overflow-hidden cursor-pointer group border border-[#2A2A2A] bg-[#141414]"
              onClick={() => setLightbox(img)}
            >
              <img
                src={img.src}
                alt={img.alt}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
            </motion.div>
          ))}
        </div>
      </section>

      {/* Lightbox */}
      {lightbox && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-6"
          onClick={() => setLightbox(null)}
        >
          <button
            className="absolute top-6 right-6 text-white/60 hover:text-white"
            onClick={() => setLightbox(null)}
          >
            <X className="w-8 h-8" />
          </button>
          <img
            src={lightbox.src.replace('w=600', 'w=1200')}
            alt={lightbox.alt}
            className="max-w-full max-h-[85vh] object-contain"
          />
        </motion.div>
      )}
    </div>
  );
}