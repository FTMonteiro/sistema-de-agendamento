"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  ShieldCheck,
  UserRound,
} from "lucide-react";

const inputClass =
  "h-[51px] w-full rounded-[12px] border border-neutral-200 bg-white pl-11 pr-4 text-[13px] text-neutral-900 outline-none transition-all duration-300 placeholder:text-neutral-400 hover:border-neutral-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/[0.06]";

const socialButtonClass =
  "nevrx-social-button group flex h-[50px] w-full items-center justify-center gap-3 rounded-[12px] text-[13px] font-medium active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-blue-500/10";

export default function CadastroPage() {
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const [loading, setLoading] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  /*
   * CAMPO ATUALMENTE FOCADO
   *
   * Serve apenas para controlar a cor e a animação
   * dos ícones dos inputs.
   */
  const [focusedField, setFocusedField] = useState<
    "name" | "company" | "email" | "password" | "confirmPassword" | null
  >(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");

    /*
     * VALIDAÇÃO
     */

    if (
      !name.trim() ||
      !company.trim() ||
      !email.trim() ||
      !password ||
      !confirmPassword
    ) {
      setErrorMessage("Preencha todos os campos obrigatórios.");
      return;
    }

    if (!acceptedTerms) {
      setErrorMessage(
        "É necessário aceitar os Termos de utilização e a Política de privacidade.",
      );
      return;
    }

    if (password.length < 8) {
      setErrorMessage("A palavra-passe deve ter pelo menos 8 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("As palavras-passe não coincidem.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        credentials: "include",

        body: JSON.stringify({
          name: name.trim(),
          company: company.trim(),
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      /*
       * Tenta ler a resposta da API
       */

      const data = await response.json();

      /*
       * Se a API retornar erro
       */

      if (!response.ok) {
        throw new Error(data?.error || "Não foi possível criar a conta.");
      }

      /*
       * CADASTRO CONCLUÍDO
       */

      setSuccessMessage(
        "Conta criada com sucesso! A redirecionar para o login...",
      );

      /*
       * Limpar formulário
       */

      setName("");
      setCompany("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setAcceptedTerms(false);

      /*
       * Redirecionar para login depois de 1.8 segundos
       */

      setTimeout(() => {
        window.location.href = "/login";
      }, 1800);
    } catch (error) {
      console.error("Erro ao criar conta:", error);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Não foi possível criar a conta.",
      );
    } finally {
      setLoading(false);
    }
  }

  /*
   * GOOGLE
   */

  function handleGoogleRegister() {
    setErrorMessage("");

    setSuccessMessage("O cadastro com Google ainda não está configurado.");
  }

  /*
   * APPLE
   */

  function handleAppleRegister() {
    setErrorMessage("");

    setSuccessMessage("O cadastro com Apple ainda não está configurado.");
  }

  return (
    <main className="min-h-screen bg-white text-neutral-950">
      <div className="grid min-h-screen lg:grid-cols-2">
        {/* PAINEL ESQUERDO */}

        <section className="nevrx-register-dark relative hidden min-h-screen overflow-hidden lg:flex">
          {/* GLOW SUPERIOR */}

          <div
            aria-hidden="true"
            className="nevrx-glow absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-blue-600/10 blur-[120px]"
          />

          {/* GLOW INFERIOR */}

          <div
            aria-hidden="true"
            className="nevrx-glow absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-indigo-600/10 blur-[120px]"
          />

          {/* GRID */}

          <div
            aria-hidden="true"
            className="nevrx-grid absolute inset-0 opacity-[0.035]"
          />

          {/* LINHA DE LUZ */}

          <div
            aria-hidden="true"
            className="nevrx-light-line pointer-events-none absolute left-0 top-1/2 h-px w-full bg-gradient-to-r from-transparent via-blue-500/30 to-transparent"
          />

          {/* CONTEÚDO */}

          <div className="nevrx-hero-animation relative z-10 flex w-full flex-col px-10 py-9 xl:px-16">
            {/* LOGO */}

            <Link
              href="/"
              className="inline-flex w-fit items-center gap-3"
              aria-label="NEVRIX"
            >
              <div className="nevrx-logo-box flex h-10 w-10 items-center justify-center rounded-[13px] text-[15px] font-black tracking-[-0.08em]">
                N
              </div>

              <span className="text-[15px] font-bold tracking-[0.24em] text-white">
                NEVRIX
              </span>
            </Link>

            {/* HERO */}

            <div className="flex flex-1 items-center">
              <div className="max-w-[600px]">
                <p className="mb-6 text-[10px] font-semibold uppercase tracking-[0.2em] text-blue-400">
                  Comece agora
                </p>

                <h1 className="text-[48px] font-semibold leading-[0.98] tracking-[-0.055em] text-white xl:text-[68px]">
                  Crie o seu
                  <br />
                  <span className="bg-gradient-to-r from-white via-slate-100 to-blue-400 bg-clip-text text-transparent">
                    espaço NEVRIX.
                  </span>
                </h1>

                <p className="mt-7 max-w-[500px] text-[15px] leading-7 text-slate-400">
                  Tenha tudo o que precisa para gerir clientes, equipa,
                  serviços, agendamentos e pagamentos num único lugar.
                </p>

                {/* BENEFÍCIOS */}

                <div className="mt-10 space-y-5">
                  <div className="nevrx-benefit">
                    <Benefit
                      title="Gestão centralizada"
                      description="Organize toda a operação do seu negócio."
                    />
                  </div>

                  <div className="nevrx-benefit">
                    <Benefit
                      title="Agendamentos inteligentes"
                      description="Tenha controlo total sobre a sua agenda."
                    />
                  </div>

                  <div className="nevrx-benefit">
                    <Benefit
                      title="Cresça com dados"
                      description="Acompanhe o desempenho do seu negócio."
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* FOOTER */}

            <p className="text-[9px] tracking-wide text-slate-700">
              © {new Date().getFullYear()} NEVRIX. Todos os direitos reservados.
            </p>
          </div>
        </section>

        {/* PAINEL DIREITO */}

        <section className="nevrx-register-light relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-10 sm:px-10">
          {/* GLOW */}

          <div
            aria-hidden="true"
            className="nevrx-glow pointer-events-none absolute -right-40 -top-40 h-[450px] w-[450px] rounded-full bg-blue-500/[0.035] blur-[120px]"
          />

          <div
            aria-hidden="true"
            className="nevrx-glow pointer-events-none absolute -bottom-40 -left-40 h-[400px] w-[400px] rounded-full bg-slate-200/50 blur-[120px]"
          />

          {/* CONTEÚDO */}

          <div className="nevrx-form-animation relative z-10 w-full max-w-[430px]">
            {/* LOGO MOBILE */}

            <div className="mb-10 lg:hidden">
              <Link
                href="/"
                className="inline-flex items-center gap-3"
                aria-label="NEVRIX"
              >
                <div className="nevrx-logo-box flex h-10 w-10 items-center justify-center rounded-[13px] text-[15px] font-black">
                  N
                </div>

                <span className="text-[15px] font-bold tracking-[0.24em]">
                  NEVRIX
                </span>
              </Link>
            </div>

            {/* HEADER */}

            <div className="mb-8">
              <p className="mb-2 text-[9px] font-bold uppercase tracking-[0.22em] text-blue-600">
                Criar conta
              </p>

              <h2 className="text-[30px] font-semibold tracking-[-0.04em]">
                Comece agora.
              </h2>

              <p className="mt-2 text-[13px] leading-6 text-neutral-500">
                Crie a sua conta para começar a utilizar a NEVRIX.
              </p>
            </div>

            {/* MENSAGEM DE SUCESSO */}

            {successMessage && (
              <div
                role="status"
                aria-live="polite"
                className="nevrx-register-animation mb-5 flex items-start gap-3 rounded-[12px] border border-green-200 bg-green-50 px-4 py-3 text-[12px] text-green-700"
              >
                <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-green-600 text-[10px] font-bold text-white">
                  ✓
                </div>

                <p className="leading-5">{successMessage}</p>
              </div>
            )}

            {/* MENSAGEM DE ERRO */}

            {errorMessage && (
              <div
                role="alert"
                aria-live="assertive"
                className="nevrx-register-animation mb-5 flex items-start gap-3 rounded-[12px] border border-red-200 bg-red-50 px-4 py-3 text-[12px] text-red-700"
              >
                <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white">
                  !
                </div>

                <p className="leading-5">{errorMessage}</p>
              </div>
            )}

            {/* FORMULÁRIO */}

            <form onSubmit={handleSubmit}>
              {/* NOME */}

              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block text-[11px] font-semibold text-neutral-800"
                >
                  Nome completo
                </label>

                <div className="relative">
                  <UserRound
                    size={16}
                    className={`pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 transition-all duration-300 ${
                      focusedField === "name"
                        ? "scale-110 text-blue-500"
                        : "scale-100 text-neutral-400"
                    }`}
                  />

                  <input
                    id="name"
                    type="text"
                    value={name}
                    onFocus={() => setFocusedField("name")}
                    onBlur={() => setFocusedField(null)}
                    onChange={(event) => {
                      setName(event.target.value);
                      setErrorMessage("");
                    }}
                    placeholder="O seu nome completo"
                    autoComplete="name"
                    required
                    className={inputClass}
                  />
                </div>
              </div>

              {/* EMPRESA */}

              <div className="mt-5">
                <label
                  htmlFor="company"
                  className="mb-2 block text-[11px] font-semibold text-neutral-800"
                >
                  Nome da empresa
                </label>

                <div className="relative">
                  <Building2
                    size={16}
                    className={`pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 transition-all duration-300 ${
                      focusedField === "company"
                        ? "scale-110 text-blue-500"
                        : "scale-100 text-neutral-400"
                    }`}
                  />

                  <input
                    id="company"
                    type="text"
                    value={company}
                    onFocus={() => setFocusedField("company")}
                    onBlur={() => setFocusedField(null)}
                    onChange={(event) => {
                      setCompany(event.target.value);
                      setErrorMessage("");
                    }}
                    placeholder="Nome da sua empresa"
                    autoComplete="organization"
                    required
                    className={inputClass}
                  />
                </div>
              </div>

              {/* EMAIL */}

              <div className="mt-5">
                <label
                  htmlFor="email"
                  className="mb-2 block text-[11px] font-semibold text-neutral-800"
                >
                  Email
                </label>

                <div className="relative">
                  <Mail
                    size={16}
                    className={`pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 transition-all duration-300 ${
                      focusedField === "email"
                        ? "scale-110 text-blue-500"
                        : "scale-100 text-neutral-400"
                    }`}
                  />

                  <input
                    id="email"
                    type="email"
                    value={email}
                    onFocus={() => setFocusedField("email")}
                    onBlur={() => setFocusedField(null)}
                    onChange={(event) => {
                      setEmail(event.target.value);
                      setErrorMessage("");
                    }}
                    placeholder="seu@email.com"
                    autoComplete="email"
                    required
                    className={inputClass}
                  />
                </div>
              </div>

              {/* PASSWORD */}

              <div className="mt-5">
                <label
                  htmlFor="password"
                  className="mb-2 block text-[11px] font-semibold text-neutral-800"
                >
                  Palavra-passe
                </label>

                <div className="relative">
                  <Lock
                    size={16}
                    className={`pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 transition-all duration-300 ${
                      focusedField === "password"
                        ? "scale-110 text-blue-500"
                        : "scale-100 text-neutral-400"
                    }`}
                  />

                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onFocus={() => setFocusedField("password")}
                    onBlur={() => setFocusedField(null)}
                    onChange={(event) => {
                      setPassword(event.target.value);
                      setErrorMessage("");
                    }}
                    placeholder="Mínimo 8 caracteres"
                    autoComplete="new-password"
                    required
                    className={`${inputClass} pr-12`}
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    aria-label={
                      showPassword
                        ? "Ocultar palavra-passe"
                        : "Mostrar palavra-passe"
                    }
                    className="absolute right-2.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-neutral-400 transition-all duration-200 hover:bg-neutral-100 hover:text-neutral-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* CONFIRMAR PASSWORD */}

              <div className="mt-5">
                <label
                  htmlFor="confirmPassword"
                  className="mb-2 block text-[11px] font-semibold text-neutral-800"
                >
                  Confirmar palavra-passe
                </label>

                <div className="relative">
                  <Lock
                    size={16}
                    className={`pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 transition-all duration-300 ${
                      focusedField === "confirmPassword"
                        ? "scale-110 text-blue-500"
                        : "scale-100 text-neutral-400"
                    }`}
                  />

                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onFocus={() => setFocusedField("confirmPassword")}
                    onBlur={() => setFocusedField(null)}
                    onChange={(event) => {
                      setConfirmPassword(event.target.value);
                      setErrorMessage("");
                    }}
                    placeholder="Repita a palavra-passe"
                    autoComplete="new-password"
                    required
                    className={`${inputClass} pr-12`}
                  />

                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((value) => !value)}
                    aria-label={
                      showConfirmPassword
                        ? "Ocultar confirmação"
                        : "Mostrar confirmação"
                    }
                    className="absolute right-2.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-neutral-400 transition-all duration-200 hover:bg-neutral-100 hover:text-neutral-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={16} />
                    ) : (
                      <Eye size={16} />
                    )}
                  </button>
                </div>
              </div>

              {/* TERMOS */}

              <div className="mt-5 flex items-start gap-3">
                <input
                  id="terms"
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(event) => {
                    setAcceptedTerms(event.target.checked);
                    setErrorMessage("");
                  }}
                  required
                  className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-blue-600"
                />

                <label
                  htmlFor="terms"
                  className="text-[10px] leading-5 text-neutral-500"
                >
                  Concordo com os{" "}
                  <Link
                    href="/termos"
                    className="font-semibold text-neutral-800 hover:text-blue-600"
                  >
                    Termos de utilização
                  </Link>{" "}
                  e a{" "}
                  <Link
                    href="/privacidade"
                    className="font-semibold text-neutral-800 hover:text-blue-600"
                  >
                    Política de privacidade
                  </Link>
                  .
                </label>
              </div>

              {/* BOTÃO */}

              <button
                type="submit"
                disabled={
                  loading ||
                  !name.trim() ||
                  !company.trim() ||
                  !email.trim() ||
                  !password ||
                  !confirmPassword ||
                  !acceptedTerms
                }
                className="nevrx-primary-button group relative mt-6 flex h-[51px] w-full items-center justify-center gap-2 overflow-hidden rounded-[12px] text-[13px] font-semibold shadow-[0_8px_25px_rgba(0,0,0,0.12)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {/* EFEITO DE LUZ */}

                <span
                  aria-hidden="true"
                  className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/[0.12] to-transparent transition-transform duration-700 group-hover:translate-x-full"
                />

                <span className="relative z-10 flex items-center gap-2">
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Criando conta...
                    </>
                  ) : (
                    <>
                      Criar conta
                      <ArrowRight
                        size={16}
                        className="transition-transform duration-300 group-hover:translate-x-1"
                      />
                    </>
                  )}
                </span>
              </button>
            </form>

            {/* DIVISOR */}

            <div className="my-6 flex items-center gap-4">
              <div className="h-px flex-1 bg-neutral-200" />

              <span className="whitespace-nowrap text-[9px] font-medium uppercase tracking-[0.18em] text-neutral-400">
                ou continuar com
              </span>

              <div className="h-px flex-1 bg-neutral-200" />
            </div>

            {/* GOOGLE */}

            <button
              type="button"
              onClick={handleGoogleRegister}
              className={socialButtonClass}
            >
              <GoogleIcon />

              <span className="nevrx-google-text">Continuar com Google</span>
            </button>

            {/* APPLE */}

            <button
              type="button"
              onClick={handleAppleRegister}
              className={`${socialButtonClass} mt-3`}
            >
              <AppleIcon />

              <span className="nevrx-apple-text">Continuar com Apple</span>
            </button>

            {/* LOGIN */}

            <p className="mt-7 text-center text-[13px] text-neutral-500">
              Já tem uma conta?{" "}
              <Link
                href="/login"
                className="font-semibold text-neutral-950 hover:text-blue-600"
              >
                Entrar
              </Link>
            </p>

            {/* SEGURANÇA */}

            <div className="mt-5 flex items-center justify-center gap-2 text-[9px] text-neutral-400">
              <ShieldCheck size={11} />

              <span>Os seus dados permanecem protegidos.</span>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

