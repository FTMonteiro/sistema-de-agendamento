import { Appointments } from "@/components/appointments/Appointments";
import { ReceivePayment } from "@/components/appointments/ReceivePayment";

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Header da página */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Dashboard</h1>

          <p className="mt-2 text-gray-500">
            Bem-vindo ao painel da NEVRIX
          </p>
        </div>

        {/* Ações principais */}
        <div className="flex gap-3">
          <Appointments/>

             <ReceivePayment />
        </div>
      </div>

      {/* Estatísticas */}
      <div
        className="
          grid
          gap-5
          md:grid-cols-2
          xl:grid-cols-4
        "
      >
        <div
          className="
            rounded-2xl
            border
            bg-white
            p-6
            shadow-sm
            transition
            hover:shadow-md
          "
        >
          <p className="text-sm text-gray-500">Clientes</p>

          <div className="mt-3 flex justify-between">
            <h2 className="text-3xl font-bold">120</h2>

            <span className="text-sm text-green-600">+12%</span>
          </div>
        </div>

        <div
          className="
            rounded-2xl
            border
            bg-white
            p-6
            shadow-sm
            transition
            hover:shadow-md
          "
        >
          <p className="text-sm text-gray-500">Agendamentos</p>

          <div className="mt-3 flex justify-between">
            <h2 className="text-3xl font-bold">25</h2>

            <span className="text-sm text-green-600">+8%</span>
          </div>
        </div>

        <div
          className="
            rounded-2xl
            border
            bg-white
            p-6
            shadow-sm
            transition
            hover:shadow-md
          "
        >
          <p className="text-sm text-gray-500">Serviços realizados</p>

          <div className="mt-3 flex justify-between">
            <h2 className="text-3xl font-bold">15</h2>

            <span className="text-sm text-green-600">+5%</span>
          </div>
        </div>

        <div
          className="
            rounded-2xl
            border
            bg-white
            p-6
            shadow-sm
            transition
            hover:shadow-md
          "
        >
          <p className="text-sm text-gray-500">Receita</p>

          <div className="mt-3 flex justify-between">
            <h2 className="text-3xl font-bold">250.000 Kz</h2>

            <span className="text-sm text-green-600">+15%</span>
          </div>
        </div>
      </div>

      {/* Agenda */}
      <div
        className="
          rounded-2xl
          border
          bg-white
          p-6
        "
      >
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Agenda de hoje</h2>

            <p className="text-sm text-gray-500">
              Próximos atendimentos
            </p>
          </div>

          <button
            className="
              rounded-lg
              bg-primary
              px-4
              py-2
              text-sm
              text-white
              hover:opacity-90
            "
          >
            Ver agenda
          </button>
        </div>

        <div className="space-y-4">
          <div
            className="
              flex
              justify-between
              rounded-xl
              bg-gray-100/60
              p-4
              transition
              hover:bg-gray-100
            "
          >
            <div>
              <p className="font-medium">João Silva</p>

              <p className="text-sm text-gray-500">
                Corte Premium • Carlos
              </p>
            </div>

            <div className="text-right">
              <p className="font-medium">09:00</p>

              <span className="text-sm text-green-600">
                Confirmado
              </span>
            </div>
          </div>

          <div
            className="
              flex
              justify-between
              rounded-xl
              bg-gray-50
              p-4
            "
          >
            <div>
              <p className="font-medium">Maria Santos</p>

              <p className="text-sm text-gray-500">
                Barba • Pedro
              </p>
            </div>

            <div className="text-right">
              <p className="font-medium">10:30</p>

              <span className="text-sm text-yellow-600">
                Aguardando
              </span>
            </div>
          </div>

          <div
            className="
              flex
              justify-between
              rounded-xl
              bg-gray-50
              p-4
            "
          >
            <div>
              <p className="font-medium">Pedro Manuel</p>

              <p className="text-sm text-gray-500">
                Coloração • Ana
              </p>
            </div>

            <div className="text-right">
              <p className="font-medium">14:00</p>

              <span className="text-sm text-green-600">
                Confirmado
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}