"use client";

import {
  FormEvent,
  ReactNode,
  useMemo,
  useState,
} from "react";
import Link from "next/link";

import {
  ArrowRight,
  BarChart3,
  Building2,
  Check,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  ShieldCheck,
  UserRound,
  Zap,
} from "lucide-react";

export default function CadastroPage() {
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [acceptTerms, setAcceptTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  /* ============================================================
     FORÇA DA PALAVRA-PASSE
  ============================================================ */

  const passwordStrength = useMemo(() => {
    let score = 0;

    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    return score;
  }, [password]);

  const passwordLabel = useMemo(() => {
    if (!password) return "";

    if (passwordStrength <= 1) return "Fraca";
    if (passwordStrength === 2) return "Média";
    if (passwordStrength === 3) return "Boa";

    return "Excelente";
  }, [password, passwordStrength]);

  const passwordsMatch =
    confirmPassword.length > 0 &&
    password === confirmPassword;

  /* ============================================================
     SUBMIT
  ============================================================ */

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!name || !company || !email || !password) {
      alert("Preencha todos os campos obrigatórios.");
      return;
    }

    if (!acceptTerms) {
      alert(
        "Aceite os termos de utilização para continuar."
      );
      return;
    }

    if (password !== confirmPassword) {
      alert("As palavras-passe não coincidem.");
      return;
    }

    if (password.length < 8) {
      alert(
        "A palavra-passe deve ter pelo menos 8 caracteres."
      );
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "/api/auth/register",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            name,
            company,
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "Não foi possível criar a conta."
        );
      }

      console.log("Conta criada:", data);

      alert("Conta criada com sucesso!");

      /* ========================================================
         LIMPAR FORMULÁRIO
      ======================================================== */

      setName("");
      setCompany("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setAcceptTerms(false);

      /* ========================================================
         IR PARA LOGIN
      ======================================================== */

      window.location.href = "/login";
    } catch (error) {
      console.error(
        "Erro ao criar conta:",
        error
      );

      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert(
          "Não foi possível criar a conta."
        );
      }
    } finally {
      setLoading(false);
    }
  }

  /* ============================================================
     SOCIAL
  ============================================================ */

  function handleGoogleSignup() {
    alert(
      "Cadastro com Google será configurado posteriormente."
    );
  }

  function handleAppleSignup() {
    alert(
      "Cadastro com Apple será configurado posteriormente."
    );
  }

  return (
    <main className="min-h-screen overflow-hidden bg-white text-neutral-950">
      <div className="grid min-h-screen lg:grid-cols-[1.08fr_0.92fr]">

        {/* =====================================================
            PAINEL ESQUERDO
        ====================================================== */}

        <section className="signup-panel relative hidden min-h-screen overflow-hidden bg-[#05070b] lg:flex">

          {/* ORBS */}

          <div
            aria-hidden="true"
            className="signup-orb signup-orb-one"
          />

          <div
            aria-hidden="true"
            className="signup-orb signup-orb-two"
          />

          <div
            aria-hidden="true"
            className="signup-orb signup-orb-three"
          />

          {/* GRID */}

          <div
            aria-hidden="true"
            className="signup-grid absolute inset-0"
          />

          {/* LINHA */}

          <div
            aria-hidden="true"
            className="absolute left-0 top-0 h-full w-px bg-gradient-to-b from-transparent via-blue-500/30 to-transparent"
          />

          <div className="relative z-10 flex min-h-screen w-full flex-col px-10 py-9 xl:px-16">

            {/* LOGO */}

            <div className="signup-enter signup-delay-1">
              <Link
                href="/"
                className="group inline-flex items-center gap-3"
                aria-label="NEVRIX"
              >
                <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-[13px] bg-white shadow-[0_10px_35px_rgba(0,0,0,0.25)] transition-all duration-500 group-hover:-translate-y-0.5 group-hover:shadow-[0_14px_40px_rgba(37,99,235,0.25)]">
                  <span className="relative z-10 text-[15px] font-black tracking-[-0.08em] text-blue-600">
                    N
                  </span>

                  <span
                    aria-hidden="true"
                    className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-blue-100/80 to-transparent transition-transform duration-700 group-hover:translate-x-full"
                  />
                </div>

                <span className="text-[15px] font-bold tracking-[0.24em] text-white">
                  NEVRIX
                </span>
              </Link>
            </div>

            {/* HERO */}

            <div className="flex flex-1 items-center">

              <div className="w-full max-w-[680px]">

                {/* EYEBROW */}

                <div className="signup-enter signup-delay-2 mb-6 flex items-center gap-3">
                  <span className="flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.035] px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.2em] text-slate-400 backdrop-blur-md">

                    <span className="relative flex h-1.5 w-1.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-60" />

                      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-blue-400" />
                    </span>

                    Gestão inteligente
                  </span>
                </div>

                {/* TÍTULO */}

                <h1 className="signup-enter signup-delay-3 max-w-[650px] text-[48px] font-semibold leading-[0.98] tracking-[-0.055em] text-white xl:text-[68px]">

                  O seu negócio.

                  <br />

                  <span className="signup-gradient-text">
                    Mais inteligente.
                  </span>

                </h1>

                {/* TEXTO */}

                <p className="signup-enter signup-delay-4 mt-6 max-w-[450px] text-[14px] leading-6 text-slate-400 xl:text-[15px]">
                  Uma plataforma criada para simplificar
                  a gestão e acelerar o crescimento.
                </p>

                {/* MOCKUP */}

                <div className="signup-dashboard relative mt-11 h-[205px] max-w-[590px]">

                  <div
                    aria-hidden="true"
                    className="absolute left-[20%] top-[30%] h-32 w-64 rounded-full bg-blue-600/10 blur-[70px]"
                  />

                  {/* CARD PRINCIPAL */}

                  <div className="signup-card-main absolute left-0 top-0 w-[325px] rounded-[18px] border border-white/[0.09] bg-white/[0.045] p-4 shadow-[0_30px_80px_rgba(0,0,0,0.35)] backdrop-blur-2xl">

                    <div className="flex items-center justify-between">

                      <div>
                        <p className="text-[9px] font-medium uppercase tracking-[0.16em] text-slate-500">
                          Visão geral
                        </p>

                        <p className="mt-1 text-[13px] font-semibold text-white">
                          Desempenho
                        </p>
                      </div>

                      <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-blue-400/10 bg-blue-500/[0.08] text-blue-400">
                        <BarChart3 size={14} />
                      </div>

                    </div>

                    {/* MÉTRICAS */}

                    <div className="mt-5 grid grid-cols-3 gap-2">

                      <MiniMetric
                        icon={<UserRound size={12} />}
                        label="Clientes"
                        value="120"
                      />

                      <MiniMetric
                        icon={<CalendarIcon />}
                        label="Agenda"
                        value="24"
                      />

                      <MiniMetric
                        icon={<Zap size={12} />}
                        label="Hoje"
                        value="18"
                      />

                    </div>

                    {/* BARRA */}

                    <div className="mt-4">

                      <div className="flex items-center justify-between">

                        <span className="text-[9px] text-slate-600">
                          Atividade
                        </span>

                        <span className="text-[9px] font-medium text-emerald-400">
                          +18,4%
                        </span>

                      </div>

                      <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/[0.06]">

                        <div className="signup-progress h-full rounded-full bg-gradient-to-r from-blue-600 to-blue-400" />

                      </div>

                    </div>

                  </div>

                  {/* CARD SECUNDÁRIO */}

                  <div className="signup-card-secondary absolute right-0 top-[58px] w-[230px] rounded-[18px] border border-white/[0.09] bg-[#0b1018]/90 p-4 shadow-[0_30px_80px_rgba(0,0,0,0.4)] backdrop-blur-2xl">

                    <div className="flex items-center justify-between">

                      <div className="flex items-center gap-2">

                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
                          <CalendarIcon />
                        </div>

                        <div>
                          <p className="text-[9px] text-slate-600">
                            Próximo
                          </p>

                          <p className="text-[11px] font-medium text-white">
                            Agendamento
                          </p>
                        </div>

                      </div>

                      <span className="text-[9px] font-medium text-blue-400">
                        14:30
                      </span>

                    </div>

                    <div className="my-3 h-px bg-white/[0.06]" />

                    <div className="flex items-center gap-2">

                      <div className="flex h-6 w-6 items-center justify-center rounded-full border border-blue-400/20 bg-blue-500 text-[8px] font-bold text-white">
                        FM
                      </div>

                      <div>
                        <p className="text-[9px] font-medium text-slate-300">
                          Cliente confirmado
                        </p>

                        <p className="text-[8px] text-slate-600">
                          Hoje · 14:30
                        </p>
                      </div>

                      <div className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/10">
                        <Check
                          size={11}
                          className="text-emerald-400"
                        />
                      </div>

                    </div>

                  </div>

                </div>

                {/* FEATURES */}

                <div className="signup-enter signup-delay-5 mt-7 flex flex-wrap gap-x-10 gap-y-5">

                  <Feature
                    number="01"
                    title="Organize"
                    description="tudo num só lugar"
                  />

                  <Feature
                    number="02"
                    title="Simplifique"
                    description="a sua operação"
                  />

                  <Feature
                    number="03"
                    title="Cresça"
                    description="com inteligência"
                  />

                </div>

              </div>

            </div>

            {/* FOOTER */}

            <div className="signup-enter signup-delay-6 flex items-center justify-between">

              <p className="text-[9px] tracking-wide text-slate-700">
                © {new Date().getFullYear()} NEVRIX.
              </p>

              <div className="hidden items-center gap-2 text-[9px] text-slate-700 xl:flex">
                <ShieldCheck size={12} />
                Ambiente seguro
              </div>

            </div>

          </div>
        </section>

        {/* =====================================================
            PAINEL DIREITO
        ====================================================== */}

        <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-white px-6 py-10 sm:px-10">

          {/* BACKGROUND */}

          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-40 -top-40 h-[450px] w-[450px] rounded-full bg-blue-500/[0.035] blur-[120px]"
          />

          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-40 -left-40 h-[400px] w-[400px] rounded-full bg-slate-200/50 blur-[120px]"
          />

          <div
            aria-hidden="true"
            className="pointer-events-none absolute right-0 top-0 h-full w-px bg-gradient-to-b from-transparent via-neutral-200/60 to-transparent"
          />

          <div className="relative z-10 w-full max-w-[430px]">

            {/* LOGO MOBILE */}

            <div className="signup-enter signup-delay-1 mb-12 lg:hidden">

              <Link
                href="/"
                className="group inline-flex items-center gap-3"
              >

                <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-[13px] bg-neutral-950 text-[15px] font-black text-blue-500">
                  N

                  <span
                    aria-hidden="true"
                    className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 group-hover:translate-x-full"
                  />
                </div>

                <span className="text-[15px] font-bold tracking-[0.24em] text-neutral-950">
                  NEVRIX
                </span>

              </Link>

            </div>

            {/* HEADER */}

            <div className="signup-enter signup-delay-2 mb-8">

              <p className="mb-2 text-[9px] font-bold uppercase tracking-[0.22em] text-blue-600">
                Criar conta
              </p>

              <h2 className="text-[30px] font-semibold tracking-[-0.04em] text-neutral-950">
                Comece agora.
              </h2>

              <p className="mt-2 text-[13px] leading-6 text-neutral-500">
                Configure a sua conta em poucos minutos.
              </p>

            </div>

            {/* FORM */}

            <form
              onSubmit={handleSubmit}
              className="signup-enter signup-delay-3"
            >

              {/* NOME */}

              <Field
                id="name"
                label="Nome completo"
                icon={<UserRound size={16} />}
              >
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(event) =>
                    setName(event.target.value)
                  }
                  placeholder="O seu nome"
                  autoComplete="name"
                  required
                  className={inputClass}
                />
              </Field>

              {/* EMPRESA */}

              <div className="mt-4">

                <Field
                  id="company"
                  label="Empresa ou negócio"
                  icon={<Building2 size={16} />}
                >
                  <input
                    id="company"
                    type="text"
                    value={company}
                    onChange={(event) =>
                      setCompany(event.target.value)
                    }
                    placeholder="Nome da sua empresa"
                    autoComplete="organization"
                    required
                    className={inputClass}
                  />
                </Field>

              </div>

              {/* EMAIL */}

              <div className="mt-4">

                <Field
                  id="email"
                  label="Email profissional"
                  icon={<Mail size={16} />}
                >
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(event) =>
                      setEmail(event.target.value)
                    }
                    placeholder="seu@email.com"
                    autoComplete="email"
                    required
                    className={inputClass}
                  />
                </Field>

              </div>

              {/* PASSWORD */}

              <div className="mt-4">

                <label
                  htmlFor="password"
                  className="mb-2 block text-[11px] font-semibold text-neutral-800"
                >
                  Palavra-passe
                </label>

                <div className="group relative">

                  <Lock
                    size={16}
                    className="pointer-events-none absolute left-3.5 top-1/2 z-10 -translate-y-1/2 text-neutral-400 transition-all duration-300 group-focus-within:scale-105 group-focus-within:text-blue-600"
                  />

                  <input
                    id="password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    value={password}
                    onChange={(event) =>
                      setPassword(event.target.value)
                    }
                    placeholder="Crie uma palavra-passe"
                    autoComplete="new-password"
                    required
                    className={`${inputClass} pr-12`}
                  />

                  <PasswordToggle
                    visible={showPassword}
                    onClick={() =>
                      setShowPassword(
                        (value) => !value
                      )
                    }
                    label={
                      showPassword
                        ? "Ocultar palavra-passe"
                        : "Mostrar palavra-passe"
                    }
                  />

                </div>

                {password && (
                  <div className="mt-3">

                    <div className="flex gap-1">

                      {[1, 2, 3, 4].map(
                        (level) => (
                          <div
                            key={level}
                            className={`h-1 flex-1 rounded-full ${
                              level <= passwordStrength
                                ? "bg-blue-600"
                                : "bg-neutral-200"
                            }`}
                          />
                        )
                      )}

                    </div>

                    <div className="mt-2 flex justify-between">

                      <span className="text-[10px] text-neutral-400">
                        Mínimo de 8 caracteres.
                      </span>

                      <span className="text-[10px] font-semibold text-neutral-500">
                        {passwordLabel}
                      </span>

                    </div>

                  </div>
                )}

              </div>

              {/* CONFIRMAR PASSWORD */}

              <div className="mt-4">

                <label
                  htmlFor="confirmPassword"
                  className="mb-2 block text-[11px] font-semibold text-neutral-800"
                >
                  Confirmar palavra-passe
                </label>

                <div className="group relative">

                  <Lock
                    size={16}
                    className="pointer-events-none absolute left-3.5 top-1/2 z-10 -translate-y-1/2 text-neutral-400 transition-all duration-300 group-focus-within:scale-105 group-focus-within:text-blue-600"
                  />

                  <input
                    id="confirmPassword"
                    type={
                      showConfirmPassword
                        ? "text"
                        : "password"
                    }
                    value={confirmPassword}
                    onChange={(event) =>
                      setConfirmPassword(
                        event.target.value
                      )
                    }
                    placeholder="Repita a palavra-passe"
                    autoComplete="new-password"
                    required
                    className={`${inputClass} pr-12 ${
                      confirmPassword &&
                      !passwordsMatch
                        ? "border-red-300 focus:border-red-400 focus:ring-red-500/10"
                        : ""
                    }`}
                  />

                  <PasswordToggle
                    visible={showConfirmPassword}
                    onClick={() =>
                      setShowConfirmPassword(
                        (value) => !value
                      )
                    }
                    label={
                      showConfirmPassword
                        ? "Ocultar palavra-passe"
                        : "Mostrar palavra-passe"
                    }
                  />

                </div>

                {confirmPassword && (
                  <div className="mt-2">

                    {passwordsMatch ? (
                      <div className="flex items-center gap-1.5 text-emerald-600">

                        <Check size={12} />

                        <span className="text-[10px]">
                          As palavras-passe coincidem.
                        </span>

                      </div>
                    ) : (
                      <span className="text-[10px] text-red-500">
                        As palavras-passe não coincidem.
                      </span>
                    )}

                  </div>
                )}

              </div>

              {/* TERMOS */}

              <label className="mt-5 flex cursor-pointer items-start gap-3">

                <input
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={(event) =>
                    setAcceptTerms(
                      event.target.checked
                    )
                  }
                  className="mt-0.5 h-4 w-4 cursor-pointer accent-blue-600"
                />

                <span className="text-[10px] leading-5 text-neutral-500">

                  Aceito os{" "}

                  <Link
                    href="/termos"
                    className="font-semibold text-neutral-800 transition-colors hover:text-blue-600"
                  >
                    Termos
                  </Link>

                  {" "}e a{" "}

                  <Link
                    href="/privacidade"
                    className="font-semibold text-neutral-800 transition-colors hover:text-blue-600"
                  >
                    Política de privacidade
                  </Link>

                  .

                </span>

              </label>

              {/* BOTÃO */}

              <button
                type="submit"
                disabled={
                  loading ||
                  !acceptTerms ||
                  password !== confirmPassword
                }
                className="signup-submit group relative mt-5 flex h-[51px] w-full items-center justify-center gap-2 overflow-hidden rounded-[12px] bg-[#050505] text-[13px] font-semibold text-white shadow-[0_8px_25px_rgba(0,0,0,0.15)] transition-all duration-500 hover:bg-[#2563EB] hover:shadow-[0_14px_35px_rgba(37,99,235,0.25)] active:scale-[0.985] disabled:cursor-not-allowed disabled:opacity-50"
              >

                <span
                  aria-hidden="true"
                  className="signup-button-shine absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/[0.16] to-transparent"
                />

                <span className="relative z-10 flex items-center gap-2">

                  {loading ? (
                    <>
                      <Loader2
                        size={16}
                        className="animate-spin"
                      />

                      A criar conta...
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

            <div className="signup-enter signup-delay-4 my-6 flex items-center gap-4">

              <div className="h-px flex-1 bg-neutral-200" />

              <span className="whitespace-nowrap text-[9px] font-medium uppercase tracking-[0.18em] text-neutral-400">
                ou continuar com
              </span>

              <div className="h-px flex-1 bg-neutral-200" />

            </div>

            {/* SOCIAL */}

            <div className="signup-enter signup-delay-5">

              <button
                type="button"
                onClick={handleGoogleSignup}
                className={socialButtonClass}
              >
                <GoogleIcon />

                <span>
                  Continuar com Google
                </span>
              </button>

              <button
                type="button"
                onClick={handleAppleSignup}
                className={`${socialButtonClass} mt-3`}
              >
                <AppleIcon />

                <span>
                  Continuar com Apple
                </span>
              </button>

            </div>

            {/* LOGIN */}

            <p className="signup-enter signup-delay-6 mt-7 text-center text-[13px] text-neutral-500">

              Já tem uma conta?{" "}

              <Link
                href="/login"
                className="font-semibold text-neutral-950 transition-colors duration-200 hover:text-blue-600"
              >
                Entrar
              </Link>

            </p>

            {/* SEGURANÇA */}

            <div className="signup-enter signup-delay-6 mt-5 flex items-center justify-center gap-2 text-[9px] text-neutral-400">

              <ShieldCheck size={11} />

              <span>
                Informação protegida.
              </span>

            </div>

          </div>
        </section>
      </div>

      {/* =====================================================
          ANIMAÇÕES
      ====================================================== */}

      <style jsx global>{`

        @keyframes signupEnter {
          from {
            opacity: 0;
            transform: translateY(14px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .signup-enter {
          animation:
            signupEnter
            0.7s
            cubic-bezier(0.22, 1, 0.36, 1)
            both;
        }

        .signup-delay-1 {
          animation-delay: 0.05s;
        }

        .signup-delay-2 {
          animation-delay: 0.12s;
        }

        .signup-delay-3 {
          animation-delay: 0.19s;
        }

        .signup-delay-4 {
          animation-delay: 0.26s;
        }

        .signup-delay-5 {
          animation-delay: 0.33s;
        }

        .signup-delay-6 {
          animation-delay: 0.4s;
        }

        /* =====================================================
           ORBS
        ====================================================== */

        @keyframes signupOrbOne {
          0%,
          100% {
            transform:
              translate3d(0, 0, 0)
              scale(1);
          }

          50% {
            transform:
              translate3d(30px, 20px, 0)
              scale(1.08);
          }
        }

        @keyframes signupOrbTwo {
          0%,
          100% {
            transform:
              translate3d(0, 0, 0)
              scale(1);
          }

          50% {
            transform:
              translate3d(-25px, -20px, 0)
              scale(1.06);
          }
        }

        @keyframes signupOrbThree {
          0%,
          100% {
            transform:
              translate3d(0, 0, 0);
          }

          50% {
            transform:
              translate3d(15px, -25px, 0);
          }
        }

        .signup-panel {
          isolation: isolate;
        }

        .signup-orb {
          pointer-events: none;
          position: absolute;
          border-radius: 9999px;
          filter: blur(100px);
          z-index: 0;
        }

        .signup-orb-one {
          left: -160px;
          top: -150px;
          width: 500px;
          height: 500px;
          background: rgba(37, 99, 235, 0.09);
          animation:
            signupOrbOne
            10s
            ease-in-out
            infinite;
        }

        .signup-orb-two {
          right: -170px;
          bottom: -180px;
          width: 500px;
          height: 500px;
          background: rgba(79, 70, 229, 0.07);
          animation:
            signupOrbTwo
            12s
            ease-in-out
            infinite;
        }

        .signup-orb-three {
          left: 45%;
          top: 35%;
          width: 260px;
          height: 260px;
          background: rgba(37, 99, 235, 0.035);
          animation:
            signupOrbThree
            8s
            ease-in-out
            infinite;
        }

        /* =====================================================
           GRID
        ====================================================== */

        .signup-grid {
          opacity: 0.035;

          background-image:
            linear-gradient(
              rgba(255, 255, 255, 0.8) 1px,
              transparent 1px
            ),
            linear-gradient(
              90deg,
              rgba(255, 255, 255, 0.8) 1px,
              transparent 1px
            );

          background-size: 52px 52px;
        }

        /* =====================================================
           GRADIENTE
        ====================================================== */

        .signup-gradient-text {
          background:
            linear-gradient(
              90deg,
              #ffffff 0%,
              #f1f5f9 48%,
              #60a5fa 100%
            );

          background-clip: text;
          -webkit-background-clip: text;

          color: transparent;
          -webkit-text-fill-color: transparent;
        }

        /* =====================================================
           PROGRESSO
        ====================================================== */

        @keyframes signupProgress {
          from {
            width: 0;
          }

          to {
            width: 76%;
          }
        }

        .signup-progress {
          width: 76%;

          animation:
            signupProgress
            1.5s
            cubic-bezier(0.22, 1, 0.36, 1)
            0.5s
            both;
        }

        /* =====================================================
           BRILHO BOTÃO
        ====================================================== */

        @keyframes signupButtonShine {
          0% {
            transform: translateX(-100%);
          }

          100% {
            transform: translateX(100%);
          }
        }

        .signup-button-shine {
          animation:
            signupButtonShine
            2.8s
            ease-in-out
            1s
            infinite;
        }

        /* =====================================================
           CARDS
        ====================================================== */

        .signup-card-main {
          animation:
            signupEnter
            0.9s
            cubic-bezier(0.22, 1, 0.36, 1)
            0.5s
            both;
        }

        .signup-card-secondary {
          animation:
            signupEnter
            0.9s
            cubic-bezier(0.22, 1, 0.36, 1)
            0.7s
            both;
        }

        /* =====================================================
           MOVIMENTO REDUZIDO
        ====================================================== */

        @media (prefers-reduced-motion: reduce) {
          *,
          *::before,
          *::after {
            animation-duration: 0.01ms !important;
            animation-delay: 0ms !important;
            transition-duration: 0.01ms !important;
          }
        }

      `}</style>
    </main>
  );
}

