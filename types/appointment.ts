export type AppointmentStatus =
  | "confirmed"
  | "pending"
  | "completed"
  | "cancelled";

export type PaymentStatus =
  | "paid"
  | "pending"
  | "partial";

export interface Appointment {
  id: string;

  client: string;

  service: string;

  professional: string;

  date: string;

  time: string;

  payment: PaymentStatus;

  status: AppointmentStatus;

  notes?: string;
}