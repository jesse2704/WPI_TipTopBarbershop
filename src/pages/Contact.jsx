import { motion } from 'framer-motion';
import { Phone, MapPin, Clock, Mail, Send } from 'lucide-react';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const INFO_ITEMS = [
  { icon: MapPin, label: 'Address', value: '123 Main Street, Downtown\nSuite 101, City, ST 10001' },
  { icon: Phone, label: 'Phone', value: '(555) 123-4567' },
  { icon: Mail, label: 'Email', value: 'hello@thesharpedge.com' },
  { icon: Clock, label: 'Hours', value: 'Mon–Fri: 9AM–8PM\nSat: 9AM–6PM · Sun: 10AM–4PM' },
];

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    // Simulate sending
    await new Promise(r => setTimeout(r, 1000));
    toast.success('Message sent! We\'ll get back to you shortly.');
    setForm({ name: '', email: '', phone: '', message: '' });
    setSending(false);
  };

  return (
    <div>
      {/* Header */}
      <section className="pt-32 pb-16 px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-[#C5A059] text-xs tracking-[0.4em] uppercase mb-4" style={{fontFamily:"'Lora', serif"}}>Get In Touch</p>
          <h1 className="text-5xl md:text-6xl font-black tracking-tight" style={{fontFamily:"'Roboto Condensed', sans-serif"}}>Contact Us</h1>
        </motion.div>
      </section>

      {/* Content */}
      <section className="pb-32 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          {/* Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-2xl font-bold mb-8">Visit Us or Drop a Line</h2>
            <div className="space-y-8">
              {INFO_ITEMS.map(item => (
                <div key={item.label} className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#C5A059]/10 flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-5 h-5 text-[#C5A059]" />
                  </div>
                  <div>
                    <p className="text-sm text-[#C5A059] tracking-wider uppercase mb-1" style={{fontFamily:"'Roboto Condensed', sans-serif"}}>{item.label}</p>
                    <p className="text-white/50 text-sm whitespace-pre-line leading-relaxed">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Map placeholder */}
            <div className="mt-10 aspect-video bg-[#141414] border border-[#1E1E1E] flex items-center justify-center overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800&q=80"
                alt="Location"
                className="w-full h-full object-cover opacity-50"
              />
            </div>
          </motion.div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="bg-[#141414] border border-[#2A2A2A] p-8 md:p-10">
              <h2 className="text-2xl font-bold mb-2">Book an Appointment</h2>
              <p className="text-white/40 text-sm mb-8">
                Fill out the form below and we'll get back to you within 24 hours.
              </p>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="text-xs text-white/50 tracking-wider uppercase mb-2 block">Full Name</label>
                  <Input
                    required
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    placeholder="John Doe"
                    className="bg-[#0A0A0A] border-[#1E1E1E] text-white placeholder:text-white/20 h-12 rounded-none focus:border-[#C8A55C] focus:ring-0"
                  />
                </div>
                <div>
                  <label className="text-xs text-white/50 tracking-wider uppercase mb-2 block">Email</label>
                  <Input
                    required
                    type="email"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    placeholder="john@example.com"
                    className="bg-[#0A0A0A] border-[#1E1E1E] text-white placeholder:text-white/20 h-12 rounded-none focus:border-[#C8A55C] focus:ring-0"
                  />
                </div>
                <div>
                  <label className="text-xs text-white/50 tracking-wider uppercase mb-2 block">Phone</label>
                  <Input
                    value={form.phone}
                    onChange={e => setForm({ ...form, phone: e.target.value })}
                    placeholder="(555) 000-0000"
                    className="bg-[#0A0A0A] border-[#1E1E1E] text-white placeholder:text-white/20 h-12 rounded-none focus:border-[#C8A55C] focus:ring-0"
                  />
                </div>
                <div>
                  <label className="text-xs text-white/50 tracking-wider uppercase mb-2 block">Message</label>
                  <Textarea
                    value={form.message}
                    onChange={e => setForm({ ...form, message: e.target.value })}
                    placeholder="Tell us what you're looking for..."
                    rows={4}
                    className="bg-[#0A0A0A] border-[#1E1E1E] text-white placeholder:text-white/20 rounded-none focus:border-[#C8A55C] focus:ring-0 resize-none"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={sending}
                  className="w-full h-12 font-bold text-sm tracking-wider uppercase rounded-none transition-colors"
                  style={{backgroundColor:'#C5A059', color:'#1A1A1A', fontFamily:"'Roboto Condensed', sans-serif"}}
                >
                  {sending ? 'Sending...' : (
                    <span className="flex items-center gap-2">
                      Send Message <Send className="w-4 h-4" />
                    </span>
                  )}
                </Button>
              </form>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}