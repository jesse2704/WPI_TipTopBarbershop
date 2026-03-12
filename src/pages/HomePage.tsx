import { Link } from "react-router-dom";
import { Button, Card } from "flowbite-react";
import { services } from "../data/services";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-deep-black text-vintage-cream py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-antique-gold tracking-[0.3em] uppercase text-sm mb-4 font-heading">
            Est. 2023
          </p>
          <h1 className="text-5xl md:text-7xl font-bold tracking-wider mb-6">
            TIP TOP
            <br />
            <span className="text-antique-gold">BARBERSHOP</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-grey max-w-2xl mx-auto mb-10 leading-relaxed">
            Where tradition meets precision. Step into our chair and leave
            looking your absolute best.
          </p>
          <Link to="/book">
            <Button
              size="xl"
              className="bg-antique-gold hover:bg-amber-600 text-deep-black font-heading border-0 focus:ring-antique-gold"
            >
              Book Now
            </Button>
          </Link>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 px-4 bg-vintage-cream">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-deep-black mb-3">
              Our Services
            </h2>
            <div className="w-16 h-1 bg-antique-gold mx-auto" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <Card
                key={service.id}
                className="border-slate-grey/20 bg-stark-white shadow-md"
              >
                <h3 className="text-xl font-bold text-deep-black font-heading">
                  {service.name}
                </h3>
                <p className="text-slate-grey">{service.description}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-2xl font-bold text-antique-gold font-heading">
                    ${service.price}
                  </span>
                  <span className="text-sm text-slate-grey">
                    {service.duration} min
                  </span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-deep-black text-vintage-cream py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready for a Fresh Look?</h2>
          <p className="text-slate-grey mb-8 text-lg">
            Book your appointment today and experience the Tip Top difference.
          </p>
          <Link to="/book">
            <Button
              size="lg"
              className="bg-antique-gold hover:bg-amber-600 text-deep-black font-heading border-0 focus:ring-antique-gold"
            >
              Book Your Appointment
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-deep-black border-t border-slate-grey/30 py-8 px-4 text-center">
        <p className="text-slate-grey text-sm">
          &copy; {new Date().getFullYear()} Tip Top Barbershop. All rights
          reserved.
        </p>
      </footer>
    </div>
  );
}
