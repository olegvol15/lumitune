import nodemailer from 'nodemailer';

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

export const sendPasswordResetEmail = async (
  to: string,
  code: string,
  isAdmin = false
): Promise<void> => {
  const transporter = createTransporter();
  const role = isAdmin ? 'Admin' : '';
  const appName = process.env.APP_NAME || 'LumiTune';
  const expiresMinutes = isAdmin
    ? process.env.ADMIN_RESET_CODE_EXPIRES_MINUTES || '10'
    : process.env.RESET_CODE_EXPIRES_MINUTES || '10';

  await transporter.sendMail({
    from: `"${appName}" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
    to,
    subject: `${appName}${role ? ' ' + role : ''} – Password Reset Code`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: auto;">
        <h2 style="color: #1DB954;">${appName}</h2>
        <p>You requested a password reset${role ? ` for your ${role} account` : ''}.</p>
        <p>Your reset code is:</p>
        <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #1DB954; margin: 24px 0;">
          ${code}
        </div>
        <p>This code expires in <strong>${expiresMinutes} minutes</strong>.</p>
        <p>If you did not request this, you can safely ignore this email.</p>
      </div>
    `,
  });
};

export const sendWelcomeEmail = async (to: string, username: string): Promise<void> => {
  const transporter = createTransporter();
  const appName = process.env.APP_NAME || 'LumiTune';

  await transporter.sendMail({
    from: `"${appName}" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
    to,
    subject: `Welcome to ${appName}!`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: auto;">
        <h2 style="color: #1DB954;">${appName}</h2>
        <p>Hey <strong>${username}</strong>, welcome aboard! 🎵</p>
        <p>Your account is ready. Start exploring music and building your playlists.</p>
      </div>
    `,
  });
};
