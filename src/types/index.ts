export interface Service {
  id: string;
  name: string;
  price: number;
  duration: number; // in minutes
  description: string;
}

export interface Appointment {
  id: string;
  customerName: string;
  phoneNumber: string;
  serviceId: string;
  date: string; // YYYY-MM-DD
  timeSlot: string; // HH:MM
  status: "booked" | "in-progress" | "completed";
  createdAt: string;
}
