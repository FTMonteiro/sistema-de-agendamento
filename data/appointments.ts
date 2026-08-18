import { Appointment } from "@/types/appointment";

export const appointments: Appointment[] = [
  {
    id: "1",
    client: "João Silva",
    service: "Corte Premium",
    professional: "Carlos",
    date: "11/08/2026",
    time: "09:00",
    payment: "paid",
    status: "confirmed",
    price: 15000,
    notes: "Cliente prefere corte baixo.",
  },

  {
    id: "2",
    client: "Maria Santos",
    service: "Barba",
    professional: "Pedro",
    date: "11/08/2026",
    time: "10:30",
    payment: "partial",
    status: "pending",
    price: 8000,
    notes: "Confirmar horário.",
  },

  {
    id: "3",
    client: "Pedro Manuel",
    service: "Coloração",
    professional: "Ana",
    date: "11/08/2026",
    time: "14:00",
    payment: "pending",
    status: "confirmed",
    price: 25000,
    notes: "Cliente novo.",
  },

  {
    id: "4",
    client: "Ana Costa",
    service: "Tratamento Capilar",
    professional: "Carlos",
    date: "11/08/2026",
    time: "16:00",
    payment: "paid",
    status: "completed",
    price: 30000,
    notes: "Atendimento concluído.",
  },
];