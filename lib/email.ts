import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ||
  "http://localhost:3000";

export async function sendVerificationEmail(
  to: string,
  name: string,
  token: string,
) {
  const verificationUrl =
    `${APP_URL}/api/auth/verify-email?token=${encodeURIComponent(token)}`;

  const result = await resend.emails.send({
    from: "NEVRIX Flow  <onboarding@resend.dev>",
    to,
    subject: "Confirme o seu email — NEVRIX",
    html: `
      <!DOCTYPE html>
      <html lang="pt">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Confirme o seu email — NEVRIX</title>
        </head>

        <body
          style="
            margin: 0;
            padding: 0;
            background: #f5f5f5;
            font-family: Arial, Helvetica, sans-serif;
            color: #171717;
          "
        >
          <div
            style="
              max-width: 600px;
              margin: 40px auto;
              background: #ffffff;
              border-radius: 12px;
              overflow: hidden;
              border: 1px solid #e5e5e5;
            "
          >
            <div
              style="
                padding: 32px;
                text-align: center;
                border-bottom: 1px solid #eeeeee;
              "
            >
              <h1
                style="
                  margin: 0;
                  font-size: 28px;
                  font-weight: 700;
                  color: #171717;
                "
              >
                NEVRIX
              </h1>
            </div>

            <div style="padding: 32px;">
              <p
                style="
                  margin: 0 0 16px;
                  font-size: 16px;
                  line-height: 1.6;
                "
              >
                Olá, ${escapeHtml(name)}!
              </p>

              <p
                style="
                  margin: 0 0 16px;
                  font-size: 16px;
                  line-height: 1.6;
                "
              >
                A sua conta NEVRIX foi criada com sucesso.
              </p>

              <p
                style="
                  margin: 0 0 24px;
                  font-size: 16px;
                  line-height: 1.6;
                "
              >
                Para ativar a sua conta, confirme o seu endereço
                de email clicando no botão abaixo.
              </p>

              <div
                style="
                  margin: 32px 0;
                  text-align: center;
                "
              >
                <a
                  href="${verificationUrl}"
                  style="
                    display: inline-block;
                    padding: 14px 24px;
                    background: #171717;
                    color: #ffffff;
                    text-decoration: none;
                    border-radius: 8px;
                    font-size: 15px;
                    font-weight: 600;
                  "
                >
                  Confirmar meu email
                </a>
              </div>

              <p
                style="
                  margin: 0 0 16px;
                  font-size: 14px;
                  line-height: 1.6;
                  color: #666666;
                "
              >
                Este link expira em 24 horas.
              </p>

              <p
                style="
                  margin: 0;
                  font-size: 14px;
                  line-height: 1.6;
                  color: #666666;
                "
              >
                Se não foi você que criou esta conta, pode ignorar
                este email.
              </p>
            </div>

            <div
              style="
                padding: 24px 32px;
                background: #fafafa;
                border-top: 1px solid #eeeeee;
              "
            >
              <p
                style="
                  margin: 0;
                  font-size: 13px;
                  color: #777777;
                  text-align: center;
                "
              >
                — Equipa NEVRIX
              </p>
            </div>
          </div>
        </body>
      </html>
    `,
  });

  return result;
}

/*
|--------------------------------------------------------------------------
| ESCAPAR HTML
|--------------------------------------------------------------------------
|
| Evita que caracteres especiais presentes no nome do utilizador
| sejam interpretados como HTML dentro do email.
|--------------------------------------------------------------------------
*/

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}