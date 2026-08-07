import Link from "next/link";

export function Sidebar() {
  return (
    <aside
      className="
        flex
        h-screen
        w-64
        flex-col
        border-r
        bg-white
        p-6
      "
    >
      {/* Logo */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-primary">NEVRIX</h1>

        <p className="text-sm text-gray-500">Beauty Management</p>
      </div>

      {/* Menu */}
      <nav className="flex flex-col gap-3">
        <Link
          href="/dashboard"
          className="
            rounded-lg
            px-4
            py-2
            hover:bg-gray-100
          "
        >
          Home
        </Link>

        <Link
          href="/dashboard/clients"
          className="
            rounded-lg
            px-4
            py-2
            hover:bg-gray-100
          "
        >
          Clientes
        </Link>

        <Link
          href="/dashboard/appointments"
          className="
            rounded-lg
            px-4
            py-2
            hover:bg-gray-100
          "
        >
          Agenda
        </Link>

        <Link
          href="/dashboard/services"
          className="
            rounded-lg
            px-4
            py-2
            hover:bg-gray-100
          "
        >
          Serviços
        </Link>

        <Link
          href="/dashboard/team"
          className="
            rounded-lg
            px-4
            py-2
            hover:bg-gray-100
          "
        >
          Equipa
        </Link>

        <Link
          href="/dashboard/settings"
          className="
            rounded-lg
            px-4
            py-2
            hover:bg-gray-100
          "
        >
          Configurações
        </Link>
      </nav>
    </aside>
  );
}
