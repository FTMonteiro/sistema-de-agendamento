export function Header() {
  return (
    <header
      className="
        flex
        h-16
        items-center
        justify-between
        border-b
        bg-white
        px-6
      "
    >
      {/* Título */}
      <h2 className="text-lg font-semibold">Dashboard</h2>

      {/* Área do utilizador */}
      <div className="flex items-center gap-4">
        <button
          className="
            rounded-lg
            p-2
            hover:bg-gray-100
          "
        >
          🔔
        </button>

        <div>
          <p className="font-medium">Faustino</p>

          <span className="text-sm text-gray-500">Administrador</span>
        </div>
      </div>
    </header>
  );
}
