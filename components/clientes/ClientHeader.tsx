
"use client";

import { useState } from "react";

export function ClientHeader() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    console.log({
      name,
      phone,
      email,
    });

    setName("");
    setPhone("");
    setEmail("");
    setIsModalOpen(false);
  }

  function closeModal() {
    setIsModalOpen(false);
  }

  return (
    <>
      {/* Header da página */}
      <section className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        {/* Título */}
        <div>
          <p className="mb-2 text-sm font-medium text-blue-600">
            Gestão
          </p>

          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            Clientes
          </h1>

          <p className="mt-2 max-w-xl text-sm text-gray-500 sm:text-base">
            Gerencie os clientes, informações e histórico do seu
            estabelecimento.
          </p>
        </div>

        {/* Ação principal */}
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="
            inline-flex
            w-full
            items-center
            justify-center
            gap-2
            rounded-xl
            bg-blue-600
            px-5
            py-3
            text-sm
            font-semibold
            text-white
            shadow-sm
            transition-all
            duration-200
            hover:bg-blue-700
            hover:shadow-md
            active:scale-[0.98]
            sm:w-auto
          "
        >
          <span className="text-lg leading-none">+</span>
          Novo Cliente
        </button>
      </section>

      {/* Modal */}
      {isModalOpen && (
        <div
          className="
            fixed
            inset-0
            z-50
            flex
            items-center
            justify-center
            bg-gray-950/50
            p-4
            backdrop-blur-sm
          "
          onClick={closeModal}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="new-client-title"
            className="
              w-full
              max-w-lg
              overflow-hidden
              rounded-2xl
              bg-white
              shadow-2xl
              ring-1
              ring-black/5
            "
            onClick={(event) => event.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between px-5 py-5 sm:px-6">
              <div>
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <span className="text-lg font-semibold">+</span>
                </div>

                <h2
                  id="new-client-title"
                  className="text-xl font-semibold tracking-tight text-gray-900"
                >
                  Novo Cliente
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Preencha os dados para cadastrar um novo cliente.
                </p>
              </div>

              {/* Fechar */}
              <button
                type="button"
                onClick={closeModal}
                aria-label="Fechar modal"
                className="
                  flex
                  h-9
                  w-9
                  shrink-0
                  items-center
                  justify-center
                  rounded-lg
                  text-xl
                  text-gray-400
                  transition-colors
                  hover:bg-gray-100
                  hover:text-gray-900
                "
              >
                ×
              </button>
            </div>

            {/* Linha visual */}
            <div className="h-px bg-gray-100" />

            {/* Formulário */}
            <form
              onSubmit={handleSubmit}
              className="space-y-5 px-5 py-6 sm:px-6"
            >
              {/* Nome */}
              <div>
                <label
                  htmlFor="client-name"
                  className="mb-2 block text-sm font-medium text-gray-800"
                >
                  Nome completo
                </label>

                <input
                  id="client-name"
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Ex.: João Silva"
                  required
                  autoComplete="name"
                  className="
                    w-full
                    rounded-xl
                    border
                    border-gray-200
                    bg-white
                    px-4
                    py-3
                    text-sm
                    text-gray-900
                    outline-none
                    transition-all
                    placeholder:text-gray-400
                    focus:border-blue-500
                    focus:ring-4
                    focus:ring-blue-500/10
                  "
                />
              </div>

              {/* Telefone */}
              <div>
                <label
                  htmlFor="client-phone"
                  className="mb-2 block text-sm font-medium text-gray-800"
                >
                  Telefone
                </label>

                <input
                  id="client-phone"
                  type="tel"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  placeholder="923 000 111"
                  required
                  autoComplete="tel"
                  className="
                    w-full
                    rounded-xl
                    border
                    border-gray-200
                    bg-white
                    px-4
                    py-3
                    text-sm
                    text-gray-900
                    outline-none
                    transition-all
                    placeholder:text-gray-400
                    focus:border-blue-500
                    focus:ring-4
                    focus:ring-blue-500/10
                  "
                />
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="client-email"
                  className="mb-2 block text-sm font-medium text-gray-800"
                >
                  Email
                </label>

                <input
                  id="client-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="cliente@email.com"
                  required
                  autoComplete="email"
                  className="
                    w-full
                    rounded-xl
                    border
                    border-gray-200
                    bg-white
                    px-4
                    py-3
                    text-sm
                    text-gray-900
                    outline-none
                    transition-all
                    placeholder:text-gray-400
                    focus:border-blue-500
                    focus:ring-4
                    focus:ring-blue-500/10
                  "
                />
              </div>

              {/* Ações */}
              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  className="
                    w-full
                    rounded-xl
                    border
                    border-gray-200
                    bg-white
                    px-5
                    py-3
                    text-sm
                    font-semibold
                    text-gray-700
                    transition-colors
                    hover:bg-gray-50
                    sm:w-auto
                  "
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="
                    w-full
                    rounded-xl
                    bg-blue-600
                    px-5
                    py-3
                    text-sm
                    font-semibold
                    text-white
                    shadow-sm
                    transition-all
                    duration-200
                    hover:bg-blue-700
                    hover:shadow-md
                    active:scale-[0.98]
                    sm:w-auto
                  "
                >
                  Criar Cliente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

