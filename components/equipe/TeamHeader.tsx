
"use client";

import { useState } from "react";
import {
  Plus,
  X,
  UserPlus,
  Eye,
  EyeOff,
  KeyRound,
} from "lucide-react";

import type { TeamMember } from "./TeamList";

interface TeamHeaderProps {
  onMemberCreated: (member: TeamMember) => void;
}

export default function TeamHeader({
  onMemberCreated,
}: TeamHeaderProps) {
  const [open, setOpen] = useState(false);

  // ============================================================
  // DADOS DO PROFISSIONAL
  // ============================================================

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [specialty, setSpecialty] = useState("");

  // ============================================================
  // ACESSO AO SISTEMA
  // ============================================================

  const [createAccess, setCreateAccess] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  // ============================================================
  // ESTADOS
  // ============================================================

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ============================================================
  // RESET
  // ============================================================

  function resetForm() {
    setName("");
    setEmail("");
    setPhone("");
    setSpecialty("");

    setCreateAccess(false);
    setPassword("");
    setConfirmPassword("");

    setShowPassword(false);
    setShowConfirmPassword(false);

    setError("");
    setSuccess("");
  }

  // ============================================================
  // FECHAR MODAL
  // ============================================================

  function closeModal() {
    if (loading) return;

    setOpen(false);
    resetForm();
  }

  // ============================================================
  // SUBMIT
  // ============================================================

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");

    const cleanName = name.trim();
    const cleanEmail =
      email.trim().toLowerCase();
    const cleanPhone = phone.trim();
    const cleanSpecialty =
      specialty.trim();

    // ========================================================
    // VALIDAR CAMPOS
    // ========================================================

    if (!cleanName) {
      setError(
        "Digite o nome do profissional.",
      );
      return;
    }

    if (!cleanEmail) {
      setError(
        "Digite o email do profissional.",
      );
      return;
    }

    if (!cleanPhone) {
      setError(
        "Digite o telefone do profissional.",
      );
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
    // VALIDAR ACESSO
    // ========================================================

    if (createAccess) {
      if (!password) {
        setError(
          "Digite uma palavra-passe.",
        );
        return;
      }

      if (password.length < 8) {
        setError(
          "A palavra-passe deve ter pelo menos 8 caracteres.",
        );
        return;
      }

      if (!confirmPassword) {
        setError(
          "Confirme a palavra-passe.",
        );
        return;
      }

      if (
        password !== confirmPassword
      ) {
        setError(
          "As palavras-passe não coincidem.",
        );
        return;
      }
    }

    // ========================================================
    // ENVIAR PARA API
    // ========================================================

    try {
      setLoading(true);

      const response = await fetch(
        "/api/professionals",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            name: cleanName,
            email: cleanEmail,
            phone: cleanPhone,
            specialty: cleanSpecialty,

            createAccess,

            ...(createAccess && {
              password,
            }),
          }),
        },
      );

      const data =
        await response.json();

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
      // NORMALIZAR
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
          professional.active ===
          true,

        emailVerified:
          professional.emailVerified ===
          true,

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
      // MENSAGEM DE SUCESSO
      // ======================================================

      setSuccess(
        data?.message ||
          "Profissional cadastrado com sucesso.",
      );

      // ======================================================
      // LIMPAR CAMPOS
      // ======================================================

      setName("");
      setEmail("");
      setPhone("");
      setSpecialty("");

      setCreateAccess(false);
      setPassword("");
      setConfirmPassword("");

      // ======================================================
      // FECHAR MODAL
      // ======================================================

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

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <>
      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4">
          <div className="my-8 w-full max-w-lg rounded-3xl bg-white shadow-2xl">
            {/* ==================================================
                HEADER MODAL
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

              {/* =================================================
                  NOME
              ================================================= */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Nome
                </label>

                <input
                  type="text"
                  value={name}
                  onChange={(event) =>
                    setName(
                      event.target.value,
                    )
                  }
                  placeholder="Nome completo"
                  disabled={loading}
                  autoComplete="name"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-blue-500 disabled:bg-gray-100"
                />
              </div>

              {/* =================================================
                  EMAIL
              ================================================= */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Email
                </label>

                <input
                  type="email"
                  value={email}
                  onChange={(event) =>
                    setEmail(
                      event.target.value,
                    )
                  }
                  placeholder="profissional@email.com"
                  disabled={loading}
                  autoComplete="email"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-blue-500 disabled:bg-gray-100"
                />
              </div>

              {/* =================================================
                  TELEFONE
              ================================================= */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Telefone
                </label>

                <input
                  type="tel"
                  value={phone}
                  onChange={(event) =>
                    setPhone(
                      event.target.value,
                    )
                  }
                  placeholder="+244 9XX XXX XXX"
                  disabled={loading}
                  autoComplete="tel"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-blue-500 disabled:bg-gray-100"
                />
              </div>

              {/* =================================================
                  ESPECIALIDADE
              ================================================= */}

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

              {/* =================================================
                  ACESSO AO SISTEMA
              ================================================= */}

              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white">
                    <KeyRound
                      size={18}
                      className="text-gray-600"
                    />
                  </div>

                  <div className="flex-1">
                    <label className="flex cursor-pointer items-start gap-3">
                      <input
                        type="checkbox"
                        checked={createAccess}
                        disabled={loading}
                        onChange={(event) => {
                          setCreateAccess(
                            event.target
                              .checked,
                          );

                          if (
                            !event.target
                              .checked
                          ) {
                            setPassword("");
                            setConfirmPassword("");
                            setShowPassword(false);
                            setShowConfirmPassword(
                              false,
                            );
                          }
                        }}
                        className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />

                      <span>
                        <span className="block text-sm font-semibold text-gray-800">
                          Dar acesso ao sistema
                        </span>

                        <span className="mt-1 block text-xs leading-5 text-gray-500">
                          Permitir que este profissional
                          entre no sistema como funcionário.
                        </span>
                      </span>
                    </label>
                  </div>
                </div>

                {/* =================================================
                    SENHAS
                ================================================= */}

                {createAccess && (
                  <div className="mt-5 space-y-4 border-t border-gray-200 pt-5">
                    {/* SENHA */}

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-gray-700">
                        Palavra-passe
                      </label>

                      <div className="relative">
                        <input
                          type={
                            showPassword
                              ? "text"
                              : "password"
                          }
                          value={password}
                          onChange={(event) =>
                            setPassword(
                              event.target.value,
                            )
                          }
                          placeholder="Mínimo de 8 caracteres"
                          disabled={loading}
                          autoComplete="new-password"
                          className="w-full rounded-xl border border-gray-200 px-4 py-3 pr-12 outline-none transition focus:border-blue-500 disabled:bg-gray-100"
                        />

                        <button
                          type="button"
                          tabIndex={-1}
                          onClick={() =>
                            setShowPassword(
                              (current) =>
                                !current,
                            )
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                        >
                          {showPassword ? (
                            <EyeOff
                              size={18}
                            />
                          ) : (
                            <Eye
                              size={18}
                            />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* CONFIRMAR SENHA */}

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-gray-700">
                        Confirmar palavra-passe
                      </label>

                      <div className="relative">
                        <input
                          type={
                            showConfirmPassword
                              ? "text"
                              : "password"
                          }
                          value={
                            confirmPassword
                          }
                          onChange={(event) =>
                            setConfirmPassword(
                              event.target.value,
                            )
                          }
                          placeholder="Digite novamente"
                          disabled={loading}
                          autoComplete="new-password"
                          className="w-full rounded-xl border border-gray-200 px-4 py-3 pr-12 outline-none transition focus:border-blue-500 disabled:bg-gray-100"
                        />

                        <button
                          type="button"
                          tabIndex={-1}
                          onClick={() =>
                            setShowConfirmPassword(
                              (current) =>
                                !current,
                            )
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                        >
                          {showConfirmPassword ? (
                            <EyeOff
                              size={18}
                            />
                          ) : (
                            <Eye
                              size={18}
                            />
                          )}
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-gray-500">
                      O profissional será criado com
                      o perfil <strong>EMPLOYEE</strong>{" "}
                      e poderá utilizar essas credenciais
                      para entrar no sistema.
                    </p>
                  </div>
                )}
              </div>

              {/* =================================================
                  BOTÕES
              ================================================= */}

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

