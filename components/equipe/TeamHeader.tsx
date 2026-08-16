"use client";

import { ChangeEvent, FormEvent, useState } from "react";

import { TeamMember } from "@/data/Team";

interface TeamHeaderProps {
  onAddMember: (member: TeamMember) => void;
}

export function TeamHeader({ onAddMember }: TeamHeaderProps) {
  const [showModal, setShowModal] = useState(false);

  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [photo, setPhoto] = useState("");

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function resetForm() {
    setName("");
    setRole("");
    setPhone("");
    setEmail("");
    setPhoto("");
    setError("");
  }

  function closeModal() {
    if (isSubmitting) return;

    setShowModal(false);
    resetForm();
  }

  function handlePhotoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Selecione uma imagem válida.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("A fotografia deve ter no máximo 5 MB.");
      return;
    }

    const imageUrl = URL.createObjectURL(file);

    setPhoto(imageUrl);
    setError("");
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");

    if (!name.trim()) {
      setError("Informe o nome completo.");
      return;
    }

    if (!role.trim()) {
      setError("Informe o cargo.");
      return;
    }

    if (!phone.trim()) {
      setError("Informe o telefone.");
      return;
    }

    if (!email.trim()) {
      setError("Informe o email.");
      return;
    }

    setIsSubmitting(true);

    const member: TeamMember = {
      id: Date.now(),
      name: name.trim(),
      role: role.trim(),
      phone: phone.trim(),
      email: email.trim(),
      photo,
      status: "Ativo",
    };

    // Envia o novo profissional para a página
    onAddMember(member);

    setTimeout(() => {
      setIsSubmitting(false);
      setShowModal(false);
      resetForm();
    }, 250);
  }

  return (
    <>
      {/* HEADER */}
      <header className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">Gestão da equipe</p>

          <h1 className="mt-1 text-2xl font-bold tracking-tight text-gray-950 sm:text-3xl">
            Equipe
          </h1>

          <p className="mt-2 max-w-xl text-sm leading-6 text-gray-500">
            Gerencie os profissionais, cargos e informações da sua equipe.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="
            inline-flex
            h-11
            items-center
            justify-center
            gap-2
            rounded-xl
            bg-gray-950
            px-5
            text-sm
            font-semibold
            text-white
            shadow-sm
            transition-all
            duration-200
            hover:bg-gray-800
            hover:shadow-md
            active:scale-[0.98]
            focus:outline-none
            focus:ring-2
            focus:ring-gray-950
            focus:ring-offset-2
          "
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M15 14a5 5 0 0 0-10 0" />
            <circle cx="10" cy="7" r="4" />
            <path d="M19 8v6" />
            <path d="M22 11h-6" />
          </svg>
          Novo profissional
        </button>
      </header>

      {/* MODAL */}
      {showModal && (
        <div
          className="
            fixed
            inset-0
            z-50
            flex
            items-center
            justify-center
            bg-black/50
            p-4
            backdrop-blur-sm
          "
          onClick={closeModal}
        >
          <div
            className="
              max-h-[90vh]
              w-full
              max-w-lg
              overflow-y-auto
              rounded-2xl
              bg-white
              shadow-2xl
            "
            onClick={(event) => event.stopPropagation()}
          >
            {/* MODAL HEADER */}
            <div className="flex items-start justify-between border-b border-gray-100 px-6 py-5">
              <div>
                <h2 className="text-xl font-bold text-gray-950">
                  Novo profissional
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Adicione um novo membro à sua equipe.
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-900"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="space-y-5 px-6 py-6">
                {/* FOTOGRAFIA */}
                <div>
                  <label className="mb-3 block text-sm font-semibold text-gray-700">
                    Fotografia
                  </label>

                  <div className="flex items-center gap-4">
                    <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-100 ring-1 ring-gray-200">
                      {photo ? (
                        <img
                          src={photo}
                          alt="Pré-visualização"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <svg
                          width="28"
                          height="28"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          className="text-gray-400"
                        >
                          <circle cx="12" cy="8" r="4" />
                          <path d="M4 21a8 8 0 0 1 16 0" />
                        </svg>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="team-photo"
                        className="
                          inline-flex
                          cursor-pointer
                          items-center
                          gap-2
                          rounded-xl
                          border
                          border-gray-200
                          px-4
                          py-2.5
                          text-sm
                          font-medium
                          text-gray-700
                          transition
                          hover:border-gray-300
                          hover:bg-gray-50
                        "
                      >
                        <svg
                          width="17"
                          height="17"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M14.5 4h-5L7.8 7H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-2.8z" />
                          <circle cx="12" cy="13" r="3" />
                        </svg>

                        {photo ? "Alterar fotografia" : "Adicionar fotografia"}
                      </label>

                      <input
                        id="team-photo"
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        onChange={handlePhotoChange}
                        className="hidden"
                      />

                      <p className="mt-2 text-xs text-gray-400">
                        JPG, PNG ou WebP · Máx. 5 MB
                      </p>
                    </div>
                  </div>
                </div>

                {/* NOME */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Nome completo
                  </label>

                  <input
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Ex: João Silva"
                    className="h-11 w-full rounded-xl border border-gray-200 px-4 text-sm outline-none transition placeholder:text-gray-400 hover:border-gray-300 focus:border-gray-950 focus:ring-4 focus:ring-gray-100"
                  />
                </div>

                {/* CARGO */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Cargo
                  </label>

                  <input
                    value={role}
                    onChange={(event) => setRole(event.target.value)}
                    placeholder="Ex: Barbeiro"
                    className="h-11 w-full rounded-xl border border-gray-200 px-4 text-sm outline-none transition placeholder:text-gray-400 hover:border-gray-300 focus:border-gray-950 focus:ring-4 focus:ring-gray-100"
                  />
                </div>

                {/* TELEFONE + EMAIL */}
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Telefone
                    </label>

                    <input
                      type="tel"
                      value={phone}
                      onChange={(event) => setPhone(event.target.value)}
                      placeholder="+244 900 000 000"
                      className="h-11 w-full rounded-xl border border-gray-200 px-4 text-sm outline-none transition placeholder:text-gray-400 focus:border-gray-950 focus:ring-4 focus:ring-gray-100"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Email
                    </label>

                    <input
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="profissional@email.com"
                      className="h-11 w-full rounded-xl border border-gray-200 px-4 text-sm outline-none transition placeholder:text-gray-400 focus:border-gray-950 focus:ring-4 focus:ring-gray-100"
                    />
                  </div>
                </div>

                {/* ERRO */}
                {error && (
                  <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                    {error}
                  </div>
                )}
              </div>

              {/* FOOTER */}
              <div className="flex justify-end gap-3 border-t border-gray-100 bg-gray-50/50 px-6 py-4">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={isSubmitting}
                  className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex min-w-[170px] items-center justify-center gap-2 rounded-xl bg-gray-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Adicionando...
                    </>
                  ) : (
                    <>
                      <svg
                        width="17"
                        height="17"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M12 5v14" />
                        <path d="M5 12h14" />
                      </svg>
                      Adicionar profissional
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
