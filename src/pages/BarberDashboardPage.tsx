import { useState } from "react";
import { Button, Card, Modal, ModalHeader, ModalBody } from "flowbite-react";
import { useBooking } from "../context/BookingContext";
import { services } from "../data/services";
import type { Appointment } from "../types";

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

export default function BarberDashboardPage() {
  const { getAppointmentsByDate, updateAppointment } = useBooking();
  const [showModal, setShowModal] = useState(false);
  const [endingAppointment, setEndingAppointment] =
    useState<Appointment | null>(null);
  const [paymentSent, setPaymentSent] = useState(false);

  const today = new Date().toISOString().split("T")[0];
  const todayAppointments = getAppointmentsByDate(today);

  const currentAppointment = todayAppointments.find(
    (a) => a.status === "in-progress"
  );
  const nextBookedAppointment = todayAppointments.find(
    (a) => a.status === "booked"
  );

  const handleStartSession = () => {
    if (nextBookedAppointment) {
      updateAppointment(nextBookedAppointment.id, { status: "in-progress" });
    }
  };

  const handleEndSession = () => {
    if (currentAppointment) {
      setEndingAppointment(currentAppointment);
      setPaymentSent(false);
      setShowModal(true);
    }
  };

  const handleCashPayment = () => {
    if (endingAppointment) {
      updateAppointment(endingAppointment.id, { status: "completed" });
    }
    setShowModal(false);
    setEndingAppointment(null);
  };

  const handlePaymentLink = () => {
    if (endingAppointment) {
      setPaymentSent(true);
      // Simulate sending SMS after a short delay
      setTimeout(() => {
        updateAppointment(endingAppointment.id, { status: "completed" });
        setShowModal(false);
        setEndingAppointment(null);
        setPaymentSent(false);
      }, 2000);
    }
  };

  const statusBadge = (status: Appointment["status"]) => {
    const colors = {
      booked: "bg-blue-100 text-blue-800",
      "in-progress": "bg-antique-gold/20 text-amber-800",
      completed: "bg-green-100 text-green-800",
    };
    return (
      <span
        className={`text-xs font-heading px-2 py-1 rounded-full ${colors[status]}`}
      >
        {status === "in-progress" ? "In Progress" : status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-vintage-cream py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-deep-black">Dashboard</h1>
            <p className="text-slate-grey text-sm mt-1">
              Today&apos;s Agenda &mdash;{" "}
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={handleStartSession}
              disabled={!nextBookedAppointment || !!currentAppointment}
              className="bg-green-600 hover:bg-green-700 text-white font-heading border-0 focus:ring-green-400 disabled:opacity-50"
            >
              Start Session
            </Button>
            <Button
              onClick={handleEndSession}
              disabled={!currentAppointment}
              className="bg-red-600 hover:bg-red-700 text-white font-heading border-0 focus:ring-red-400 disabled:opacity-50"
            >
              End Session
            </Button>
          </div>
        </div>

        {/* Current Client Highlight */}
        {currentAppointment && (
          <Card className="mb-6 border-2 border-antique-gold bg-antique-gold/5 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-antique-gold font-heading uppercase tracking-wider mb-1">
                  Currently in Chair
                </p>
                <h3 className="text-xl font-bold text-deep-black font-heading">
                  {currentAppointment.customerName}
                </h3>
                <p className="text-slate-grey text-sm">
                  {getServiceName(currentAppointment.serviceId)} &bull;{" "}
                  {formatTime(currentAppointment.timeSlot)}
                </p>
              </div>
              {statusBadge(currentAppointment.status)}
            </div>
          </Card>
        )}

        {/* Today's Appointments */}
        {todayAppointments.length === 0 ? (
          <Card className="text-center bg-stark-white">
            <p className="text-slate-grey text-lg py-8">
              No appointments scheduled for today.
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {todayAppointments.map((appointment) => (
              <Card
                key={appointment.id}
                className={`bg-stark-white ${
                  appointment.status === "in-progress"
                    ? "border-2 border-antique-gold"
                    : appointment.status === "completed"
                      ? "opacity-60"
                      : ""
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-center min-w-[60px]">
                      <p className="text-lg font-bold font-heading text-deep-black">
                        {formatTime(appointment.timeSlot)}
                      </p>
                    </div>
                    <div className="border-l border-slate-grey/20 pl-4">
                      <h3 className="font-bold text-deep-black font-heading">
                        {appointment.customerName}
                      </h3>
                      <p className="text-slate-grey text-sm">
                        {getServiceName(appointment.serviceId)} &bull;{" "}
                        {appointment.phoneNumber}
                      </p>
                    </div>
                  </div>
                  {statusBadge(appointment.status)}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* End Session Modal */}
      <Modal show={showModal} onClose={() => setShowModal(false)} size="md">
        <ModalHeader>
          <span className="font-heading">Complete Session</span>
        </ModalHeader>
        <ModalBody>
          {endingAppointment && (
            <div className="text-center">
              <p className="text-slate-grey mb-1">Session for</p>
              <p className="text-xl font-bold text-deep-black font-heading mb-1">
                {endingAppointment.customerName}
              </p>
              <p className="text-sm text-slate-grey mb-6">
                {getServiceName(endingAppointment.serviceId)}
              </p>

              {paymentSent ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-green-700 font-heading">
                    ✓ Payment link sent to {endingAppointment.phoneNumber}
                  </p>
                  <p className="text-green-600 text-sm mt-1">
                    Marking as completed...
                  </p>
                </div>
              ) : (
                <div className="flex gap-4 justify-center">
                  <Button
                    onClick={handleCashPayment}
                    size="lg"
                    className="bg-green-600 hover:bg-green-700 text-white font-heading border-0 focus:ring-green-400"
                  >
                    💵 Cash
                  </Button>
                  <Button
                    onClick={handlePaymentLink}
                    size="lg"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-heading border-0 focus:ring-blue-400"
                  >
                    📱 Payment Link
                  </Button>
                </div>
              )}
            </div>
          )}
        </ModalBody>
      </Modal>
    </div>
  );
}
