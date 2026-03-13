import { Link } from "react-router-dom";
import { services } from "../data/services";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-deep-black text-vintage-cream py-28 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-antique-gold tracking-[0.3em] uppercase text-sm mb-5 font-heading">
            Est. 2023
          </p>
          <h1 className="text-5xl md:text-7xl font-bold tracking-wider mb-6 leading-tight">
            TIP TOP
            <br />
            <span className="text-antique-gold">BARBERSHOP</span>
          </h1>
          <p className="text-lg md:text-xl text-vintage-cream/60 max-w-2xl mx-auto mb-10 leading-relaxed">
            Where tradition meets precision. Step into our chair and leave
            looking your absolute best.
          </p>
          <Link
            to="/book"
            className="inline-block px-8 py-4 bg-antique-gold hover:bg-amber-500 text-deep-black font-heading font-bold text-base rounded-lg transition-colors shadow-lg"
          >
            Book Now
          </Link>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 px-4 bg-vintage-cream">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-deep-black mb-3 font-heading">
              Our Services
            </h2>
            <div className="w-16 h-1 bg-antique-gold mx-auto rounded-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <div
                key={service.id}
                className="bg-stark-white border border-slate-grey/15 rounded-xl shadow-md p-6 flex flex-col gap-3 hover:shadow-lg transition-shadow"
              >
                <h3 className="text-xl font-bold text-deep-black font-heading">
                  {service.name}
                </h3>
                <p className="text-slate-grey text-sm leading-relaxed flex-1">
                  {service.description}
                </p>
                <div className="flex items-center justify-between pt-2 border-t border-slate-grey/10">
                  <span className="text-2xl font-bold text-antique-gold font-heading">
                    ${service.price}
                  </span>
                  <span className="text-sm text-slate-grey bg-slate-grey/10 px-2 py-1 rounded">
                    {service.duration} min
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-deep-black text-vintage-cream py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 font-heading">
            Ready for a Fresh Look?
          </h2>
          <p className="text-vintage-cream/60 mb-10 text-lg leading-relaxed">
            Book your appointment today and experience the Tip Top difference.
          </p>
          <Link
            to="/book"
            className="inline-block px-8 py-4 bg-antique-gold hover:bg-amber-500 text-deep-black font-heading font-bold text-base rounded-lg transition-colors shadow-lg"
          >
            Book Your Appointment
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-deep-black border-t border-slate-grey/20 py-8 px-4 text-center">
        <p className="text-vintage-cream/40 text-sm">
          &copy; {new Date().getFullYear()} Tip Top Barbershop. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
