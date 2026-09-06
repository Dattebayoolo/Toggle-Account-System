import nodemailer from 'nodemailer';

import { config } from './config.js';

let transporter = null;

function getTransporter() {
  if (!config.smtpHost) {
    return null;
  }

  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: config.smtpHost,
      port: config.smtpPort,
      secure: config.smtpSecure,
      auth: config.smtpUser ? { user: config.smtpUser, pass: config.smtpPass } : undefined
    });
  }

  return transporter;
}

function buildHtml(title, bodyText, linkText, linkUrl) {
  return `<div style="font-family:Roboto,Segoe UI,Arial,sans-serif;max-width:480px;margin:0 auto;padding:24px;border:1px solid #dadce0;border-radius:16px;">
    <div style="font-size:20px;font-weight:500;color:#202124;margin-bottom:12px;">${title}</div>
    <p style="color:#5f6368;font-size:14px;line-height:1.5;">${bodyText}</p>
    <p style="margin:20px 0;">
      <a href="${linkUrl}" style="background:#1a73e8;color:#ffffff;text-decoration:none;padding:10px 22px;border-radius:999px;font-size:14px;display:inline-block;">${linkText}</a>
    </p>
    <p style="color:#80868b;font-size:12px;">If you did not request this, you can safely ignore this email.</p>
  </div>`;
}

/**
 * Sends a transactional account email when SMTP is configured.
 * Falls back gracefully so local development can keep using dev links.
 */
export async function sendAccountEmail({ to, subject, title, bodyText, linkText, linkUrl }) {
  const transporterInstance = getTransporter();

  if (!transporterInstance) {
    return { delivered: false, reason: 'SMTP is not configured (SMTP_HOST missing).' };
  }

  try {
    await transporterInstance.sendMail({
      from: config.smtpFrom || 'Toggle Account <no-reply@toggle.local>',
      to,
      subject,
      text: `${bodyText}\n\n${linkText}: ${linkUrl}`,
      html: buildHtml(title, bodyText, linkText, linkUrl)
    });

    return { delivered: true };
  } catch (error) {
    return { delivered: false, reason: error.message };
  }
}