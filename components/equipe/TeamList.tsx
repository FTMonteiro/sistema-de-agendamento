"use client";

import { useMemo, useState } from "react";

import {
  Search,
  MoreHorizontal,
  Pencil,
  Trash2,
  Power,
  X,
  Save,
} from "lucide-react";

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  specialty: string;
  active: boolean;
  emailVerified: boolean;
  businessId: string;
  createdAt: string;
  updatedAt: string;
}

interface TeamListProps {
  members: TeamMember[];

  onUpdateMember: (
    member: TeamMember,
  ) => void;

  onDeleteMember: (id: string) => void;
}

export default function TeamList({
  members,
  onUpdateMember,
  onDeleteMember,
}: TeamListProps) {
  const [query, setQuery] = useState("");

  const [openMenu, setOpenMenu] =
    useState<string | null>(null);

  const [editingMember, setEditingMember] =
    useState<TeamMember | null>(null);

  const [deletingMember, setDeletingMember] =
    useState<TeamMember | null>(null);

  const [loadingId, setLoadingId] =
    useState<string | null>(null);

  const [editName, setEditName] =
    useState("");

  const [editEmail, setEditEmail] =
    useState("");

  const [editPhone, setEditPhone] =
    useState("");

  const [editSpecialty, setEditSpecialty] =
    useState("");

  const [error, setError] =
    useState("");

  const filteredMembers = useMemo(() => {
    const normalized =
      query.trim().toLowerCase();

    if (!normalized) {
      return members;
    }

    return members.filter((member) => {
      return (
        member.name
          .toLowerCase()
          .includes(normalized) ||
        member.email
          .toLowerCase()
          .includes(normalized) ||
        member.phone
          .toLowerCase()
          .includes(normalized) ||
        member.specialty
          .toLowerCase()
          .includes(normalized)
      );
    });
  }, [members, query]);

  function openEdit(member: TeamMember) {
    setEditingMember(member);

    setEditName(member.name);
    setEditEmail(member.email);
    setEditPhone(member.phone);
    setEditSpecialty(member.specialty);

    setOpenMenu(null);
    setError("");
  }

  async function handleEdit() {
    if (!editingMember) return;

    setError("");

    const name = editName.trim();
    const email = editEmail
      .trim()
      .toLowerCase();

    if (!name) {
      setError("Digite o nome.");
      return;
    }

    if (!email) {
      setError("Digite o email.");
      return;
    }

    if (!editPhone.trim()) {
      setError("Digite o telefone.");
      return;
    }

    if (!editSpecialty.trim()) {
      setError("Digite a especialidade.");
      return;
    }

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      setError("Digite um email válido.");
      return;
    }

    try {
      setLoadingId(editingMember.id);

      const response = await fetch(
        `/api/professionals/${editingMember.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            email,
            phone: editPhone.trim(),
            specialty: editSpecialty.trim(),
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "Não foi possível editar.",
        );
      }

      onUpdateMember({
        ...data,
        email: data.email ?? "",
        phone: data.phone ?? "",
        specialty: data.specialty ?? "",
        active: data.active === true,
        emailVerified:
          data.emailVerified === true,
      });

      setEditingMember(null);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Erro ao editar.",
      );
    } finally {
      setLoadingId(null);
    }
  }

  async function handleToggleActive(
    member: TeamMember,
  ) {
    try {
      setLoadingId(member.id);
      setOpenMenu(null);

      const response = await fetch(
        `/api/professionals/${member.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            active: !member.active,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "Não foi possível alterar o estado.",
        );
      }

      onUpdateMember({
        ...member,
        ...data,
        active: data.active === true,
      });
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Erro ao alterar estado.",
      );
    } finally {
      setLoadingId(null);
    }
  }

  async function handleDelete() {
    if (!deletingMember) return;

    try {
      setLoadingId(deletingMember.id);

      const response = await fetch(
        `/api/professionals/${deletingMember.id}`,
        {
          method: "DELETE",
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "Não foi possível excluir.",
        );
      }

      onDeleteMember(deletingMember.id);

      setDeletingMember(null);
      setOpenMenu(null);
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Erro ao excluir.",
      );
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <>
      <section className="rounded-3xl border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-gray-100 p-5 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-950">
              Profissionais
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Profissionais cadastrados.
            </p>
          </div>

          <div className="relative w-full md:w-80">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              value={query}
              onChange={(event) =>
                setQuery(event.target.value)
              }
              placeholder="Pesquisar profissional..."
              className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:bg-white"
            />
          </div>
        </div>

        <div className="divide-y divide-gray-100">
          {filteredMembers.length === 0 ? (
            <div className="p-10 text-center">
              <p className="font-medium text-gray-700">
                Nenhum profissional encontrado.
              </p>

              <p className="mt-1 text-sm text-gray-500">
                Adicione um profissional ou
                tente outra pesquisa.
              </p>
            </div>
          ) : (
            filteredMembers.map((member) => {
              const isLoading =
                loadingId === member.id;

              return (
                <div
                  key={member.id}
                  className="flex items-center justify-between gap-4 p-5 transition hover:bg-gray-50"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="font-semibold text-gray-950">
                        {member.name}
                      </h3>

                      {member.active ? (
                        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                          Ativo
                        </span>
                      ) : (
                        <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-500">
                          Inativo
                        </span>
                      )}

                      {member.email &&
                        (member.emailVerified ? (
                          <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                            Email verificado
                          </span>
                        ) : (
                          <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                            Email não verificado
                          </span>
                        ))}
                    </div>

                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
                      {member.email && (
                        <span>{member.email}</span>
                      )}

                      {member.phone && (
                        <span>{member.phone}</span>
                      )}

                      {member.specialty && (
                        <span>
                          {member.specialty}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* TRÊS PONTOS */}

                  <div className="relative shrink-0">
                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={() =>
                        setOpenMenu(
                          openMenu === member.id
                            ? null
                            : member.id,
                        )
                      }
                      aria-label="Abrir ações"
                      className="rounded-xl p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 disabled:opacity-50"
                    >
                      <MoreHorizontal
                        size={22}
                      />
                    </button>

                    {openMenu === member.id && (
                      <div className="absolute right-0 top-11 z-50 w-48 rounded-2xl border border-gray-200 bg-white p-2 shadow-xl">
                        <button
                          type="button"
                          onClick={() =>
                            openEdit(member)
                          }
                          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                          <Pencil size={16} />
                          Editar
                        </button>

                        <button
                          type="button"
                          disabled={isLoading}
                          onClick={() =>
                            handleToggleActive(
                              member,
                            )
                          }
                          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                        >
                          <Power size={16} />

                          {member.active
                            ? "Desativar"
                            : "Ativar"}
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setDeletingMember(
                              member,
                            );
                            setOpenMenu(null);
                          }}
                          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-red-600 hover:bg-red-50"
                        >
                          <Trash2 size={16} />
                          Excluir
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* ==============================
          MODAL EDITAR
      ============================== */}

      {editingMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 p-6">
              <div>
                <h2 className="text-xl font-bold text-gray-950">
                  Editar profissional
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Atualize os dados.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setEditingMember(null)
                }
                className="rounded-xl p-2 text-gray-500 hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-5 p-6">
              {error && (
                <div className="rounded-xl bg-red-50 p-4 text-sm font-medium text-red-700">
                  {error}
                </div>
              )}

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Nome
                </label>

                <input
                  value={editName}
                  onChange={(event) =>
                    setEditName(
                      event.target.value,
                    )
                  }
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Email
                </label>

                <input
                  type="email"
                  value={editEmail}
                  onChange={(event) =>
                    setEditEmail(
                      event.target.value,
                    )
                  }
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Telefone
                </label>

                <input
                  value={editPhone}
                  onChange={(event) =>
                    setEditPhone(
                      event.target.value,
                    )
                  }
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Especialidade
                </label>

                <input
                  value={editSpecialty}
                  onChange={(event) =>
                    setEditSpecialty(
                      event.target.value,
                    )
                  }
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-gray-100 p-6">
              <button
                type="button"
                onClick={() =>
                  setEditingMember(null)
                }
                className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={handleEdit}
                disabled={
                  loadingId === editingMember.id
                }
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
              >
                <Save size={16} />

                {loadingId === editingMember.id
                  ? "A guardar..."
                  : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==============================
          MODAL EXCLUIR
      ============================== */}

      {deletingMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
              <Trash2
                size={22}
                className="text-red-600"
              />
            </div>

            <h2 className="mt-5 text-xl font-bold text-gray-950">
              Excluir profissional?
            </h2>

            <p className="mt-2 text-sm leading-6 text-gray-500">
              Tem certeza que deseja excluir{" "}
              <strong className="text-gray-800">
                {deletingMember.name}
              </strong>
              ?
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() =>
                  setDeletingMember(null)
                }
                className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={handleDelete}
                disabled={
                  loadingId ===
                  deletingMember.id
                }
                className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
              >
                {loadingId ===
                deletingMember.id
                  ? "A excluir..."
                  : "Sim, excluir"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}