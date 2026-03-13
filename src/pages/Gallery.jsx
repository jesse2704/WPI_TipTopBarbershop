import { motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { X, Heart, MessageCircle, Send, Instagram } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const INSTAGRAM_URL = 'https://www.instagram.com/tiptopbarbershopnl/';
const INSTAGRAM_FEED_API = 'https://europe-west1-wpi-tiptopbarbershop.cloudfunctions.net/getInstagramFeedHttp';

const GALLERY_IMAGES = [
  {
    src: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=900&q=80',
    alt: 'Classic fade haircut',
    captionNl: 'Skin fade met scherpe lijnen en een verzorgde afwerking.',
    captionEn: 'Skin fade with crisp lines and a polished finish.',
    tags: ['fade', 'precision', 'tiptop'],
  },
  {
    src: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=900&q=80',
    alt: 'Beard trimming',
    captionNl: 'Baard trim en shape-up voor een strakke, evenwichtige look.',
    captionEn: 'Beard trim and shape-up for a sharp, balanced look.',
    tags: ['beard', 'shapeup', 'grooming'],
  },
  {
    src: 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=900&q=80',
    alt: 'Hot towel shave',
    captionNl: 'Hot towel shave met klassieke barbershop-beleving.',
    captionEn: 'Hot towel shave with a classic barbershop ritual.',
    tags: ['shave', 'hot towel', 'classic'],
  },
  {
    src: 'https://images.unsplash.com/photo-1585747860019-8030e2039dd2?w=900&q=80',
    alt: 'Barbershop interior',
    captionNl: 'De shop: warm licht, rustige sfeer en premium afwerking.',
    captionEn: 'Inside the shop: warm light, calm atmosphere, premium finish.',
    tags: ['interior', 'shop vibe', 'premium'],
  },
  {
    src: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=900&q=80',
    alt: 'Barber at work',
    captionNl: 'Vakmanschap in detail, van consult tot finishing touch.',
    captionEn: 'Craftsmanship in detail, from consultation to finishing touch.',
    tags: ['barber', 'craft', 'detail'],
  },
  {
    src: 'https://images.unsplash.com/photo-1587909209111-5097ee578ec3?w=900&q=80',
    alt: 'Styling details',
    captionNl: 'Textuur, controle en stijl die de hele dag blijft zitten.',
    captionEn: 'Texture, control, and style that holds all day.',
    tags: ['styling', 'texture', 'finish'],
  },
];

export default function Gallery() {
  const { txt } = useLanguage();
  const [lightbox, setLightbox] = useState(null);
  const [feedItems, setFeedItems] = useState([]);

  useEffect(() => {
    let isMounted = true;

    const loadFeed = async () => {
      try {
        const response = await fetch(INSTAGRAM_FEED_API, { method: 'GET' });
        if (!response.ok) return;

        const data = await response.json();
        if (!isMounted || !Array.isArray(data?.media) || data.media.length === 0) {
          return;
        }

        const normalized = data.media.slice(0, 9).map((item, index) => {
          const caption = (item.caption || '').trim();
          const extractedTags = Array.from(new Set((caption.match(/#[\p{L}\p{N}_]+/gu) || []).map((tag) => tag.replace(/^#/, '').toLowerCase()))).slice(0, 4);

          return {
            src: item.mediaUrl,
            alt: caption || `Instagram post ${index + 1}`,
            captionNl: caption || txt('Bekijk deze recente update op Instagram.', 'See this recent update on Instagram.'),
            captionEn: caption || txt('Bekijk deze recente update op Instagram.', 'See this recent update on Instagram.'),
            tags: extractedTags.length > 0 ? extractedTags : ['instagram', 'tiptop'],
            permalink: item.permalink || INSTAGRAM_URL,
          };
        });

        setFeedItems(normalized);
      } catch {
        // Fallback stays active when Instagram feed is unavailable.
      }
    };

    loadFeed();
    return () => {
      isMounted = false;
    };
  }, [txt]);

  const galleryItems = useMemo(() => {
    if (feedItems.length > 0) return feedItems;
    return GALLERY_IMAGES.map((item) => ({ ...item, permalink: INSTAGRAM_URL }));
  }, [feedItems]);

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

      <section className="brand-section pb-10">
        <div className="max-w-6xl mx-auto rounded-[28px] border border-[#2A2A2A] bg-[#101010]/95 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.35)] md:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-full border border-[#C5A059]/35 bg-[radial-gradient(circle_at_30%_30%,rgba(212,180,112,0.22),rgba(20,20,20,1))] text-[#C5A059] shadow-lg">
                <Instagram className="h-8 w-8" />
              </div>
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-[#C5A059]" style={{ fontFamily: "'Roboto Condensed', sans-serif" }}>
                  @tiptopbarbershopnl
                </p>
                <h2 className="mt-1 text-3xl font-black text-white md:text-4xl" style={{ fontFamily: "'Roboto Condensed', sans-serif" }}>
                  {txt('Instagram Feed Stijl', 'Instagram Feed Style')}
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/60" style={{ fontFamily: "'Lora', serif" }}>
                  {txt(
                    'Een galerie die aanvoelt als jullie Instagram-profiel: scherpe resultaten, shopmomenten en premium grooming details.',
                    'A gallery that feels like your Instagram profile: sharp results, shop moments, and premium grooming details.'
                  )}
                </p>
              </div>
            </div>

            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noreferrer"
              className="brand-button justify-center"
            >
              {txt('Bekijk Op Instagram', 'View on Instagram')}
            </a>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-3 border-t border-[#1E1E1E] pt-6 text-center md:max-w-xl">
            <div>
              <p className="text-[10px] uppercase tracking-[0.28em] text-white/35" style={{ fontFamily: "'Lora', serif" }}>{txt('Focus', 'Focus')}</p>
              <p className="mt-1 text-sm font-bold text-white" style={{ fontFamily: "'Roboto Condensed', sans-serif" }}>{txt('Coupes', 'Cuts')}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.28em] text-white/35" style={{ fontFamily: "'Lora', serif" }}>{txt('Vibe', 'Vibe')}</p>
              <p className="mt-1 text-sm font-bold text-white" style={{ fontFamily: "'Roboto Condensed', sans-serif" }}>{txt('Premium Shop', 'Premium Shop')}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.28em] text-white/35" style={{ fontFamily: "'Lora', serif" }}>{txt('Kanaal', 'Channel')}</p>
              <p className="mt-1 text-sm font-bold text-white" style={{ fontFamily: "'Roboto Condensed', sans-serif" }}>Instagram</p>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="brand-section pb-32">
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {galleryItems.map((img, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="overflow-hidden cursor-pointer group border border-[#2A2A2A] bg-[#141414]"
              onClick={() => setLightbox(img)}
            >
              <div className="flex items-center gap-3 border-b border-[#202020] px-4 py-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#C5A059]/35 bg-[#1A1A1A] text-[#C5A059]">
                  <Instagram className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.18em] text-white" style={{ fontFamily: "'Roboto Condensed', sans-serif" }}>
                    tip top barbershop
                  </p>
                  <p className="text-[11px] text-white/40" style={{ fontFamily: "'Lora', serif" }}>
                    @tiptopbarbershopnl
                  </p>
                </div>
              </div>

              <div className="relative aspect-square overflow-hidden">
                <img
                  src={img.src}
                  alt={img.alt}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              </div>

              <div className="px-4 py-4">
                <div className="mb-3 flex items-center gap-3 text-white/75">
                  <Heart className="h-4 w-4" />
                  <MessageCircle className="h-4 w-4" />
                  <Send className="h-4 w-4" />
                </div>

                <p className="text-sm leading-relaxed text-white/72" style={{ fontFamily: "'Lora', serif" }}>
                  {txt(img.captionNl, img.captionEn)}
                </p>

                <div className="mt-3 flex flex-wrap gap-2">
                  {img.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-[#2A2A2A] bg-[#101010] px-2.5 py-1 text-[10px] uppercase tracking-[0.2em] text-[#C5A059]"
                      style={{ fontFamily: "'Roboto Condensed', sans-serif" }}
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                <a
                  href={img.permalink || INSTAGRAM_URL}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(event) => event.stopPropagation()}
                  className="mt-4 inline-flex text-xs uppercase tracking-[0.22em] text-[#C5A059] transition-colors hover:text-[#D4B470]"
                  style={{ fontFamily: "'Roboto Condensed', sans-serif" }}
                >
                  {txt('Open Op Instagram', 'Open on Instagram')}
                </a>
              </div>
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
          <div
            className="grid w-full max-w-5xl overflow-hidden rounded-[24px] border border-[#2A2A2A] bg-[#111111] shadow-[0_24px_80px_rgba(0,0,0,0.45)] md:grid-cols-[1.2fr_0.8fr]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="bg-black">
              <img
                src={lightbox.src}
                alt={lightbox.alt}
                className="h-full max-h-[85vh] w-full object-cover"
              />
            </div>
            <div className="flex flex-col justify-between p-6">
              <div>
                <div className="flex items-center gap-3 border-b border-[#202020] pb-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[#C5A059]/35 bg-[#1A1A1A] text-[#C5A059]">
                    <Instagram className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold uppercase tracking-[0.18em] text-white" style={{ fontFamily: "'Roboto Condensed', sans-serif" }}>
                      tip top barbershop
                    </p>
                    <p className="text-[11px] text-white/40" style={{ fontFamily: "'Lora', serif" }}>
                      @tiptopbarbershopnl
                    </p>
                  </div>
                </div>

                <p className="mt-5 text-base leading-relaxed text-white/75" style={{ fontFamily: "'Lora', serif" }}>
                  {txt(lightbox.captionNl, lightbox.captionEn)}
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  {lightbox.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-[#2A2A2A] px-2.5 py-1 text-[10px] uppercase tracking-[0.2em] text-[#C5A059]"
                      style={{ fontFamily: "'Roboto Condensed', sans-serif" }}
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-6">
                <div className="mb-4 flex items-center gap-3 text-white/75">
                  <Heart className="h-5 w-5" />
                  <MessageCircle className="h-5 w-5" />
                  <Send className="h-5 w-5" />
                </div>
                <a
                  href={lightbox.permalink || INSTAGRAM_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="brand-button w-full justify-center"
                >
                  {txt('Ga Naar Instagram Profiel', 'Go to Instagram Profile')}
                </a>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}