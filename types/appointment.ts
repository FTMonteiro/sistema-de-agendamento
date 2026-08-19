export type AppointmentStatus =
  | "pending"
  | "confirmed"
  | "completed"
  | "cancelled";

export type AppointmentPayment =
  | "pending"
  | "partial"
  | "paid";

export interface Appointment {
  id: string;

  client: string;

  service: string;

  professional: string;

  date: string;

  time: string;

  price: number;

  payment: AppointmentPayment;

  status: AppointmentStatus;

  notes?: string | null;
}