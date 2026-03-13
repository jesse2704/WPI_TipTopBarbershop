import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useBooking } from "../context/BookingContext";
import { services } from "../data/services";
import type { Appointment } from "../types";

const headingFont = { fontFamily: "'Roboto Condensed', 'Arial Narrow', sans-serif" };
const accentFont = { fontFamily: "'Lora', serif" };
const NOTES_STORAGE_KEY = "tiptop_client_notes";

type BookingFilter = "all" | "upcoming" | "completed";

type ClientBooking = Appointment & {
  serviceName: string;
  serviceDuration: number;
  dateTime: Date;
};

type ClientDetails = {
  key: string;
  name: string;
  phoneNumber: string;
  bookings: ClientBooking[];
  completedCount: number;
  upcomingCount: number;
  totalSpent: number;
  totalMinutes: number;
  mostBookedService: string;
  lastVisitLabel: string;
  nextVisitLabel: string;
};

const statusStyles: Record<Appointment["status"], string> = {
  booked: "bg-blue-100 text-blue-800 border border-blue-200",
  "in-progress": "bg-antique-gold/20 text-amber-900 border border-antique-gold/40",
  completed: "bg-green-100 text-green-800 border border-green-200",
};

function getServiceMeta(serviceId: string) {
  const service = services.find((item) => item.id === serviceId);
  return {
    name: service?.name ?? serviceId,
    price: service?.price ?? 0,
    duration: service?.duration ?? 30,
  };
}

function parseDateTime(date: string, time: string) {
  return new Date(`${date}T${time}:00`);
}

