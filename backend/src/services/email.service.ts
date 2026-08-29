import nodemailer from 'nodemailer';
import { config } from '../config/env';

let activeTransporter: nodemailer.Transporter | null = null;

const getTransporter = async (): Promise<nodemailer.Transporter> => {
  if (activeTransporter) return activeTransporter;

  if (config.smtp.user && config.smtp.pass) {
    activeTransporter = nodemailer.createTransport({
      host: config.smtp.host || 'smtp.ethereal.email',
      port: config.smtp.port || 587,
      secure: false,
      auth: {
        user: config.smtp.user,
        pass: config.smtp.pass,
      },
    });
    return activeTransporter;
  }

  // Fallback: automatically create fresh Ethereal test account if credentials missing
  console.log('Generating dynamic Ethereal test account...');
  const testAccount = await nodemailer.createTestAccount();
  activeTransporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
  return activeTransporter;
};

export const sendEmail = async (to: string, subject: string, body: string) => {
  const mailOptions = {
    from: '"ReachInbox Scheduler" <scheduler@reachinbox.test>',
    to,
    subject,
    text: body,
    html: `<p>${body.replace(/\n/g, '<br/>')}</p>`,
  };

  try {
    const transporter = await getTransporter();
    const info = await transporter.sendMail(mailOptions);
    const previewUrl = nodemailer.getTestMessageUrl(info);
    return {
      messageId: info.messageId,
      previewUrl,
    };
  } catch (error: any) {
    console.warn('Configured SMTP send failed, attempting automatic Ethereal fallback...', error?.message);
    const fallbackAccount = await nodemailer.createTestAccount();
    const fallbackTransporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: fallbackAccount.user,
        pass: fallbackAccount.pass,
      },
    });
    activeTransporter = fallbackTransporter;
    const info = await fallbackTransporter.sendMail(mailOptions);
    const previewUrl = nodemailer.getTestMessageUrl(info);
    return {
      messageId: info.messageId,
      previewUrl,
    };
  }
};
