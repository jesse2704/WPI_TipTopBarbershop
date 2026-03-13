import { useEffect, useMemo, useState } from "react";
import { app } from "../lib/firebase";
import { services } from "../data/services";
import { useBooking, WORKING_TIME_SLOTS } from "../context/BookingContext";
import { usePhoneAuth } from "../context/PhoneAuthContext";
import { useLanguage } from "../context/LanguageContext";

const headingFont = { fontFamily: "'Roboto Condensed', 'Arial Narrow', sans-serif" };
const accentFont = { fontFamily: "'Lora', serif" };

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

function isClosedWeekDay(dateIso: string): boolean {
  const day = new Date(dateIso + "T12:00:00").getDay();
  return day === 0 || day === 1;
}

function toCalendarStamp(date: Date): string {
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

function buildDateTime(dateIso: string, time: string): Date {
  const [year, month, day] = dateIso.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);
  return new Date(year, month - 1, day, hour, minute, 0);
}

function escapeIcs(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

function createStableId(): string {
  if (typeof globalThis.crypto !== "undefined" && typeof globalThis.crypto.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }

  return `ttb-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function getFunctionsBaseUrl(): string {
  const projectId = app.options.projectId;
  if (!projectId) {
    throw new Error("Firebase projectId is missing from app configuration.");
  }

  return `https://europe-west1-${projectId}.cloudfunctions.net`;
}

async function postFunctionJson<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(`${getFunctionsBaseUrl()}/${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    let details = "";
    try {
      const data = (await response.json()) as { error?: string };
      if (data?.error) {
        details = ` (${data.error})`;
      }
    } catch {
      // Ignore parse errors and throw a generic message below.
    }
    throw new Error(`Request failed with status ${response.status}${details}`);
  }

  return response.json() as Promise<T>;
}

function BrandMasthead({ subtitle }: { subtitle: string }) {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="relative overflow-hidden rounded-2xl border border-[#C5A059]/25 bg-[#111111] px-6 py-7 shadow-xl md:px-8 md:py-8">
      <div className="absolute -top-12 -right-16 h-44 w-44 rounded-full bg-[#C5A059]/15 blur-2xl" />
      <div className="absolute -bottom-16 -left-16 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
      <div className="relative">
        <div className="absolute right-0 top-0 flex items-center gap-1 rounded-md border border-white/15 bg-black/25 p-0.5 text-xs">
          <button
            onClick={() => setLanguage("nl")}
            className={`rounded px-2 py-1 transition-colors ${
              language === "nl" ? "bg-[#C5A059] text-[#1A1A1A]" : "text-white/80 hover:text-white"
            }`}
          >
            NL
          </button>
          <button
            onClick={() => setLanguage("en")}
            className={`rounded px-2 py-1 transition-colors ${
              language === "en" ? "bg-[#C5A059] text-[#1A1A1A]" : "text-white/80 hover:text-white"
            }`}
          >
            EN
          </button>
        </div>
        <p className="text-[10px] uppercase tracking-[0.45em] text-[#C5A059]" style={accentFont}>
          Tip Top Barbershop
        </p>
        <h1 className="mt-2 text-4xl font-black leading-[0.9] text-white md:text-5xl" style={headingFont}>
          Booking Studio
        </h1>
        <p className="mt-2 text-sm text-white/60" style={accentFont}>{subtitle}</p>
      </div>
    </div>
  );
}

interface SuccessData {
  customerName: string;
  serviceName: string;
  serviceDuration: number;
  date: string;
  time: string;
  email: string | null;
  contactInfo: string;
}

interface MyBookingItem {
  id: string;
  serviceId: string;
  serviceName: string;
  date: string;
  time: string;
  status: "booked" | "in-progress" | "completed";
}

function isAtLeast24HoursAway(date: string, time: string): boolean {
  const bookingTime = new Date(`${date}T${time}:00`).getTime();
  return bookingTime - Date.now() >= 24 * 60 * 60 * 1000;
}

function BookingSuccessScreen({ data, myBookings }: { data: SuccessData; myBookings: MyBookingItem[] }) {
  const { txt } = useLanguage();
  const start = buildDateTime(data.date, data.time);
  const end = new Date(start.getTime() + data.serviceDuration * 60_000);
  const title = `Barber Appointment - ${data.serviceName}`;
  const details = `Booking for ${data.customerName}. Service: ${data.serviceName} (${data.serviceDuration} min).`;
  const location = "Tip Top Barbershop";

  const openGoogleCalendar = () => {
    const url = new URL("https://calendar.google.com/calendar/render");
    url.searchParams.set("action", "TEMPLATE");
    url.searchParams.set("text", title);
    url.searchParams.set("details", details);
    url.searchParams.set("location", location);
    url.searchParams.set("dates", `${toCalendarStamp(start)}/${toCalendarStamp(end)}`);
    window.open(url.toString(), "_blank", "noopener,noreferrer");
  };

  const downloadIcs = () => {
    const uid = `${createStableId()}@tiptopbarbershop`;
    const ics = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Tip Top Barbershop//Booking//EN",
      "BEGIN:VEVENT",
      `UID:${uid}`,
      `DTSTAMP:${toCalendarStamp(new Date())}`,
      `DTSTART:${toCalendarStamp(start)}`,
      `DTEND:${toCalendarStamp(end)}`,
      `SUMMARY:${escapeIcs(title)}`,
      `DESCRIPTION:${escapeIcs(details)}`,
      `LOCATION:${escapeIcs(location)}`,
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");

    const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = "tiptop-booking.ics";
    a.click();
    URL.revokeObjectURL(blobUrl);
  };

  return (
    <div className="min-h-screen brand-page px-4 py-8 md:py-12">
      <div className="mx-auto max-w-3xl space-y-6">
        <BrandMasthead subtitle={txt("Je afspraak is bevestigd en betaald.", "Your appointment is secured and paid.")} />

        <div className="rounded-2xl border border-slate-grey/15 bg-stark-white p-8 text-center shadow-lg md:p-10">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h2 className="text-2xl font-black text-deep-black md:text-3xl" style={headingFont}>{txt("Boeking Bevestigd", "Booking Confirmed")}</h2>
          <p className="mt-3 text-slate-grey" style={accentFont}>
            {shortDay(data.date)} {shortDate(data.date)} at <strong className="text-deep-black">{formatTime(data.time)}</strong>
          </p>
          <p className="text-slate-grey" style={accentFont}>
            Service: <strong className="text-deep-black">{data.serviceName}</strong>
          </p>
          {data.email && (
            <p className="mt-3 text-sm font-medium text-green-700">{txt("Bevestiging verzonden naar", "Confirmation sent to")} {data.email}</p>
          )}
          <p className="mt-2 text-xs text-slate-grey/70">{txt("De aanbetaling van EUR 5 wordt verrekend bij het afrekenen.", "EUR 5 deposit will be deducted from your total at checkout.")}</p>

          <div className="mx-auto mt-7 grid max-w-md gap-2">
            <button
              onClick={openGoogleCalendar}
              className="rounded-lg bg-[#C5A059] px-4 py-2.5 font-semibold text-[#1A1A1A] transition-colors hover:bg-[#b49149]"
              style={headingFont}
            >
              {txt("Toevoegen aan Google Agenda", "Add to Google Calendar")}
            </button>
            <button
              onClick={downloadIcs}
              className="rounded-lg border border-slate-grey/30 px-4 py-2.5 font-semibold text-deep-black transition-colors hover:bg-slate-50"
              style={headingFont}
            >
              {txt("Download Agenda Bestand (.ics)", "Download Calendar File (.ics)")}
            </button>
            <a
              href="/"
              className="rounded-lg border border-slate-grey/30 px-4 py-2.5 text-center font-semibold text-deep-black transition-colors hover:bg-slate-50"
              style={headingFont}
            >
              {txt("Terug Naar Home", "Back to Home")}
            </a>
          </div>
        </div>

        {myBookings.length > 1 && (
          <div className="rounded-2xl border border-slate-grey/15 bg-stark-white p-6 shadow-lg md:p-8">
            <h3 className="text-xl font-black text-deep-black" style={headingFont}>{txt("Mijn Boekingen", "My Bookings")}</h3>
            <p className="mt-1 text-sm text-slate-grey" style={accentFont}>
              {txt("Je hebt momenteel", "You currently have")} {myBookings.length} {txt("boekingen", "bookings")}.
            </p>

            <div className="mt-4 space-y-3">
              {myBookings.map((booking) => (
                <div key={booking.id} className="rounded-xl border border-slate-grey/15 bg-vintage-cream/35 px-4 py-3">
                  <p className="text-sm font-semibold text-deep-black" style={headingFont}>{booking.serviceName}</p>
                  <p className="text-sm text-slate-grey" style={accentFont}>
                    {shortDay(booking.date)} {shortDate(booking.date)} at {formatTime(booking.time)}
                  </p>
                  <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-grey/80" style={accentFont}>
                    {txt("Status", "Status")}: {booking.status.replace("-", " ")}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function PhoneLoginGate({ onVerified }: { onVerified: () => void }) {
  const { user, loading, error, busy, signInWithGoogle, signInWithApple } = usePhoneAuth();
  const { txt } = useLanguage();

  if (user) {
    onVerified();
    return null;
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-vintage-cream">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-antique-gold" />
      </div>
    );
  }

  return (
    <div className="min-h-screen brand-page px-4 py-8 md:py-12">
      <div className="mx-auto max-w-3xl space-y-6">
        <BrandMasthead subtitle={txt("Log in om je tijd te reserveren en je plek vast te zetten.", "Sign in to reserve your time and secure your spot.")} />

        <div className="mx-auto w-full max-w-lg rounded-2xl border border-slate-grey/15 bg-stark-white p-6 shadow-lg md:p-8">
          <p className="mb-5 text-sm text-slate-grey" style={accentFont}>{txt("Ga verder met je account om te boeken.", "Continue with your account to start booking.")}</p>

          <div className="space-y-3">
            {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

            <button
              onClick={signInWithGoogle}
              disabled={busy}
              className="flex w-full items-center justify-center gap-3 rounded-lg border border-slate-200 bg-white px-6 py-3 font-semibold text-deep-black shadow-sm transition-colors hover:bg-slate-50 disabled:opacity-50"
              style={headingFont}
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              {busy ? txt("Bezig met inloggen...", "Signing in...") : txt("Doorgaan met Google", "Continue with Google")}
            </button>

            <button
              onClick={signInWithApple}
              disabled={busy}
              className="flex w-full items-center justify-center gap-3 rounded-lg bg-[#111111] px-6 py-3 font-semibold text-white shadow-sm transition-colors hover:bg-black disabled:opacity-50"
              style={headingFont}
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
              </svg>
              {busy ? txt("Bezig met inloggen...", "Signing in...") : txt("Doorgaan met Apple", "Continue with Apple")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function AgendaBookingView({ paymentCancelled }: { paymentCancelled: boolean }) {
  const { user, logout } = usePhoneAuth();
  const { txt } = useLanguage();
  const { appointments, getAvailableTimeSlots, getAppointmentsByDate, breakMinutes, rescheduleAppointment } = useBooking();

  const [serviceId, setServiceId] = useState(services[0].id);
  const [customerName, setCustomerName] = useState("");
  const [selectedSlot, setSelectedSlot] = useState<{ date: string; time: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [editingBookingId, setEditingBookingId] = useState<string | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState<string>("");
  const [rescheduleTime, setRescheduleTime] = useState<string>("");
  const [rescheduleError, setRescheduleError] = useState<string | null>(null);

  const days = useMemo(buildNext14Days, []);
  const contactInfo = user?.phoneNumber ?? user?.email ?? user?.displayName ?? "Signed in user";
  const defaultCustomerName = user?.displayName?.trim() || user?.email?.split("@")[0] || "";
  const bookingContact = user?.phoneNumber ?? user?.email ?? "social-login";

  useEffect(() => {
    if (!customerName.trim() && defaultCustomerName) {
      setCustomerName(defaultCustomerName);
    }
  }, [customerName, defaultCustomerName]);

  const dayData = useMemo(() => {
    return days.map((day) => {
      const available = getAvailableTimeSlots(day, serviceId);
      const booked = getAppointmentsByDate(day);
      return { day, available, booked };
    });
  }, [days, serviceId, getAvailableTimeSlots, getAppointmentsByDate]);

  const myBookings = useMemo<MyBookingItem[]>(() => {
    const identifiers = new Set<string>();
    if (user?.phoneNumber) identifiers.add(user.phoneNumber);
    if (user?.email) identifiers.add(user.email);

    if (identifiers.size === 0) {
      return [];
    }

    const toTimestamp = (date: string, time: string) => new Date(`${date}T${time}:00`).getTime();

    return appointments
      .filter((appointment) => identifiers.has(appointment.phoneNumber))
      .map((appointment) => ({
        id: appointment.id,
        serviceId: appointment.serviceId,
        serviceName: services.find((service) => service.id === appointment.serviceId)?.name ?? appointment.serviceId,
        date: appointment.date,
        time: appointment.timeSlot,
        status: appointment.status,
      }))
      .sort((a, b) => toTimestamp(a.date, a.time) - toTimestamp(b.date, b.time));
  }, [appointments, user?.email, user?.phoneNumber]);

  const upcomingBookings = useMemo(() => {
    const now = Date.now();
    return myBookings.filter((booking) => new Date(`${booking.date}T${booking.time}:00`).getTime() >= now);
  }, [myBookings]);

  const historyBookings = useMemo(() => {
    const now = Date.now();
    return myBookings.filter((booking) => new Date(`${booking.date}T${booking.time}:00`).getTime() < now);
  }, [myBookings]);

  const editingBooking = useMemo(
    () => upcomingBookings.find((booking) => booking.id === editingBookingId) ?? null,
    [editingBookingId, upcomingBookings]
  );

  const rescheduleDateOptions = useMemo(() => {
    if (!editingBooking) {
      return days;
    }

    const todayIso = toIso(new Date());
    const merged = [editingBooking.date, ...days]
      .filter((date, index, source) => source.indexOf(date) === index)
      .filter((date) => date >= todayIso)
      .filter((date) => !isClosedWeekDay(date));

    return merged.sort((a, b) => a.localeCompare(b));
  }, [days, editingBooking]);

  const availableRescheduleSlots = useMemo(() => {
    if (!editingBooking || !rescheduleDate) {
      return [] as string[];
    }

    return getAvailableTimeSlots(rescheduleDate, editingBooking.serviceId, editingBooking.id);
  }, [editingBooking, getAvailableTimeSlots, rescheduleDate]);

  const startEditingBooking = (booking: MyBookingItem) => {
    setEditingBookingId(booking.id);
    setRescheduleDate(booking.date);
    setRescheduleTime(booking.time);
    setRescheduleError(null);
  };

  const saveReschedule = () => {
    if (!editingBooking) {
      return;
    }

    if (!isAtLeast24HoursAway(editingBooking.date, editingBooking.time)) {
      setRescheduleError(txt("Boekingen kunnen alleen gratis aangepast worden tot 24 uur voor de afspraak.", "Bookings can only be edited for free up to 24 hours before the appointment."));
      return;
    }

    if (!rescheduleDate || !rescheduleTime) {
      setRescheduleError(txt("Selecteer een nieuwe datum en tijd.", "Please select a new date and time."));
      return;
    }

    const success = rescheduleAppointment(editingBooking.id, rescheduleDate, rescheduleTime);
    if (!success) {
      setRescheduleError(txt("Geselecteerde tijd is niet beschikbaar. Kies een ander tijdslot.", "Selected time is not available. Please pick another slot."));
      return;
    }

    setEditingBookingId(null);
    setRescheduleError(null);
  };

  const handleBook = async () => {
    if (!selectedSlot || !customerName) return;
    const svc = services.find((s) => s.id === serviceId);
    if (!svc) return;

    setBusy(true);
    setPaymentError(null);
    try {
      const pending = {
        id: createStableId(),
        customerName,
        contactInfo: bookingContact,
        serviceId,
        serviceName: svc.name,
        serviceDuration: svc.duration,
        date: selectedSlot.date,
        time: selectedSlot.time,
        email: user?.email ?? null,
      };

      localStorage.setItem("pendingBooking", JSON.stringify(pending));

      const result = await postFunctionJson<{ sessionUrl: string }>("createCheckoutSessionHttp", {
        booking: {
          customerName,
          email: user?.email ?? null,
          serviceName: svc.name,
          serviceDuration: svc.duration,
          date: selectedSlot.date,
          time: selectedSlot.time,
          formattedDate: `${shortDay(selectedSlot.date)} ${shortDate(selectedSlot.date)}`,
          formattedTime: formatTime(selectedSlot.time),
          contactInfo: bookingContact,
        },
        baseUrl: window.location.origin,
      });

      const { sessionUrl } = result;
      if (!sessionUrl) {
        throw new Error("No checkout session URL was returned.");
      }

      window.location.href = sessionUrl;
    } catch (err: unknown) {
      console.error("Payment error:", err);
      const message =
        typeof err === "object" && err && "message" in err && typeof err.message === "string"
          ? err.message
          : "Unable to start payment. Please try again in a moment.";
      setPaymentError(message);
      setBusy(false);
    }
  };

  const selectedService = services.find((s) => s.id === serviceId);

  return (
    <div className="min-h-screen brand-page px-4 py-6 md:py-10">
      <div className="mx-auto max-w-6xl space-y-6">
        <BrandMasthead subtitle={txt("Kies je behandeling en tijdslot, en bevestig met EUR 5 aanbetaling.", "Choose your service and slot, then confirm with a EUR 5 deposit.")} />

        {paymentCancelled && (
          <div className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            {txt("Betaling is geannuleerd. Je slot is nog niet geboekt. Bevestig en betaal om af te ronden.", "Payment was cancelled. Your slot is not booked yet. Please confirm and pay to finalize.")}
          </div>
        )}

        {paymentError && (
          <div className="rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
            {paymentError}
          </div>
        )}

        {upcomingBookings.length > 0 && (
          <div className="rounded-xl border border-slate-grey/15 bg-stark-white p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="text-lg font-black text-deep-black" style={headingFont}>{txt("Mijn Boekingen", "My Bookings")}</h3>
                <p className="mt-1 text-sm text-slate-grey" style={accentFont}>
                  {txt("Toont", "Showing")} {upcomingBookings.length} {txt("toekomstige boeking", "upcoming booking")}{upcomingBookings.length === 1 ? "" : txt("en", "s")}.
                </p>
              </div>
              {historyBookings.length > 0 && (
                <button
                  onClick={() => setShowHistory((value) => !value)}
                  className="rounded-lg border border-slate-grey/30 px-3 py-2 text-xs font-semibold text-deep-black transition-colors hover:bg-slate-50"
                  style={headingFont}
                >
                  {showHistory ? txt("Verberg Geschiedenis", "Hide History") : `${txt("Toon Geschiedenis", "Show History")} (${historyBookings.length})`}
                </button>
              )}
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {upcomingBookings.map((booking) => (
                <div key={booking.id} className="rounded-xl border border-slate-grey/15 bg-vintage-cream/35 px-4 py-3">
                  <p className="text-sm font-semibold text-deep-black" style={headingFont}>{booking.serviceName}</p>
                  <p className="text-sm text-slate-grey" style={accentFont}>
                    {shortDay(booking.date)} {shortDate(booking.date)} at {formatTime(booking.time)}
                  </p>
                  <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-grey/80" style={accentFont}>
                    {txt("Status", "Status")}: {booking.status.replace("-", " ")}
                  </p>

                  {isAtLeast24HoursAway(booking.date, booking.time) ? (
                    <button
                      onClick={() => startEditingBooking(booking)}
                      className="mt-3 rounded-lg border border-slate-grey/30 bg-stark-white px-3 py-2 text-xs font-semibold text-deep-black transition-colors hover:bg-slate-50"
                      style={headingFont}
                    >
                      {txt("Boeking Aanpassen (Gratis)", "Edit Booking (Free)")}
                    </button>
                  ) : (
                    <p className="mt-2 text-xs text-amber-700" style={accentFont}>
                      {txt("Gratis aanpassen kan tot 24 uur voor deze afspraak.", "Free edits close 24 hours before this appointment.")}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {editingBooking && (
              <div className="mt-5 rounded-xl border border-antique-gold/35 bg-antique-gold/10 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-[#8f733a]" style={accentFont}>{txt("Boeking Aanpassen", "Edit Booking")}</p>
                <p className="mt-1 text-sm font-semibold text-deep-black" style={headingFont}>{editingBooking.serviceName}</p>

                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-deep-black" style={headingFont}>{txt("Nieuwe Datum", "New Date")}</label>
                    <select
                      value={rescheduleDate}
                      onChange={(e) => {
                        setRescheduleDate(e.target.value);
                        setRescheduleTime("");
                        setRescheduleError(null);
                      }}
                      className="w-full rounded-lg border border-slate-grey/30 bg-stark-white px-3 py-2 text-sm text-deep-black"
                    >
                      {rescheduleDateOptions.map((date) => (
                        <option key={date} value={date}>{shortDay(date)} {shortDate(date)}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-semibold text-deep-black" style={headingFont}>{txt("Nieuwe Tijd", "New Time")}</label>
                    <select
                      value={rescheduleTime}
                      onChange={(e) => {
                        setRescheduleTime(e.target.value);
                        setRescheduleError(null);
                      }}
                      className="w-full rounded-lg border border-slate-grey/30 bg-stark-white px-3 py-2 text-sm text-deep-black"
                    >
                      <option value="">{txt("Selecteer tijd", "Select time")}</option>
                      {availableRescheduleSlots.map((slot) => (
                        <option key={slot} value={slot}>{formatTime(slot)}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {rescheduleError && <p className="mt-3 text-xs text-red-700">{rescheduleError}</p>}

                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => {
                      setEditingBookingId(null);
                      setRescheduleError(null);
                    }}
                    className="rounded-lg border border-slate-grey/30 bg-stark-white px-3 py-2 text-xs font-semibold text-deep-black"
                    style={headingFont}
                  >
                    {txt("Annuleren", "Cancel")}
                  </button>
                  <button
                    onClick={saveReschedule}
                    className="rounded-lg bg-[#C5A059] px-3 py-2 text-xs font-semibold text-[#1A1A1A]"
                    style={headingFont}
                  >
                    {txt("Wijzigingen Opslaan", "Save Changes")}
                  </button>
                </div>
              </div>
            )}

            {showHistory && historyBookings.length > 0 && (
              <div className="mt-5 border-t border-slate-grey/15 pt-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-grey/80" style={accentFont}>{txt("Geschiedenis", "History")}</p>
                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  {historyBookings.map((booking) => (
                    <div key={booking.id} className="rounded-xl border border-slate-grey/15 bg-slate-50 px-4 py-3 opacity-90">
                      <p className="text-sm font-semibold text-deep-black" style={headingFont}>{booking.serviceName}</p>
                      <p className="text-sm text-slate-grey" style={accentFont}>
                        {shortDay(booking.date)} {shortDate(booking.date)} at {formatTime(booking.time)}
                      </p>
                      <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-grey/80" style={accentFont}>
                        {txt("Status", "Status")}: {booking.status.replace("-", " ")}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="grid gap-4 lg:grid-cols-3">
          <div className="rounded-xl border border-slate-grey/15 bg-stark-white p-5 shadow-sm lg:col-span-2">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-semibold text-deep-black" style={headingFont}>{txt("Behandeling", "Service")}</label>
                <select
                  value={serviceId}
                  onChange={(e) => {
                    setServiceId(e.target.value);
                    setSelectedSlot(null);
                  }}
                  className="w-full rounded-lg border border-slate-grey/30 bg-stark-white px-4 py-3 text-deep-black transition-colors focus:outline-none focus:ring-2 focus:ring-antique-gold"
                >
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} - EUR {s.price} ({s.duration} {txt("min", "min")})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold text-deep-black" style={headingFont}>{txt("Jouw Naam", "Your Name")}</label>
                <input
                  type="text"
                  placeholder={txt("Jouw naam", "John Doe")}
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full rounded-lg border border-slate-grey/30 bg-stark-white px-4 py-3 text-deep-black placeholder-slate-grey/50 transition-colors focus:outline-none focus:ring-2 focus:ring-antique-gold"
                />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-[#C5A059]/30 bg-[#C5A059]/10 p-5 shadow-sm">
            <p className="text-[10px] uppercase tracking-[0.35em] text-[#C5A059]" style={accentFont}>{txt("Ingelogd", "Signed In")}</p>
            <p className="mt-2 break-all text-sm text-deep-black">{contactInfo}</p>
            <div className="mt-4 rounded-lg border border-[#C5A059]/35 bg-stark-white/70 p-3 text-sm text-deep-black">
              <p className="font-semibold" style={headingFont}>{txt("Aanbetalingsbeleid", "Deposit Policy")}</p>
              <p className="mt-1 text-xs text-slate-grey">{txt("EUR 5 wordt vooraf betaald en later verrekend in de shop.", "EUR 5 is paid upfront and deducted from your total at the shop.")}</p>
            </div>
            <button
              onClick={logout}
              className="mt-4 text-xs font-heading font-semibold text-red-600 transition-colors hover:text-red-800"
            >
              {txt("Uitloggen", "Sign out")}
            </button>
          </div>
        </div>

        {selectedService && (
          <div className="rounded-xl border border-[#C5A059]/30 bg-stark-white p-4 text-sm text-deep-black shadow-sm">
            <strong>{selectedService.name}</strong> - {selectedService.duration} {txt("min", "min")} + {breakMinutes} {txt("min" ,"min")} {txt("schoonmaaktijd", "cleanup break")}
          </div>
        )}

        <div className="space-y-3">
          {dayData.map(({ day, available, booked }) => {
            const isToday = day === toIso(new Date());
            const isClosedDay = isClosedWeekDay(day);

            return (
              <div
                key={day}
                className={`overflow-hidden rounded-xl border bg-stark-white shadow-sm ${
                  isToday ? "border-antique-gold/45" : "border-slate-grey/15"
                } ${isClosedDay ? "opacity-60" : ""}`}
              >
                <div
                  className={`flex items-center gap-3 border-b px-4 py-2.5 ${
                    isToday
                      ? "border-antique-gold/25 bg-antique-gold/10"
                      : "border-slate-grey/10 bg-slate-grey/[0.03]"
                  }`}
                >
                  <span className="min-w-[36px] text-sm font-bold text-deep-black" style={headingFont}>{shortDay(day)}</span>
                  <span className="text-sm text-slate-grey">{shortDate(day)}</span>
                  {isToday && <span className="text-[10px] uppercase tracking-widest text-[#C5A059]" style={accentFont}>{txt("Vandaag", "Today")}</span>}
                  <span className="ml-auto text-xs text-slate-grey">{available.length} {txt("vrij", "open")}</span>
                </div>

                {isClosedDay ? (
                  <div className="px-4 py-4 text-center text-sm text-slate-grey/70">{txt("Gesloten op zondag en maandag", "Closed on Sundays and Mondays")}</div>
                ) : available.length === 0 ? (
                  <div className="px-4 py-4 text-center text-sm text-slate-grey/70">{txt("Volledig volgeboekt", "Fully booked")}</div>
                ) : (
                  <div className="flex flex-wrap gap-2 px-3 py-3">
                    {WORKING_TIME_SLOTS.map((slot) => {
                      const isBooked = booked.some((a) => a.timeSlot === slot && a.status !== "completed");
                      const isAvailable = available.includes(slot);
                      const isSelected = selectedSlot?.date === day && selectedSlot?.time === slot;

                      if (!isAvailable && !isBooked) {
                        return (
                          <div
                            key={slot}
                            className="rounded-lg border border-transparent bg-slate-grey/[0.04] px-3 py-2 text-xs text-slate-grey/35"
                            style={headingFont}
                          >
                            {formatTime(slot)}
                          </div>
                        );
                      }

                      if (isBooked) {
                        return (
                          <div
                            key={slot}
                            className="cursor-not-allowed rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-xs text-red-400/70"
                            style={headingFont}
                            title="Taken"
                          >
                            {formatTime(slot)}
                          </div>
                        );
                      }

                      return (
                        <button
                          key={slot}
                          onClick={() => setSelectedSlot(isSelected ? null : { date: day, time: slot })}
                          className={`rounded-lg border px-3 py-2 text-xs font-semibold transition-all ${
                            isSelected
                              ? "scale-105 border-[#C5A059] bg-[#C5A059] text-deep-black shadow-md"
                              : "border-green-200 bg-green-50 text-green-700 hover:border-green-300 hover:bg-green-100"
                          }`}
                          style={headingFont}
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

        {selectedSlot && (
          <div className="sticky bottom-4 z-50">
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[#C5A059]/30 bg-[#111111] px-5 py-4 text-stark-white shadow-2xl">
              <div>
                <p className="mb-1 text-[10px] uppercase tracking-widest text-[#C5A059]" style={accentFont}>{txt("Geselecteerd Slot", "Selected Slot")}</p>
                <p className="font-bold" style={headingFont}>
                  {shortDay(selectedSlot.date)} {shortDate(selectedSlot.date)} at {formatTime(selectedSlot.time)}
                </p>
                <p className="text-xs text-stark-white/65">{selectedService?.name} - EUR {selectedService?.price}</p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedSlot(null)}
                  className="rounded-lg border border-stark-white/20 px-4 py-2.5 text-sm transition-colors hover:bg-stark-white/10"
                  style={headingFont}
                >
                  {txt("Annuleren", "Cancel")}
                </button>
                {historyBookings.length > 0 && (
                  <button
                    onClick={() => setShowHistory((value) => !value)}
                    className="rounded-lg border border-stark-white/20 px-4 py-2.5 text-sm transition-colors hover:bg-stark-white/10"
                    style={headingFont}
                  >
                    {showHistory ? txt("Verberg Geschiedenis", "Hide History") : `${txt("Toon Geschiedenis", "Show History")} (${historyBookings.length})`}
                  </button>
                )}
                <button
                  onClick={handleBook}
                  disabled={!customerName || busy}
                  className="rounded-lg bg-[#C5A059] px-6 py-2.5 text-sm font-bold text-[#1A1A1A] shadow-md transition-colors hover:bg-[#b49149] disabled:opacity-50"
                  style={headingFont}
                >
                  {busy
                    ? txt("Doorsturen naar betaling...", "Redirecting to payment...")
                    : !customerName
                    ? txt("Vul eerst je naam in", "Enter name first")
                    : txt("Bevestigen en EUR 5 betalen", "Confirm and Pay EUR 5")}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-x-5 gap-y-1 px-1 pb-4 text-[11px] text-slate-grey" style={accentFont}>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-3 w-3 rounded border border-green-200 bg-green-50" />
            <span className="ml-1">{txt("Beschikbaar", "Available")}</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-3 w-3 rounded border border-red-100 bg-red-50" />
            <span className="ml-1">{txt("Bezet", "Taken")}</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-3 w-3 rounded border border-antique-gold bg-antique-gold" />
            <span className="ml-1">{txt("Jouw keuze", "Your pick")}</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-3 w-3 rounded border border-transparent bg-slate-grey/[0.04]" />
            <span className="ml-1">{txt("Geblokkeerd", "Blocked")}</span>
          </span>
        </div>
      </div>
    </div>
  );
}

export default function BookingPage() {
  const [verified, setVerified] = useState(false);
  const [successData, setSuccessData] = useState<SuccessData | null>(null);
  const [paymentCancelled, setPaymentCancelled] = useState(false);

  const { user } = usePhoneAuth();
  const { appointments, addAppointment } = useBooking();

  const myBookings = useMemo<MyBookingItem[]>(() => {
    if (!successData) {
      return [];
    }

    const identifiers = new Set<string>();
    if (successData.contactInfo) identifiers.add(successData.contactInfo);
    if (successData.email) identifiers.add(successData.email);
    if (user?.phoneNumber) identifiers.add(user.phoneNumber);
    if (user?.email) identifiers.add(user.email);

    const toTimestamp = (date: string, time: string) => new Date(`${date}T${time}:00`).getTime();

    return appointments
      .filter((appointment) => identifiers.has(appointment.phoneNumber))
      .map((appointment) => ({
        id: appointment.id,
        serviceId: appointment.serviceId,
        serviceName: services.find((service) => service.id === appointment.serviceId)?.name ?? appointment.serviceId,
        date: appointment.date,
        time: appointment.timeSlot,
        status: appointment.status,
      }))
      .sort((a, b) => toTimestamp(a.date, a.time) - toTimestamp(b.date, b.time));
  }, [appointments, successData, user?.email, user?.phoneNumber]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const payment = params.get("payment");
    const sessionId = params.get("session_id");

    if (payment === "success" && sessionId) {
      const raw = localStorage.getItem("pendingBooking");
      if (raw) {
        try {
          const pending = JSON.parse(raw) as {
            id: string;
            customerName: string;
            contactInfo: string;
            serviceId: string;
            serviceName: string;
            serviceDuration: number;
            date: string;
            time: string;
            email: string | null;
          };

          addAppointment({
            id: pending.id,
            customerName: pending.customerName,
            phoneNumber: pending.contactInfo,
            serviceId: pending.serviceId,
            date: pending.date,
            timeSlot: pending.time,
            status: "booked",
            createdAt: new Date().toISOString(),
          });

          postFunctionJson("verifyPaymentAndEmailHttp", { sessionId }).catch(console.error);

          localStorage.removeItem("pendingBooking");
          setSuccessData({
            customerName: pending.customerName,
            serviceName: pending.serviceName,
            serviceDuration: pending.serviceDuration,
            date: pending.date,
            time: pending.time,
            email: pending.email,
            contactInfo: pending.contactInfo,
          });
          setPaymentCancelled(false);
        } catch (e) {
          console.error("Failed to restore pending booking:", e);
        }
      }
      window.history.replaceState({}, "", "/book");
    } else if (payment === "cancelled") {
      setPaymentCancelled(true);
      window.history.replaceState({}, "", "/book");
    }
  }, [addAppointment]);

  if (successData) {
    return <BookingSuccessScreen data={successData} myBookings={myBookings} />;
  }

  if (user || verified) {
    return <AgendaBookingView paymentCancelled={paymentCancelled} />;
  }

  return <PhoneLoginGate onVerified={() => setVerified(true)} />;
}
