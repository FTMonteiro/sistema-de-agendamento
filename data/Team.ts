export type TeamStatus = "Ativo" | "Inativo";

export interface TeamMember {
  id: number;
  name: string;
  role: string;
  phone: string;
  email: string;
  photo?: string;
  status: TeamStatus;
}

export const team: TeamMember[] = [
  {
    id: 1,
    name: "João Silva",
    role: "Barbeiro",
    phone: "+244 900 000 000",
    email: "joao@email.com",
    photo: "",
    status: "Ativo",
  },
  {
    id: 2,
    name: "Maria Santos",
    role: "Cabeleireira",
    phone: "+244 921 000 000",
    email: "maria@email.com",
    photo: "",
    status: "Ativo",
  },
  {
    id: 3,
    name: "Pedro Manuel",
    role: "Barbeiro",
    phone: "+244 923 000 000",
    email: "pedro@email.com",
    photo: "",
    status: "Inativo",
  },
];