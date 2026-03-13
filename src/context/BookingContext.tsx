import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type { Appointment } from "../types";
import { services } from "../data/services";

interface BookingContextType {
  appointments: Appointment[];
  breakMinutes: number;
  addAppointment: (appointment: Appointment) => void;
  updateAppointment: (id: string, updates: Partial<Appointment>) => void;
  setBreakMinutes: (minutes: number) => void;
  getAppointmentsByDate: (date: string) => Appointment[];
  getAvailableTimeSlots: (
    date: string,
    serviceId: string,
    excludeAppointmentId?: string
  ) => string[];
  rescheduleAppointment: (
    id: string,
    date: string,
    timeSlot: string
  ) => boolean;
}

const STORAGE_KEY = "tiptop_appointments";
const BREAK_STORAGE_KEY = "tiptop_break_minutes";
const DEFAULT_BREAK_MINUTES = 15;
const MAX_BREAK_MINUTES = 120;
const SHOP_CLOSE_MINUTES = 18 * 60;

export const WORKING_TIME_SLOTS = [
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

function parseTimeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function getServiceDuration(serviceId: string): number {
  return services.find((service) => service.id === serviceId)?.duration ?? 30;
}

function isActiveAppointment(appointment: Appointment): boolean {
  return appointment.status !== "completed";
}

function hasSchedulingConflict(
  dateAppointments: Appointment[],
  candidateStart: number,
  candidateDuration: number,
  breakMinutes: number,
  excludeAppointmentId?: string
): boolean {
  const candidateEnd = candidateStart + candidateDuration + breakMinutes;

  return dateAppointments
    .filter(isActiveAppointment)
    .filter((appointment) => appointment.id !== excludeAppointmentId)
    .some((appointment) => {
      const existingStart = parseTimeToMinutes(appointment.timeSlot);
      const existingEnd =
        existingStart + getServiceDuration(appointment.serviceId) + breakMinutes;

      return candidateStart < existingEnd && existingStart < candidateEnd;
    });
}

function loadBreakMinutes(): number {
  try {
    const stored = localStorage.getItem(BREAK_STORAGE_KEY);
    if (!stored) {
      return DEFAULT_BREAK_MINUTES;
    }

    const value = Number(stored);
    if (!Number.isFinite(value) || value < 0) {
      return DEFAULT_BREAK_MINUTES;
    }

    return Math.min(value, MAX_BREAK_MINUTES);
  } catch {
    return DEFAULT_BREAK_MINUTES;
  }
}

function createDummyAppointments(): Appointment[] {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const formatDate = (value: Date) => value.toISOString().split("T")[0];
  const createdAt = new Date().toISOString();

  return [
    {
      id: crypto.randomUUID(),
      customerName: "Michael Carter",
      phoneNumber: "(555) 201-4401",
      serviceId: "haircut-and-beard",
      date: formatDate(today),
      timeSlot: "09:30",
      status: "completed",
      createdAt,
    },
    {
      id: crypto.randomUUID(),
      customerName: "Jason Reed",
      phoneNumber: "(555) 304-1189",
      serviceId: "classic-cut",
      date: formatDate(today),
      timeSlot: "10:30",
      status: "in-progress",
      createdAt,
    },
    {
      id: crypto.randomUUID(),
      customerName: "Andre Brooks",
      phoneNumber: "(555) 412-7734",
      serviceId: "beard-trim",
      date: formatDate(today),
      timeSlot: "11:00",
      status: "booked",
      createdAt,
    },
    {
      id: crypto.randomUUID(),
      customerName: "Ethan Miles",
      phoneNumber: "(555) 505-2290",
      serviceId: "hot-towel-shave",
      date: formatDate(today),
      timeSlot: "12:30",
      status: "booked",
      createdAt,
    },
    {
      id: crypto.randomUUID(),
      customerName: "Noah Bennett",
      phoneNumber: "(555) 606-9104",
      serviceId: "buzz-cut",
      date: formatDate(tomorrow),
      timeSlot: "10:00",
      status: "booked",
      createdAt,
    },
  ];
}

function loadAppointments(): Appointment[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }

    const dummyAppointments = createDummyAppointments();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dummyAppointments));
    return dummyAppointments;
  } catch {
    return createDummyAppointments();
  }
}

function saveAppointments(appointments: Appointment[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(appointments));
}

function saveBreakMinutes(minutes: number) {
  localStorage.setItem(BREAK_STORAGE_KEY, String(minutes));
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export function BookingProvider({ children }: { children: ReactNode }) {
  const [appointments, setAppointments] =
    useState<Appointment[]>(loadAppointments);
  const [breakMinutes, setBreakMinutesState] =
    useState<number>(loadBreakMinutes);

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

  const setBreakMinutes = useCallback((minutes: number) => {
    const safeMinutes = Math.min(
      MAX_BREAK_MINUTES,
      Math.max(0, Number.isFinite(minutes) ? Math.round(minutes) : DEFAULT_BREAK_MINUTES)
    );
    setBreakMinutesState(safeMinutes);
    saveBreakMinutes(safeMinutes);
  }, []);

  const getAppointmentsByDate = useCallback(
    (date: string) => {
      return appointments
        .filter((a) => a.date === date)
        .sort((a, b) => a.timeSlot.localeCompare(b.timeSlot));
    },
    [appointments]
  );

  const getAvailableTimeSlots = useCallback(
    (date: string, serviceId: string, excludeAppointmentId?: string) => {
      if (!date || !serviceId) {
        return [];
      }

      const dateAppointments = appointments.filter((a) => a.date === date);
      const serviceDuration = getServiceDuration(serviceId);

      return WORKING_TIME_SLOTS.filter((slot) => {
        const candidateStart = parseTimeToMinutes(slot);
        const candidateEnd = candidateStart + serviceDuration + breakMinutes;

        if (candidateEnd > SHOP_CLOSE_MINUTES) {
          return false;
        }

        return !hasSchedulingConflict(
          dateAppointments,
          candidateStart,
          serviceDuration,
          breakMinutes,
          excludeAppointmentId
        );
      });
    },
    [appointments, breakMinutes]
  );

  const rescheduleAppointment = useCallback(
    (id: string, date: string, timeSlot: string) => {
      const target = appointments.find((appointment) => appointment.id === id);
      if (!target) {
        return false;
      }

      const availableSlots = getAvailableTimeSlots(date, target.serviceId, id);
      if (!availableSlots.includes(timeSlot)) {
        return false;
      }

      setAppointments((prev) => {
        const next = prev.map((appointment) =>
          appointment.id === id ? { ...appointment, date, timeSlot } : appointment
        );
        saveAppointments(next);
        return next;
      });

      return true;
    },
    [appointments, getAvailableTimeSlots]
  );

  return (
    <BookingContext.Provider
      value={{
        appointments,
        breakMinutes,
        addAppointment,
        updateAppointment,
        setBreakMinutes,
        getAppointmentsByDate,
        getAvailableTimeSlots,
        rescheduleAppointment,
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
