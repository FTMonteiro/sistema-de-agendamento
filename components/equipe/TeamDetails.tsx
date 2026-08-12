"use client";

import {
  X,
  Pencil,
  Trash2,
  Phone,
  Mail,
  BriefcaseBusiness,
} from "lucide-react";

import { TeamMember } from "@/data/Team";

interface TeamDetailsProps {
  member: TeamMember | null;
  onClose: () => void;
  onEdit: (member: TeamMember) => void;
  onDelete: (member: TeamMember) => void;
}

export function TeamDetails({
  member,
  onClose,
  onEdit,
  onDelete,
}: TeamDetailsProps) {
  if (!member) {
    return null;
  }

  const active = member.status === "Ativo";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(event) =>
          event.stopPropagation()
        }
      >
        {/* HEADER */}
        <div className="flex items-start justify-between border-b border-gray-100 px-6 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
              Profissional
            </p>

            <h2 className="mt-1 text-xl font-bold text-gray-950">
              {member.name}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* CONTEÚDO */}
        <div className="space-y-5 px-6 py-6">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-100 text-lg font-bold text-gray-700">
              {member.photo ? (
                <img
                  src={member.photo}
                  alt={`Foto de ${member.name}`}
                  className="h-full w-full object-cover"
                />
              ) : (
                member.name.charAt(0).toUpperCase()
              )}
            </div>

            <div className="min-w-0">
              <p className="font-semibold text-gray-950">
                {member.name}
              </p>

              <p className="mt-0.5 text-sm text-gray-500">
                #{String(member.id).padStart(3, "0")}
              </p>
            </div>

            <span
              className={`ml-auto inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                active
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  active
                    ? "bg-emerald-500"
                    : "bg-gray-400"
                }`}
              />

              {member.status}
            </span>
          </div>

          <div className="divide-y divide-gray-100 overflow-hidden rounded-xl border border-gray-100">
            <div className="flex items-center gap-3 px-4 py-3.5">
              <BriefcaseBusiness className="h-4 w-4 text-gray-400" />

              <div>
                <p className="text-xs text-gray-400">
                  Cargo
                </p>

                <p className="mt-0.5 text-sm font-medium text-gray-800">
                  {member.role}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 px-4 py-3.5">
              <Phone className="h-4 w-4 text-gray-400" />

              <div>
                <p className="text-xs text-gray-400">
                  Telefone
                </p>

                <p className="mt-0.5 text-sm font-medium text-gray-800">
                  {member.phone}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 px-4 py-3.5">
              <Mail className="h-4 w-4 text-gray-400" />

              <div className="min-w-0">
                <p className="text-xs text-gray-400">
                  Email
                </p>

                <p className="mt-0.5 truncate text-sm font-medium text-gray-800">
                  {member.email}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* AÇÕES */}
        <div className="flex justify-end gap-3 border-t border-gray-100 bg-gray-50/50 px-6 py-4">
          <button
            type="button"
            onClick={() => onDelete(member)}
            className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
            Excluir
          </button>

          <button
            type="button"
            onClick={() => onEdit(member)}
            className="inline-flex items-center gap-2 rounded-xl bg-gray-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-800"
          >
            <Pencil className="h-4 w-4" />
            Editar
          </button>
        </div>
      </div>
    </div>
  );
}