/* ============================================================
   FIELD
============================================================ */

function Field({
  id,
  label,
  icon,
  children,
}: {
  id: string;
  label: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-[11px] font-semibold text-neutral-800"
      >
        {label}
      </label>

      <div className="group relative">

        <div className="pointer-events-none absolute left-3.5 top-1/2 z-10 -translate-y-1/2 text-neutral-400 transition-all duration-300 group-focus-within:scale-105 group-focus-within:text-blue-600">
          {icon}
        </div>

        {children}

      </div>
    </div>
  );
}

/* ============================================================
   PASSWORD TOGGLE
============================================================ */

function PasswordToggle({
  visible,
  onClick,
  label,
}: {
  visible: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="absolute right-2.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-neutral-400 transition-all duration-200 hover:bg-neutral-100 hover:text-neutral-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
    >
      {visible ? (
        <EyeOff size={16} />
      ) : (
        <Eye size={16} />
      )}
    </button>
  );
}

/* ============================================================
   FEATURE
============================================================ */

function Feature({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="group flex items-start gap-3">

      <span className="pt-0.5 text-[10px] font-semibold tracking-[0.12em] text-blue-400 transition-colors duration-300 group-hover:text-blue-300">
        {number}
      </span>

      <div>
        <p className="text-[10px] font-medium text-slate-300 transition-colors duration-300 group-hover:text-white">
          {title}
        </p>

        <p className="mt-0.5 text-[9px] text-slate-600">
          {description}
        </p>
      </div>

    </div>
  );
}

