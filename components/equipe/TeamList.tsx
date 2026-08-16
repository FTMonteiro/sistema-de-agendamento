"use client";

import { useState } from "react";
import {
  Search,
  MoreHorizontal,
  Eye,
  Pencil,
  Trash2,
} from "lucide-react";

import { TeamMember } from "@/data/Team";
import { TeamDetails } from "@/components/equipe/TeamDetails";

interface TeamListProps {
  members: TeamMember[];
  onUpdateMember: (member: TeamMember) => void;
  onDeleteMember: (id: TeamMember["id"]) => void;
}

export default function TeamList({
  members,
  onUpdateMember,
  onDeleteMember,
}: TeamListProps) {
  const [search, setSearch] = useState("");

  const [selectedMember, setSelectedMember] =
    useState<TeamMember | null>(null);

  const [isEditing, setIsEditing] = useState(false);

  const [openMenu, setOpenMenu] = useState<
    TeamMember["id"] | null
  >(null);

  /*
   * PESQUISA
   */
  const filteredTeam = members.filter((member) => {
    const value = search.toLowerCase().trim();

    return (
      member.name.toLowerCase().includes(value) ||
      member.role.toLowerCase().includes(value) ||
      member.phone.toLowerCase().includes(value) ||
      member.email.toLowerCase().includes(value)
    );
  });

  /*
   * VER PERFIL
   */
  function handleView(member: TeamMember) {
    setOpenMenu(null);
    setIsEditing(false);
    setSelectedMember(member);
  }

  /*
   * ABRIR EDIÇÃO
   */
  function handleEdit(member: TeamMember) {
    setOpenMenu(null);
    setSelectedMember(member);
    setIsEditing(true);
  }

  /*
   * SALVAR EDIÇÃO
   */
function handleSaveEdit(updatedMember: TeamMember) {
  onUpdateMember(updatedMember);

  setSelectedMember(updatedMember);
  setIsEditing(false);
}
  /*
   * EXCLUIR
   */
  function handleDelete(member: TeamMember) {
    setOpenMenu(null);

    onDeleteMember(member.id);

    if (selectedMember?.id === member.id) {
      setSelectedMember(null);
      setIsEditing(false);
    }
  }

  /*
   * FECHAR MODAL
   */
  function handleClose() {
    setSelectedMember(null);
    setIsEditing(false);
  }

  return (
    <>
      <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-100">
        {/* =========================
            CABEÇALHO
        ========================= */}
        <div className="flex flex-col gap-4 border-b border-gray-100 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Equipe
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Profissionais cadastrados.
            </p>
          </div>

          {/* PESQUISA */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Pesquisar profissional..."
              className="
                h-10
                w-full
                rounded-xl
                border
                border-gray-200
                bg-gray-50
                pl-10
                pr-4
                text-sm
                text-gray-900
                outline-none
                transition
                placeholder:text-gray-400
                focus:border-gray-950
                focus:bg-white
              "
            />
          </div>
        </div>

        {/* =========================
            TABELA
        ========================= */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/70">
                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Profissional
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Cargo
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Telefone
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Status
                </th>

                <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Ações
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredTeam.map((member) => {
                const active = member.status === "Ativo";

                return (
                  <tr
                    key={member.id}
                    className="
                      border-b
                      border-gray-100
                      last:border-0
                      transition
                      hover:bg-gray-50/70
                    "
                  >
                    {/* =========================
                        PROFISSIONAL
                    ========================= */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {/* FOTO */}
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-100 ring-1 ring-gray-200">
                          {member.photo ? (
                            <img
                              src={member.photo}
                              alt={`Foto de ${member.name}`}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <span className="text-sm font-semibold text-gray-700">
                              {member.name
                                .charAt(0)
                                .toUpperCase()}
                            </span>
                          )}
                        </div>

                        {/* NOME + EMAIL */}
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-gray-900">
                            {member.name}
                          </p>

                          <p className="truncate text-xs text-gray-400">
                            {member.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* =========================
                        CARGO
                    ========================= */}
                    <td className="px-5 py-4">
                      <span className="text-sm text-gray-700">
                        {member.role}
                      </span>
                    </td>

                    {/* =========================
                        TELEFONE
                    ========================= */}
                    <td className="px-5 py-4">
                      <span className="text-sm text-gray-700">
                        {member.phone}
                      </span>
                    </td>

                    {/* =========================
                        STATUS
                    ========================= */}
                    <td className="px-5 py-4">
                      <span
                        className={`
                          inline-flex
                          rounded-full
                          px-2.5
                          py-1
                          text-xs
                          font-medium
                          ${
                            active
                              ? "bg-green-50 text-green-700"
                              : "bg-gray-100 text-gray-600"
                          }
                        `}
                      >
                        {member.status}
                      </span>
                    </td>

                    {/* =========================
                        AÇÕES
                    ========================= */}
                    <td className="px-5 py-4">
                      <div className="relative flex items-center justify-end gap-2">
                        {/* VER MAIS */}
                        <button
                          type="button"
                          onClick={() =>
                            handleView(member)
                          }
                          className="
                            inline-flex
                            items-center
                            gap-2
                            rounded-lg
                            border
                            border-gray-200
                            px-3
                            py-2
                            text-xs
                            font-medium
                            text-gray-700
                            transition
                            hover:bg-gray-50
                            hover:text-gray-950
                          "
                        >
                          <Eye className="h-4 w-4" />
                          Ver mais
                        </button>

                        {/* MAIS OPÇÕES */}
                        <button
                          type="button"
                          onClick={() =>
                            setOpenMenu(
                              openMenu === member.id
                                ? null
                                : member.id
                            )
                          }
                          className="
                            flex
                            h-9
                            w-9
                            items-center
                            justify-center
                            rounded-lg
                            text-gray-400
                            transition
                            hover:bg-gray-100
                            hover:text-gray-700
                          "
                          aria-label={`Mais opções para ${member.name}`}
                        >
                          <MoreHorizontal className="h-5 w-5" />
                        </button>

                        {/* MENU */}
                        {openMenu === member.id && (
                          <div
                            className="
                              absolute
                              right-0
                              top-11
                              z-30
                              w-40
                              overflow-hidden
                              rounded-xl
                              border
                              border-gray-200
                              bg-white
                              p-1
                              shadow-xl
                            "
                          >
                            {/* EDITAR */}
                            <button
                              type="button"
                              onClick={() =>
                                handleEdit(member)
                              }
                              className="
                                flex
                                w-full
                                items-center
                                gap-2
                                rounded-lg
                                px-3
                                py-2.5
                                text-sm
                                text-gray-700
                                transition
                                hover:bg-gray-50
                              "
                            >
                              <Pencil className="h-4 w-4" />
                              Editar
                            </button>

                            {/* EXCLUIR */}
                            <button
                              type="button"
                              onClick={() =>
                                handleDelete(member)
                              }
                              className="
                                flex
                                w-full
                                items-center
                                gap-2
                                rounded-lg
                                px-3
                                py-2.5
                                text-sm
                                text-red-600
                                transition
                                hover:bg-red-50
                              "
                            >
                              <Trash2 className="h-4 w-4" />
                              Excluir
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {/* =========================
                  SEM RESULTADOS
              ========================= */}
              {filteredTeam.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-12 text-center"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-700">
                        Nenhum profissional encontrado
                      </p>

                      <p className="mt-1 text-xs text-gray-400">
                        Tente pesquisar por outro nome, cargo,
                        telefone ou email.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* =========================
          DETALHES / EDIÇÃO
      ========================= */}
<TeamDetails
  member={selectedMember}
  isEditing={isEditing}
  onClose={handleClose}
  onStartEdit={handleEdit}
  onEdit={handleSaveEdit}
  onDelete={handleDelete}
/>
    </>
  );
}