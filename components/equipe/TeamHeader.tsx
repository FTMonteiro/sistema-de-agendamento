
"use client";

import { useState } from "react";
import { Plus, X, UserPlus } from "lucide-react";

import type { TeamMember } from "./TeamList";

interface TeamHeaderProps {
  onMemberCreated: (member: TeamMember) => void;
}

export default function TeamHeader({
  onMemberCreated,
}: TeamHeaderProps) {
  const [open, setOpen] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [specialty, setSpecialty] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function resetForm() {
    setName("");
    setEmail("");
    setPhone("");
    setSpecialty("");
    setError("");
    setSuccess("");
  }

  function closeModal() {
    if (loading) return;

    setOpen(false);
    resetForm();
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.trim();
    const cleanSpecialty = specialty.trim();

    // ========================================================
    // VALIDAR CAMPOS
    // ========================================================

    if (!cleanName) {
      setError("Digite o nome do profissional.");
      return;
    }

    if (!cleanEmail) {
      setError("Digite o email do profissional.");
      return;
    }

    if (!cleanPhone) {
      setError("Digite o telefone do profissional.");
      return;
    }

    if (!cleanSpecialty) {
      setError(
        "Digite a especialidade do profissional.",
      );
      return;
    }

    // ========================================================
    // VALIDAR EMAIL
    // ========================================================

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(cleanEmail)) {
      setError("Digite um email válido.");
      return;
    }

    // ========================================================
    // ENVIAR PARA A API
    // ========================================================
    //
    // NÃO enviamos businessId.
    //
    // A API pega o businessId através do utilizador
    // autenticado pela sessão.
    //
    // ========================================================

    try {
      setLoading(true);

      const response = await fetch(
        "/api/professionals",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: cleanName,
            email: cleanEmail,
            phone: cleanPhone,
            specialty: cleanSpecialty,
          }),
        },
      );

      const data = await response.json();

      // ======================================================
      // ERRO DA API
      // ======================================================

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "Não foi possível cadastrar o profissional.",
        );
      }

      // ======================================================
      // PROFISSIONAL CRIADO
      // ======================================================

      const professional =
        data?.professional;

      if (!professional) {
        throw new Error(
          "A API não retornou os dados do profissional.",
        );
      }

      // ======================================================
      // NORMALIZAR PARA TeamMember
      // ======================================================

      const member: TeamMember = {
        id: String(
          professional.id ?? "",
        ),

        name: String(
          professional.name ?? "",
        ),

        email: String(
          professional.email ?? "",
        ),

        phone: String(
          professional.phone ?? "",
        ),

        specialty: String(
          professional.specialty ?? "",
        ),

        active:
          professional.active === true,

        emailVerified:
          professional.emailVerified === true,

        businessId: String(
          professional.businessId ?? "",
        ),

        createdAt: String(
          professional.createdAt ?? "",
        ),

        updatedAt: String(
          professional.updatedAt ?? "",
        ),
      };

      // ======================================================
      // ATUALIZAR LISTA
      // ======================================================

      onMemberCreated(member);

      // ======================================================
      // SUCESSO
      // ======================================================

      setSuccess(
        "Profissional cadastrado com sucesso.",
      );

      // Limpar campos
      setName("");
      setEmail("");
      setPhone("");
      setSpecialty("");

      // Fechar modal depois de um pequeno intervalo
      setTimeout(() => {
        setOpen(false);
        setSuccess("");
      }, 2500);
    } catch (error) {
      console.error(
        "Erro ao cadastrar profissional:",
        error,
      );

      setError(
        error instanceof Error
          ? error.message
          : "Erro ao cadastrar profissional.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-medium text-blue-600">
            Gestão
          </p>

          <h1 className="mt-1 text-2xl font-bold text-gray-950">
            Equipe
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Gerencie os profissionais do seu estabelecimento.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setError("");
            setSuccess("");
            setOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          <Plus size={18} />

          Novo profissional
        </button>
      </div>

      {/* ======================================================
          MODAL
      ====================================================== */}

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white shadow-2xl">

            {/* ==================================================
                HEADER DO MODAL
            ================================================== */}

            <div className="flex items-center justify-between border-b border-gray-100 p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50">
                  <UserPlus
                    size={21}
                    className="text-blue-600"
                  />
                </div>

                <div>
                  <h2 className="text-xl font-bold text-gray-950">
                    Novo profissional
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Preencha todos os campos.
                  </p>
                </div>
              </div>

              <button
                type="button"
                disabled={loading}
                onClick={closeModal}
                className="rounded-xl p-2 text-gray-500 transition hover:bg-gray-100 disabled:opacity-50"
              >
                <X size={20} />
              </button>
            </div>

            {/* ==================================================
                FORMULÁRIO
            ================================================== */}

            <form
              onSubmit={handleSubmit}
              className="space-y-5 p-6"
            >
              {/* ERRO */}

              {error && (
                <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm font-medium text-red-700">
                  {error}
                </div>
              )}

              {/* SUCESSO */}

              {success && (
                <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-sm font-medium text-emerald-700">
                  {success}
                </div>
              )}

              {/* ==================================================
                  NOME
              ================================================== */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Nome
                </label>

                <input
                  type="text"
                  value={name}
                  onChange={(event) =>
                    setName(event.target.value)
                  }
                  placeholder="Nome completo"
                  disabled={loading}
                  autoComplete="name"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-blue-500 disabled:bg-gray-100"
                />
              </div>

              {/* ==================================================
                  EMAIL
              ================================================== */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Email
                </label>

                <input
                  type="email"
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  placeholder="profissional@email.com"
                  disabled={loading}
                  autoComplete="email"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-blue-500 disabled:bg-gray-100"
                />
              </div>

              {/* ==================================================
                  TELEFONE
              ================================================== */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Telefone
                </label>

                <input
                  type="tel"
                  value={phone}
                  onChange={(event) =>
                    setPhone(event.target.value)
                  }
                  placeholder="+244 9XX XXX XXX"
                  disabled={loading}
                  autoComplete="tel"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-blue-500 disabled:bg-gray-100"
                />
              </div>

              {/* ==================================================
                  ESPECIALIDADE
              ================================================== */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Especialidade
                </label>

                <input
                  type="text"
                  value={specialty}
                  onChange={(event) =>
                    setSpecialty(
                      event.target.value,
                    )
                  }
                  placeholder="Barbeiro, cabeleireiro..."
                  disabled={loading}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-blue-500 disabled:bg-gray-100"
                />
              </div>

              {/* ==================================================
                  BOTÕES
              ================================================== */}

              <div className="flex justify-end gap-3 border-t border-gray-100 pt-5">
                <button
                  type="button"
                  disabled={loading}
                  onClick={closeModal}
                  className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading
                    ? "A cadastrar..."
                    : "Cadastrar profissional"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

