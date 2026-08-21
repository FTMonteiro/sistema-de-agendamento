export default function VerifyEmailSuccessPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-xl">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
          <span className="text-3xl text-emerald-600">
            ✓
          </span>
        </div>

        <h1 className="mt-6 text-2xl font-bold text-gray-950">
          Email verificado!
        </h1>

        <p className="mt-3 text-sm leading-6 text-gray-500">
          O email do profissional foi
          verificado com sucesso.
        </p>

        <a
          href="/equipe"
          className="mt-6 inline-flex rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Voltar para a equipe
        </a>
      </div>
    </main>
  );
}