import nodemailer from 'nodemailer';
import { env } from '../../config/env.js';
import type { SendEmailOptions } from './email.types.js';

let transporter: nodemailer.Transporter | null = null;

async function getTransporter(): Promise<nodemailer.Transporter> {
  if (transporter) return transporter;

  const testAccount = await nodemailer.createTestAccount();

  transporter = nodemailer.createTransport({
    host: env.smtp.host,
    port: env.smtp.port,
    secure: env.smtp.port === 465,
    auth: {
      user: env.smtp.user || testAccount.user,
      pass: env.smtp.pass || testAccount.pass,
    },
  });

  return transporter;
}

export async function sendEmail(options: SendEmailOptions): Promise<void> {
  const tr = await getTransporter();

  const info = await tr.sendMail({
    from: env.emailFrom,
    to: options.to,
    subject: options.subject,
    html: options.html,
  });

  if (env.nodeEnv === 'development') {
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log('  Email preview:', previewUrl);
    }
  }
}
