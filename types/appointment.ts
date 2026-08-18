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

  price: number;

  status:
    | "confirmed"
    | "pending"
    | "completed"
    | "cancelled";

  payment:
    | "paid"
    | "partial"
    | "pending";
    
      notes?: string;
}