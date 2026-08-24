"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import {
  Menu,
  Moon,
  Sun,
  ChevronDown,
  Settings,
  LogOut,
  User,
  Loader2,
  X,
  AlertTriangle,
} from "lucide-react";

import { useTheme } from "@/components/theme/ThemeProvider";
import { NotificationsBell } from "@/components/notifications/NotificationsBell";

interface HeaderProps {
  onOpenMenu: () => void;
}

interface CurrentUser {
  id: string;
  name: string;
  email: string;
  role: string;
  businessId: string;

  // Logo do estabelecimento
  logo?: string | null;

  // Foto do profissional/funcionário
  avatar?: string | null;
}

const PAGES: Record<
  string,
  { title: string; subtitle: string }
> = {
  "/dashboard": {
    title: "Dashboard",
    subtitle: "Visão geral do seu negócio",
  },

  "/clientes": {
    title: "Clientes",
    subtitle: "Gerencie a sua base de clientes",
  },

  "/appointments": {
    title: "Agenda",
    subtitle: "Agendamentos e atendimentos",
  },

  "/services": {
    title: "Serviços",
    subtitle: "Serviços oferecidos e preços",
  },

  "/equipe": {
    title: "Equipa",
    subtitle: "Profissionais do estabelecimento",
  },

  "/configuracoes": {
    title: "Configurações",
    subtitle: "Dados do estabelecimento",
  },
};

const FALLBACK = {
  title: "NEVRIX Flow",
  subtitle: "Smart Business Management",
};

