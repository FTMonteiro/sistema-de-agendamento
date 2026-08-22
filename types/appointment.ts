export type AppointmentStatus =
  | "pending"
  | "confirmed"
  | "completed"
  | "cancelled"
  | "no_show";

export type AppointmentPayment =
  | "pending"
  | "partial"
  | "paid";

export interface Appointment {
  id: string;

  clientId: string;

  serviceId: string;

  professionalId: string;

  client: string;

  service: string;

  professional: string;

  date: string;

  time: string;

  price: number;

  payment: AppointmentPayment;

  paidAmount?: number;

  status: AppointmentStatus;

  notes?: string | null;
}