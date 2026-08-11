import { Client } from "@/types/clients";

export const clients: Client[] = [
  {
    id: "1",
    name: "João Silva",
    phone: "923 000 111",
    email: "joao@email.com",
    visits: 12,
    totalSpent: 45000,
    status: "vip",
    lastVisit: "06/08/2026",
  },
  {
    id: "2",
    name: "Maria Santos",
    phone: "924 222 333",
    email: "maria@email.com",
    visits: 8,
    totalSpent: 28000,
    status: "active",
    lastVisit: "05/08/2026",
  },
  {
    id: "3",
    name: "Pedro Manuel",
    phone: "921 444 555",
    email: "pedro@email.com",
    visits: 3,
    totalSpent: 12000,
    status: "inactive",
    lastVisit: "20/07/2026",
  },
];