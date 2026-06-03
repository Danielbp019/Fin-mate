function baseHtml(content: string): string {
  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#f8faf8;font-family:Arial,Helvetica,sans-serif">
  <table role="presentation" style="width:100%;max-width:600px;margin:0 auto;padding:20px">
    <tr><td style="text-align:center;padding:20px 0">
      <h1 style="color:#0f6e56;margin:0">FinMate</h1>
    </td></tr>
    <tr><td style="background-color:#ffffff;border-radius:8px;padding:30px;box-shadow:0 2px 8px rgba(15,110,86,0.1)">
      ${content}
    </td></tr>
    <tr><td style="text-align:center;padding:20px 0;color:#3d5c3d;font-size:12px">
      <p style="margin:0">FinMate — Administrador de Finanzas Personales</p>
    </td></tr>
  </table>
</body>
</html>`;
}

export function verificationEmail(
  name: string,
  verificationUrl: string,
): { subject: string; html: string } {
  return {
    subject: 'Verifica tu correo electronico en FinMate',
    html: baseHtml(`
      <h2 style="color:#1a2e1a;margin-top:0">Hola ${name},</h2>
      <p style="color:#3d5c3d;line-height:1.6">Gracias por registrarte en FinMate. Para completar tu registro, por favor verifica tu direccion de correo electronico haciendo clic en el siguiente enlace:</p>
      <table role="presentation" style="margin:25px 0"><tr><td style="background-color:#0f6e56;border-radius:5px;padding:12px 25px">
        <a href="${verificationUrl}" style="color:#ffffff;text-decoration:none;font-weight:bold;font-size:14px">Verificar Correo Electronico</a>
      </td></tr></table>
      <p style="color:#3d5c3d;line-height:1.6">Si no creaste una cuenta en FinMate, puedes ignorar este mensaje.</p>
      <p style="color:#6a8f6a;font-size:12px">Este enlace expirara en 24 horas.</p>
    `),
  };
}

export function passwordResetEmail(
  name: string,
  resetUrl: string,
): { subject: string; html: string } {
  return {
    subject: 'Recuperacion de contrasena - FinMate',
    html: baseHtml(`
      <h2 style="color:#1a2e1a;margin-top:0">Hola ${name},</h2>
      <p style="color:#3d5c3d;line-height:1.6">Recibimos una solicitud para restablecer tu contrasena en FinMate. Haz clic en el siguiente enlace para crear una nueva contrasena:</p>
      <table role="presentation" style="margin:25px 0"><tr><td style="background-color:#0f6e56;border-radius:5px;padding:12px 25px">
        <a href="${resetUrl}" style="color:#ffffff;text-decoration:none;font-weight:bold;font-size:14px">Restablecer Contrasena</a>
      </td></tr></table>
      <p style="color:#3d5c3d;line-height:1.6">Si no solicitaste este cambio, puedes ignorar este mensaje. Tu contrasena actual seguira siendo valida.</p>
      <p style="color:#6a8f6a;font-size:12px">Este enlace expirara en 15 minutos.</p>
    `),
  };
}

export function coupleInvitationEmail(
  coupleName: string,
  inviterName: string,
  inviteUrl: string,
): { subject: string; html: string } {
  return {
    subject: `${inviterName} te ha invitado a un grupo en FinMate`,
    html: baseHtml(`
      <h2 style="color:#1a2e1a;margin-top:0">Hola!</h2>
      <p style="color:#3d5c3d;line-height:1.6"><strong>${inviterName}</strong> te ha invitado a unirse al grupo <strong>${coupleName}</strong> en FinMate para administrar sus finanzas en pareja.</p>
      <table role="presentation" style="margin:25px 0"><tr><td style="background-color:#0f6e56;border-radius:5px;padding:12px 25px">
        <a href="${inviteUrl}" style="color:#ffffff;text-decoration:none;font-weight:bold;font-size:14px">Aceptar Invitacion</a>
      </td></tr></table>
      <p style="color:#3d5c3d;line-height:1.6">Si no esperabas esta invitacion, puedes ignorar este mensaje.</p>
      <p style="color:#6a8f6a;font-size:12px">Esta invitacion expirara en 7 dias.</p>
    `),
  };
}
