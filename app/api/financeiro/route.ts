import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/auth";

/*
|--------------------------------------------------------------------------
| GET - FINANCEIRO
|--------------------------------------------------------------------------
|
| OWNER + EMPLOYEE podem consultar a API, mas a página Financeiro
| deverá estar disponível apenas para OWNER no Sidebar.
|
| A API:
|
| - identifica o utilizador autenticado;
| - identifica o businessId;
| - busca apenas pagamentos do próprio espaço;
| - considera somente pagamentos PAID;
| - usa paidAt como data real da receita;
| - permite consultar um mês específico;
| - calcula receita do dia;
| - calcula receita do mês;
| - devolve a lista de pagamentos.
|
|--------------------------------------------------------------------------
*/

export async function GET(request: NextRequest) {
  try {
    /*
    |--------------------------------------------------------------------------
    | UTILIZADOR AUTENTICADO
    |--------------------------------------------------------------------------
    */

    const user = await requireStaff();

    /*
    |--------------------------------------------------------------------------
    | BUSINESS
    |--------------------------------------------------------------------------
    */

    const businessId = user.businessId;

    if (!businessId) {
      return NextResponse.json(
        {
          error:
            "O utilizador não está associado a nenhum espaço.",
        },
        {
          status: 400,
        },
      );
    }

    /*
    |--------------------------------------------------------------------------
    | MÊS SELECIONADO
    |--------------------------------------------------------------------------
    |
    | Exemplo:
    |
    | /api/financeiro?month=2026-08
    |
    | Se não for enviado, usamos o mês atual.
    |
    */

    const monthParam =
      request.nextUrl.searchParams.get("month");

    const now = new Date();

    let year = now.getFullYear();
    let month = now.getMonth();

    if (monthParam) {
      const match =
        /^(\d{4})-(\d{2})$/.exec(
          monthParam,
        );

      if (!match) {
        return NextResponse.json(
          {
            error:
              "O parâmetro month deve estar no formato YYYY-MM.",
          },
          {
            status: 400,
          },
        );
      }

      year = Number(match[1]);
      month = Number(match[2]) - 1;

      if (
        month < 0 ||
        month > 11
      ) {
        return NextResponse.json(
          {
            error:
              "Mês inválido.",
          },
          {
            status: 400,
          },
        );
      }
    }

    /*
    |--------------------------------------------------------------------------
    | INÍCIO E FIM DO MÊS
    |--------------------------------------------------------------------------
    */

    const startOfMonth = new Date(
      year,
      month,
      1,
      0,
      0,
      0,
      0,
    );

    const startOfNextMonth = new Date(
      year,
      month + 1,
      1,
      0,
      0,
      0,
      0,
    );

    /*
    |--------------------------------------------------------------------------
    | INÍCIO E FIM DO DIA ATUAL
    |--------------------------------------------------------------------------
    |
    | A receita "Hoje" é sempre referente ao dia atual.
    |
    */

    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      0,
      0,
      0,
      0,
    );

    const startOfTomorrow = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1,
      0,
      0,
      0,
      0,
    );

    /*
    |--------------------------------------------------------------------------
    | PAGAMENTOS DO MÊS
    |--------------------------------------------------------------------------
    |
    | IMPORTANTE:
    |
    | Usamos paidAt e NÃO createdAt.
    |
    | A receita deve entrar no dia em que o pagamento foi realmente
    | recebido.
    |
    */

    const payments =
      await prisma.payment.findMany({
        where: {
          status: "PAID",

          paidAt: {
            gte: startOfMonth,
            lt: startOfNextMonth,
          },

          appointment: {
            businessId,
          },
        },

        include: {
          appointment: {
            include: {
              client: {
                select: {
                  id: true,
                  name: true,
                },
              },

              service: {
                select: {
                  id: true,
                  name: true,
                },
              },

              professional: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },

        orderBy: {
          paidAt: "desc",
        },
      });

    /*
    |--------------------------------------------------------------------------
    | RECEITA DO MÊS
    |--------------------------------------------------------------------------
    */

    const monthlyRevenue =
      payments.reduce(
        (total, payment) => {
          return (
            total +
            Number(payment.amount)
          );
        },
        0,
      );

    /*
    |--------------------------------------------------------------------------
    | PAGAMENTOS DE HOJE
    |--------------------------------------------------------------------------
    |
    | Atenção:
    |
    | "Hoje" deve continuar mostrando o dia atual,
    | independentemente do mês selecionado.
    |
    */

    const todayPayments =
      await prisma.payment.findMany({
        where: {
          status: "PAID",

          paidAt: {
            gte: startOfToday,
            lt: startOfTomorrow,
          },

          appointment: {
            businessId,
          },
        },

        select: {
          amount: true,
        },
      });

    /*
    |--------------------------------------------------------------------------
    | RECEITA DE HOJE
    |--------------------------------------------------------------------------
    */

    const todayRevenue =
      todayPayments.reduce(
        (total, payment) => {
          return (
            total +
            Number(payment.amount)
          );
        },
        0,
      );

    /*
    |--------------------------------------------------------------------------
    | PAGAMENTOS POR MÉTODO
    |--------------------------------------------------------------------------
    */

    const paymentMethods = {
      CASH: 0,
      CARD: 0,
      TRANSFER: 0,
      MOBILE_MONEY: 0,
    };

    for (const payment of payments) {
      const method =
        payment.method;

      if (
        method in paymentMethods
      ) {
        paymentMethods[
          method as keyof typeof paymentMethods
        ] += Number(
          payment.amount,
        );
      }
    }

    /*
    |--------------------------------------------------------------------------
    | FORMATAR PAGAMENTOS
    |--------------------------------------------------------------------------
    |
    | Transformamos Decimal do Prisma em number/string simples
    | para o frontend consumir facilmente.
    |
    */

    const formattedPayments =
      payments.map((payment) => ({
        id: payment.id,

        amount:
          Number(payment.amount),

        method: payment.method,

        status: payment.status,

        paidAt:
          payment.paidAt?.toISOString() ??
          null,

        createdAt:
          payment.createdAt.toISOString(),

        reference:
          payment.reference,

        client: {
          id:
            payment.appointment
              .client.id,

          name:
            payment.appointment
              .client.name,
        },

        service: {
          id:
            payment.appointment
              .service.id,

          name:
            payment.appointment
              .service.name,
        },

        professional: {
          id:
            payment.appointment
              .professional.id,

          name:
            payment.appointment
              .professional.name,
        },

        appointment: {
          id:
            payment.appointment.id,

          date:
            payment.appointment.date.toISOString(),

          status:
            payment.appointment.status,
        },
      }));

    /*
    |--------------------------------------------------------------------------
    | RESPOSTA
    |--------------------------------------------------------------------------
    */

    return NextResponse.json({
      success: true,

      period: {
        month:
          `${year}-${String(
            month + 1,
          ).padStart(2, "0")}`,

        start:
          startOfMonth.toISOString(),

        end:
          startOfNextMonth.toISOString(),
      },

      summary: {
        todayRevenue,

        monthlyRevenue,

        paymentsReceived:
          payments.length,

        todayPayments:
          todayPayments.length,
      },

      paymentMethods,

      payments:
        formattedPayments,
    });
  } catch (error) {
    console.error(
      "Erro ao carregar financeiro:",
      error,
    );

    /*
    |--------------------------------------------------------------------------
    | ERRO DE AUTENTICAÇÃO
    |--------------------------------------------------------------------------
    */

    if (
      error instanceof Error &&
      (
        error.message
          .toLowerCase()
          .includes("não autenticado") ||
        error.message
          .toLowerCase()
          .includes("unauthorized") ||
        error.message
          .toLowerCase()
          .includes("unauthenticated")
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Não autenticado.",
        },
        {
          status: 401,
        },
      );
    }

    /*
    |--------------------------------------------------------------------------
    | ERRO INTERNO
    |--------------------------------------------------------------------------
    */

    return NextResponse.json(
      {
        error:
          "Erro ao carregar os dados financeiros.",
      },
      {
        status: 500,
      },
    );
  }
}