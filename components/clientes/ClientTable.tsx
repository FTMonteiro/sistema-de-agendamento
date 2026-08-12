"use client";

import { useState } from "react";
import { clients as initialClients } from "@/data/Clients";

type Client = (typeof initialClients)[number];

export function ClientTable() {
  const [clients, setClients] = useState<Client[]>(initialClients);

  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const [selectedClient, setSelectedClient] =
    useState<Client | null>(null);

  const [viewingClient, setViewingClient] =
    useState<Client | null>(null);

  const [editingClient, setEditingClient] =
    useState<Client | null>(null);

  const [deletingClient, setDeletingClient] =
    useState<Client | null>(null);

  const [showAll, setShowAll] = useState(false);

  const visibleClients = showAll
    ? clients
    : clients.slice(0, 5);

  // =====================================================
  // EDITAR CLIENTE
  // =====================================================

  function handleSaveEdit() {
    if (!editingClient) return;

    setClients((currentClients) =>
      currentClients.map((client) =>
        client.id === editingClient.id
          ? editingClient
          : client
      )
    );

    setEditingClient(null);
    setOpenMenu(null);
  }

  // =====================================================
  // EXCLUIR CLIENTE
  // =====================================================

  function handleDeleteClient() {
    if (!deletingClient) return;

    setClients((currentClients) =>
      currentClients.filter(
        (client) =>
          client.id !== deletingClient.id
      )
    );

    setDeletingClient(null);
    setOpenMenu(null);
  }

  // =====================================================
  // VER DETALHES
  // =====================================================

  function handleViewClient(client: Client) {
    setViewingClient(client);
    setOpenMenu(null);
  }

  // =====================================================
  // EDITAR
  // =====================================================

  function handleEditClient(client: Client) {
    setEditingClient({ ...client });
    setOpenMenu(null);
  }

  // =====================================================
  // EXCLUIR
  // =====================================================

  function handleAskDelete(client: Client) {
    setDeletingClient(client);
    setOpenMenu(null);
  }

  return (
    <>
      <div className="w-full overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-100">

        {/* =================================================
            CABEÇALHO
        ================================================= */}

        <div className="flex flex-col gap-1 px-5 py-5 sm:px-6">

          <h2 className="text-base font-semibold tracking-tight text-gray-900">
            Lista de clientes
          </h2>

          <p className="text-sm text-gray-500">
            Clientes cadastrados no seu estabelecimento.
          </p>

        </div>

        {/* =================================================
            TABELA
        ================================================= */}

        <div className="overflow-x-auto">

          <table className="w-full min-w-[760px]">

            <thead>

              <tr className="border-y border-gray-100 bg-gray-50/70">

                <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Cliente
                </th>

                <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Telefone
                </th>

                <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Visitas
                </th>

                <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Estado
                </th>

                <th className="px-6 py-3.5 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Ações
                </th>

              </tr>

            </thead>

            <tbody className="divide-y divide-gray-100">

              {visibleClients.map((client) => {

                const initial =
                  client.name
                    .charAt(0)
                    .toUpperCase();

                const isActive =
                  client.status
                    .toLowerCase() === "ativo";

                return (

                  <tr
                    key={client.id}
                    className="
                      group
                      transition-colors
                      duration-150
                      hover:bg-gray-50/70
                    "
                  >

                    {/* CLIENTE */}

                    <td className="px-6 py-4">

                      <div className="flex items-center gap-3">

                        <div
                          className="
                            flex
                            h-10
                            w-10
                            shrink-0
                            items-center
                            justify-center
                            rounded-full
                            bg-gray-100
                            text-sm
                            font-semibold
                            text-gray-700
                          "
                        >
                          {initial}
                        </div>

                        <div className="min-w-0">

                          <p className="truncate text-sm font-semibold text-gray-900">
                            {client.name}
                          </p>

                          <p className="mt-0.5 truncate text-xs text-gray-500">
                            {client.email}
                          </p>

                        </div>

                      </div>

                    </td>

                    {/* TELEFONE */}

                    <td className="px-6 py-4">

                      <span className="text-sm text-gray-600">
                        {client.phone}
                      </span>

                    </td>

                    {/* VISITAS */}

                    <td className="px-6 py-4">

                      <div className="flex items-center gap-2">

                        <span className="text-sm font-semibold text-gray-900">
                          {client.visits}
                        </span>

                        <span className="text-xs text-gray-400">
                          visitas
                        </span>

                      </div>

                    </td>

                    {/* ESTADO */}

                    <td className="px-6 py-4">

                      <span
                        className={`
                          inline-flex
                          items-center
                          gap-1.5
                          rounded-full
                          px-2.5
                          py-1
                          text-xs
                          font-medium
                          ${
                            isActive
                              ? "bg-green-50 text-green-700"
                              : "bg-gray-100 text-gray-600"
                          }
                        `}
                      >

                        <span
                          className={`
                            h-1.5
                            w-1.5
                            rounded-full
                            ${
                              isActive
                                ? "bg-green-500"
                                : "bg-gray-400"
                            }
                          `}
                        />

                        {client.status}

                      </span>

                    </td>

                    {/* AÇÕES */}

                    <td className="relative px-6 py-4 text-right">

                      <button
                        type="button"
                        aria-label={`Mais opções para ${client.name}`}
                        onClick={() =>
                          setOpenMenu(
                            openMenu === client.id
                              ? null
                              : client.id
                          )
                        }
                        className="
                          inline-flex
                          h-9
                          w-9
                          items-center
                          justify-center
                          rounded-lg
                          text-gray-400
                          transition-all
                          duration-150
                          hover:bg-gray-100
                          hover:text-gray-900
                          lg:opacity-0
                          lg:group-hover:opacity-100
                        "
                      >
                        <span className="text-lg leading-none">
                          ⋮
                        </span>
                      </button>

                      {/* MENU */}

                      {openMenu === client.id && (

                        <div
                          className="
                            absolute
                            right-6
                            top-14
                            z-30
                            w-48
                            overflow-hidden
                            rounded-xl
                            border
                            border-gray-100
                            bg-white
                            p-1
                            text-left
                            shadow-xl
                            ring-1
                            ring-black/5
                          "
                        >

                          {/* VER DETALHES */}

                          <button
                            type="button"
                            onClick={() =>
                              handleViewClient(client)
                            }
                            className="
                              flex
                              w-full
                              items-center
                              rounded-lg
                              px-3
                              py-2.5
                              text-sm
                              text-gray-700
                              transition
                              hover:bg-gray-50
                            "
                          >
                            Ver detalhes
                          </button>

                          {/* EDITAR */}

                          <button
                            type="button"
                            onClick={() =>
                              handleEditClient(client)
                            }
                            className="
                              flex
                              w-full
                              items-center
                              rounded-lg
                              px-3
                              py-2.5
                              text-sm
                              text-gray-700
                              transition
                              hover:bg-gray-50
                            "
                          >
                            Editar
                          </button>

                          <div className="my-1 border-t border-gray-100" />

                          {/* EXCLUIR */}

                          <button
                            type="button"
                            onClick={() =>
                              handleAskDelete(client)
                            }
                            className="
                              flex
                              w-full
                              items-center
                              rounded-lg
                              px-3
                              py-2.5
                              text-sm
                              text-red-600
                              transition
                              hover:bg-red-50
                            "
                          >
                            Excluir
                          </button>

                        </div>

                      )}

                    </td>

                  </tr>

                );

              })}

            </tbody>

          </table>

        </div>

        {/* =================================================
            RODAPÉ
        ================================================= */}

        <div className="flex items-center justify-between border-t border-gray-100 px-5 py-4 sm:px-6">

          <p className="text-sm text-gray-500">

            <span className="font-medium text-gray-900">
              {clients.length}
            </span>{" "}

            clientes cadastrados

          </p>

          <button
            type="button"
            onClick={() =>
              setShowAll(!showAll)
            }
            className="
              text-sm
              font-medium
              text-gray-600
              transition-colors
              hover:text-gray-900
            "
          >
            {showAll
              ? "Mostrar menos"
              : "Ver todos"}
          </button>

        </div>

      </div>

      {/* =================================================
          MODAL — VER DETALHES
      ================================================= */}

      {viewingClient && (

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
          onClick={() =>
            setViewingClient(null)
          }
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
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <div className="flex items-start justify-between">

              <div>

                <div
                  className="
                    flex
                    h-12
                    w-12
                    items-center
                    justify-center
                    rounded-full
                    bg-gray-100
                    text-lg
                    font-semibold
                    text-gray-700
                  "
                >
                  {viewingClient.name
                    .charAt(0)
                    .toUpperCase()}
                </div>

                <h2 className="mt-4 text-xl font-semibold text-gray-900">
                  {viewingClient.name}
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Informações do cliente
                </p>

              </div>

              <button
                type="button"
                onClick={() =>
                  setViewingClient(null)
                }
                className="
                  rounded-lg
                  px-3
                  py-2
                  text-gray-400
                  transition
                  hover:bg-gray-100
                  hover:text-gray-900
                "
              >
                ✕
              </button>

            </div>

            <div className="mt-6 space-y-4">

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                  Email
                </p>

                <p className="mt-1 text-sm text-gray-900">
                  {viewingClient.email}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                  Telefone
                </p>

                <p className="mt-1 text-sm text-gray-900">
                  {viewingClient.phone}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                  Visitas
                </p>

                <p className="mt-1 text-sm text-gray-900">
                  {viewingClient.visits} visitas
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                  Estado
                </p>

                <p className="mt-1 text-sm text-gray-900">
                  {viewingClient.status}
                </p>
              </div>

            </div>

            <div className="mt-7 flex justify-end">

              <button
                type="button"
                onClick={() =>
                  setViewingClient(null)
                }
                className="
                  rounded-xl
                  bg-gray-950
                  px-5
                  py-3
                  text-sm
                  font-medium
                  text-white
                  transition
                  hover:bg-gray-800
                "
              >
                Fechar
              </button>

            </div>

          </div>

        </div>

      )}

      {/* =================================================
          MODAL — EDITAR
      ================================================= */}

      {editingClient && (

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
          onClick={() =>
            setEditingClient(null)
          }
        >

          <div
            className="
              w-full
              max-w-lg
              rounded-2xl
              bg-white
              p-6
              shadow-2xl
            "
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <div className="mb-6 flex items-start justify-between">

              <div>

                <h2 className="text-xl font-semibold text-gray-900">
                  Editar cliente
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Atualize as informações do cliente.
                </p>

              </div>

              <button
                type="button"
                onClick={() =>
                  setEditingClient(null)
                }
                className="
                  rounded-lg
                  px-3
                  py-2
                  text-gray-400
                  hover:bg-gray-100
                  hover:text-gray-900
                "
              >
                ✕
              </button>

            </div>

            <div className="space-y-4">

              {/* NOME */}

              <div>

                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Nome
                </label>

                <input
                  type="text"
                  value={editingClient.name}
                  onChange={(event) =>
                    setEditingClient({
                      ...editingClient,
                      name: event.target.value,
                    })
                  }
                  className="
                    w-full
                    rounded-xl
                    border
                    border-gray-200
                    px-4
                    py-3
                    text-sm
                    outline-none
                    transition
                    focus:border-gray-900
                    focus:ring-4
                    focus:ring-gray-100
                  "
                />

              </div>

              {/* EMAIL */}

              <div>

                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Email
                </label>

                <input
                  type="email"
                  value={editingClient.email}
                  onChange={(event) =>
                    setEditingClient({
                      ...editingClient,
                      email: event.target.value,
                    })
                  }
                  className="
                    w-full
                    rounded-xl
                    border
                    border-gray-200
                    px-4
                    py-3
                    text-sm
                    outline-none
                    transition
                    focus:border-gray-900
                    focus:ring-4
                    focus:ring-gray-100
                  "
                />

              </div>

              {/* TELEFONE */}

              <div>

                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Telefone
                </label>

                <input
                  type="text"
                  value={editingClient.phone}
                  onChange={(event) =>
                    setEditingClient({
                      ...editingClient,
                      phone: event.target.value,
                    })
                  }
                  className="
                    w-full
                    rounded-xl
                    border
                    border-gray-200
                    px-4
                    py-3
                    text-sm
                    outline-none
                    transition
                    focus:border-gray-900
                    focus:ring-4
                    focus:ring-gray-100
                  "
                />

              </div>

              {/* ESTADO */}

              <div>

                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Estado
                </label>

                <select
                  value={editingClient.status}
                  onChange={(event) =>
                    setEditingClient({
                      ...editingClient,
                      status: event.target.value,
                    })
                  }
                  className="
                    w-full
                    rounded-xl
                    border
                    border-gray-200
                    bg-white
                    px-4
                    py-3
                    text-sm
                    outline-none
                    transition
                    focus:border-gray-900
                    focus:ring-4
                    focus:ring-gray-100
                  "
                >

                  <option value="Ativo">
                    Ativo
                  </option>

                  <option value="Inativo">
                    Inativo
                  </option>

                </select>

              </div>

            </div>

            <div className="mt-7 flex justify-end gap-3">

              <button
                type="button"
                onClick={() =>
                  setEditingClient(null)
                }
                className="
                  rounded-xl
                  border
                  border-gray-200
                  bg-white
                  px-5
                  py-3
                  text-sm
                  font-medium
                  text-gray-700
                  transition
                  hover:bg-gray-50
                "
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={handleSaveEdit}
                className="
                  rounded-xl
                  bg-gray-950
                  px-5
                  py-3
                  text-sm
                  font-medium
                  text-white
                  transition
                  hover:bg-gray-800
                "
              >
                Guardar alterações
              </button>

            </div>

          </div>

        </div>

      )}

      {/* =================================================
          MODAL — EXCLUIR
      ================================================= */}

      {deletingClient && (

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
          onClick={() =>
            setDeletingClient(null)
          }
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
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-50 text-red-600">
              !
            </div>

            <h2 className="mt-4 text-lg font-semibold text-gray-900">
              Excluir cliente?
            </h2>

            <p className="mt-2 text-sm leading-6 text-gray-500">
              Tem certeza que deseja excluir{" "}
              <span className="font-medium text-gray-900">
                {deletingClient.name}
              </span>
              ? Esta ação não poderá ser desfeita.
            </p>

            <div className="mt-7 flex justify-end gap-3">

              <button
                type="button"
                onClick={() =>
                  setDeletingClient(null)
                }
                className="
                  rounded-xl
                  border
                  border-gray-200
                  px-5
                  py-3
                  text-sm
                  font-medium
                  text-gray-700
                  hover:bg-gray-50
                "
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={handleDeleteClient}
                className="
                  rounded-xl
                  bg-red-600
                  px-5
                  py-3
                  text-sm
                  font-medium
                  text-white
                  transition
                  hover:bg-red-700
                "
              >
                Excluir cliente
              </button>

            </div>

          </div>

        </div>

      )}

    </>
  );
}