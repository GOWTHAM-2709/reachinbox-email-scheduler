import nodemailer from 'nodemailer';
import { config } from '../config/env';

const transporter = nodemailer.createTransport({
  host: config.smtp.host,
  port: config.smtp.port,
  secure: false, // Ethereal uses TLS on 587
  auth: {
    user: config.smtp.user,
    pass: config.smtp.pass,
  },
});

export const sendEmail = async (to: string, subject: string, body: string) => {
  const mailOptions = {
    from: '"ReachInbox Scheduler" <scheduler@reachinbox.test>',
    to,
    subject,
    text: body, // plain text body
    html: `<p>${body.replace(/\n/g, '<br/>')}</p>`,
  };

  const info = await transporter.sendMail(mailOptions);
  
  // For Ethereal, generate a preview URL
  const previewUrl = nodemailer.getTestMessageUrl(info);
  
  return {
    messageId: info.messageId,
    previewUrl,
  };
};
