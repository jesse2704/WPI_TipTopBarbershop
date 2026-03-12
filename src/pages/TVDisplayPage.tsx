import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { useBooking } from "../context/BookingContext";
import { useYouTubeQueue } from "../hooks/useYouTubeQueue";
import { services } from "../data/services";

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

function getServiceName(serviceId: string): string {
  return services.find((s) => s.id === serviceId)?.name ?? serviceId;
}

function formatTime(time: string): string {
  const [h, m] = time.split(":");
  const hour = parseInt(h, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${m} ${ampm}`;
}

export default function TVDisplayPage() {
  const { getAppointmentsByDate } = useBooking();
  const { currentVideo, queue, playNext } = useYouTubeQueue();
  const [now, setNow] = useState(new Date());

  const remoteUrl = `${window.location.origin}/remote`;

  // Auto-refresh every 30 seconds so the TV stays up-to-date
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(interval);
  }, []);

  const today = now.toISOString().split("T")[0];
  const todayAppointments = getAppointmentsByDate(today);

  const bookedSlots = todayAppointments
    .filter((a) => a.status !== "completed")
    .map((a) => a.timeSlot);

  const availableSlots = TIME_SLOTS.filter(
    (slot) => !bookedSlots.includes(slot)
  );

  const currentAppointment = todayAppointments.find(
    (a) => a.status === "in-progress"
  );

  const upcomingAppointments = todayAppointments.filter(
    (a) => a.status === "booked"
  );

  const upcomingVideos = currentVideo
    ? queue.filter(
        (v) =>
          queue.indexOf(v) >
          queue.findIndex((q) => q.id === currentVideo.id)
      )
    : [];

  return (
    <div className="h-screen bg-deep-black text-vintage-cream flex flex-col overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-4 border-b border-slate-grey/20">
        <h1 className="text-3xl md:text-4xl font-bold tracking-wider font-heading">
          TIP TOP{" "}
          <span className="text-antique-gold">BARBERSHOP</span>
        </h1>
        <p className="text-slate-grey text-lg font-heading">
          {now.toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
          {" — "}
          {now.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </header>

      {/* Main Content */}
      <div className="flex-1 grid grid-cols-12 gap-6 p-6 min-h-0">
        {/* Left Column — Agenda */}
        <div className="col-span-4 flex flex-col gap-5 overflow-y-auto min-h-0">
          {/* Now Serving */}
          <div>
            <h2 className="text-xl font-bold font-heading text-antique-gold mb-3 tracking-wider uppercase">
              Now Serving
            </h2>
            {currentAppointment ? (
              <div className="bg-antique-gold/10 border-2 border-antique-gold rounded-xl p-5">
                <p className="text-3xl font-bold font-heading text-antique-gold mb-1">
                  {currentAppointment.customerName}
                </p>
                <p className="text-lg text-slate-grey">
                  {getServiceName(currentAppointment.serviceId)} • {formatTime(currentAppointment.timeSlot)}
                </p>
              </div>
            ) : (
              <div className="bg-slate-grey/10 border border-slate-grey/30 rounded-xl p-5">
                <p className="text-xl text-slate-grey font-heading">
                  Chair is open
                </p>
              </div>
            )}
          </div>

          {/* Up Next */}
          <div>
            <h2 className="text-xl font-bold font-heading text-antique-gold mb-3 tracking-wider uppercase">
              Up Next
            </h2>
            {upcomingAppointments.length > 0 ? (
              <div className="space-y-2">
                {upcomingAppointments.slice(0, 3).map((appointment, idx) => (
                  <div
                    key={appointment.id}
                    className={`rounded-lg p-3 ${
                      idx === 0
                        ? "bg-antique-gold/5 border border-antique-gold/40"
                        : "bg-slate-grey/5 border border-slate-grey/20"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-base font-bold font-heading">
                          {appointment.customerName}
                        </p>
                        <p className="text-sm text-slate-grey">
                          {getServiceName(appointment.serviceId)}
                        </p>
                      </div>
                      <p className="text-lg font-heading text-antique-gold">
                        {formatTime(appointment.timeSlot)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-grey">No upcoming appointments</p>
            )}
          </div>

          {/* Available Slots */}
          <div>
            <h2 className="text-xl font-bold font-heading text-antique-gold mb-3 tracking-wider uppercase">
              Available Today
            </h2>
            {availableSlots.length > 0 ? (
              <div className="grid grid-cols-3 gap-2">
                {availableSlots.map((slot) => (
                  <div
                    key={slot}
                    className="bg-green-900/20 border border-green-500/40 rounded-lg p-2 text-center"
                  >
                    <p className="text-lg font-bold font-heading text-green-400">
                      {formatTime(slot)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-4 text-center">
                <p className="text-lg text-red-400 font-heading">
                  Fully Booked
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Center — YouTube Player */}
        <div className="col-span-6 flex flex-col min-h-0">
          <div className="flex-1 flex flex-col">
            <div className="flex-1 bg-slate-grey/10 border border-slate-grey/30 rounded-xl overflow-hidden flex flex-col">
              {currentVideo ? (
                <iframe
                  className="w-full flex-1 border-0"
                  src={`https://www.youtube.com/embed/${currentVideo.videoId}?autoplay=1&rel=0`}
                  title={currentVideo.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-6xl mb-4">🎵</p>
                    <p className="text-2xl text-slate-grey font-heading">
                      Scan the QR code to add music
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Now Playing + Queue info bar */}
            <div className="flex items-center justify-between mt-3 px-2">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                {currentVideo ? (
                  <>
                    <span className="text-antique-gold text-sm font-heading uppercase tracking-wider shrink-0">
                      Now Playing:
                    </span>
                    <span className="text-vintage-cream font-heading truncate">
                      {currentVideo.title}
                    </span>
                    <button
                      onClick={playNext}
                      className="text-xs text-slate-grey hover:text-antique-gold border border-slate-grey/30 rounded px-2 py-1 font-heading transition-colors shrink-0"
                    >
                      Skip ▶▶
                    </button>
                  </>
                ) : (
                  <span className="text-slate-grey text-sm font-heading">
                    No music playing
                  </span>
                )}
              </div>
              {upcomingVideos.length > 0 && (
                <span className="text-slate-grey text-sm font-heading shrink-0 ml-4">
                  {upcomingVideos.length} in queue
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right Column — QR Code + Schedule */}
        <div className="col-span-2 flex flex-col gap-5 min-h-0">
          {/* QR Code */}
          <div className="bg-stark-white rounded-xl p-4 text-center">
            <QRCodeSVG
              value={remoteUrl}
              size={160}
              bgColor="#FFFFFF"
              fgColor="#1A1A1A"
              level="M"
              className="mx-auto"
            />
            <p className="text-deep-black text-xs font-heading mt-2 font-bold uppercase tracking-wider">
              Scan to add music
            </p>
          </div>

          {/* Mini Schedule */}
          <div className="flex-1 overflow-y-auto min-h-0">
            <h3 className="text-sm font-bold font-heading text-antique-gold mb-2 tracking-wider uppercase">
              Schedule
            </h3>
            <div className="space-y-1">
              {TIME_SLOTS.map((slot) => {
                const appointment = todayAppointments.find(
                  (a) => a.timeSlot === slot
                );

                return (
                  <div
                    key={slot}
                    className={`flex items-center gap-2 rounded px-2 py-1.5 text-xs ${
                      appointment?.status === "in-progress"
                        ? "bg-antique-gold/15 border border-antique-gold"
                        : appointment?.status === "booked"
                          ? "bg-slate-grey/10 border border-slate-grey/20"
                          : appointment?.status === "completed"
                            ? "bg-slate-grey/5 border border-slate-grey/10 opacity-40"
                            : "bg-green-900/10 border border-green-500/20"
                    }`}
                  >
                    <span className="font-heading font-bold min-w-[52px]">
                      {formatTime(slot)}
                    </span>
                    {appointment && appointment.status !== "completed" ? (
                      <span className="truncate">
                        {appointment.customerName}
                      </span>
                    ) : !appointment ? (
                      <span className="text-green-400">Open</span>
                    ) : (
                      <span className="text-slate-grey line-through truncate">
                        Done
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="px-8 py-3 border-t border-slate-grey/20 flex items-center justify-between">
        <p className="text-slate-grey text-sm">
          Book online at{" "}
          <span className="text-antique-gold font-heading">tiptopbarbershop.com/book</span>
        </p>
        <p className="text-slate-grey text-sm">
          Scan the QR code to control the music from your phone
        </p>
      </footer>
    </div>
  );
}
