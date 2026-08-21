"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

/* Verificação simples de formato; o email do cliente é opcional. */
const EMAIL_PATTERN =
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
import {
  X,
  Pencil,
  Trash2,
  UserRound,
  Mail,
  Phone,
  CalendarDays,
  Plus,
} from "lucide-react";

interface ApiClient {
  id: string;
  name: string;
  email: string | null;
  phone: string;
  active: boolean;
  businessId: string;
  createdAt: string;
  updatedAt: string;
}

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  visits: number;
  totalSpent: number;
  status: "Ativo" | "Inativo";
  lastVisit: string;
}

interface ClientForm {
  name: string;
  email: string;
  phone: string;
  status: "Ativo" | "Inativo";
}

const emptyForm: ClientForm = {
  name: "",
  email: "",
  phone: "",
  status: "Ativo",
};

export function ClientTable() {
  const [clients, setClients] = useState<Client[]>([]);

  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const [selectedClient, setSelectedClient] =
    useState<Client | null>(null);

  const [editForm, setEditForm] =
    useState<Client | null>(null);

  const [isEditing, setIsEditing] = useState(false);

  const [deletingClient, setDeletingClient] =
    useState<Client | null>(null);

  const [isDeleting, setIsDeleting] = useState(false);

  const [showAll, setShowAll] = useState(false);

  const [showAddModal, setShowAddModal] =
    useState(false);

  const [addForm, setAddForm] =
    useState<ClientForm>(emptyForm);

  const [isSaving, setIsSaving] = useState(false);

  const [isUpdating, setIsUpdating] = useState(false);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  /* CLIENTES VISÍVEIS*/

  const visibleClients = showAll
    ? clients
    : clients.slice(0, 5);

  /* CARREGAR CLIENTES*/

  async function loadClients() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/clients", {
        method: "GET",
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "Erro ao buscar clientes.",
        );
      }

      const formattedClients: Client[] =
        data.map((client: ApiClient) => ({
          id: client.id,
          name: client.name,
          email: client.email ?? "",
          phone: client.phone,
          visits: 0,
          totalSpent: 0,
          status: client.active
            ? "Ativo"
            : "Inativo",
          lastVisit: "-",
        }));

      setClients(formattedClients);
    } catch (error) {
      console.error(
        "Erro ao carregar clientes:",
        error,
      );

      setError(
        error instanceof Error
          ? error.message
          : "Erro ao carregar clientes.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadClients();
  }, []);

  /*ADICIONAR CLIENTE*/

  function handleOpenAddClient() {
    setError("");

    setAddForm({
      ...emptyForm,
    });

    setShowAddModal(true);
  }

  function handleCloseAddClient() {
    if (isSaving) return;

    setShowAddModal(false);

    setAddForm({
      ...emptyForm,
    });

    setError("");
  }

  async function handleAddClient() {
    setError("");

    if (!addForm.name.trim()) {
      setError("Digite o nome do cliente.");
      return;
    }

    if (!addForm.phone.trim()) {
      setError("Digite o telefone do cliente.");
      return;
    }

    const addEmail = addForm.email.trim();

    if (
      addEmail &&
      !EMAIL_PATTERN.test(addEmail)
    ) {
      setError("Digite um email válido.");
      return;
    }

    try {
      setIsSaving(true);

      const response = await fetch(
        "/api/clients",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            name: addForm.name.trim(),

            email:
              addForm.email.trim() || null,

            phone:
              addForm.phone.trim(),

            active:
              addForm.status === "Ativo",
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "Não foi possível criar o cliente.",
        );
      }

      /*
       * O cliente foi criado no banco.
       * Agora atualizamos a tabela.
       */

      await loadClients();

      setShowAddModal(false);

      setAddForm({
        ...emptyForm,
      });

      setError("");
    } catch (error) {
      console.error(
        "Erro ao adicionar cliente:",
        error,
      );

      setError(
        error instanceof Error
          ? error.message
          : "Erro ao adicionar cliente.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  /* VER CLIENTE*/

  function handleViewClient(client: Client) {
    setOpenMenu(null);

    setSelectedClient(client);

    setEditForm({
      ...client,
    });

    setIsEditing(false);

    setError("");
  }

  /*EDITAR CLIENTE*/

  function handleStartEdit() {
    if (!selectedClient) return;

    setEditForm({
      ...selectedClient,
    });

    setIsEditing(true);

    setError("");
  }

  function handleCancelEdit() {
    if (!selectedClient) return;

    setEditForm({
      ...selectedClient,
    });

    setIsEditing(false);

    setError("");
  }

  function handleChange(
    field: keyof Client,
    value: string | number,
  ) {
    if (!editForm) return;

    setEditForm({
      ...editForm,
      [field]: value,
    });
  }

  /*GUARDAR EDIÇÃO*/

  async function handleSaveEdit() {
    if (!editForm) return;

    setError("");

    if (!editForm.name.trim()) {
      setError("O nome do cliente é obrigatório.");
      return;
    }

    if (!editForm.phone.trim()) {
      setError(
        "O telefone do cliente é obrigatório.",
      );
      return;
    }

    const editEmail =
      editForm.email.trim();

    if (
      editEmail &&
      !EMAIL_PATTERN.test(editEmail)
    ) {
      setError("Digite um email válido.");
      return;
    }

    try {
      setIsUpdating(true);

      const response = await fetch(
        `/api/clients/${editForm.id}`,
        {
          method: "PUT",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            name: editForm.name.trim(),

            email:
              editForm.email.trim() || null,

            phone:
              editForm.phone.trim(),

            active:
              editForm.status === "Ativo",
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "Não foi possível atualizar o cliente.",
        );
      }

      /*
       * Atualiza imediatamente a tabela
       * com os dados recebidos da API.
       */

      const updatedClient: Client = {
        id: data.id,
        name: data.name,
        email: data.email ?? "",
        phone: data.phone,
        visits: editForm.visits,
        totalSpent: editForm.totalSpent,
        status: data.active
          ? "Ativo"
          : "Inativo",
        lastVisit: editForm.lastVisit,
      };

      setClients((currentClients) =>
        currentClients.map((client) =>
          client.id === updatedClient.id
            ? updatedClient
            : client,
        ),
      );

      setSelectedClient(updatedClient);

      setEditForm(updatedClient);

      setIsEditing(false);

      setError("");
    } catch (error) {
      console.error(
        "Erro ao atualizar cliente:",
        error,
      );

      setError(
        error instanceof Error
          ? error.message
          : "Erro ao atualizar cliente.",
      );
    } finally {
      setIsUpdating(false);
    }
  }

  /*EXCLUIR CLIENTE*/

  function handleAskDelete(client: Client) {
    setOpenMenu(null);

    setDeletingClient(client);

    setError("");
  }

  function handleCancelDelete() {
    if (isDeleting) return;

    setDeletingClient(null);
  }

  async function handleDeleteClient() {
    if (!deletingClient) return;

    try {
      setIsDeleting(true);

      setError("");

      const response = await fetch(
        `/api/clients/${deletingClient.id}`,
        {
          method: "DELETE",
        },
      );

      const data = await response.json();

      if (!response.ok) {
        // Bloqueio por agendamentos nao muda em nova tentativa: fecha a
        // confirmacao e explica no toast, que fica mais tempo em tela.
        if (data?.reason === "has_appointments") {
          setDeletingClient(null);
          setOpenMenu(null);

          toast.error(data.error, {
            duration: 10000,
          });

          return;
        }

        throw new Error(
          data?.error ||
            "Não foi possível excluir o cliente.",
        );
      }

      /*
       * Remove imediatamente da tabela.
       */

      setClients((currentClients) =>
        currentClients.filter(
          (client) =>
            client.id !==
            deletingClient.id,
        ),
      );

      /*
       * Se o cliente excluído estiver
       * aberto no modal, fecha o modal.
       */

      if (
        selectedClient?.id ===
        deletingClient.id
      ) {
        setSelectedClient(null);
        setEditForm(null);
        setIsEditing(false);
      }

      setDeletingClient(null);

      setOpenMenu(null);

      setError("");

      toast.success(
        `${deletingClient.name} foi excluído.`,
      );
    } catch (error) {
      console.error(
        "Erro ao excluir cliente:",
        error,
      );

      toast.error(
        error instanceof Error
          ? error.message
          : "Erro ao excluir cliente.",
      );
    } finally {
      setIsDeleting(false);
    }
  }

  /*FECHAR DETALHES*/

  function handleCloseDetails() {
    if (isUpdating) return;

    setSelectedClient(null);

    setEditForm(null);

    setIsEditing(false);

    setError("");
  }

  return (
    <>
      {/* ======================================================
          TABELA
      ====================================================== */}

      <div className="w-full overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-100">

        {/* HEADER */}

        <div className="flex items-center justify-between gap-4 px-5 py-5 sm:px-6">

          <div>
            <h2 className="text-base font-semibold tracking-tight text-gray-900">
              Lista de clientes
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Clientes cadastrados no seu estabelecimento.
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenAddClient}
            className="
              inline-flex
              items-center
              gap-2
              rounded-xl
              bg-gray-950
              px-4
              py-2.5
              text-sm
              font-medium
              text-white
              transition
              hover:bg-gray-800
            "
          >
            <Plus className="h-4 w-4" />

            Novo cliente
          </button>

        </div>

        {/* TABELA */}

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

              {/* LOADING */}

              {loading && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center"
                  >
                    <p className="text-sm text-gray-500">
                      A carregar clientes...
                    </p>
                  </td>
                </tr>
              )}

              {/* ERRO */}

              {!loading &&
                error &&
                !showAddModal &&
                !selectedClient &&
                !deletingClient && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-12 text-center"
                    >
                      <p className="text-sm font-medium text-red-600">
                        {error}
                      </p>

                      <button
                        type="button"
                        onClick={loadClients}
                        className="mt-3 text-sm font-medium text-gray-900 underline"
                      >
                        Tentar novamente
                      </button>
                    </td>
                  </tr>
                )}

              {/* CLIENTES */}

              {!loading &&
                clients.length > 0 &&
                visibleClients.map(
                  (client) => {
                    const initial =
                      client.name
                        .charAt(0)
                        .toUpperCase();

                    const isActive =
                      client.status ===
                      "Ativo";

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
                                {client.email ||
                                  "Sem email"}
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
                            onClick={() =>
                              setOpenMenu(
                                openMenu ===
                                  client.id
                                  ? null
                                  : client.id,
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
                              transition
                              hover:bg-gray-100
                              hover:text-gray-900
                              lg:opacity-0
                              lg:group-hover:opacity-100
                            "
                          >
                            <span className="text-lg">
                              ⋮
                            </span>
                          </button>

                          {openMenu ===
                            client.id && (
                            <div
                              className="
                                absolute
                                right-6
                                top-14
                                z-30
                                w-48
                                rounded-xl
                                border
                                border-gray-100
                                bg-white
                                p-1
                                text-left
                                shadow-xl
                              "
                            >

                              {/* VER MAIS */}

                              <button
                                type="button"
                                onClick={() =>
                                  handleViewClient(
                                    client,
                                  )
                                }
                                className="
                                  flex
                                  w-full
                                  items-center
                                  gap-3
                                  rounded-lg
                                  px-3
                                  py-3
                                  text-sm
                                  font-medium
                                  text-gray-700
                                  hover:bg-gray-50
                                "
                              >
                                <UserRound className="h-4 w-4" />

                                Ver mais
                              </button>

                              <div className="my-1 border-t border-gray-100" />

                              {/* EXCLUIR */}

                              <button
                                type="button"
                                onClick={() =>
                                  handleAskDelete(
                                    client,
                                  )
                                }
                                className="
                                  flex
                                  w-full
                                  items-center
                                  gap-3
                                  rounded-lg
                                  px-3
                                  py-3
                                  text-sm
                                  font-medium
                                  text-red-600
                                  hover:bg-red-50
                                "
                              >
                                <Trash2 className="h-4 w-4" />

                                Excluir
                              </button>

                            </div>
                          )}

                        </td>

                      </tr>
                    );
                  },
                )}

              {/* SEM CLIENTES */}

              {!loading &&
                !error &&
                clients.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-12 text-center"
                    >

                      <p className="text-sm font-medium text-gray-900">
                        Nenhum cliente encontrado
                      </p>

                      <p className="mt-1 text-sm text-gray-500">
                        Adicione o primeiro cliente.
                      </p>

                    </td>
                  </tr>
                )}

            </tbody>

          </table>

        </div>

        {/* RODAPÉ */}

        <div className="flex items-center justify-between border-t border-gray-100 px-5 py-4 sm:px-6">

          <p className="text-sm text-gray-500">

            <span className="font-medium text-gray-900">
              {clients.length}
            </span>{" "}

            clientes cadastrados

          </p>

          {clients.length > 5 && (
            <button
              type="button"
              onClick={() =>
                setShowAll(!showAll)
              }
              className="text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              {showAll
                ? "Mostrar menos"
                : "Ver todos"}
            </button>
          )}

        </div>

      </div>

      {/*  MODAL — NOVO CLIENTE*/}
    
      {showAddModal && (
        <div
          className="
            fixed
            inset-0
            z-[9999]
            flex
            items-center
            justify-center
            bg-black/40
            px-4
            py-6
            backdrop-blur-sm
          "
          onClick={handleCloseAddClient}
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
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            {/* HEADER */}

            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">

              <div>

                <h2 className="text-xl font-semibold text-gray-900">
                  Novo cliente
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Cadastre um novo cliente.
                </p>

              </div>

              <button
                type="button"
                onClick={handleCloseAddClient}
                disabled={isSaving}
                className="
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  rounded-lg
                  text-gray-400
                  hover:bg-gray-100
                  hover:text-gray-900
                  disabled:opacity-50
                "
              >
                <X className="h-5 w-5" />
              </button>

            </div>

            {/* FORM */}

            <div className="space-y-5 px-6 py-6">

              {/* NOME */}

              <div>

                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Nome *
                </label>

                <input
                  type="text"
                  value={addForm.name}
                  onChange={(event) =>
                    setAddForm({
                      ...addForm,
                      name: event.target.value,
                    })
                  }
                  placeholder="Nome do cliente"
                  className="
                    w-full
                    rounded-xl
                    border
                    border-gray-200
                    px-4
                    py-3
                    text-sm
                    outline-none
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
                  value={addForm.email}
                  onChange={(event) =>
                    setAddForm({
                      ...addForm,
                      email: event.target.value,
                    })
                  }
                  placeholder="cliente@email.com"
                  className="
                    w-full
                    rounded-xl
                    border
                    border-gray-200
                    px-4
                    py-3
                    text-sm
                    outline-none
                    focus:border-gray-900
                    focus:ring-4
                    focus:ring-gray-100
                  "
                />

              </div>

              {/* TELEFONE */}

              <div>

                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Telefone *
                </label>

                <input
                  type="tel"
                  value={addForm.phone}
                  onChange={(event) =>
                    setAddForm({
                      ...addForm,
                      phone: event.target.value,
                    })
                  }
                  placeholder="923 000 000"
                  className="
                    w-full
                    rounded-xl
                    border
                    border-gray-200
                    px-4
                    py-3
                    text-sm
                    outline-none
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
                  value={addForm.status}
                  onChange={(event) =>
                    setAddForm({
                      ...addForm,
                      status:
                        event.target.value as
                          | "Ativo"
                          | "Inativo",
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

              {/* ERRO */}

              {error && (
                <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              {/* BOTÕES */}

              <div className="flex justify-end gap-3 border-t border-gray-100 pt-5">

                <button
                  type="button"
                  onClick={handleCloseAddClient}
                  disabled={isSaving}
                  className="
                    rounded-xl
                    border
                    border-gray-200
                    px-5
                    py-2.5
                    text-sm
                    font-medium
                    text-gray-700
                    hover:bg-gray-50
                    disabled:opacity-50
                  "
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  onClick={handleAddClient}
                  disabled={isSaving}
                  className="
                    rounded-xl
                    bg-gray-950
                    px-5
                    py-2.5
                    text-sm
                    font-medium
                    text-white
                    hover:bg-gray-800
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                  "
                >
                  {isSaving
                    ? "A guardar..."
                    : "Adicionar cliente"}
                </button>

              </div>

            </div>

          </div>

        </div>
      )}

      {/*MODAL — VER / EDITAR*/}

      {selectedClient && (
        <div
          className="
            fixed
            inset-0
            z-[9998]
            flex
            items-center
            justify-center
            bg-black/40
            px-4
            py-6
            backdrop-blur-sm
          "
          onClick={handleCloseDetails}
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
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            {/* HEADER */}

            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">

              <div>

                <h2 className="text-xl font-semibold text-gray-900">
                  {isEditing
                    ? "Editar cliente"
                    : "Detalhes do cliente"}
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  {isEditing
                    ? "Atualize os dados do cliente."
                    : "Informações completas do cliente."}
                </p>

              </div>

              <button
                type="button"
                onClick={handleCloseDetails}
                disabled={isUpdating}
                className="
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  rounded-lg
                  text-gray-400
                  hover:bg-gray-100
                  hover:text-gray-900
                  disabled:opacity-50
                "
              >
                <X className="h-5 w-5" />
              </button>

            </div>

            {isEditing && editForm ? (

              /* FORM EDITAR */

              <div className="space-y-5 px-6 py-6">

                {/* NOME */}

                <div>

                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Nome *
                  </label>

                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(event) =>
                      handleChange(
                        "name",
                        event.target.value,
                      )
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
                    value={editForm.email}
                    onChange={(event) =>
                      handleChange(
                        "email",
                        event.target.value,
                      )
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
                      focus:border-gray-900
                      focus:ring-4
                      focus:ring-gray-100
                    "
                  />

                </div>

                {/* TELEFONE */}

                <div>

                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Telefone *
                  </label>

                  <input
                    type="tel"
                    value={editForm.phone}
                    onChange={(event) =>
                      handleChange(
                        "phone",
                        event.target.value,
                      )
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
                    value={editForm.status}
                    onChange={(event) =>
                      handleChange(
                        "status",
                        event.target.value,
                      )
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

                {/* ERRO */}

                {error && (
                  <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
                    {error}
                  </div>
                )}

                {/* BOTÕES */}

                <div className="flex justify-end gap-3 border-t border-gray-100 pt-5">

                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    disabled={isUpdating}
                    className="
                      rounded-xl
                      border
                      border-gray-200
                      px-5
                      py-2.5
                      text-sm
                      font-medium
                      text-gray-700
                      hover:bg-gray-50
                      disabled:opacity-50
                    "
                  >
                    Cancelar
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveEdit}
                    disabled={isUpdating}
                    className="
                      inline-flex
                      items-center
                      gap-2
                      rounded-xl
                      bg-gray-950
                      px-5
                      py-2.5
                      text-sm
                      font-medium
                      text-white
                      hover:bg-gray-800
                      disabled:cursor-not-allowed
                      disabled:opacity-50
                    "
                  >
                    {isUpdating
                      ? "A guardar..."
                      : "Guardar alterações"}
                  </button>

                </div>

              </div>

            ) : (

              /* DETALHES */

              <>

                <div className="flex items-center gap-4 border-b border-gray-100 px-6 py-5">

                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 text-lg font-semibold text-gray-700">
                    {selectedClient.name
                      .charAt(0)
                      .toUpperCase()}
                  </div>

                  <div>

                    <p className="font-semibold text-gray-900">
                      {selectedClient.name}
                    </p>

                    <span
                      className={`
                        mt-1
                        inline-flex
                        rounded-full
                        px-2.5
                        py-1
                        text-[11px]
                        font-medium
                        ${
                          selectedClient.status ===
                          "Ativo"
                            ? "bg-green-50 text-green-700"
                            : "bg-gray-100 text-gray-600"
                        }
                      `}
                    >
                      {selectedClient.status}
                    </span>

                  </div>

                </div>

                <div className="grid grid-cols-1 gap-4 px-6 py-6 sm:grid-cols-2">

                  {/* EMAIL */}

                  <div className="rounded-xl bg-gray-50 p-4">

                    <div className="flex items-center gap-2 text-gray-400">

                      <Mail className="h-4 w-4" />

                      <span className="text-xs font-medium uppercase tracking-wide">
                        Email
                      </span>

                    </div>

                    <p className="mt-2 break-all font-semibold text-gray-900">
                      {selectedClient.email ||
                        "Sem email"}
                    </p>

                  </div>

                  {/* TELEFONE */}

                  <div className="rounded-xl bg-gray-50 p-4">

                    <div className="flex items-center gap-2 text-gray-400">

                      <Phone className="h-4 w-4" />

                      <span className="text-xs font-medium uppercase tracking-wide">
                        Telefone
                      </span>

                    </div>

                    <p className="mt-2 font-semibold text-gray-900">
                      {selectedClient.phone}
                    </p>

                  </div>

                  {/* VISITAS */}

                  <div className="rounded-xl bg-gray-50 p-4">

                    <div className="flex items-center gap-2 text-gray-400">

                      <CalendarDays className="h-4 w-4" />

                      <span className="text-xs font-medium uppercase tracking-wide">
                        Visitas
                      </span>

                    </div>

                    <p className="mt-2 font-semibold text-gray-900">
                      {selectedClient.visits}{" "}
                      visitas
                    </p>

                  </div>

                  {/* ESTADO */}

                  <div className="rounded-xl bg-gray-50 p-4">

                    <div className="flex items-center gap-2 text-gray-400">

                      <UserRound className="h-4 w-4" />

                      <span className="text-xs font-medium uppercase tracking-wide">
                        Estado
                      </span>

                    </div>

                    <p className="mt-2 font-semibold text-gray-900">
                      {selectedClient.status}
                    </p>

                  </div>

                </div>

                {/* BOTÕES */}

                <div className="flex justify-end gap-3 border-t border-gray-100 px-6 py-5">

                  <button
                    type="button"
                    onClick={handleStartEdit}
                    className="
                      inline-flex
                      items-center
                      gap-2
                      rounded-xl
                      border
                      border-gray-200
                      px-5
                      py-2.5
                      text-sm
                      font-medium
                      text-gray-700
                      hover:bg-gray-50
                    "
                  >
                    <Pencil className="h-4 w-4" />

                    Editar
                  </button>

                  <button
                    type="button"
                    onClick={handleCloseDetails}
                    className="
                      rounded-xl
                      bg-gray-950
                      px-5
                      py-2.5
                      text-sm
                      font-medium
                      text-white
                      hover:bg-gray-800
                    "
                  >
                    Fechar
                  </button>

                </div>

              </>
            )}

          </div>

        </div>
      )}

      {/*MODAL — EXCLUIR*/}

      {deletingClient && (
        <div
          className="
            fixed
            inset-0
            z-[10000]
            flex
            items-center
            justify-center
            bg-black/40
            p-4
            backdrop-blur-sm
          "
          onClick={handleCancelDelete}
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

            <div
              className="
                flex
                h-12
                w-12
                items-center
                justify-center
                rounded-xl
                bg-red-50
                text-red-600
              "
            >
              <Trash2 className="h-5 w-5" />
            </div>

            <h2 className="mt-5 text-lg font-semibold text-gray-900">
              Excluir cliente?
            </h2>

            <p className="mt-2 text-sm leading-6 text-gray-500">

              Tem certeza que deseja excluir{" "}

              <span className="font-semibold text-gray-900">
                {deletingClient.name}
              </span>

              ?

              <br />

              Esta ação não poderá ser desfeita.

            </p>

            {error && (
              <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <div className="mt-7 flex justify-end gap-3">

              <button
                type="button"
                onClick={handleCancelDelete}
                disabled={isDeleting}
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
                  hover:bg-gray-50
                  disabled:opacity-50
                "
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={handleDeleteClient}
                disabled={isDeleting}
                className="
                  inline-flex
                  items-center
                  gap-2
                  rounded-xl
                  bg-red-600
                  px-5
                  py-3
                  text-sm
                  font-medium
                  text-white
                  hover:bg-red-700
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                <Trash2 className="h-4 w-4" />

                {isDeleting
                  ? "A excluir..."
                  : "Excluir cliente"}

              </button>

            </div>

          </div>

        </div>
      )}
    </>
  );
}