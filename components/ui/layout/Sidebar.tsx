
import Link from "next/link";

export function Sidebar() {
  return (
    <aside className="flex min-h-screen w-64 flex-col border-r border-gray-200 bg-white px-4 py-6">
      {/* Logo */}
      <div className="mb-10 px-3">
        <h1 className="text-2xl font-bold tracking-tight text-black">
          NEVRIX
        </h1>

        <p className="mt-1 text-xs font-medium text-gray-500">
          Beauty Management
        </p>
      </div>

      {/* Menu */}
      <nav className="flex flex-col gap-1.5">
        <Link
          href="/dashboard"
          className="group flex items-center rounded-lg px-4 py-2.5 text-sm font-medium text-black transition-all duration-200 hover:bg-blue-600 hover:text-white"
        >
          Home
        </Link>

        <Link
          href="/clientes"
          className="group flex items-center rounded-lg px-4 py-2.5 text-sm font-medium text-black transition-all duration-200 hover:bg-blue-600 hover:text-white"
        >
          Clientes
        </Link>

        <Link
          href="/appointments"
          className="group flex items-center rounded-lg px-4 py-2.5 text-sm font-medium text-black transition-all duration-200 hover:bg-blue-600 hover:text-white"
        >
          Agenda
        </Link>

        <Link
          href="/services"
          className="group flex items-center rounded-lg px-4 py-2.5 text-sm font-medium text-black transition-all duration-200 hover:bg-blue-600 hover:text-white"
        >
          Serviços
        </Link>

        <Link
          href="/dashboard/team"
          className="group flex items-center rounded-lg px-4 py-2.5 text-sm font-medium text-black transition-all duration-200 hover:bg-blue-600 hover:text-white"
        >
          Equipa
        </Link>

        <Link
          href="/dashboard/settings"
          className="group flex items-center rounded-lg px-4 py-2.5 text-sm font-medium text-black transition-all duration-200 hover:bg-blue-600 hover:text-white"
        >
          Configurações
        </Link>
      </nav>
    </aside>
  );
}

