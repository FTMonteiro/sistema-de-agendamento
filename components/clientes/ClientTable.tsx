import { clients } from "@/data/Clients";

export function ClientTable() {
  return (
    <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="p-4 text-left text-sm font-medium text-gray-500">
              Cliente
            </th>

            <th className="p-4 text-left text-sm font-medium text-gray-500">
              Telefone
            </th>

            <th className="p-4 text-left text-sm font-medium text-gray-500">
              Visitas
            </th>

            <th className="p-4 text-left text-sm font-medium text-gray-500">
              Estado
            </th>
          </tr>
        </thead>

        <tbody>
          {clients.map((client) => (
            <tr
              key={client.id}
              className="border-t border-gray-100"
            >
              <td className="p-4">
                <p className="font-medium text-gray-900">
                  {client.name}
                </p>

                <p className="text-sm text-gray-500">
                  {client.email}
                </p>
              </td>

              <td className="p-4 text-sm text-gray-600">
                {client.phone}
              </td>

              <td className="p-4 text-sm text-gray-600">
                {client.visits}
              </td>

              <td className="p-4">
                <span className="rounded-full bg-gray-100 px-3 py-1 text-sm">
                  {client.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}