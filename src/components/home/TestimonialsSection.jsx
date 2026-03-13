import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

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

const GOOGLE_REVIEWS_URL = 'https://www.google.com/search?sa=X&sca_esv=d087776caa853f74&sxsrf=ANbL-n4IEtkjJUNvzCLA27NdQPk_5DnldA:1773417656543&q=TIP+TOP+BARBERSHOP+Reviews&rflfq=1&num=20&stick=H4sIAAAAAAAAAONgkxIxNDYwNTEwNjYzN7U0MwKSJuYWGxgZXzFKhXgGKIT4Byg4OQY5uQYFewCZQallmanlxYtY8UgCAKXRy3RVAAAA&rldimm=13054033675962675478&tbm=lcl&hl=nl-NL&ved=2ahUKEwiTqdPLn52TAxUYgv0HHZYxLk8Q9fQKegQIUBAG&biw=1920&bih=919&dpr=1#lkt=LocalPoiReviews';
const GOOGLE_REVIEWS_API = 'https://europe-west1-wpi-tiptopbarbershop.cloudfunctions.net/getGoogleReviewsHttp';

export default function TestimonialsSection() {
  const { txt } = useLanguage();
  const [reviews, setReviews] = useState([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadReviews = async () => {
      try {
        const res = await fetch(GOOGLE_REVIEWS_API, { method: 'GET' });
        if (!res.ok) return;
        const data = await res.json();
        if (!isMounted || !Array.isArray(data?.reviews) || data.reviews.length === 0) return;

        const parsedReviews = data.reviews
          .map((r, i) => ({
            name: r.authorName || r.author_name || `Google User ${i + 1}`,
            text: r.text || txt('Google review', 'Google review'),
            rating: Math.max(1, Math.min(5, Math.round(Number(r.rating) || 5))),
            publishTime: r.publishTime || r.publish_time || null,
          }))
          .filter((r) => r.text.trim().length > 0);

        const getTimestamp = (value) => {
          if (!value) return 0;
          const parsed = Date.parse(value);
          return Number.isNaN(parsed) ? 0 : parsed;
        };

        const normalized = parsedReviews
          .sort((a, b) => {
            if (b.rating !== a.rating) return b.rating - a.rating;
            return getTimestamp(b.publishTime) - getTimestamp(a.publishTime);
          })
          .slice(0, 3)
          .map(({ name, text, rating }) => ({ name, text, rating }));

        setReviews(normalized);
      } catch {
        // Keep static fallback testimonials when API is unavailable.
      } finally {
        if (isMounted) setIsLoadingReviews(false);
      }
    };

    loadReviews();
    return () => {
      isMounted = false;
    };
  }, [txt]);

  const displayTestimonials = useMemo(() => {
    if (reviews.length > 0) return reviews;
    return TESTIMONIALS;
  }, [reviews]);

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
          <p className="text-[#C5A059] text-xs tracking-[0.4em] uppercase mb-4" style={{fontFamily:"'Lora', serif"}}>{txt('Ervaringen', 'Testimonials')}</p>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight" style={{fontFamily:"'Roboto Condensed', sans-serif"}}>{txt('Wat Klanten Zeggen', 'What Clients Say')}</h2>
          {!isLoadingReviews && reviews.length > 0 && (
            <p className="mt-4 text-[11px] tracking-[0.25em] uppercase text-[#C5A059]/90" style={{fontFamily:"'Roboto Condensed', sans-serif"}}>
              {txt('Live vanaf Google Reviews', 'Live from Google Reviews')}
            </p>
          )}
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {isLoadingReviews
            ? Array.from({ length: 3 }).map((_, i) => (
                <motion.div
                  key={`skeleton-${i}`}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.12 }}
                  className="bg-[#141414] border border-[#2A2A2A] p-8 h-full flex flex-col"
                >
                  <div className="flex gap-1 mb-5">
                    {Array.from({ length: 5 }).map((__, j) => (
                      <div key={j} className="w-4 h-4 rounded-sm bg-[#2A2A2A] animate-pulse" />
                    ))}
                  </div>
                  <div className="space-y-2 mb-6 flex-1">
                    <div className="h-3 rounded bg-[#2A2A2A] animate-pulse" />
                    <div className="h-3 rounded bg-[#2A2A2A] animate-pulse w-11/12" />
                    <div className="h-3 rounded bg-[#2A2A2A] animate-pulse w-4/5" />
                  </div>
                  <div className="flex items-center gap-3 mt-auto">
                    <div className="w-10 h-10 rounded-full bg-[#2A2A2A] animate-pulse" />
                    <div className="h-3 w-24 rounded bg-[#2A2A2A] animate-pulse" />
                  </div>
                </motion.div>
              ))
            : displayTestimonials.map((t, i) => (
                <motion.div
                  key={t.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.15 }}
                  className="bg-[#141414] border border-[#2A2A2A] p-8 h-full flex flex-col"
                >
                  <div className="flex gap-1 mb-5">
                    {Array.from({ length: t.rating }).map((_, j) => (
                      <Star key={j} className="w-4 h-4 fill-[#C5A059] text-[#C5A059]" />
                    ))}
                  </div>
                  <p className="text-white/50 text-sm leading-relaxed mb-6 italic flex-1" style={{fontFamily:"'Lora', serif"}}>"{t.text}"</p>
                  <div className="flex items-center gap-3 mt-auto">
                    <div className="w-10 h-10 rounded-full bg-[#C5A059]/10 flex items-center justify-center">
                      <span className="text-[#C5A059] font-semibold text-sm">{t.name[0]}</span>
                    </div>
                    <span className="text-sm font-medium" style={{fontFamily:"'Roboto Condensed', sans-serif"}}>{t.name}</span>
                  </div>
                </motion.div>
              ))}
        </div>

        <div className="mt-10 text-center">
          <a
            href={GOOGLE_REVIEWS_URL}
            target="_blank"
            rel="noreferrer"
            className="text-[#C5A059] text-sm tracking-widest uppercase hover:text-[#D4B470] transition-colors"
            style={{fontFamily:"'Roboto Condensed', sans-serif"}}
          >
            {txt('Bekijk Alle Google Reviews', 'View All Google Reviews')} →
          </a>
        </div>
      </div>
    </section>
  );
}