/* BENEFIT */

function Benefit({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-3">
      <div className="nevrx-benefit-icon mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
        ✓
      </div>

      <div>
        <p className="text-[11px] font-semibold text-slate-200">{title}</p>

        <p className="mt-1 text-[10px] leading-5 text-slate-600">
          {description}
        </p>
      </div>
    </div>
  );
}

/* GOOGLE ICON */

function GoogleIcon() {
  return (
    <span className="nevrx-google-icon">
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <path
          fill="#4285F4"
          d="M21.35 12.23c0-.7-.06-1.38-.18-2.03H12v3.84h5.24a4.48 4.48 0 0 1-1.94 2.94v2.45h3.14c1.84-1.7 2.91-4.2 2.91-7.2Z"
        />

        <path
          fill="#34A853"
          d="M12 21.82c2.63 0 4.84-.87 6.45-2.39l-3.14-2.45c-.87.58-1.98.92-3.31.92-2.54 0-4.69-1.72-5.46-4.03H3.3v2.53A9.75 9.75 0 0 0 12 21.82Z"
        />

        <path
          fill="#FBBC05"
          d="M6.54 13.87A5.86 5.86 0 0 1 6.23 12c0-.65.11-1.28.31-1.87V7.6H3.3A9.83 9.83 0 0 0 2.25 12c0 1.58.38 3.08 1.05 4.4l3.24-2.53Z"
        />

        <path
          fill="#EA4335"
          d="M12 6.1c1.43 0 2.71.49 3.72 1.45l2.79-2.79C16.84 3.16 14.63 2.18 12 2.18A9.75 9.75 0 0 0 3.3 7.6l3.24 2.53C7.31 7.82 9.46 6.1 12 6.1Z"
        />
      </svg>
    </span>
  );
}

/* APPLE ICON */

function AppleIcon() {
  return (
    <span className="nevrx-apple-icon">
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.09.8 1.2-.24 2.35-.93 3.63-.84 1.54.12 2.7.73 3.46 1.85-3.18 1.9-2.43 6.07.49 7.23-.58 1.52-1.33 3.03-2.67 3.93ZM12.03 7.25C11.88 4.99 13.71 3.13 15.8 3c.29 2.61-2.36 4.55-3.77 4.25Z" />
      </svg>
    </span>
  );
}
