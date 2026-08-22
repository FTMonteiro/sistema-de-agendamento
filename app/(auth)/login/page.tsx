"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  Check,
  Clock3,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Scissors,
  Users,
  Loader2,
  Sparkles,
} from "lucide-react";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);

    try {
      console.log({
        email,
        password,
      });

      await new Promise((resolve) => setTimeout(resolve, 1000));
    } finally {
      setLoading(false);
    }
  }

  function handleGoogleLogin() {
    console.log("Login com Google");
  }

  function handleAppleLogin() {
    console.log("Login com Apple");
  }

  return (
    <main className="min-h-screen bg-white text-neutral-950">
      <div className="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">

        {/* =====================================================
            LEFT — BRAND
        ===================================================== */}

        <section className="relative hidden min-h-screen overflow-hidden bg-[#050914] lg:block">

          {/* Background glow */}

          <div className="absolute -left-40 -top-40 h-[560px] w-[560px] rounded-full bg-blue-600/[0.10] blur-[140px]" />

          <div className="absolute -bottom-48 -right-40 h-[560px] w-[560px] rounded-full bg-indigo-600/[0.08] blur-[150px]" />

          {/* Grid */}

          <div
            className="absolute inset-0 opacity-[0.035]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.8) 1px, transparent 1px)",
              backgroundSize: "52px 52px",
            }}
          />

          {/* Decorative line */}

          <div className="absolute left-0 top-0 h-full w-px bg-gradient-to-b from-transparent via-blue-500/40 to-transparent" />

          {/* Content */}

          <div className="relative z-10 flex min-h-screen flex-col px-12 py-10 xl:px-16">

            {/* =================================================
                LOGO
            ================================================= */}

            <div className="login-fade login-delay-1">

              <Link
                href="/"
                className="group inline-flex items-center gap-3"
              >

                {/* NEVRIX MARK */}

                <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 shadow-[0_8px_30px_rgba(37,99,235,.28)] transition-all duration-300 group-hover:scale-105 group-hover:bg-blue-500">

                  <span className="text-[17px] font-black tracking-[-0.08em] text-white">
                    N
                  </span>

                  <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full border-2 border-[#050914] bg-blue-400" />

                </div>

                <div className="leading-none">

                  <p className="text-[16px] font-bold tracking-[0.20em] text-white">
                    NEVRIX
                  </p>

                  <p className="mt-1 text-[8px] font-medium uppercase tracking-[0.25em] text-slate-500">
                    Business Management
                  </p>

                </div>

              </Link>

            </div>

            {/* =================================================
                HERO
            ================================================= */}

            <div className="flex flex-1 items-center">

              <div className="w-full max-w-[650px]">

                {/* Badge */}

                <div className="login-fade login-delay-2 mb-7">

                  <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/[0.07] px-3.5 py-2">

                    <Sparkles
                      size={13}
                      className="text-blue-400"
                    />

                    <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-blue-400">
                      Gestão inteligente
                    </span>

                  </div>

                </div>

                {/* Title */}

                <h1 className="login-fade login-delay-3 max-w-[620px] text-[48px] font-semibold leading-[1.04] tracking-[-0.045em] text-white xl:text-[62px]">

                  O seu negócio.

                  <br />

                  <span className="bg-gradient-to-r from-white via-slate-200 to-blue-400 bg-clip-text text-transparent">
                    Mais simples.
                  </span>

                </h1>

                {/* Description */}

                <p className="login-fade login-delay-4 mt-7 max-w-[540px] text-[15px] leading-7 text-slate-400 xl:text-base">
                  Uma plataforma completa para gerir clientes,
                  profissionais, serviços, agendamentos e pagamentos
                  num único lugar.
                </p>

                {/* =================================================
                    DASHBOARD PREVIEW
                ================================================= */}

                <div className="login-dashboard relative mt-12 h-[205px] max-w-[570px]">

                  {/* Main card */}

                  <div className="absolute left-0 top-0 w-[315px] rounded-2xl border border-white/[0.08] bg-white/[0.045] p-4 shadow-2xl backdrop-blur-xl">

                    <div className="flex items-center justify-between">

                      <div>

                        <p className="text-[9px] font-medium uppercase tracking-[0.14em] text-slate-500">
                          Visão geral
                        </p>

                        <p className="mt-1 text-sm font-semibold text-white">
                          Hoje
                        </p>

                      </div>

                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
                        <CalendarDays size={15} />
                      </div>

                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-3">

                      <div className="rounded-xl border border-white/[0.06] bg-black/20 p-3">

                        <div className="flex items-center gap-2">

                          <Users
                            size={13}
                            className="text-blue-400"
                          />

                          <span className="text-[10px] text-slate-500">
                            Clientes
                          </span>

                        </div>

                        <p className="mt-2 text-xl font-semibold text-white">
                          120
                        </p>

                      </div>

                      <div className="rounded-xl border border-white/[0.06] bg-black/20 p-3">

                        <div className="flex items-center gap-2">

                          <Clock3
                            size={13}
                            className="text-blue-400"
                          />

                          <span className="text-[10px] text-slate-500">
                            Agenda
                          </span>

                        </div>

                        <p className="mt-2 text-xl font-semibold text-white">
                          24
                        </p>

                      </div>

                    </div>

                  </div>

                  {/* Floating card */}

                  <div className="login-float absolute right-0 top-14 w-[225px] rounded-2xl border border-white/[0.09] bg-[#0b1220]/95 p-4 shadow-2xl backdrop-blur-xl">

                    <div className="flex items-center justify-between">

                      <div className="flex items-center gap-2">

                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
                          <Scissors size={14} />
                        </div>

                        <div>

                          <p className="text-[9px] text-slate-500">
                            Próximo
                          </p>

                          <p className="text-xs font-medium text-white">
                            Corte + Barba
                          </p>

                        </div>

                      </div>

                      <span className="text-[10px] font-medium text-blue-400">
                        14:30
                      </span>

                    </div>

                    <div className="mt-4 h-px bg-white/[0.06]" />

                    <div className="mt-3 flex items-center gap-2">

                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-[8px] font-bold text-white">
                        FM
                      </div>

                      <span className="text-[10px] text-slate-400">
                        Cliente confirmado
                      </span>

                      <Check
                        size={12}
                        className="ml-auto text-emerald-400"
                      />

                    </div>

                  </div>

                </div>

                {/* Features */}

                <div className="login-fade login-delay-5 mt-6 flex flex-wrap gap-8">

                  <Feature
                    number="01"
                    title="Clientes"
                    description="organizados"
                  />

                  <Feature
                    number="02"
                    title="Agenda"
                    description="inteligente"
                  />

                  <Feature
                    number="03"
                    title="Gestão"
                    description="simplificada"
                  />

                </div>

              </div>

            </div>

            {/* Footer */}

            <div className="flex items-center justify-between">

              <p className="text-[10px] tracking-wide text-slate-600">
                © {new Date().getFullYear()} NEVRIX. Todos os direitos
                reservados.
              </p>

              <div className="flex items-center gap-2 text-[10px] text-slate-600">

                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />

                Plataforma operacional

              </div>

            </div>

          </div>

        </section>

        {/* =====================================================
            RIGHT — LOGIN
        ===================================================== */}

        <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-10 sm:px-10">

          {/* Background */}

          <div className="absolute -right-32 -top-32 h-[400px] w-[400px] rounded-full bg-blue-500/[0.045] blur-[120px]" />

          <div className="absolute -bottom-32 -left-32 h-[350px] w-[350px] rounded-full bg-slate-200/50 blur-[110px]" />

          <div className="relative z-10 w-full max-w-[430px]">

            {/* Mobile logo */}

            <div className="mb-12 lg:hidden">

              <Link
                href="/"
                className="inline-flex items-center gap-3"
              >

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 shadow-lg">
                  <span className="text-[17px] font-black tracking-[-0.08em] text-white">
                    N
                  </span>
                </div>

                <div>

                  <p className="text-[16px] font-bold tracking-[0.20em] text-neutral-950">
                    NEVRIX
                  </p>

                  <p className="mt-1 text-[8px] uppercase tracking-[0.2em] text-neutral-400">
                    Business Management
                  </p>

                </div>

              </Link>

            </div>

            {/* Header */}

            <div className="login-form login-delay-1 mb-9">

              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-blue-600">
                <Lock size={18} />
              </div>

              <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-blue-600">
                Área reservada
              </p>

              <h2 className="text-[30px] font-semibold tracking-[-0.035em] text-neutral-950">
                Bem-vindo de volta
              </h2>

              <p className="mt-2 text-sm leading-6 text-neutral-500">
                Entre na sua conta para continuar a gerir o seu negócio.
              </p>

            </div>

            {/* Form */}

            <form
              onSubmit={handleSubmit}
              className="login-form login-delay-2"
            >

              {/* Email */}

              <div>

                <label
                  htmlFor="email"
                  className="mb-2 block text-xs font-semibold text-neutral-800"
                >
                  Email
                </label>

                <div className="group relative">

                  <Mail
                    size={17}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 transition-colors group-focus-within:text-blue-600"
                  />

                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="seu@email.com"
                    required
                    autoComplete="email"
                    className="
                      h-[52px]
                      w-full
                      rounded-xl
                      border
                      border-neutral-200
                      bg-white
                      pl-11
                      pr-4
                      text-sm
                      text-neutral-900
                      outline-none
                      transition-all
                      duration-200
                      placeholder:text-neutral-400
                      hover:border-neutral-300
                      focus:border-blue-500
                      focus:ring-4
                      focus:ring-blue-500/10
                    "
                  />

                </div>

              </div>

              {/* Password */}

              <div className="mt-5">

                <div className="mb-2 flex items-center justify-between">

                  <label
                    htmlFor="password"
                    className="text-xs font-semibold text-neutral-800"
                  >
                    Palavra-passe
                  </label>

                  <Link
                    href="/recuperar-password"
                    className="text-[11px] font-medium text-neutral-500 transition-colors hover:text-blue-600"
                  >
                    Esqueceu a palavra-passe?
                  </Link>

                </div>

                <div className="group relative">

                  <Lock
                    size={17}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 transition-colors group-focus-within:text-blue-600"
                  />

                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Digite sua palavra-passe"
                    required
                    autoComplete="current-password"
                    className="
                      h-[52px]
                      w-full
                      rounded-xl
                      border
                      border-neutral-200
                      bg-white
                      pl-11
                      pr-12
                      text-sm
                      text-neutral-900
                      outline-none
                      transition-all
                      duration-200
                      placeholder:text-neutral-400
                      hover:border-neutral-300
                      focus:border-blue-500
                      focus:ring-4
                      focus:ring-blue-500/10
                    "
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword((value) => !value)
                    }
                    className="
                      absolute
                      right-2
                      top-1/2
                      flex
                      h-8
                      w-8
                      -translate-y-1/2
                      items-center
                      justify-center
                      rounded-lg
                      text-neutral-400
                      transition
                      hover:bg-neutral-100
                      hover:text-neutral-700
                    "
                    aria-label={
                      showPassword
                        ? "Ocultar palavra-passe"
                        : "Mostrar palavra-passe"
                    }
                  >
                    {showPassword ? (
                      <EyeOff size={17} />
                    ) : (
                      <Eye size={17} />
                    )}
                  </button>

                </div>

              </div>

              {/* Submit */}

              <button
                type="submit"
                disabled={loading}
                className="
                  login-button
                  group
                  relative
                  mt-6
                  flex
                  h-[52px]
                  w-full
                  items-center
                  justify-center
                  gap-2
                  overflow-hidden
                  rounded-xl
                  bg-neutral-950
                  text-sm
                  font-semibold
                  text-white
                  shadow-[0_8px_24px_rgba(0,0,0,.08)]
                  transition-all
                  duration-300
                  hover:bg-blue-600
                  hover:shadow-[0_12px_30px_rgba(37,99,235,.20)]
                  active:scale-[.99]
                  disabled:cursor-not-allowed
                  disabled:opacity-70
                "
              >

                <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 group-hover:translate-x-full" />

                {loading ? (
                  <>
                    <Loader2
                      size={17}
                      className="animate-spin"
                    />

                    A entrar...
                  </>
                ) : (
                  <>
                    Entrar

                    <ArrowRight
                      size={16}
                      className="transition-transform duration-300 group-hover:translate-x-1"
                    />
                  </>
                )}

              </button>

            </form>

            {/* Divider */}

            <div className="my-7 flex items-center gap-4">

              <div className="h-px flex-1 bg-neutral-200" />

              <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-neutral-400">
                ou continuar com
              </span>

              <div className="h-px flex-1 bg-neutral-200" />

            </div>

            {/* Social */}

            <div className="login-form login-delay-3">

              {/* Google */}

              <button
                type="button"
                onClick={handleGoogleLogin}
                className="
                  flex
                  h-[52px]
                  w-full
                  items-center
                  justify-center
                  gap-3
                  rounded-xl
                  border
                  border-neutral-200
                  bg-white
                  text-sm
                  font-medium
                  text-neutral-800
                  transition-all
                  duration-200
                  hover:border-neutral-300
                  hover:bg-neutral-50
                  hover:shadow-sm
                  active:scale-[.99]
                "
              >

                <GoogleIcon />

                <span>
                  Continuar com Google
                </span>

              </button>

              {/* Apple */}

              <button
                type="button"
                onClick={handleAppleLogin}
                className="
                  mt-3
                  flex
                  h-[52px]
                  w-full
                  items-center
                  justify-center
                  gap-3
                  rounded-xl
                  border
                  border-neutral-200
                  bg-white
                  text-sm
                  font-medium
                  text-neutral-800
                  transition-all
                  duration-200
                  hover:border-neutral-300
                  hover:bg-neutral-50
                  hover:shadow-sm
                  active:scale-[.99]
                "
              >

                <AppleIcon />

                <span>
                  Continuar com Apple
                </span>

              </button>

            </div>

            {/* Register */}

            <p className="login-fade login-delay-4 mt-8 text-center text-sm text-neutral-500">

              Ainda não tem uma conta?{" "}

              <Link
                href="/cadastro"
                className="font-semibold text-neutral-950 transition-colors hover:text-blue-600"
              >
                Criar conta
              </Link>

            </p>

            {/* Security */}

            <div className="login-fade login-delay-5 mt-7 flex items-center justify-center gap-2 text-[10px] text-neutral-400">

              <Lock size={11} />

              <span>
                Os seus dados são protegidos com segurança.
              </span>

            </div>

          </div>

        </section>

      </div>

      {/* =====================================================
          ANIMAÇÕES
      ===================================================== */}

      <style>{`
        .login-fade {
          animation: loginFade 700ms cubic-bezier(.22,1,.36,1) both;
        }

        .login-form {
          animation: loginForm 650ms cubic-bezier(.22,1,.36,1) both;
        }

        .login-dashboard {
          animation: dashboardIn 900ms cubic-bezier(.22,1,.36,1) both;
        }

        .login-float {
          animation: floatingCard 5s ease-in-out infinite;
        }

        .login-delay-1 {
          animation-delay: 80ms;
        }

        .login-delay-2 {
          animation-delay: 160ms;
        }

        .login-delay-3 {
          animation-delay: 240ms;
        }

        .login-delay-4 {
          animation-delay: 320ms;
        }

        .login-delay-5 {
          animation-delay: 400ms;
        }

        @keyframes loginFade {
          from {
            opacity: 0;
            transform: translateY(14px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes loginForm {
          from {
            opacity: 0;
            transform: translateY(18px);
            filter: blur(3px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
            filter: blur(0);
          }
        }

        @keyframes dashboardIn {
          from {
            opacity: 0;
            transform: translateY(22px) scale(.97);
          }

          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes floatingCard {
          0%,
          100% {
            transform: translateY(0);
          }

          50% {
            transform: translateY(-6px);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .login-fade,
          .login-form,
          .login-dashboard,
          .login-float {
            animation: none !important;
          }
        }
      `}</style>

    </main>
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

      <span className="text-[11px] font-bold tracking-wider text-blue-400 transition-colors group-hover:text-blue-300">
        {number}
      </span>

      <div>

        <p className="text-[11px] font-semibold text-slate-300">
          {title}
        </p>

        <p className="mt-0.5 text-[10px] text-slate-600">
          {description}
        </p>

      </div>

    </div>
  );
}

/* ============================================================
   GOOGLE
============================================================ */

function GoogleIcon() {
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 24 24"
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
        d="M12 6.1c1.43 0 2.71.49 3.72 1.45l2.79-2.79C16.84 3.16 14.63 2.18 12 2.18A9.75 9.75 0 0 0 3.3 7.6l3.24 2.53c.77-2.31 2.92-4.03 5.46-4.03Z"
      />
    </svg>
  );
}

/* ============================================================
   APPLE
============================================================ */

function AppleIcon() {
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.09.8 1.2-.24 2.35-.93 3.63-.84 1.54.12 2.7.73 3.46 1.85-3.18 1.9-2.43 6.07.49 7.23-.58 1.52-1.33 3.03-2.67 3.93ZM12.03 7.25C11.88 4.99 13.71 3.13 15.8 3c.29 2.61-2.36 4.55-3.77 4.25Z" />
    </svg>
  );
}