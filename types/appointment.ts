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

  /** Valor efectivamente recebido; 0 enquanto não houver pagamento. */
  paidAmount?: number;

  status: AppointmentStatus;

  notes?: string | null;
}