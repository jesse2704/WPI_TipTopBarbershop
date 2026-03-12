import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type { Appointment } from "../types";

interface BookingContextType {
  appointments: Appointment[];
  addAppointment: (appointment: Appointment) => void;
  updateAppointment: (id: string, updates: Partial<Appointment>) => void;
  getAppointmentsByDate: (date: string) => Appointment[];
}

const STORAGE_KEY = "tiptop_appointments";

function loadAppointments(): Appointment[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveAppointments(appointments: Appointment[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(appointments));
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export function BookingProvider({ children }: { children: ReactNode }) {
  const [appointments, setAppointments] =
    useState<Appointment[]>(loadAppointments);

  const addAppointment = useCallback((appointment: Appointment) => {
    setAppointments((prev) => {
      const next = [...prev, appointment];
      saveAppointments(next);
      return next;
    });
  }, []);

  const updateAppointment = useCallback(
    (id: string, updates: Partial<Appointment>) => {
      setAppointments((prev) => {
        const next = prev.map((a) => (a.id === id ? { ...a, ...updates } : a));
        saveAppointments(next);
        return next;
      });
    },
    []
  );

  const getAppointmentsByDate = useCallback(
    (date: string) => {
      return appointments
        .filter((a) => a.date === date)
        .sort((a, b) => a.timeSlot.localeCompare(b.timeSlot));
    },
    [appointments]
  );

  return (
    <BookingContext.Provider
      value={{
        appointments,
        addAppointment,
        updateAppointment,
        getAppointmentsByDate,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking(): BookingContextType {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error("useBooking must be used within a BookingProvider");
  }
  return context;
}
