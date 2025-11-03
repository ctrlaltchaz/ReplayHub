export interface EmailTemplate {
    subject: string;
    html: string;
    text: string;
}

interface InviteEmailData {
    organizationName: string;
    organizationLogo?: string;
    inviterName: string;
    recipientEmail: string;
    roles: string[];
    inviteUrl: string;
    expiresAt: Date;
}

export function generateInviteEmail(data: InviteEmailData): EmailTemplate {
    const expiryDate = new Date(data.expiresAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    const subject = `You're invited to join ${data.organizationName}`;

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Organization Invitation</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f6f9fc;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f6f9fc; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="padding: 40px 40px 20px; text-align: center;">
                            ${data.organizationLogo
            ? `<img src="${data.organizationLogo}" alt="${data.organizationName}" style="max-width: 120px; height: auto; margin-bottom: 20px;" />`
            : `<div style="width: 80px; height: 80px; margin: 0 auto 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 16px; display: flex; align-items: center; justify-content: center; color: white; font-size: 32px; font-weight: bold;">${data.organizationName.charAt(0)}</div>`
        }
                            <h1 style="margin: 0; font-size: 28px; font-weight: 600; color: #1a202c;">
                                You're Invited!
                            </h1>
                        </td>
                    </tr>

                    <!-- Body -->
                    <tr>
                        <td style="padding: 20px 40px;">
                            <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #4a5568;">
                                Hi there!
                            </p>
                            <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #4a5568;">
                                <strong>${data.inviterName}</strong> has invited you to join <strong>${data.organizationName}</strong> on our esports operations platform.
                            </p>
                            
                            ${data.roles.length > 0 ? `
                            <div style="background-color: #edf2f7; border-left: 4px solid #4299e1; padding: 16px; margin: 20px 0; border-radius: 4px;">
                                <p style="margin: 0 0 8px; font-size: 14px; font-weight: 600; color: #2d3748;">
                                    Roles you'll receive:
                                </p>
                                <p style="margin: 0; font-size: 14px; color: #4a5568;">
                                    ${data.roles.join(', ')}
                                </p>
                            </div>
                            ` : ''}

                            <p style="margin: 20px 0; font-size: 16px; line-height: 1.6; color: #4a5568;">
                                Click the button below to accept the invitation and create your account:
                            </p>
                        </td>
                    </tr>

                    <!-- CTA Button -->
                    <tr>
                        <td style="padding: 0 40px 40px; text-align: center;">
                            <a href="${data.inviteUrl}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(102, 126, 234, 0.25);">
                                Accept Invitation
                            </a>
                            <p style="margin: 20px 0 0; font-size: 13px; color: #718096;">
                                Or copy and paste this link into your browser:<br/>
                                <a href="${data.inviteUrl}" style="color: #4299e1; word-break: break-all;">${data.inviteUrl}</a>
                            </p>
                        </td>
                    </tr>

                    <!-- Footer Info -->
                    <tr>
                        <td style="padding: 20px 40px; background-color: #f7fafc; border-bottom-left-radius: 8px; border-bottom-right-radius: 8px;">
                            <p style="margin: 0 0 8px; font-size: 13px; color: #718096;">
                                ⏱️ This invitation expires on <strong>${expiryDate}</strong>
                            </p>
                            <p style="margin: 0; font-size: 13px; color: #718096;">
                                If you weren't expecting this invitation, you can safely ignore this email.
                            </p>
                        </td>
                    </tr>
                </table>

                <!-- Footer -->
                <table width="600" cellpadding="0" cellspacing="0" style="margin-top: 20px;">
                    <tr>
                        <td style="text-align: center; padding: 20px;">
                            <p style="margin: 0; font-size: 12px; color: #a0aec0;">
                                © ${new Date().getFullYear()} Esports Operations Platform. All rights reserved.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    `.trim();

    const text = `
You're invited to join ${data.organizationName}!

Hi there!

${data.inviterName} has invited you to join ${data.organizationName} on our esports operations platform.

${data.roles.length > 0 ? `Roles you'll receive: ${data.roles.join(', ')}` : ''}

To accept this invitation and create your account, visit:
${data.inviteUrl}

This invitation expires on ${expiryDate}.

If you weren't expecting this invitation, you can safely ignore this email.

© ${new Date().getFullYear()} Esports Operations Platform. All rights reserved.
    `.trim();

    return { subject, html, text };
}
