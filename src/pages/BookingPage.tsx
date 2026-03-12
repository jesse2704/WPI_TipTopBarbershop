import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Label, TextInput, Select } from "flowbite-react";
import { services } from "../data/services";
import { useBooking } from "../context/BookingContext";
import type { Appointment } from "../types";

const TIME_SLOTS = [
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "12:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
];

export default function BookingPage() {
  const navigate = useNavigate();
  const { addAppointment, getAppointmentsByDate } = useBooking();

  const [customerName, setCustomerName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [date, setDate] = useState("");
  const [timeSlot, setTimeSlot] = useState("");
  const [success, setSuccess] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  const bookedSlots = date
    ? getAppointmentsByDate(date)
        .filter((a) => a.status !== "completed")
        .map((a) => a.timeSlot)
    : [];

  const availableSlots = TIME_SLOTS.filter(
    (slot) => !bookedSlots.includes(slot)
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName || !phoneNumber || !serviceId || !date || !timeSlot) {
      return;
    }

    const appointment: Appointment = {
      id: crypto.randomUUID(),
      customerName,
      phoneNumber,
      serviceId,
      date,
      timeSlot,
      status: "booked",
      createdAt: new Date().toISOString(),
    };

    addAppointment(appointment);
    setSuccess(true);

    setTimeout(() => {
      navigate("/");
    }, 3000);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-vintage-cream flex items-center justify-center px-4">
        <div className="bg-stark-white rounded-lg shadow-lg p-10 text-center max-w-md">
          <div className="text-5xl mb-4">✓</div>
          <h2 className="text-2xl font-bold text-deep-black mb-2">
            Booking Confirmed!
          </h2>
          <p className="text-slate-grey">
            Thank you, <strong>{customerName}</strong>. We&apos;ll see you on{" "}
            <strong>{date}</strong> at <strong>{timeSlot}</strong>.
          </p>
          <p className="text-sm text-slate-grey mt-4">
            Redirecting to home page...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-vintage-cream py-12 px-4">
      <div className="max-w-lg mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-deep-black mb-2">
            Book an Appointment
          </h1>
          <div className="w-16 h-1 bg-antique-gold mx-auto" />
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-stark-white rounded-lg shadow-lg p-8 space-y-5"
        >
          <div>
            <Label htmlFor="name" className="text-deep-black font-heading mb-1">
              Full Name
            </Label>
            <TextInput
              id="name"
              placeholder="John Doe"
              required
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
            />
          </div>

          <div>
            <Label
              htmlFor="phone"
              className="text-deep-black font-heading mb-1"
            >
              Phone Number
            </Label>
            <TextInput
              id="phone"
              type="tel"
              placeholder="(555) 123-4567"
              required
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
          </div>

          <div>
            <Label
              htmlFor="service"
              className="text-deep-black font-heading mb-1"
            >
              Select Service
            </Label>
            <Select
              id="service"
              required
              value={serviceId}
              onChange={(e) => setServiceId(e.target.value)}
            >
              <option value="">Choose a service...</option>
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} — ${s.price} ({s.duration} min)
                </option>
              ))}
            </Select>
          </div>

          <div>
            <Label htmlFor="date" className="text-deep-black font-heading mb-1">
              Preferred Date
            </Label>
            <TextInput
              id="date"
              type="date"
              required
              min={today}
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
                setTimeSlot("");
              }}
            />
          </div>

          <div>
            <Label htmlFor="time" className="text-deep-black font-heading mb-1">
              Time Slot
            </Label>
            <Select
              id="time"
              required
              value={timeSlot}
              onChange={(e) => setTimeSlot(e.target.value)}
              disabled={!date}
            >
              <option value="">
                {!date
                  ? "Select a date first"
                  : availableSlots.length === 0
                    ? "No slots available"
                    : "Choose a time..."}
              </option>
              {availableSlots.map((slot) => (
                <option key={slot} value={slot}>
                  {slot}
                </option>
              ))}
            </Select>
          </div>

          <Button
            type="submit"
            size="lg"
            className="w-full bg-antique-gold hover:bg-amber-600 text-deep-black font-heading border-0 focus:ring-antique-gold"
          >
            Confirm Booking
          </Button>
        </form>
      </div>
    </div>
  );
}
