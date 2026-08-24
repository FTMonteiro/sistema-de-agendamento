"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import {
  X,
  Pencil,
  Trash2,
  UserRound,
  Mail,
  Phone,
  CalendarDays,
  Plus,
  ChevronRight,
  RefreshCw,
} from "lucide-react";

/*
|--------------------------------------------------------------------------
| EMAIL
|--------------------------------------------------------------------------
*/

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/*
|--------------------------------------------------------------------------
| API CLIENT
|--------------------------------------------------------------------------
*/

interface ApiClient {
  id: string;
  name: string;
  email: string | null;
  phone: string;
  active: boolean;
  businessId: string;
  createdAt: string;
  updatedAt: string;

  visits: number;
  totalSpent: number;
  lastVisit: string | null;
}

/*
|--------------------------------------------------------------------------
| CLIENT
|--------------------------------------------------------------------------
*/

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;

  visits: number;
  totalSpent: number;

  status: "Ativo" | "Inativo";

  lastVisit: string | null;
}

/*
|--------------------------------------------------------------------------
| FORM
|--------------------------------------------------------------------------
*/

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

/*
|--------------------------------------------------------------------------
| COMPONENT
|--------------------------------------------------------------------------
*/

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

  const [showAddModal, setShowAddModal] = useState(false);

  const [addForm, setAddForm] =
    useState<ClientForm>(emptyForm);

  const [isSaving, setIsSaving] = useState(false);

  const [isUpdating, setIsUpdating] = useState(false);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  /*
  |--------------------------------------------------------------------------
  | BLOQUEAR SCROLL DA PÁGINA QUANDO MODAL ESTÁ ABERTO
  |--------------------------------------------------------------------------
  */

  const modalOpen =
    showAddModal ||
    !!selectedClient ||
    !!deletingClient;

  useEffect(() => {
    if (!modalOpen) return;

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow =
        previousOverflow;
    };
  }, [modalOpen]);

  /*
  |--------------------------------------------------------------------------
  | CLIENTES VISÍVEIS
  |--------------------------------------------------------------------------
  */

  const visibleClients = showAll
    ? clients
    : clients.slice(0, 5);

  /*
  |--------------------------------------------------------------------------
  | CARREGAR CLIENTES
  |--------------------------------------------------------------------------
  */

  async function loadClients() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "/api/clients",
        {
          method: "GET",
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "Erro ao buscar clientes."
        );
      }

      const formattedClients: Client[] =
        data.map((client: ApiClient) => ({
          id: client.id,
          name: client.name,
          email: client.email ?? "",
          phone: client.phone,
          visits: Number(client.visits) || 0,
          totalSpent:
            Number(client.totalSpent) || 0,
          status: client.active
            ? "Ativo"
            : "Inativo",
          lastVisit:
            client.lastVisit ?? null,
        }));

      setClients(formattedClients);
    } catch (error) {
      console.error(
        "Erro ao carregar clientes:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Erro ao carregar clientes."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadClients();
  }, []);

  /*
  |--------------------------------------------------------------------------
  | ADICIONAR CLIENTE
  |--------------------------------------------------------------------------
  */

  function handleOpenAddClient() {
    setError("");
    setAddForm({ ...emptyForm });
    setShowAddModal(true);
  }

  function handleCloseAddClient() {
    if (isSaving) return;

    setShowAddModal(false);
    setAddForm({ ...emptyForm });
    setError("");
  }

  async function handleAddClient() {
    setError("");

    if (!addForm.name.trim()) {
      setError("Digite o nome do cliente.");
      return;
    }

    if (!addForm.phone.trim()) {
      setError(
        "Digite o telefone do cliente."
      );
      return;
    }

    const addEmail =
      addForm.email.trim();

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
            phone: addForm.phone.trim(),
            active:
              addForm.status === "Ativo",
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "Não foi possível criar o cliente."
        );
      }

      await loadClients();

      setShowAddModal(false);
      setAddForm({ ...emptyForm });

      toast.success(
        "Cliente adicionado com sucesso."
      );
    } catch (error) {
      console.error(
        "Erro ao adicionar cliente:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Erro ao adicionar cliente."
      );
    } finally {
      setIsSaving(false);
    }
  }

  /*
  |--------------------------------------------------------------------------
  | VER CLIENTE
  |--------------------------------------------------------------------------
  */

  function handleViewClient(
    client: Client
  ) {
    setOpenMenu(null);
    setSelectedClient(client);
    setEditForm({ ...client });
    setIsEditing(false);
    setError("");
  }

  /*
  |--------------------------------------------------------------------------
  | EDITAR
  |--------------------------------------------------------------------------
  */

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
    field:
      | "name"
      | "email"
      | "phone",
    value: string
  ) {
    if (!editForm) return;

    setEditForm({
      ...editForm,
      [field]: value,
    });
  }

  function handleStatusChange(
    value: "Ativo" | "Inativo"
  ) {
    if (!editForm) return;

    setEditForm({
      ...editForm,
      status: value,
    });
  }

  /*
  |--------------------------------------------------------------------------
  | GUARDAR EDIÇÃO
  |--------------------------------------------------------------------------
  */

  async function handleSaveEdit() {
    if (!editForm) return;

    setError("");

    if (!editForm.name.trim()) {
      setError(
        "O nome do cliente é obrigatório."
      );
      return;
    }

    if (!editForm.phone.trim()) {
      setError(
        "O telefone do cliente é obrigatório."
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
            phone: editForm.phone.trim(),
            active:
              editForm.status === "Ativo",
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "Não foi possível atualizar o cliente."
        );
      }

      const oldClient =
        clients.find(
          (client) =>
            client.id === editForm.id
        );

      const updatedClient: Client = {
        id: data.id,
        name: data.name,
        email: data.email ?? "",
        phone: data.phone,

        visits:
          oldClient?.visits ??
          editForm.visits,

        totalSpent:
          oldClient?.totalSpent ??
          editForm.totalSpent,

        status: data.active
          ? "Ativo"
          : "Inativo",

        lastVisit:
          oldClient?.lastVisit ??
          editForm.lastVisit,
      };

      setClients(
        (currentClients) =>
          currentClients.map(
            (client) =>
              client.id ===
              updatedClient.id
                ? updatedClient
                : client
          )
      );

      setSelectedClient(
        updatedClient
      );

      setEditForm(
        updatedClient
      );

      setIsEditing(false);

      toast.success(
        "Cliente atualizado com sucesso."
      );
    } catch (error) {
      console.error(
        "Erro ao atualizar cliente:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Erro ao atualizar cliente."
      );
    } finally {
      setIsUpdating(false);
    }
  }

  /*
  |--------------------------------------------------------------------------
  | EXCLUIR
  |--------------------------------------------------------------------------
  */

  function handleAskDelete(
    client: Client
  ) {
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

      const response = await fetch(
        `/api/clients/${deletingClient.id}`,
        {
          method: "DELETE",
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        if (
          data?.reason ===
          "has_appointments"
        ) {
          setDeletingClient(null);

          toast.error(
            data.error,
            {
              duration: 10000,
            }
          );

          return;
        }

        throw new Error(
          data?.error ||
            "Não foi possível excluir o cliente."
        );
      }

      setClients(
        (currentClients) =>
          currentClients.filter(
            (client) =>
              client.id !==
              deletingClient.id
          )
      );

      if (
        selectedClient?.id ===
        deletingClient.id
      ) {
        setSelectedClient(null);
        setEditForm(null);
        setIsEditing(false);
      }

      setDeletingClient(null);

      toast.success(
        `${deletingClient.name} foi excluído.`
      );
    } catch (error) {
      console.error(
        "Erro ao excluir cliente:",
        error
      );

      toast.error(
        error instanceof Error
          ? error.message
          : "Erro ao excluir cliente."
      );
    } finally {
      setIsDeleting(false);
    }
  }

  /*
  |--------------------------------------------------------------------------
  | FECHAR DETALHES
  |--------------------------------------------------------------------------
  */

  function handleCloseDetails() {
    if (isUpdating) return;

    setSelectedClient(null);
    setEditForm(null);
    setIsEditing(false);
    setError("");
  }

  /*
  |--------------------------------------------------------------------------
  | FORMATADORES
  |--------------------------------------------------------------------------
  */

  function formatCurrency(
    value: number
  ) {
    return new Intl.NumberFormat(
      "pt-AO",
      {
        style: "currency",
        currency: "AOA",
        maximumFractionDigits: 0,
      }
    ).format(value);
  }

  function formatDate(
    date: string | null
  ) {
    if (!date) {
      return "Nenhuma visita";
    }

    return new Intl.DateTimeFormat(
      "pt-AO",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    ).format(new Date(date));
  }

  /*
  |--------------------------------------------------------------------------
  | RENDER
  |--------------------------------------------------------------------------
  */

  return (
    <>
      <div className="w-full overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-100">

        {/* HEADER */}

        <div className="flex flex-col gap-3 border-b border-gray-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">

          <div>
            <h2 className="text-base font-semibold tracking-tight text-gray-900">
              Clientes
            </h2>

            <p className="mt-0.5 text-xs text-gray-500">
              Gerencie os clientes e acompanhe o histórico de visitas.
            </p>
          </div>

          <div className="flex items-center gap-2">

            <button
              type="button"
              onClick={loadClients}
              disabled={loading}
              title="Atualizar clientes"
              className="
                inline-flex
                h-9
                w-9
                items-center
                justify-center
                rounded-lg
                border
                border-gray-200
                text-gray-500
                transition
                hover:bg-gray-50
                hover:text-gray-900
                disabled:opacity-50
              "
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  loading
                    ? "animate-spin"
                    : ""
                }`}
              />
            </button>

            <button
              type="button"
              onClick={
                handleOpenAddClient
              }
              className="
                inline-flex
                items-center
                gap-1.5
                rounded-lg
                bg-blue-700
                px-3.5
                py-2
                text-sm
                font-medium
                text-white
                transition
                hover:bg-blue-800
              "
            >
              <Plus className="h-4 w-4" />
              Novo cliente
            </button>

          </div>
        </div>

        {/* TABELA */}

        <div className="overflow-x-auto">

          <table className="w-full min-w-[760px]">

            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/70">

                <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                  Cliente
                </th>

                <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                  Telefone
                </th>

                <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                  Visitas
                </th>

                <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                  Estado
                </th>

                <th className="px-4 py-2.5 text-right text-[11px] font-semibold uppercase tracking-wide text-gray-500">
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
                    className="px-4 py-12 text-center"
                  >
                    <RefreshCw className="mx-auto h-5 w-5 animate-spin text-gray-400" />

                    <p className="mt-2 text-xs text-gray-500">
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
                      className="px-4 py-12 text-center"
                    >
                      <p className="text-sm font-medium text-red-600">
                        {error}
                      </p>

                      <button
                        type="button"
                        onClick={
                          loadClients
                        }
                        className="mt-2 text-xs font-medium text-gray-900 underline"
                      >
                        Tentar novamente
                      </button>
                    </td>
                  </tr>
                )}

              {/* CLIENTES */}

              {!loading &&
                !error &&
                clients.length > 0 &&
                visibleClients.map(
                  (client) => {
                    const initial =
                      client.name
                        .charAt(0)
                        .toUpperCase();

                    return (
                      <tr
                        key={client.id}
                        className="group transition-colors hover:bg-gray-50/70"
                      >

                        {/* CLIENTE */}

                        <td className="px-4 py-2.5">

                          <div className="flex items-center gap-2.5">

                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-700">
                              {initial}
                            </div>

                            <div className="min-w-0">

                              <p className="truncate text-sm font-semibold text-gray-900">
                                {client.name}
                              </p>

                              <p className="mt-0.5 max-w-[180px] truncate text-[11px] text-gray-500">
                                {client.email ||
                                  "Sem email"}
                              </p>

                            </div>

                          </div>

                        </td>

                        {/* TELEFONE */}

                        <td className="px-4 py-2.5">

                          <div className="flex items-center gap-1.5">

                            <Phone className="h-3.5 w-3.5 text-gray-400" />

                            <span className="text-xs text-gray-600">
                              {client.phone}
                            </span>

                          </div>

                        </td>

                        {/* VISITAS */}

                        <td className="px-4 py-2.5">

                          <div className="inline-flex items-center gap-1.5 rounded-md bg-gray-50 px-2 py-1">

                            <CalendarDays className="h-3 w-3 text-gray-400" />

                            <span className="text-xs font-semibold text-gray-900">
                              {client.visits}
                            </span>

                          </div>

                        </td>

                        {/* ESTADO */}

                        <td className="px-4 py-2.5">

                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ${
                              client.status ===
                              "Ativo"
                                ? "bg-green-50 text-green-700"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >

                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                client.status ===
                                "Ativo"
                                  ? "bg-green-500"
                                  : "bg-gray-400"
                              }`}
                            />

                            {client.status}

                          </span>

                        </td>

                        {/* AÇÕES */}

                        <td className="relative px-4 py-2.5 text-right">

                          <button
                            type="button"
                            onClick={() =>
                              setOpenMenu(
                                openMenu ===
                                  client.id
                                  ? null
                                  : client.id
                              )
                            }
                            className="
                              inline-flex
                              h-8
                              w-8
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
                            <span className="text-lg leading-none">
                              ⋮
                            </span>
                          </button>

                          {openMenu ===
                            client.id && (
                            <div className="absolute right-4 top-11 z-30 w-44 rounded-xl border border-gray-100 bg-white p-1 text-left shadow-xl">

                              <button
                                type="button"
                                onClick={() =>
                                  handleViewClient(
                                    client
                                  )
                                }
                                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                              >
                                <UserRound className="h-3.5 w-3.5" />

                                Ver cliente

                                <ChevronRight className="ml-auto h-3.5 w-3.5 text-gray-300" />
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  handleAskDelete(
                                    client
                                  )
                                }
                                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-xs font-medium text-red-600 hover:bg-red-50"
                              >
                                <Trash2 className="h-3.5 w-3.5" />

                                Excluir
                              </button>

                            </div>
                          )}

                        </td>

                      </tr>
                    );
                  }
                )}

              {/* VAZIO */}

              {!loading &&
                !error &&
                clients.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-12 text-center"
                    >
                      <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                        <UserRound className="h-4 w-4 text-gray-400" />
                      </div>

                      <p className="mt-3 text-sm font-semibold text-gray-900">
                        Nenhum cliente encontrado
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        Adicione o primeiro cliente ao seu estabelecimento.
                      </p>
                    </td>
                  </tr>
                )}

            </tbody>
          </table>

        </div>

        {/* ESPAÇO INFERIOR */}

        <div className="h-5 border-t border-gray-100" />

      </div>

      {/* ======================================================
          MODAL — NOVO CLIENTE
      ====================================================== */}

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
          onClick={
            handleCloseAddClient
          }
        >
          <div
            className="
              w-full
              max-w-md
              overflow-hidden
              rounded-2xl
              bg-white
              shadow-2xl
            "
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">

              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Novo cliente
                </h2>

                <p className="mt-0.5 text-xs text-gray-500">
                  Cadastre um novo cliente.
                </p>
              </div>

              <button
                type="button"
                onClick={
                  handleCloseAddClient
                }
                disabled={isSaving}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-900"
              >
                <X className="h-4 w-4" />
              </button>

            </div>

            <div className="space-y-4 px-5 py-5">

              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-700">
                  Nome
                </label>

                <input
                  type="text"
                  value={addForm.name}
                  onChange={(event) =>
                    setAddForm({
                      ...addForm,
                      name: event.target
                        .value,
                    })
                  }
                  placeholder="Nome do cliente"
                  className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm outline-none focus:border-gray-900 focus:ring-4 focus:ring-gray-100"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-700">
                  Email
                </label>

                <input
                  type="email"
                  value={addForm.email}
                  onChange={(event) =>
                    setAddForm({
                      ...addForm,
                      email:
                        event.target.value,
                    })
                  }
                  placeholder="cliente@email.com"
                  className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm outline-none focus:border-gray-900 focus:ring-4 focus:ring-gray-100"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-700">
                  Telefone
                </label>

                <input
                  type="tel"
                  value={addForm.phone}
                  onChange={(event) =>
                    setAddForm({
                      ...addForm,
                      phone:
                        event.target.value,
                    })
                  }
                  placeholder="923 000 000"
                  className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm outline-none focus:border-gray-900 focus:ring-4 focus:ring-gray-100"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-700">
                  Estado
                </label>

                <select
                  value={addForm.status}
                  onChange={(event) =>
                    setAddForm({
                      ...addForm,
                      status:
                        event.target
                          .value as
                          | "Ativo"
                          | "Inativo",
                    })
                  }
                  className="w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-gray-900 focus:ring-4 focus:ring-gray-100"
                >
                  <option value="Ativo">
                    Ativo
                  </option>

                  <option value="Inativo">
                    Inativo
                  </option>
                </select>
              </div>

              {error && (
                <div className="rounded-lg bg-red-50 px-3.5 py-2.5 text-xs text-red-600">
                  {error}
                </div>
              )}

              <div className="flex justify-end gap-2 border-t border-gray-100 pt-4">

                <button
                  type="button"
                  onClick={
                    handleCloseAddClient
                  }
                  disabled={isSaving}
                  className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  onClick={
                    handleAddClient
                  }
                  disabled={isSaving}
                  className="rounded-lg bg-gray-950 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
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

      {/* ======================================================
          MODAL — CLIENTE
      ====================================================== */}

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
          onClick={
            handleCloseDetails
          }
        >
          <div
            className="
              w-full
              max-w-lg
              overflow-hidden
              rounded-2xl
              bg-white
              shadow-2xl
            "
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            {/* HEADER */}

            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">

              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {isEditing
                    ? "Editar cliente"
                    : "Perfil do cliente"}
                </h2>

                <p className="mt-0.5 text-xs text-gray-500">
                  {isEditing
                    ? "Atualize os dados do cliente."
                    : "Resumo e informações do cliente."}
                </p>
              </div>

              <button
                type="button"
                onClick={
                  handleCloseDetails
                }
                disabled={isUpdating}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-900"
              >
                <X className="h-4 w-4" />
              </button>

            </div>

            {/* EDITAR */}

            {isEditing &&
            editForm ? (
              <div className="space-y-4 px-5 py-5">

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-700">
                    Nome
                  </label>

                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(event) =>
                      handleChange(
                        "name",
                        event.target
                          .value
                      )
                    }
                    className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm outline-none focus:border-gray-900 focus:ring-4 focus:ring-gray-100"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-700">
                    Email
                  </label>

                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(event) =>
                      handleChange(
                        "email",
                        event.target
                          .value
                      )
                    }
                    className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm outline-none focus:border-gray-900 focus:ring-4 focus:ring-gray-100"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-700">
                    Telefone
                  </label>

                  <input
                    type="tel"
                    value={editForm.phone}
                    onChange={(event) =>
                      handleChange(
                        "phone",
                        event.target
                          .value
                      )
                    }
                    className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm outline-none focus:border-gray-900 focus:ring-4 focus:ring-gray-100"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-700">
                    Estado
                  </label>

                  <select
                    value={
                      editForm.status
                    }
                    onChange={(event) =>
                      handleStatusChange(
                        event.target
                          .value as
                          | "Ativo"
                          | "Inativo"
                      )
                    }
                    className="w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-gray-900 focus:ring-4 focus:ring-gray-100"
                  >
                    <option value="Ativo">
                      Ativo
                    </option>

                    <option value="Inativo">
                      Inativo
                    </option>
                  </select>
                </div>

                {error && (
                  <div className="rounded-lg bg-red-50 px-3.5 py-2.5 text-xs text-red-600">
                    {error}
                  </div>
                )}

                <div className="flex justify-end gap-2 border-t border-gray-100 pt-4">

                  <button
                    type="button"
                    onClick={
                      handleCancelEdit
                    }
                    disabled={
                      isUpdating
                    }
                    className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancelar
                  </button>

                  <button
                    type="button"
                    onClick={
                      handleSaveEdit
                    }
                    disabled={
                      isUpdating
                    }
                    className="rounded-lg bg-gray-950 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
                  >
                    {isUpdating
                      ? "A guardar..."
                      : "Guardar alterações"}
                  </button>

                </div>

              </div>
            ) : (

              /* PERFIL */

              <>
                {/* IDENTIDADE */}

                <div className="flex items-center gap-3 border-b border-gray-100 px-5 py-5">

                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-lg font-bold text-gray-700">
                    {selectedClient.name
                      .charAt(0)
                      .toUpperCase()}
                  </div>

                  <div className="min-w-0">

                    <h3 className="truncate text-base font-semibold text-gray-900">
                      {selectedClient.name}
                    </h3>

                    <p className="mt-0.5 text-xs text-gray-500">
                      {selectedClient.phone}
                    </p>

                  </div>

                  <span
                    className={`ml-auto inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ${
                      selectedClient.status ===
                      "Ativo"
                        ? "bg-green-50 text-green-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        selectedClient.status ===
                        "Ativo"
                          ? "bg-green-500"
                          : "bg-gray-400"
                      }`}
                    />

                    {selectedClient.status}
                  </span>

                </div>

                {/* ESTATÍSTICAS */}

                <div className="grid grid-cols-1 gap-2.5 px-5 py-5 sm:grid-cols-3">

                  <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-3.5">

                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white shadow-sm">
                      <CalendarDays className="h-4 w-4 text-gray-500" />
                    </div>

                    <p className="mt-3 text-xl font-bold tracking-tight text-gray-900">
                      {
                        selectedClient.visits
                      }
                    </p>

                    <p className="mt-0.5 text-[11px] font-medium text-gray-500">
                      Visitas realizadas
                    </p>

                  </div>

                  <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-3.5">

                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white shadow-sm">
                      <span className="text-xs font-bold text-gray-500">
                        Kz
                      </span>
                    </div>

                    <p className="mt-3 text-xl font-bold tracking-tight text-gray-900">
                      {formatCurrency(
                        selectedClient.totalSpent
                      )}
                    </p>

                    <p className="mt-0.5 text-[11px] font-medium text-gray-500">
                      Total gasto
                    </p>

                  </div>

                  <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-3.5">

                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white shadow-sm">
                      <CalendarDays className="h-4 w-4 text-gray-500" />
                    </div>

                    <p className="mt-3 text-sm font-bold text-gray-900">
                      {formatDate(
                        selectedClient.lastVisit
                      )}
                    </p>

                    <p className="mt-0.5 text-[11px] font-medium text-gray-500">
                      Última visita
                    </p>

                  </div>

                </div>

                {/* CONTACTO */}

                <div className="px-5 pb-5">

                  <h4 className="mb-2.5 text-xs font-semibold text-gray-900">
                    Informações de contacto
                  </h4>

                  <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">

                    <div className="rounded-lg border border-gray-100 p-3">

                      <div className="flex items-center gap-2 text-gray-400">

                        <Mail className="h-3.5 w-3.5" />

                        <span className="text-[10px] font-medium uppercase tracking-wide">
                          Email
                        </span>

                      </div>

                      <p className="mt-1.5 break-all text-xs font-semibold text-gray-900">
                        {selectedClient.email ||
                          "Sem email"}
                      </p>

                    </div>

                    <div className="rounded-lg border border-gray-100 p-3">

                      <div className="flex items-center gap-2 text-gray-400">

                        <Phone className="h-3.5 w-3.5" />

                        <span className="text-[10px] font-medium uppercase tracking-wide">
                          Telefone
                        </span>

                      </div>

                      <p className="mt-1.5 text-xs font-semibold text-gray-900">
                        {
                          selectedClient.phone
                        }
                      </p>

                    </div>

                  </div>

                </div>

                {/* FOOTER */}

                <div className="flex justify-end gap-2 border-t border-gray-100 px-5 py-4">

                  <button
                    type="button"
                    onClick={
                      handleStartEdit
                    }
                    className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
                  >
                    <Pencil className="h-3.5 w-3.5" />

                    Editar
                  </button>

                  <button
                    type="button"
                    onClick={
                      handleCloseDetails
                    }
                    className="rounded-lg bg-gray-950 px-4 py-2 text-xs font-medium text-white hover:bg-gray-800"
                  >
                    Fechar
                  </button>

                </div>
              </>
            )}

          </div>
        </div>
      )}

      {/* ======================================================
          MODAL — EXCLUIR
      ====================================================== */}

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
          onClick={
            handleCancelDelete
          }
        >
          <div
            className="
              w-full
              max-w-sm
              rounded-2xl
              bg-white
              p-5
              shadow-2xl
            "
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-600">
              <Trash2 className="h-5 w-5" />
            </div>

            <h2 className="mt-4 text-base font-semibold text-gray-900">
              Excluir cliente?
            </h2>

            <p className="mt-2 text-xs leading-5 text-gray-500">

              Tem certeza que deseja excluir{" "}

              <span className="font-semibold text-gray-900">
                {
                  deletingClient.name
                }
              </span>

              ?

              <br />

              Esta ação não poderá ser desfeita.

            </p>

            <div className="mt-6 flex justify-end gap-2">

              <button
                type="button"
                onClick={
                  handleCancelDelete
                }
                disabled={isDeleting}
                className="rounded-lg border border-gray-200 px-4 py-2.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={
                  handleDeleteClient
                }
                disabled={isDeleting}
                className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-4 py-2.5 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                <Trash2 className="h-3.5 w-3.5" />

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