export function Header({
  onOpenMenu,
}: HeaderProps) {
  const pathname = usePathname();

  const { theme, toggleTheme } = useTheme();

  const [user, setUser] =
    useState<CurrentUser | null>(null);

  const [loadingUser, setLoadingUser] =
    useState(true);

  const [openProfile, setOpenProfile] =
    useState(false);

  const [showLogoutModal, setShowLogoutModal] =
    useState(false);

  const [loggingOut, setLoggingOut] =
    useState(false);

  const profileRef =
    useRef<HTMLDivElement>(null);

  /*
  |--------------------------------------------------------------------------
  | CARREGAR UTILIZADOR
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    async function loadUser() {
      try {
        const response = await fetch(
          "/api/auth/me",
          {
            method: "GET",
            cache: "no-store",
            credentials: "include",
          },
        );

        const contentType =
          response.headers.get(
            "content-type",
          );

        if (
          !contentType?.includes(
            "application/json",
          )
        ) {
          throw new Error(
            "A API /api/auth/me não devolveu JSON.",
          );
        }

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data?.error ||
              "Não foi possível carregar o utilizador.",
          );
        }

        /*
         * Esperamos:
         *
         * data.user
         *
         * e dentro dele:
         *
         * avatar = foto do profissional
         * logo   = logo do estabelecimento
         */

        setUser(
          data.user ?? null,
        );
      } catch (error) {
        console.error(
          "Erro ao carregar utilizador:",
          error,
        );
      } finally {
        setLoadingUser(false);
      }
    }

    loadUser();
  }, []);

  /*
  |--------------------------------------------------------------------------
  | ATUALIZAR PERFIL NO HEADER
  |--------------------------------------------------------------------------
  |
  | Existem dois eventos diferentes:
  |
  | business-profile-updated
  | -> atualização do logo do estabelecimento
  |
  | employee-profile-updated
  | -> atualização da foto do funcionário
  |
  */

  useEffect(() => {
    /*
     * LOGO DO ESTABELECIMENTO
     */

    function handleBusinessUpdated(
      event: Event,
    ) {
      const customEvent =
        event as CustomEvent<{
          logo?: string | null;
          name?: string;
        }>;

      const detail =
        customEvent.detail;

      setUser((currentUser) => {
        if (!currentUser) {
          return currentUser;
        }

        return {
          ...currentUser,

          logo:
            detail.logo ?? null,
        };
      });
    }

    /*
     * FOTO DO FUNCIONÁRIO
     */

    function handleEmployeeUpdated(
      event: Event,
    ) {
      const customEvent =
        event as CustomEvent<{
          avatar?: string | null;
          name?: string;
        }>;

      const detail =
        customEvent.detail;

      setUser((currentUser) => {
        if (!currentUser) {
          return currentUser;
        }

        return {
          ...currentUser,

          avatar:
            detail.avatar ?? null,

          name:
            detail.name ??
            currentUser.name,
        };
      });
    }

    window.addEventListener(
      "business-profile-updated",
      handleBusinessUpdated,
    );

    window.addEventListener(
      "employee-profile-updated",
      handleEmployeeUpdated,
    );

    return () => {
      window.removeEventListener(
        "business-profile-updated",
        handleBusinessUpdated,
      );

      window.removeEventListener(
        "employee-profile-updated",
        handleEmployeeUpdated,
      );
    };
  }, []);

  /*
  |--------------------------------------------------------------------------
  | FECHAR MENU AO CLICAR FORA
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    function handleClickOutside(
      event: MouseEvent,
    ) {
      if (
        profileRef.current &&
        !profileRef.current.contains(
          event.target as Node,
        )
      ) {
        setOpenProfile(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleClickOutside,
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside,
      );
    };
  }, []);

  /*
  |--------------------------------------------------------------------------
  | FECHAR MODAL COM ESC
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    function handleEscape(
      event: KeyboardEvent,
    ) {
      if (
        event.key === "Escape" &&
        !loggingOut
      ) {
        setShowLogoutModal(false);
      }
    }

    if (showLogoutModal) {
      document.addEventListener(
        "keydown",
        handleEscape,
      );
    }

    return () => {
      document.removeEventListener(
        "keydown",
        handleEscape,
      );
    };
  }, [
    showLogoutModal,
    loggingOut,
  ]);

  /*
  |--------------------------------------------------------------------------
  | TÍTULO DA PÁGINA
  |--------------------------------------------------------------------------
  */

  const page =
    PAGES[pathname] ??
    Object.entries(PAGES).find(
      ([href]) =>
        pathname.startsWith(
          `${href}/`,
        ),
    )?.[1] ??
    FALLBACK;

  /*
  |--------------------------------------------------------------------------
  | UTILIZADOR
  |--------------------------------------------------------------------------
  */

  const userName =
    user?.name?.trim() ||
    "Utilizador";

  const avatarLetter =
    userName
      .charAt(0)
      .toUpperCase();

  /*
  |--------------------------------------------------------------------------
  | FOTO QUE SERÁ MOSTRADA
  |--------------------------------------------------------------------------
  |
  | Primeiro tenta a foto do profissional.
  |
  | Se não existir, usa o logo do estabelecimento.
  |
  */

  const profileImage =
    user?.avatar ||
    user?.logo ||
    null;

  /*
  |--------------------------------------------------------------------------
  | CARGO
  |--------------------------------------------------------------------------
  */

  function formatRole(
    role?: string,
  ) {
    if (!role) {
      return "Utilizador";
    }

    switch (
      role.toUpperCase()
    ) {
      case "ADMIN":
      case "ADMINISTRATOR":
      case "ADMINISTRADOR":
        return "Administrador";

      case "OWNER":
      case "PROPRIETARIO":
      case "PROPRIETÁRIO":
        return "Proprietário";

      case "MANAGER":
      case "GERENTE":
        return "Gerente";

      case "PROFESSIONAL":
      case "PROFISSIONAL":
        return "Profissional";

      case "STAFF":
      case "EMPLOYEE":
      case "FUNCIONARIO":
      case "FUNCIONÁRIO":
        return "Funcionário";

      default:
        return role;
    }
  }

  /*
  |--------------------------------------------------------------------------
  | ABRIR MODAL DE LOGOUT
  |--------------------------------------------------------------------------
  */

  function handleLogout() {
    setOpenProfile(false);
    setShowLogoutModal(true);
  }

  /*
  |--------------------------------------------------------------------------
  | CONFIRMAR LOGOUT
  |--------------------------------------------------------------------------
  */

  async function confirmLogout() {
    try {
      setLoggingOut(true);

      const response =
        await fetch(
          "/api/auth/logout",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            credentials:
              "include",
          },
        );

      const contentType =
        response.headers.get(
          "content-type",
        );

      if (
        !contentType?.includes(
          "application/json",
        )
      ) {
        throw new Error(
          "A API de logout não devolveu uma resposta JSON.",
        );
      }

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "Não foi possível terminar a sessão.",
        );
      }

      window.location.href =
        "/login";
    } catch (error) {
      console.error(
        "Erro ao terminar sessão:",
        error,
      );

      setLoggingOut(false);

      window.alert(
        error instanceof Error
          ? error.message
          : "Não foi possível terminar a sessão.",
      );
    }
  }

  /*
  |--------------------------------------------------------------------------
  | RENDER
  |--------------------------------------------------------------------------
  */

  return (
    <>
      <header className="sticky top-0 z-30 w-full border-b border-[var(--border)] bg-[var(--surface)]/95 backdrop-blur-md">
        <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">

          {/* =========================================================
              ESQUERDA
          ========================================================= */}

          <div className="flex min-w-0 items-center gap-2 sm:gap-3">

            <button
              type="button"
              onClick={onOpenMenu}
              aria-label="Abrir menu"
              aria-controls="menu-lateral"
              className="-ml-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[var(--muted)] transition-colors hover:bg-[var(--surface-secondary)] hover:text-[var(--foreground)] active:scale-95 lg:hidden"
            >
              <Menu size={22} />
            </button>

            <div className="min-w-0">
              <h2 className="truncate text-base font-semibold tracking-tight text-[var(--foreground)] sm:text-lg">
                {page.title}
              </h2>

              <p className="hidden truncate text-xs text-[var(--muted)] sm:block">
                {page.subtitle}
              </p>
            </div>
          </div>

          {/* =========================================================
              DIREITA
          ========================================================= */}

          <div className="flex items-center gap-1 sm:gap-2">

            {/* =====================================================
                TEMA
            ===================================================== */}

            <button
              type="button"
              onClick={toggleTheme}
              aria-label={
                theme === "dark"
                  ? "Mudar para modo claro"
                  : "Mudar para modo escuro"
              }
              className="flex h-9 w-9 items-center justify-center rounded-xl text-[var(--muted)] transition-all duration-200 hover:bg-[var(--surface-secondary)] hover:text-[var(--foreground)] active:scale-95"
            >
              {theme === "dark" ? (
                <Sun size={19} />
              ) : (
                <Moon size={19} />
              )}
            </button>

            {/* =====================================================
                NOTIFICAÇÕES
            ===================================================== */}

            <NotificationsBell />

            <div className="mx-1 hidden h-8 w-px bg-[var(--border)] sm:block" />

            {/* =====================================================
                UTILIZADOR
            ===================================================== */}

            <div
              ref={profileRef}
              className="relative"
            >
              {loadingUser ? (
                <div className="flex items-center gap-2 p-1.5">

                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100">
                    <Loader2
                      size={17}
                      className="animate-spin text-gray-400"
                    />
                  </div>

                  <div className="hidden sm:block">
                    <div className="h-3 w-20 animate-pulse rounded bg-gray-200" />

                    <div className="mt-1.5 h-2.5 w-14 animate-pulse rounded bg-gray-100" />
                  </div>

                </div>
              ) : (
                <>
                  {/* =================================================
                      BOTÃO DO PERFIL
                  ================================================= */}

                  <button
                    type="button"
                    onClick={() =>
                      setOpenProfile(
                        (value) =>
                          !value,
                      )
                    }
                    aria-expanded={
                      openProfile
                    }
                    className="flex items-center gap-2 rounded-xl p-1.5 transition-colors hover:bg-[var(--surface-secondary)]"
                  >

                    {/* AVATAR */}

                    {profileImage ? (
                      <img
                        src={profileImage}
                        alt={`Foto de ${userName}`}
                        className="h-9 w-9 shrink-0 rounded-full object-cover shadow-sm"
                      />
                    ) : (
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white shadow-sm">
                        {avatarLetter}
                      </div>
                    )}

                    {/* NOME E CARGO */}

                    <div className="hidden text-left sm:block">

                      <p className="max-w-[140px] truncate text-sm font-semibold leading-4 text-[var(--foreground)]">
                        {userName}
                      </p>

                      <p className="mt-1 text-xs leading-3 text-[var(--muted)]">
                        {formatRole(
                          user?.role,
                        )}
                      </p>

                    </div>

                    <ChevronDown
                      size={16}
                      className={`hidden text-[var(--muted)] transition-transform duration-200 sm:block ${
                        openProfile
                          ? "rotate-180"
                          : ""
                      }`}
                    />

                  </button>

                  {/* =================================================
                      DROPDOWN
                  ================================================= */}

                  {openProfile && (
                    <div className="absolute right-0 top-full z-50 mt-2 w-72 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-xl">

                      {/* =============================================
                          PERFIL
                      ============================================= */}

                      <div className="border-b border-[var(--border)] p-4">

                        <div className="flex items-center gap-3">

                          {/* FOTO */}

                          {profileImage ? (
                            <img
                              src={
                                profileImage
                              }
                              alt={`Foto de ${userName}`}
                              className="h-11 w-11 shrink-0 rounded-full object-cover"
                            />
                          ) : (
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                              {
                                avatarLetter
                              }
                            </div>
                          )}

                          {/* INFORMAÇÕES */}

                          <div className="min-w-0">

                            <p className="truncate text-sm font-semibold text-[var(--foreground)]">
                              {
                                userName
                              }
                            </p>

                            <p className="truncate text-xs text-[var(--muted)]">
                              {
                                user?.email ||
                                ""
                              }
                            </p>

                            <p className="mt-1 text-xs font-medium text-blue-600">
                              {formatRole(
                                user?.role,
                              )}
                            </p>

                          </div>

                        </div>
                      </div>

                      {/* =============================================
                          OPÇÕES
                      ============================================= */}

                      <div className="p-2">

                        {/* CONFIGURAÇÕES */}

                        <button
                          type="button"
                          onClick={() => {
                            setOpenProfile(
                              false,
                            );

                            window.location.href =
                              "/configuracoes";
                          }}
                          className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-[var(--foreground)] transition hover:bg-[var(--surface-secondary)]"
                        >
                          <Settings
                            size={18}
                            className="text-[var(--muted)]"
                          />

                          Configurações
                        </button>

                        {/* MEU PERFIL */}

                        <button
                          type="button"
                          onClick={() => {
                            setOpenProfile(
                              false,
                            );

                            window.location.href =
                              "/configuracoes";
                          }}
                          className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-[var(--foreground)] transition hover:bg-[var(--surface-secondary)]"
                        >
                          <User
                            size={18}
                            className="text-[var(--muted)]"
                          />

                          Meu perfil
                        </button>

                      </div>

                      {/* =============================================
                          LOGOUT
                      ============================================= */}

                      <div className="border-t border-[var(--border)] p-2">

                        <button
                          type="button"
                          onClick={
                            handleLogout
                          }
                          disabled={
                            loggingOut
                          }
                          className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <LogOut
                            size={18}
                          />

                          Terminar sessão
                        </button>

                      </div>

                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ===========================================================
          MODAL DE LOGOUT
      =========================================================== */}

      {showLogoutModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm"
          onMouseDown={(
            event,
          ) => {
            if (
              event.target ===
                event.currentTarget &&
              !loggingOut
            ) {
              setShowLogoutModal(
                false,
              );
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="logout-title"
            className="w-full max-w-md overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl"
          >

            {/* HEADER DA MODAL */}

            <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-5">

              <div className="flex items-center gap-3">

                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-100 text-red-600">
                  <AlertTriangle
                    size={21}
                  />
                </div>

                <div>

                  <h2
                    id="logout-title"
                    className="text-base font-semibold text-[var(--foreground)]"
                  >
                    Terminar sessão
                  </h2>

                  <p className="text-xs text-[var(--muted)]">
                    Confirmação necessária
                  </p>

                </div>

              </div>

              <button
                type="button"
                onClick={() =>
                  setShowLogoutModal(
                    false,
                  )
                }
                disabled={
                  loggingOut
                }
                aria-label="Fechar"
                className="flex h-9 w-9 items-center justify-center rounded-xl text-[var(--muted)] transition hover:bg-[var(--surface-secondary)] hover:text-[var(--foreground)] disabled:opacity-50"
              >
                <X size={19} />
              </button>

            </div>

            {/* CONTEÚDO */}

            <div className="px-6 py-6">

              <p className="text-sm leading-6 text-[var(--muted)]">
                Tem a certeza de que deseja
                terminar a sessão?
              </p>

              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                Será necessário iniciar
                sessão novamente para
                voltar a utilizar o
                sistema.
              </p>

            </div>

            {/* BOTÕES */}

            <div className="flex flex-col-reverse gap-3 border-t border-[var(--border)] px-6 py-5 sm:flex-row sm:justify-end">

              <button
                type="button"
                onClick={() =>
                  setShowLogoutModal(
                    false,
                  )
                }
                disabled={
                  loggingOut
                }
                className="w-full rounded-xl border border-[var(--border)] px-5 py-3 text-sm font-semibold text-[var(--foreground)] transition hover:bg-[var(--surface-secondary)] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={
                  confirmLogout
                }
                disabled={
                  loggingOut
                }
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
              >
                {loggingOut ? (
                  <>
                    <Loader2
                      size={17}
                      className="animate-spin"
                    />

                    A terminar sessão...
                  </>
                ) : (
                  <>
                    <LogOut
                      size={17}
                    />

                    Terminar sessão
                  </>
                )}
              </button>

            </div>
          </div>
        </div>
      )}
    </>
  );
}