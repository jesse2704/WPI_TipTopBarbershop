import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { services } from "../data/services";
import { useBooking, WORKING_TIME_SLOTS } from "../context/BookingContext";
import { usePhoneAuth } from "../context/PhoneAuthContext";
import type { Appointment } from "../types";

/* ── helpers ─────────────────────────────────────────────────── */

function toIso(d: Date): string {
  return d.toISOString().split("T")[0];
}

function formatTime(t: string): string {
  const [h, m] = t.split(":");
  const hr = parseInt(h, 10);
  return `${hr % 12 || 12}:${m} ${hr >= 12 ? "PM" : "AM"}`;
}

function shortDay(iso: string): string {
  return new Date(iso + "T12:00:00").toLocaleDateString("en-US", {
    weekday: "short",
  });
}

function shortDate(iso: string): string {
  return new Date(iso + "T12:00:00").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function buildNext14Days(): string[] {
  const days: string[] = [];
  const now = new Date();
  for (let i = 0; i < 14; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() + i);
    days.push(toIso(d));
  }
  return days;
}

/* ── Phone Login Screen ──────────────────────────────────────── */

function PhoneLoginGate({ onVerified }: { onVerified: () => void }) {
  const { user, loading, error, busy, sendCode, verifyCode } = usePhoneAuth();

  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"phone" | "code">("phone");

  // Already authenticated
  if (user) {
    onVerified();
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-vintage-cream flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-antique-gold rounded-full animate-spin" />
      </div>
    );
  }

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) return;
    await sendCode(phone);
    setStep("code");
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code) return;
    await verifyCode(code);
  };

  const inputClass =
    "w-full px-4 py-3 rounded-lg border border-slate-grey/30 bg-stark-white text-deep-black placeholder-slate-grey/50 focus:outline-none focus:ring-2 focus:ring-antique-gold transition-colors";

  return (
    <div className="min-h-screen bg-vintage-cream flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-deep-black font-heading mb-2">
            Book an Appointment
          </h1>
          <p className="text-slate-grey text-sm">
            Verify your phone number to continue booking.
          </p>
          <div className="w-16 h-1 bg-antique-gold mx-auto rounded-full mt-3" />
        </div>

        <div className="bg-stark-white rounded-xl shadow-lg border border-slate-grey/10 p-8">
          {step === "phone" ? (
            <form onSubmit={handleSendCode} className="space-y-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-antique-gold/10 flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 text-antique-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div>
                  <h2 className="font-heading font-bold text-deep-black">
                    Enter your phone number
                  </h2>
                  <p className="text-xs text-slate-grey">
                    We&apos;ll send you a verification code via SMS.
                  </p>
                </div>
              </div>

              <input
                type="tel"
                placeholder="+31 6 1234 5678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={inputClass}
                required
              />

              <p className="text-[11px] text-slate-grey/70">
                Use international format including country code (e.g.{" "}
                <strong>+31</strong> for NL, <strong>+1</strong> for US).
              </p>

              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={busy || !phone}
                className="w-full py-3 bg-antique-gold hover:bg-amber-500 disabled:opacity-50 text-deep-black font-heading font-bold rounded-lg transition-colors shadow-md"
              >
                {busy ? "Sending…" : "Send Verification Code"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerify} className="space-y-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-antique-gold/10 flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 text-antique-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <div>
                  <h2 className="font-heading font-bold text-deep-black">
                    Enter verification code
                  </h2>
                  <p className="text-xs text-slate-grey">
                    Sent to <strong>{phone}</strong>
                  </p>
                </div>
              </div>

              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="123456"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                className={`${inputClass} text-center text-2xl tracking-[0.4em] font-heading`}
                required
              />

              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={busy || code.length < 6}
                className="w-full py-3 bg-antique-gold hover:bg-amber-500 disabled:opacity-50 text-deep-black font-heading font-bold rounded-lg transition-colors shadow-md"
              >
                {busy ? "Verifying…" : "Verify & Continue"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep("phone");
                  setCode("");
                }}
                className="w-full text-sm text-slate-grey hover:text-deep-black transition-colors"
              >
                ← Use a different number
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── 2-Week Agenda Booking View ──────────────────────────────── */

function AgendaBookingView() {
  const navigate = useNavigate();
  const { user, logout } = usePhoneAuth();
  const {
    addAppointment,
    getAvailableTimeSlots,
    getAppointmentsByDate,
    breakMinutes,
  } = useBooking();

  const [serviceId, setServiceId] = useState(services[0].id);
  const [customerName, setCustomerName] = useState("");
  const [selectedSlot, setSelectedSlot] = useState<{
    date: string;
    time: string;
  } | null>(null);
  const [success, setSuccess] = useState(false);

  const days = useMemo(buildNext14Days, []);

  const phone = user?.phoneNumber ?? "";

  /* Precompute availability for every day in the 2-week window */
  const dayData = useMemo(() => {
    return days.map((day) => {
      const available = getAvailableTimeSlots(day, serviceId);
      const booked = getAppointmentsByDate(day);
      return { day, available, booked };
    });
  }, [days, serviceId, getAvailableTimeSlots, getAppointmentsByDate]);

  const handleBook = () => {
    if (!selectedSlot || !customerName) return;

    const appointment: Appointment = {
      id: crypto.randomUUID(),
      customerName,
      phoneNumber: phone,
      serviceId,
      date: selectedSlot.date,
      timeSlot: selectedSlot.time,
      status: "booked",
      createdAt: new Date().toISOString(),
    };

    addAppointment(appointment);
    setSuccess(true);
    setTimeout(() => navigate("/"), 3000);
  };

  const selectedService = services.find((s) => s.id === serviceId);

  /* ── Success screen ─────────────────────────────────────────── */
  if (success && selectedSlot) {
    return (
      <div className="min-h-screen bg-vintage-cream flex items-center justify-center px-4">
        <div className="bg-stark-white rounded-xl shadow-xl p-10 text-center max-w-md border border-slate-grey/10">
          <div className="w-16 h-16 bg-antique-gold/10 rounded-full flex items-center justify-center mx-auto mb-5">
            <svg
              className="w-8 h-8 text-antique-gold"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-deep-black font-heading mb-2">
            Booking Confirmed!
          </h2>
          <p className="text-slate-grey">
            See you on{" "}
            <strong className="text-deep-black">
              {shortDay(selectedSlot.date)} {shortDate(selectedSlot.date)}
            </strong>{" "}
            at{" "}
            <strong className="text-deep-black">
              {formatTime(selectedSlot.time)}
            </strong>
            .
          </p>
          <p className="text-sm text-slate-grey/60 mt-5">
            Redirecting to home…
          </p>
        </div>
      </div>
    );
  }

  /* ── Main view ──────────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-vintage-cream py-6 px-4 md:py-10">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-deep-black font-heading">
              Book an Appointment
            </h1>
            <p className="text-slate-grey text-sm mt-1">
              Pick a service, then tap an available slot in the next 2 weeks.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-grey font-heading">
              {phone}
            </span>
            <button
              onClick={logout}
              className="text-xs text-red-500 hover:text-red-700 font-heading transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>

        {/* Service selector + name */}
        <div className="bg-stark-white rounded-xl border border-slate-grey/10 shadow-sm p-5 flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-heading font-semibold text-deep-black mb-1">
              Service
            </label>
            <select
              value={serviceId}
              onChange={(e) => {
                setServiceId(e.target.value);
                setSelectedSlot(null);
              }}
              className="w-full px-4 py-3 rounded-lg border border-slate-grey/30 bg-stark-white text-deep-black focus:outline-none focus:ring-2 focus:ring-antique-gold transition-colors"
            >
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} — €{s.price} ({s.duration} min)
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-heading font-semibold text-deep-black mb-1">
              Your Name
            </label>
            <input
              type="text"
              placeholder="John Doe"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-slate-grey/30 bg-stark-white text-deep-black placeholder-slate-grey/50 focus:outline-none focus:ring-2 focus:ring-antique-gold transition-colors"
            />
          </div>

          {selectedService && (
            <div className="rounded-lg bg-antique-gold/10 border border-antique-gold/30 px-4 py-3 text-sm text-deep-black">
              <strong>{selectedService.name}</strong> · {selectedService.duration} min · {breakMinutes} min break after
            </div>
          )}
        </div>

        {/* 2-Week Agenda Grid */}
        <div className="space-y-3">
          {dayData.map(({ day, available, booked }) => {
            const isToday = day === toIso(new Date());
            const isSunday = new Date(day + "T12:00:00").getDay() === 0;

            return (
              <div
                key={day}
                className={`bg-stark-white rounded-xl border shadow-sm overflow-hidden ${
                  isToday
                    ? "border-antique-gold/40"
                    : "border-slate-grey/10"
                } ${isSunday ? "opacity-50" : ""}`}
              >
                {/* Day header */}
                <div
                  className={`px-4 py-2.5 flex items-center gap-3 border-b ${
                    isToday
                      ? "bg-antique-gold/5 border-antique-gold/20"
                      : "bg-slate-grey/[0.02] border-slate-grey/10"
                  }`}
                >
                  <span className="font-heading font-bold text-deep-black text-sm min-w-[36px]">
                    {shortDay(day)}
                  </span>
                  <span className="text-slate-grey text-sm">
                    {shortDate(day)}
                  </span>
                  {isToday && (
                    <span className="text-[10px] text-antique-gold font-heading uppercase tracking-widest">
                      Today
                    </span>
                  )}
                  <span className="ml-auto text-xs text-slate-grey">
                    {available.length} slot{available.length !== 1 ? "s" : ""}{" "}
                    open
                  </span>
                </div>

                {/* Slots row */}
                {isSunday ? (
                  <div className="px-4 py-4 text-center text-sm text-slate-grey/60">
                    Closed on Sundays
                  </div>
                ) : available.length === 0 ? (
                  <div className="px-4 py-4 text-center text-sm text-slate-grey/60">
                    Fully booked
                  </div>
                ) : (
                  <div className="px-3 py-3 flex flex-wrap gap-2">
                    {WORKING_TIME_SLOTS.map((slot) => {
                      const isBooked = booked.some(
                        (a) =>
                          a.timeSlot === slot && a.status !== "completed"
                      );
                      const isAvailable = available.includes(slot);
                      const isSelected =
                        selectedSlot?.date === day &&
                        selectedSlot?.time === slot;

                      if (!isAvailable && !isBooked) {
                        // blocked by overlap / break — show dimmed
                        return (
                          <div
                            key={slot}
                            className="px-3 py-2 rounded-lg text-xs font-heading text-slate-grey/30 bg-slate-grey/[0.03] border border-transparent"
                          >
                            {formatTime(slot)}
                          </div>
                        );
                      }

                      if (isBooked) {
                        return (
                          <div
                            key={slot}
                            className="px-3 py-2 rounded-lg text-xs font-heading text-red-400/70 bg-red-50 border border-red-100 cursor-not-allowed"
                            title="Taken"
                          >
                            {formatTime(slot)}
                          </div>
                        );
                      }

                      return (
                        <button
                          key={slot}
                          onClick={() =>
                            setSelectedSlot(
                              isSelected ? null : { date: day, time: slot }
                            )
                          }
                          className={`px-3 py-2 rounded-lg text-xs font-heading font-semibold transition-all border ${
                            isSelected
                              ? "bg-antique-gold text-deep-black border-antique-gold shadow-md scale-105"
                              : "bg-green-50 text-green-700 border-green-200 hover:bg-green-100 hover:border-green-300"
                          }`}
                        >
                          {formatTime(slot)}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Sticky booking bar */}
        {selectedSlot && (
          <div className="sticky bottom-4 z-50">
            <div className="bg-deep-black text-stark-white rounded-xl shadow-2xl px-5 py-4 flex flex-wrap items-center justify-between gap-4 border border-antique-gold/20">
              <div>
                <p className="text-[10px] text-antique-gold font-heading uppercase tracking-widest mb-0.5">
                  Selected
                </p>
                <p className="font-heading font-bold">
                  {shortDay(selectedSlot.date)}{" "}
                  {shortDate(selectedSlot.date)} at{" "}
                  {formatTime(selectedSlot.time)}
                </p>
                <p className="text-xs text-stark-white/60">
                  {selectedService?.name} · €{selectedService?.price}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedSlot(null)}
                  className="px-4 py-2.5 rounded-lg border border-stark-white/20 text-stark-white text-sm font-heading hover:bg-stark-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBook}
                  disabled={!customerName}
                  className="px-6 py-2.5 rounded-lg bg-antique-gold hover:bg-amber-500 disabled:opacity-50 text-deep-black font-heading font-bold text-sm transition-colors shadow-md"
                >
                  {!customerName ? "Enter name first" : "Confirm Booking"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="flex flex-wrap gap-x-5 gap-y-1 text-[11px] text-slate-grey font-heading px-1 pb-6">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-green-50 border border-green-200 inline-block" />{" "}
            Available
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-red-50 border border-red-100 inline-block" />{" "}
            Taken
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-antique-gold border border-antique-gold inline-block" />{" "}
            Your pick
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-slate-grey/[0.03] border border-transparent inline-block" />{" "}
            Blocked
          </span>
        </div>
      </div>
    </div>
  );
}

/* ── Main Export ──────────────────────────────────────────────── */

export default function BookingPage() {
  const [verified, setVerified] = useState(false);
  const { user } = usePhoneAuth();

  // If already logged in, skip the gate
  if (user || verified) {
    return <AgendaBookingView />;
  }

  return <PhoneLoginGate onVerified={() => setVerified(true)} />;
}
