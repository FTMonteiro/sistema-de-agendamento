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

  return (
    <>
      {/* Header */}

      <div className="flex items-center justify-between">

        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Clientes
          </h1>

          <p className="mt-2 text-gray-500">
            Gerencie os clientes do seu estabelecimento.
          </p>
        </div>

        {/* ESTE É O BOTÃO QUE JÁ TENS */}

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="
            rounded-xl
            bg-black
            px-5
            py-3
            text-sm
            font-medium
            text-white
            transition
            hover:bg-gray-800
          "
        >
          + Novo Cliente
        </button>

      </div>


      {/* MODAL */}

      {isModalOpen && (
        <div
          className="
            fixed
            inset-0
            z-50
            flex
            items-center
            justify-center
            bg-black/40
            p-4
          "
          onClick={() => setIsModalOpen(false)}
        >

          <div
            className="
              w-full
              max-w-md
              rounded-2xl
              bg-white
              p-6
              shadow-2xl
            "
            onClick={(event) => event.stopPropagation()}
          >

            {/* Modal Header */}

            <div className="mb-6 flex items-start justify-between">

              <div>

                <h2 className="text-xl font-semibold">
                  Novo Cliente
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Adicione um novo cliente.
                </p>

              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="
                  flex
                  h-8
                  w-8
                  items-center
                  justify-center
                  rounded-lg
                  text-xl
                  text-gray-400
                  hover:bg-gray-100
                  hover:text-black
                "
              >
                ×
              </button>

            </div>


            {/* Formulário */}

            <form
              onSubmit={handleSubmit}
              className="space-y-4"
            >

              {/* Nome */}

              <div>

                <label className="mb-2 block text-sm font-medium">
                  Nome
                </label>

                <input
                  type="text"
                  value={name}
                  onChange={(event) =>
                    setName(event.target.value)
                  }
                  placeholder="Nome completo"
                  required
                  className="
                    w-full
                    rounded-xl
                    border
                    border-gray-200
                    px-4
                    py-3
                    outline-none
                    focus:border-black
                  "
                />

              </div>


              {/* Telefone */}

              <div>

                <label className="mb-2 block text-sm font-medium">
                  Telefone
                </label>

                <input
                  type="tel"
                  value={phone}
                  onChange={(event) =>
                    setPhone(event.target.value)
                  }
                  placeholder="923 000 111"
                  required
                  className="
                    w-full
                    rounded-xl
                    border
                    border-gray-200
                    px-4
                    py-3
                    outline-none
                    focus:border-black
                  "
                />

              </div>


              {/* Email */}

              <div>

                <label className="mb-2 block text-sm font-medium">
                  Email
                </label>

                <input
                  type="email"
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  placeholder="cliente@email.com"
                  required
                  className="
                    w-full
                    rounded-xl
                    border
                    border-gray-200
                    px-4
                    py-3
                    outline-none
                    focus:border-black
                  "
                />

              </div>


              {/* Botões */}

              <div className="flex justify-end gap-3 pt-4">

                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="
                    rounded-xl
                    border
                    border-gray-200
                    px-5
                    py-3
                    text-sm
                    font-medium
                    hover:bg-gray-50
                  "
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="
                    rounded-xl
                    bg-black
                    px-5
                    py-3
                    text-sm
                    font-medium
                    text-white
                    hover:bg-gray-800
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