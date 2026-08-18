"use client";

import { useState } from "react";
import { CreditCard, X, UserRound, Banknote } from "lucide-react";

export function ReceivePayment() {
  const [isOpen, setIsOpen] = useState(false);

  const [client, setClient] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");

  function handleOpen() {
    setIsOpen(true);
  }

  function handleClose() {
    setIsOpen(false);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    console.log({
      client,
      amount,
      paymentMethod,
    });

    setClient("");
    setAmount("");
    setPaymentMethod("cash");

    setIsOpen(false);
  }

  return (
    <>
      {/*BOTÃO RECEBER PAGAMENTO*/}

      <button
        type="button"
        onClick={handleOpen}
        className="
          inline-flex
          w-full
          items-center
          justify-center
          gap-2
          rounded-xl
          border
          border-gray-200
          bg-white
          px-5
          py-3
          text-sm
          font-semibold
          text-gray-900
          shadow-sm
          transition-all
          duration-200
          hover:bg-gray-50
          hover:shadow-md
          active:scale-[0.98]
          sm:w-auto
        "
      >
        <CreditCard className="h-4 w-4" />
        Receber Pagamento
      </button>

      {/*  MODAL*/}

      {isOpen && (
        <div
          className="
            fixed
            inset-0
            z-[9999]
            flex
            items-center
            justify-center
            bg-black/40
            px-4
            py-6
            backdrop-blur-sm
          "
          onClick={handleClose}
        >
          <div
            className="
              w-full
              max-w-md
              overflow-hidden
              rounded-2xl
              bg-white
              shadow-2xl
            "
            onClick={(event) => event.stopPropagation()}
          >
            {/* HEADER*/}

            <div
              className="
                flex
                items-center
                justify-between
                border-b
                border-gray-100
                px-6
                py-5
              "
            >
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Receber pagamento
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Registe um novo pagamento.
                </p>
              </div>

              <button
                type="button"
                onClick={handleClose}
                className="
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  rounded-lg
                  text-gray-400
                  transition
                  hover:bg-gray-100
                  hover:text-gray-900
                "
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* FORMULÁRIO */}

            <form onSubmit={handleSubmit} className="space-y-5 px-6 py-6">
              {/* CLIENTE */}

              <div>
                <label
                  htmlFor="payment-client"
                  className="
                    mb-2
                    block
                    text-sm
                    font-medium
                    text-gray-700
                  "
                >
                  Cliente
                </label>

                <div className="relative">
                  <UserRound
                    className="
                      pointer-events-none
                      absolute
                      left-3
                      top-1/2
                      h-4
                      w-4
                      -translate-y-1/2
                      text-gray-400
                    "
                  />

                  <input
                    id="payment-client"
                    type="text"
                    value={client}
                    onChange={(event) => setClient(event.target.value)}
                    placeholder="Nome do cliente"
                    required
                    className="
                      w-full
                      rounded-xl
                      border
                      border-gray-200
                      py-3
                      pl-10
                      pr-4
                      text-sm
                      text-gray-900
                      outline-none
                      transition
                      placeholder:text-gray-400
                      focus:border-blue-500
                      focus:ring-4
                      focus:ring-blue-500/10
                    "
                  />
                </div>
              </div>

              {/* VALOR */}

              <div>
                <label
                  htmlFor="payment-amount"
                  className="
                    mb-2
                    block
                    text-sm
                    font-medium
                    text-gray-700
                  "
                >
                  Valor
                </label>

                <div className="relative">
                  <Banknote
                    className="
                      pointer-events-none
                      absolute
                      left-3
                      top-1/2
                      h-4
                      w-4
                      -translate-y-1/2
                      text-gray-400
                    "
                  />

                  <input
                    id="payment-amount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={amount}
                    onChange={(event) => setAmount(event.target.value)}
                    placeholder="0"
                    required
                    className="
                      w-full
                      rounded-xl
                      border
                      border-gray-200
                      py-3
                      pl-10
                      pr-4
                      text-sm
                      text-gray-900
                      outline-none
                      transition
                      placeholder:text-gray-400
                      focus:border-blue-500
                      focus:ring-4
                      focus:ring-blue-500/10
                    "
                  />
                </div>
              </div>

              {/* MÉTODO DE PAGAMENTO */}

              <div>
                <label
                  htmlFor="payment-method"
                  className="
                    mb-2
                    block
                    text-sm
                    font-medium
                    text-gray-700
                  "
                >
                  Método de pagamento
                </label>

                <select
                  id="payment-method"
                  value={paymentMethod}
                  onChange={(event) => setPaymentMethod(event.target.value)}
                  className="
                    w-full
                    rounded-xl
                    border
                    border-gray-200
                    bg-white
                    px-4
                    py-3
                    text-sm
                    text-gray-900
                    outline-none
                    transition
                    focus:border-blue-500
                    focus:ring-4
                    focus:ring-blue-500/10
                  "
                >
                  <option value="cash">Dinheiro</option>

                  <option value="transfer">Transferência</option>

                  <option value="card">Cartão</option>

                  <option value="multicaixa">Multicaixa Express</option>
                </select>
              </div>

              {/*BOTÕES*/}

              <div
                className="
                  flex
                  flex-col-reverse
                  gap-3
                  border-t
                  border-gray-100
                  pt-5
                  sm:flex-row
                  sm:justify-end
                "
              >
                <button
                  type="button"
                  onClick={handleClose}
                  className="
                    rounded-xl
                    border
                    border-gray-200
                    bg-white
                    px-5
                    py-2.5
                    text-sm
                    font-medium
                    text-gray-700
                    transition
                    hover:bg-gray-50
                  "
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="
                    inline-flex
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    bg-gray-900
                    px-5
                    py-2.5
                    text-sm
                    font-semibold
                    text-white
                    transition
                    hover:bg-gray-800
                    active:scale-[0.98]
                  "
                >
                  <CreditCard className="h-4 w-4" />
                  Confirmar pagamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