function formatDateTime(value: Date) {
  return value.toLocaleString("nl-NL", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function loadClientNotes(): Record<string, string> {
  try {
    const raw = localStorage.getItem(NOTES_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function saveClientNotes(notes: Record<string, string>) {
  localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(notes));
}

function toCsvValue(value: string | number) {
  const text = String(value ?? "");
  return `"${text.replace(/"/g, '""')}"`;
}

export default function BarberClientsPage() {
  const { appointments } = useBooking();
  const [search, setSearch] = useState("");
  const [selectedClientKey, setSelectedClientKey] = useState<string | null>(null);
  const [bookingFilter, setBookingFilter] = useState<BookingFilter>("all");
  const [clientNotes, setClientNotes] = useState<Record<string, string>>(loadClientNotes);
  const [noteDraft, setNoteDraft] = useState("");
  const [noteFeedback, setNoteFeedback] = useState<string | null>(null);

  const clients = useMemo<ClientDetails[]>(() => {
    const grouped = new Map<string, ClientBooking[]>();

    for (const appointment of appointments) {
      const meta = getServiceMeta(appointment.serviceId);
      const enriched: ClientBooking = {
        ...appointment,
        serviceName: meta.name,
        serviceDuration: meta.duration,
        dateTime: parseDateTime(appointment.date, appointment.timeSlot),
      };
      const key = `${appointment.customerName.toLowerCase()}|${appointment.phoneNumber}`;
      const existing = grouped.get(key) ?? [];
      existing.push(enriched);
      grouped.set(key, existing);
    }

    const now = new Date();

    return Array.from(grouped.entries())
      .map(([key, bookings]) => {
        const sorted = [...bookings].sort((a, b) => b.dateTime.getTime() - a.dateTime.getTime());

        const completed = sorted.filter((entry) => entry.status === "completed");
        const upcoming = sorted.filter((entry) => entry.dateTime.getTime() >= now.getTime() && entry.status !== "completed");

        const serviceStats = new Map<string, number>();
        for (const entry of sorted) {
          serviceStats.set(entry.serviceName, (serviceStats.get(entry.serviceName) ?? 0) + 1);
        }

        const [mostBookedService] = Array.from(serviceStats.entries()).sort((a, b) => b[1] - a[1])[0] ?? ["-"];

        const totalSpent = completed.reduce((sum, entry) => sum + getServiceMeta(entry.serviceId).price, 0);
        const totalMinutes = sorted.reduce((sum, entry) => sum + entry.serviceDuration, 0);

        const latestCompleted = [...completed].sort((a, b) => b.dateTime.getTime() - a.dateTime.getTime())[0];
        const nextVisit = [...upcoming].sort((a, b) => a.dateTime.getTime() - b.dateTime.getTime())[0];

        return {
          key,
          name: sorted[0]?.customerName ?? "Unknown",
          phoneNumber: sorted[0]?.phoneNumber ?? "-",
          bookings: sorted,
          completedCount: completed.length,
          upcomingCount: upcoming.length,
          totalSpent,
          totalMinutes,
          mostBookedService,
          lastVisitLabel: latestCompleted ? formatDateTime(latestCompleted.dateTime) : "Nog geen afgeronde afspraak",
          nextVisitLabel: nextVisit ? formatDateTime(nextVisit.dateTime) : "Geen komende afspraak",
        };
      })
      .sort((a, b) => {
        const aLatest = a.bookings[0]?.dateTime.getTime() ?? 0;
        const bLatest = b.bookings[0]?.dateTime.getTime() ?? 0;
        return bLatest - aLatest;
      });
  }, [appointments]);

  const filteredClients = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return clients;
    return clients.filter((client) => {
      return (
        client.name.toLowerCase().includes(query) ||
        client.phoneNumber.toLowerCase().includes(query) ||
        client.mostBookedService.toLowerCase().includes(query)
      );
    });
  }, [clients, search]);

  const selectedClient = useMemo(() => {
    if (filteredClients.length === 0) return null;
    if (!selectedClientKey) return filteredClients[0];
    return filteredClients.find((item) => item.key === selectedClientKey) ?? filteredClients[0];
  }, [filteredClients, selectedClientKey]);

  const selectedClientBookings = useMemo(() => {
    if (!selectedClient) return [];
    if (bookingFilter === "completed") {
      return selectedClient.bookings.filter((booking) => booking.status === "completed");
    }
    if (bookingFilter === "upcoming") {
      return selectedClient.bookings.filter((booking) => booking.status !== "completed");
    }
    return selectedClient.bookings;
  }, [selectedClient, bookingFilter]);

  useEffect(() => {
    if (!selectedClient) {
      setNoteDraft("");
      return;
    }
    setNoteDraft(clientNotes[selectedClient.key] ?? "");
  }, [selectedClient, clientNotes]);

  const saveNote = useCallback(() => {
    if (!selectedClient) return;
    const trimmed = noteDraft.trim();
    const next = { ...clientNotes };

    if (trimmed) {
      next[selectedClient.key] = trimmed;
    } else {
      delete next[selectedClient.key];
    }

    setClientNotes(next);
    saveClientNotes(next);
    setNoteFeedback(trimmed ? "Client note saved." : "Client note cleared.");
    window.setTimeout(() => setNoteFeedback(null), 2000);
  }, [selectedClient, noteDraft, clientNotes]);

  const exportClientCsv = useCallback(() => {
    if (!selectedClient) return;

    const header = [
      "Client Name",
      "Phone",
      "Service",
      "Duration (min)",
      "Date",
      "Time",
      "Status",
      "Created At",
    ];

    const rows = selectedClient.bookings.map((booking) => [
      toCsvValue(selectedClient.name),
      toCsvValue(selectedClient.phoneNumber),
      toCsvValue(booking.serviceName),
      toCsvValue(booking.serviceDuration),
      toCsvValue(booking.date),
      toCsvValue(booking.timeSlot),
      toCsvValue(booking.status),
      toCsvValue(booking.createdAt),
    ]);

    const csv = [header.map(toCsvValue).join(","), ...rows.map((row) => row.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const safeName = selectedClient.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "client";
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `tiptop-client-${safeName}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [selectedClient]);

  const totalUpcoming = useMemo(() => clients.reduce((sum, client) => sum + client.upcomingCount, 0), [clients]);

  return (
    <div className="min-h-screen bg-vintage-cream py-6 px-4 md:py-10">
      <div className="max-w-6xl mx-auto space-y-5">
        <div className="relative overflow-hidden rounded-2xl border border-antique-gold/25 bg-deep-black px-6 py-7 shadow-xl md:px-8 md:py-8">
          <div className="absolute -top-12 -right-16 h-44 w-44 rounded-full bg-antique-gold/15 blur-2xl" />
          <div className="absolute -bottom-16 -left-16 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
          <div className="relative flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-[10px] tracking-[0.45em] uppercase text-antique-gold" style={accentFont}>
                Tip Top Barbershop
              </p>
              <h1 className="mt-2 text-4xl md:text-5xl font-black text-vintage-cream leading-[0.9]" style={headingFont}>
                Client Detail Hub
              </h1>
              <p className="text-sm text-vintage-cream/65 mt-2" style={accentFont}>
                All clients, appointments, and history in one place.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link
                to="/barber/dashboard"
                className="px-4 py-2 bg-stark-white text-deep-black rounded-lg text-sm font-semibold hover:bg-slate-100 transition-colors"
                style={headingFont}
              >
                Back to Dashboard
              </Link>
            </div>
          </div>

          <div className="relative mt-5 grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="rounded-lg border border-antique-gold/30 bg-antique-gold/10 px-3 py-2">
              <p className="text-[10px] uppercase tracking-widest text-vintage-cream/70" style={accentFont}>Clients</p>
              <p className="text-2xl text-vintage-cream font-bold" style={headingFont}>{clients.length}</p>
            </div>
            <div className="rounded-lg border border-antique-gold/30 bg-antique-gold/10 px-3 py-2">
              <p className="text-[10px] uppercase tracking-widest text-vintage-cream/70" style={accentFont}>Upcoming</p>
              <p className="text-2xl text-vintage-cream font-bold" style={headingFont}>{totalUpcoming}</p>
            </div>
            <div className="rounded-lg border border-antique-gold/30 bg-antique-gold/10 px-3 py-2">
              <p className="text-[10px] uppercase tracking-widest text-vintage-cream/70" style={accentFont}>Bookings</p>
              <p className="text-2xl text-vintage-cream font-bold" style={headingFont}>{appointments.length}</p>
            </div>
            <div className="rounded-lg border border-antique-gold/30 bg-antique-gold/10 px-3 py-2">
              <p className="text-[10px] uppercase tracking-widest text-vintage-cream/70" style={accentFont}>Data source</p>
              <p className="text-sm text-vintage-cream/90 font-semibold mt-1" style={headingFont}>Live booking context</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-4">
          <div className="rounded-xl border border-slate-grey/15 bg-stark-white shadow-sm p-4">
            <label className="text-xs uppercase tracking-widest text-slate-grey" style={accentFont}>
              Search clients
            </label>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Name, phone, or service"
              className="mt-2 w-full rounded-lg border border-slate-grey/30 bg-stark-white px-3 py-2 text-sm text-deep-black focus:outline-none focus:ring-2 focus:ring-antique-gold"
              style={headingFont}
            />

            <div className="mt-3 max-h-[62vh] overflow-y-auto space-y-2 pr-1">
              {filteredClients.length === 0 && (
                <p className="text-sm text-slate-grey" style={accentFont}>No matching clients found.</p>
              )}

              {filteredClients.map((client) => {
                const isSelected = selectedClient?.key === client.key;
                return (
                  <button
                    key={client.key}
                    onClick={() => setSelectedClientKey(client.key)}
                    className={`w-full text-left rounded-lg border px-3 py-3 transition-colors ${
                      isSelected
                        ? "border-antique-gold bg-antique-gold/10"
                        : "border-slate-grey/20 hover:bg-slate-grey/5"
                    }`}
                  >
                    <p className="text-sm font-bold text-deep-black" style={headingFont}>{client.name}</p>
                    <p className="text-xs text-slate-grey mt-0.5" style={accentFont}>{client.phoneNumber}</p>
                    <div className="mt-2 text-[11px] text-slate-grey flex gap-2" style={accentFont}>
                      <span>{client.bookings.length} bookings</span>
                      <span>&bull;</span>
                      <span>{client.upcomingCount} upcoming</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-xl border border-slate-grey/15 bg-stark-white shadow-sm p-5">
            {!selectedClient ? (
              <div className="text-center py-16">
                <p className="text-slate-grey" style={accentFont}>Select a client to view details.</p>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-antique-gold/15 text-antique-gold flex items-center justify-center font-bold" style={headingFont}>
                      {initials(selectedClient.name)}
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-deep-black" style={headingFont}>{selectedClient.name}</h2>
                      <a
                        href={`tel:${selectedClient.phoneNumber}`}
                        className="text-sm text-slate-grey hover:text-antique-gold transition-colors"
                        style={accentFont}
                      >
                        {selectedClient.phoneNumber}
                      </a>
                    </div>
                  </div>

                  <button
                    onClick={exportClientCsv}
                    className="px-3 py-2 rounded-lg border border-antique-gold text-antique-gold hover:bg-antique-gold/10 transition-colors text-xs font-semibold"
                    style={headingFont}
                  >
                    Export CSV
                  </button>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                    <div className="rounded-lg border border-slate-grey/15 px-3 py-2">
                      <p className="text-[10px] uppercase tracking-widest text-slate-grey" style={accentFont}>Total</p>
                      <p className="text-lg font-bold text-deep-black" style={headingFont}>{selectedClient.bookings.length}</p>
                    </div>
                    <div className="rounded-lg border border-slate-grey/15 px-3 py-2">
                      <p className="text-[10px] uppercase tracking-widest text-slate-grey" style={accentFont}>Completed</p>
                      <p className="text-lg font-bold text-deep-black" style={headingFont}>{selectedClient.completedCount}</p>
                    </div>
                    <div className="rounded-lg border border-slate-grey/15 px-3 py-2">
                      <p className="text-[10px] uppercase tracking-widest text-slate-grey" style={accentFont}>Revenue</p>
                      <p className="text-lg font-bold text-deep-black" style={headingFont}>{formatMoney(selectedClient.totalSpent)}</p>
                    </div>
                    <div className="rounded-lg border border-slate-grey/15 px-3 py-2">
                      <p className="text-[10px] uppercase tracking-widest text-slate-grey" style={accentFont}>Chair Time</p>
                      <p className="text-lg font-bold text-deep-black" style={headingFont}>{selectedClient.totalMinutes}m</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="rounded-lg border border-slate-grey/15 p-3">
                    <p className="text-[10px] uppercase tracking-widest text-slate-grey" style={accentFont}>Most booked service</p>
                    <p className="mt-1 text-sm font-semibold text-deep-black" style={headingFont}>{selectedClient.mostBookedService}</p>
                  </div>
                  <div className="rounded-lg border border-slate-grey/15 p-3">
                    <p className="text-[10px] uppercase tracking-widest text-slate-grey" style={accentFont}>Last visit</p>
                    <p className="mt-1 text-sm font-semibold text-deep-black" style={headingFont}>{selectedClient.lastVisitLabel}</p>
                  </div>
                  <div className="rounded-lg border border-slate-grey/15 p-3">
                    <p className="text-[10px] uppercase tracking-widest text-slate-grey" style={accentFont}>Next visit</p>
                    <p className="mt-1 text-sm font-semibold text-deep-black" style={headingFont}>{selectedClient.nextVisitLabel}</p>
                  </div>
                </div>

                <div className="rounded-lg border border-slate-grey/15 p-3">
                  <p className="text-[10px] uppercase tracking-widest text-slate-grey" style={accentFont}>Client notes</p>
                  <textarea
                    value={noteDraft}
                    onChange={(event) => setNoteDraft(event.target.value)}
                    placeholder="Hair preferences, allergies, preferred style, reminders..."
                    className="mt-2 w-full min-h-[92px] rounded-lg border border-slate-grey/30 bg-stark-white px-3 py-2 text-sm text-deep-black focus:outline-none focus:ring-2 focus:ring-antique-gold"
                    style={accentFont}
                  />
                  <div className="mt-2 flex items-center justify-between gap-3">
                    <button
                      onClick={saveNote}
                      className="px-3 py-1.5 rounded-lg bg-deep-black text-stark-white hover:bg-black transition-colors text-xs font-semibold"
                      style={headingFont}
                    >
                      Save note
                    </button>
                    {noteFeedback && (
                      <span className="text-xs text-green-700" style={accentFont}>{noteFeedback}</span>
                    )}
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                    <p className="text-xs uppercase tracking-widest text-slate-grey" style={accentFont}>
                      Appointment history
                    </p>
                    <div className="flex rounded-lg border border-slate-grey/20 overflow-hidden">
                      <button
                        onClick={() => setBookingFilter("all")}
                        className={`px-3 py-1.5 text-[11px] font-semibold transition-colors ${bookingFilter === "all" ? "bg-deep-black text-stark-white" : "bg-stark-white text-slate-grey hover:bg-slate-grey/10"}`}
                        style={headingFont}
                      >
                        All
                      </button>
                      <button
                        onClick={() => setBookingFilter("upcoming")}
                        className={`px-3 py-1.5 text-[11px] font-semibold transition-colors ${bookingFilter === "upcoming" ? "bg-deep-black text-stark-white" : "bg-stark-white text-slate-grey hover:bg-slate-grey/10"}`}
                        style={headingFont}
                      >
                        Upcoming
                      </button>
                      <button
                        onClick={() => setBookingFilter("completed")}
                        className={`px-3 py-1.5 text-[11px] font-semibold transition-colors ${bookingFilter === "completed" ? "bg-deep-black text-stark-white" : "bg-stark-white text-slate-grey hover:bg-slate-grey/10"}`}
                        style={headingFont}
                      >
                        Completed
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2 max-h-[44vh] overflow-y-auto pr-1">
                    {selectedClientBookings.length === 0 && (
                      <div className="rounded-lg border border-slate-grey/15 px-3 py-4 text-sm text-slate-grey" style={accentFont}>
                        No bookings for this filter.
                      </div>
                    )}
                    {selectedClientBookings.map((booking) => (
                      <div
                        key={booking.id}
                        className="rounded-lg border border-slate-grey/15 px-3 py-3 flex flex-wrap items-center justify-between gap-3"
                      >
                        <div>
                          <p className="text-sm font-semibold text-deep-black" style={headingFont}>
                            {booking.serviceName}
                            <span className="text-xs text-slate-grey font-normal" style={accentFont}>
                              {` (${booking.serviceDuration}m)`}
                            </span>
                          </p>
                          <p className="text-xs text-slate-grey" style={accentFont}>{formatDateTime(booking.dateTime)}</p>
                        </div>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-widest ${statusStyles[booking.status]}`} style={headingFont}>
                          {booking.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
