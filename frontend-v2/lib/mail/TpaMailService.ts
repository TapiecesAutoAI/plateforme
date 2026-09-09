import nodemailer from "nodemailer";

function requiredEnv(
  name: string,
): string {
  const value =
    process.env[name]?.trim();

  if (!value) {
    throw new Error(
      `Missing environment variable: ${name}`,
    );
  }

  return value;
}

export type TpaMailInput = {
  to: string;
  subject: string;
  text: string;
  html?: string;
};

export async function sendTpaMail(
  input: TpaMailInput,
): Promise<void> {
  const host =
    requiredEnv("TPA_SMTP_HOST");

  const port =
    Number(
      requiredEnv("TPA_SMTP_PORT"),
    );

  const user =
    requiredEnv("TPA_SMTP_USER");

  const password =
    requiredEnv("TPA_SMTP_PASSWORD");

  const from =
    requiredEnv("TPA_MAIL_FROM");

  if (
    !Number.isInteger(port) ||
    port <= 0
  ) {
    throw new Error(
      "Invalid TPA_SMTP_PORT.",
    );
  }

  const transporter =
    nodemailer.createTransport({
      host,
      port,
      secure: false,
      requireTLS: true,
      auth: {
        user,
        pass: password,
      },
    });

  await transporter.sendMail({
    from: `TaPieceAuto <${from}>`,
    to: input.to,
    subject: input.subject,
    text: input.text,
    html: input.html,
  });
}