/* ============================================================
   MINI METRIC
============================================================ */

function MiniMetric({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-white/[0.055] bg-black/20 p-2.5">

      <div className="flex items-center gap-1.5 text-blue-400">

        {icon}

        <span className="text-[8px] text-slate-600">
          {label}
        </span>

      </div>

      <p className="mt-1.5 text-[15px] font-semibold text-white">
        {value}
      </p>

    </div>
  );
}

/* ============================================================
   CALENDAR ICON
============================================================ */

function CalendarIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect
        width="18"
        height="18"
        x="3"
        y="4"
        rx="2"
      />

      <line
        x1="16"
        x2="16"
        y1="2"
        y2="6"
      />

      <line
        x1="8"
        x2="8"
        y1="2"
        y2="6"
      />

      <line
        x1="3"
        x2="21"
        y1="10"
        y2="10"
      />
    </svg>
  );
}

/* ============================================================
   INPUT
============================================================ */

const inputClass =
  "h-[51px] w-full rounded-[12px] border border-neutral-200 bg-white pl-11 pr-4 text-[13px] text-neutral-900 shadow-[0_2px_10px_rgba(0,0,0,0.02)] outline-none transition-all duration-300 placeholder:text-neutral-400 hover:border-neutral-300 focus:border-blue-500 focus:bg-white focus:shadow-[0_8px_25px_rgba(37,99,235,0.07)] focus:ring-4 focus:ring-blue-500/[0.06]";

/* ============================================================
   SOCIAL BUTTON
============================================================ */

const socialButtonClass =
  "group flex h-[50px] w-full items-center justify-center gap-3 rounded-[12px] border border-neutral-200 bg-white text-[13px] font-medium text-neutral-800 transition-all duration-300 hover:border-neutral-300 hover:bg-neutral-50 hover:shadow-[0_8px_25px_rgba(0,0,0,0.05)] active:scale-[0.99]";

/* ============================================================
   GOOGLE ICON
============================================================ */

function GoogleIcon() {
  return (
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
  );
}

/* ============================================================
   APPLE ICON
============================================================ */

function AppleIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.09.8 1.2-.24 2.35-.93 3.63-.84 1.54.12 2.7.73 3.46 1.85-3.18 1.9-2.43 6.07.49 7.23-.58 1.52-1.33 3.03-2.67 3.93ZM12.03 7.25C11.88 4.99 13.71 3.13 15.8 3c.29 2.61-2.36 4.55-3.77 4.25Z" />
    </svg>
  );
}