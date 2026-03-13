import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from "@hello-pangea/dnd";
import { useBooking, WORKING_TIME_SLOTS } from "../context/BookingContext";
import { app } from "../lib/firebase";
import { useAuth } from "../context/AuthContext";
import { services } from "../data/services";
import type { Appointment } from "../types";

const headingFont = { fontFamily: "'Roboto Condensed', 'Arial Narrow', sans-serif" };
const accentFont = { fontFamily: "'Lora', serif" };

/* ── helpers ─────────────────────────────────────────────────── */

function getServiceName(id: string): string {
  return services.find((s) => s.id === id)?.name ?? id;
}

function getServiceDuration(id: string): number {
  return services.find((s) => s.id === id)?.duration ?? 30;
}

function formatTime(time: string): string {
  const [h, m] = time.split(":");
  const hour = parseInt(h, 10);
  return `${hour % 12 || 12}:${m} ${hour >= 12 ? "PM" : "AM"}`;
}

function addDays(dateString: string, n: number): string {
  const d = new Date(dateString);
  d.setDate(d.getDate() + n);
  return d.toISOString().split("T")[0];
}

function formatDateLabel(iso: string): string {
  const d = new Date(iso + "T12:00:00");
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

function getFunctionsBaseUrl(): string {
  const projectId = app.options.projectId;
  if (!projectId) {
    throw new Error("Firebase projectId is missing from app configuration.");
  }

  return `https://europe-west1-${projectId}.cloudfunctions.net`;
}

/* ── status badge ────────────────────────────────────────────── */

const statusColors: Record<Appointment["status"], string> = {
  booked: "bg-blue-100 text-blue-800",
  "in-progress": "bg-antique-gold/20 text-amber-900",
  completed: "bg-green-100 text-green-800",
};

function StatusBadge({ status }: { status: Appointment["status"] }) {
  const label =
    status === "in-progress"
      ? "In Progress"
      : status.charAt(0).toUpperCase() + status.slice(1);

  return (
    <span
      className={`text-[10px] px-2 py-0.5 rounded-full whitespace-nowrap ${statusColors[status]}`}
      style={headingFont}
    >
      {label}
    </span>
  );
}

/* ── main component ──────────────────────────────────────────── */

export default function BarberDashboardPage() {
  const { user } = useAuth();
  const {
    getAppointmentsByDate,
    updateAppointment,
    breakMinutes,
    setBreakMinutes,
    getAvailableTimeSlots,
    rescheduleAppointment,
  } = useBooking();

  const today = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState(today);
  const [feedback, setFeedback] = useState<{
    type: "error" | "success";
    message: string;
  } | null>(null);
  const [instagramState, setInstagramState] = useState<{ connected: boolean; username: string | null }>({ connected: false, username: null });
  const [instagramBusy, setInstagramBusy] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadInstagramStatus = async () => {
      if (!user) return;
      try {
        const token = await user.getIdToken();
        const response = await fetch(`${getFunctionsBaseUrl()}/getInstagramConnectionStatusHttp`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) return;
        const data = await response.json();
        if (!isMounted) return;
        setInstagramState({ connected: Boolean(data.connected), username: data.username ?? null });
      } catch {
        // Ignore dashboard integration status fetch failures.
      }
    };

    loadInstagramStatus();

    const params = new URLSearchParams(window.location.search);
    const instagramParam = params.get("instagram");
    if (instagramParam && isMounted) {
      if (instagramParam === "connected") {
        setFeedback({ type: "success", message: "Instagram connected successfully." });
      } else if (instagramParam === "no-account") {
        setFeedback({ type: "error", message: "No Instagram business account was found on the connected Meta page." });
      } else if (instagramParam === "error") {
        setFeedback({ type: "error", message: "Instagram connection failed. Please try again." });
      }
      params.delete("instagram");
      const query = params.toString();
      const nextUrl = `${window.location.pathname}${query ? `?${query}` : ""}`;
      window.history.replaceState({}, "", nextUrl);
    }

    return () => {
      isMounted = false;
    };
  }, [user]);

  const dayAppointments = getAppointmentsByDate(selectedDate);

  const currentAppointment = dayAppointments.find(
    (a) => a.status === "in-progress"
  );
  const nextBookedAppointment = dayAppointments.find(
    (a) => a.status === "booked"
  );

  /* Build a map: timeSlot → appointment (if any) */
  const slotMap = new Map<string, Appointment>();
  for (const appt of dayAppointments) {
    slotMap.set(appt.timeSlot, appt);
  }

  /* ── Drag handler ───────────────────────────────────────────── */

  const onDragEnd = (result: DropResult) => {
    const { draggableId, destination } = result;
    if (!destination) return;

    const targetSlot = destination.droppableId; // e.g. "slot-10:30"
    const newTime = targetSlot.replace("slot-", "");
    const appointment = dayAppointments.find((a) => a.id === draggableId);
    if (!appointment) return;

    // Same slot — no-op
    if (appointment.timeSlot === newTime) return;

    // Completed appointments can't move
    if (appointment.status === "completed") {
      setFeedback({
        type: "error",
        message: "Completed appointments cannot be moved.",
      });
      return;
    }

    const ok = rescheduleAppointment(appointment.id, selectedDate, newTime);

    if (!ok) {
      setFeedback({
        type: "error",
        message: `Cannot move to ${formatTime(newTime)} — slot unavailable (service duration + break overlap).`,
      });
    } else {
      setFeedback({
        type: "success",
        message: `${appointment.customerName} moved to ${formatTime(newTime)}.`,
      });
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  /* ── Session controls ───────────────────────────────────────── */

  const startSession = () => {
    if (nextBookedAppointment) {
      updateAppointment(nextBookedAppointment.id, { status: "in-progress" });
    }
  };

  const finishSession = () => {
    if (currentAppointment) {
      updateAppointment(currentAppointment.id, { status: "completed" });
    }
  };

  const connectInstagram = async () => {
    if (!user) return;
    setInstagramBusy(true);
    try {
      const token = await user.getIdToken();
      const response = await fetch(`${getFunctionsBaseUrl()}/beginInstagramConnectionHttp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ returnUrl: `${window.location.origin}/barber/dashboard` }),
      });

      const data = await response.json();
      if (!response.ok || !data?.authUrl) {
        throw new Error(data?.error || "Unable to start Instagram connection.");
      }

      window.location.href = data.authUrl;
    } catch (error) {
      setFeedback({
        type: "error",
        message: error instanceof Error ? error.message : "Unable to start Instagram connection.",
      });
      setInstagramBusy(false);
    }
  };

  const disconnectInstagram = async () => {
    if (!user) return;
    setInstagramBusy(true);
    try {
      const token = await user.getIdToken();
      const response = await fetch(`${getFunctionsBaseUrl()}/disconnectInstagramConnectionHttp`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Unable to disconnect Instagram.");
      }

      setInstagramState({ connected: false, username: null });
      setFeedback({ type: "success", message: "Instagram disconnected." });
    } catch (error) {
      setFeedback({
        type: "error",
        message: error instanceof Error ? error.message : "Unable to disconnect Instagram.",
      });
    } finally {
      setInstagramBusy(false);
    }
  };

  /* ── Render ─────────────────────────────────────────────────── */

  return (
    <div className="min-h-screen bg-vintage-cream py-6 px-4 md:py-10">
      <div className="max-w-4xl mx-auto space-y-5">
        <div className="relative overflow-hidden rounded-2xl border border-antique-gold/25 bg-deep-black px-6 py-7 shadow-xl md:px-8 md:py-8">
          <div className="absolute -top-12 -right-16 h-44 w-44 rounded-full bg-antique-gold/15 blur-2xl" />
          <div className="absolute -bottom-16 -left-16 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
          <div className="relative flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-[10px] tracking-[0.45em] uppercase text-antique-gold" style={accentFont}>
                Tip Top Barbershop
              </p>
              <h1 className="mt-2 text-4xl md:text-5xl font-black text-vintage-cream leading-[0.9]" style={headingFont}>
                Barber Dashboard
              </h1>
              <p className="text-sm text-vintage-cream/65 mt-2" style={accentFont}>
                Drag and drop appointments to keep the day on track.
              </p>
            </div>

            <div className="bg-stark-white rounded-xl border border-slate-grey/15 shadow-sm px-4 py-3 flex items-center gap-3">
              <Link
                to="/barber/clients"
                className="px-3 py-1.5 rounded-lg border border-antique-gold text-antique-gold hover:bg-antique-gold/10 transition-colors text-xs font-semibold"
                style={headingFont}
              >
                Client Hub
              </Link>
              <label className="text-sm font-semibold text-deep-black whitespace-nowrap" style={headingFont}>
                Break
              </label>
              <input
                type="number"
                min={0}
                max={120}
                step={5}
                value={breakMinutes}
                onChange={(e) => setBreakMinutes(Number(e.target.value))}
                className="w-16 px-2 py-1.5 rounded-lg border border-slate-grey/30 bg-stark-white text-deep-black text-center focus:outline-none focus:ring-2 focus:ring-antique-gold"
              />
              <span className="text-xs text-slate-grey" style={accentFont}>min</span>
            </div>
          </div>
        </div>

        {/* ── Day navigation ────────────────────────────────────── */}
        <div className="bg-stark-white rounded-xl border border-slate-grey/15 shadow-sm px-4 py-3 flex flex-wrap items-center gap-3">
          <button
            onClick={() => setSelectedDate(addDays(selectedDate, -1))}
            className="p-2 rounded-lg hover:bg-slate-grey/10 transition-colors"
            aria-label="Previous day"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div className="flex-1 text-center">
            <p className="text-lg font-bold text-deep-black" style={headingFont}>
              {formatDateLabel(selectedDate)}
            </p>
            {selectedDate === today && (
              <span className="text-xs text-antique-gold uppercase tracking-wider" style={accentFont}>
                Today
              </span>
            )}
          </div>

          <button
            onClick={() => setSelectedDate(addDays(selectedDate, 1))}
            className="p-2 rounded-lg hover:bg-slate-grey/10 transition-colors"
            aria-label="Next day"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {selectedDate !== today && (
            <button
              onClick={() => setSelectedDate(today)}
              className="ml-2 px-3 py-1.5 text-xs font-semibold rounded-lg border border-antique-gold text-antique-gold hover:bg-antique-gold/10 transition-colors"
              style={headingFont}
            >
              Today
            </button>
          )}

          <div className="ml-auto flex gap-2">
            <button
              onClick={startSession}
              disabled={!nextBookedAppointment || !!currentAppointment}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors text-sm"
              style={headingFont}
            >
              Start
            </button>
            <button
              onClick={finishSession}
              disabled={!currentAppointment}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors text-sm"
              style={headingFont}
            >
              Done
            </button>
          </div>
        </div>

        {/* ── Feedback banner ───────────────────────────────────── */}
        {feedback && (
          <div
            className={`rounded-lg px-4 py-3 text-sm border ${
              feedback.type === "error"
                ? "border-red-200 bg-red-50 text-red-700"
                : "border-green-200 bg-green-50 text-green-700"
            }`}
          >
            {feedback.message}
          </div>
        )}

        <div className="bg-stark-white rounded-xl border border-slate-grey/15 shadow-sm px-5 py-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.35em] text-antique-gold" style={accentFont}>
              Instagram Integration
            </p>
            <h3 className="mt-1 text-lg font-bold text-deep-black" style={headingFont}>
              {instagramState.connected ? `Connected as @${instagramState.username ?? "tiptopbarbershopnl"}` : "Connect the shop Instagram"}
            </h3>
            <p className="text-sm text-slate-grey mt-1" style={accentFont}>
              {instagramState.connected
                ? "The gallery will use the connected Instagram feed automatically."
                : "Connect once here and the gallery feed will start syncing without manual secrets from the barber side."}
            </p>
          </div>

          <div className="flex gap-2">
            {instagramState.connected ? (
              <button
                onClick={disconnectInstagram}
                disabled={instagramBusy}
                className="px-4 py-2 rounded-lg border border-red-200 text-red-700 hover:bg-red-50 disabled:opacity-50 transition-colors text-sm font-semibold"
                style={headingFont}
              >
                {instagramBusy ? "Disconnecting..." : "Disconnect Instagram"}
              </button>
            ) : (
              <button
                onClick={connectInstagram}
                disabled={instagramBusy}
                className="px-4 py-2 rounded-lg bg-antique-gold text-deep-black hover:bg-[#b49149] disabled:opacity-50 transition-colors text-sm font-semibold"
                style={headingFont}
              >
                {instagramBusy ? "Connecting..." : "Connect Instagram"}
              </button>
            )}
          </div>
        </div>

        {/* ── Currently in chair ────────────────────────────────── */}
        {currentAppointment && (
          <div className="bg-antique-gold/5 border-2 border-antique-gold rounded-xl px-5 py-4 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[10px] text-antique-gold uppercase tracking-widest mb-0.5" style={accentFont}>
                Currently in Chair
              </p>
              <h3 className="text-lg font-bold text-deep-black" style={headingFont}>
                {currentAppointment.customerName}
              </h3>
              <p className="text-slate-grey text-sm">
                {getServiceName(currentAppointment.serviceId)} &bull;{" "}
                {formatTime(currentAppointment.timeSlot)}
              </p>
            </div>
            <StatusBadge status={currentAppointment.status} />
          </div>
        )}

        {/* ── Timeline (drag-and-drop) ──────────────────────────── */}
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="bg-stark-white rounded-xl border border-slate-grey/15 shadow-sm overflow-hidden">
            {WORKING_TIME_SLOTS.map((slot) => {
              const appointment = slotMap.get(slot);
              const isAvailable =
                !appointment &&
                getAvailableTimeSlots(selectedDate, "classic-cut").includes(slot);

              return (
                <Droppable droppableId={`slot-${slot}`} key={slot}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`flex items-stretch border-b border-slate-grey/10 last:border-b-0 transition-colors min-h-[64px] ${
                        snapshot.isDraggingOver
                          ? "bg-antique-gold/10"
                          : appointment
                            ? ""
                            : "bg-slate-grey/[0.02]"
                      }`}
                    >
                      {/* Time gutter */}
                      <div className="w-20 md:w-24 shrink-0 flex items-center justify-center border-r border-slate-grey/10 select-none">
                        <span className="text-xs font-semibold text-slate-grey" style={headingFont}>
                          {formatTime(slot)}
                        </span>
                      </div>

                      {/* Slot content */}
                      <div className="flex-1 px-3 py-2 flex items-center">
                        {appointment ? (
                          <Draggable
                            draggableId={appointment.id}
                            index={0}
                            isDragDisabled={appointment.status === "completed"}
                          >
                            {(dragProvided, dragSnapshot) => (
                              <div
                                ref={dragProvided.innerRef}
                                {...dragProvided.draggableProps}
                                {...dragProvided.dragHandleProps}
                                className={`w-full rounded-lg px-4 py-3 flex items-center justify-between gap-3 select-none transition-shadow ${
                                  appointment.status === "completed"
                                    ? "bg-slate-grey/5 opacity-50 cursor-default"
                                    : appointment.status === "in-progress"
                                      ? "bg-antique-gold/10 border-2 border-antique-gold cursor-grab"
                                      : "bg-blue-50 border border-blue-200 cursor-grab hover:shadow-md"
                                } ${dragSnapshot.isDragging ? "shadow-xl ring-2 ring-antique-gold/50 rotate-1" : ""}`}
                              >
                                <div className="flex items-center gap-3 min-w-0">
                                  {/* Drag handle icon */}
                                  {appointment.status !== "completed" && (
                                    <svg
                                      className="w-4 h-4 text-slate-grey/40 shrink-0"
                                      fill="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <circle cx="9" cy="5" r="1.5" />
                                      <circle cx="15" cy="5" r="1.5" />
                                      <circle cx="9" cy="12" r="1.5" />
                                      <circle cx="15" cy="12" r="1.5" />
                                      <circle cx="9" cy="19" r="1.5" />
                                      <circle cx="15" cy="19" r="1.5" />
                                    </svg>
                                  )}
                                  <div className="min-w-0">
                                    <p className="font-bold text-deep-black text-sm truncate" style={headingFont}>
                                      {appointment.customerName}
                                    </p>
                                    <p className="text-slate-grey text-xs truncate">
                                      {getServiceName(appointment.serviceId)}{" "}
                                      <span className="text-slate-grey/60">
                                        ({getServiceDuration(appointment.serviceId)}m)
                                      </span>{" "}
                                      &bull; {appointment.phoneNumber}
                                    </p>
                                  </div>
                                </div>
                                <StatusBadge status={appointment.status} />
                              </div>
                            )}
                          </Draggable>
                        ) : (
                          <div className="w-full flex items-center justify-center py-1">
                            <span
                              className={`text-[11px] tracking-wide ${
                                isAvailable
                                  ? "text-green-500/60"
                                  : "text-slate-grey/30"
                              }`}
                              style={accentFont}
                            >
                              {isAvailable ? "Available" : "—"}
                            </span>
                          </div>
                        )}
                        {provided.placeholder}
                      </div>
                    </div>
                  )}
                </Droppable>
              );
            })}
          </div>
        </DragDropContext>

        {/* ── Summary footer ────────────────────────────────────── */}
        <div className="flex flex-wrap gap-4 text-xs text-slate-grey px-1" style={accentFont}>
          <span>
            {dayAppointments.length} appointment{dayAppointments.length !== 1 ? "s" : ""}
          </span>
          <span>&bull;</span>
          <span>
            {dayAppointments.filter((a) => a.status === "completed").length} completed
          </span>
          <span>&bull;</span>
          <span>
            {dayAppointments.filter((a) => a.status === "booked").length} upcoming
          </span>
          <span>&bull;</span>
          <span>{breakMinutes}m break between sessions</span>
        </div>
      </div>
    </div>
  );
}
