import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
    private transporter: nodemailer.Transporter;

    constructor() {
        console.log('🚀 EmailService constructor called');
        console.log('📧 Raw environment variables:', {
            SMTP_HOST: process.env.SMTP_HOST,
            SMTP_PORT: process.env.SMTP_PORT,
            SMTP_SECURE: process.env.SMTP_SECURE,
            SMTP_USER: process.env.SMTP_USER,
            SMTP_PASSWORD: process.env.SMTP_PASSWORD ? '***SET***' : undefined,
            EMAIL_FROM: process.env.EMAIL_FROM,
            EMAIL_FROM_NAME: process.env.EMAIL_FROM_NAME,
        });

        const smtpConfig = {
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASSWORD,
            },
            tls: {
                // Don't fail on invalid certificates (for development/self-signed certs)
                rejectUnauthorized: process.env.NODE_ENV === 'production',
            },
        };

        console.log('📧 SMTP Configuration:', {
            host: smtpConfig.host,
            port: smtpConfig.port,
            secure: smtpConfig.secure,
            user: smtpConfig.auth.user,
            hasPassword: !!smtpConfig.auth.pass,
        });

        this.transporter = nodemailer.createTransport(smtpConfig);
    }

    async sendPasswordResetEmail(email: string, token: string): Promise<void> {
        const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password/${token}`;
        const fromEmail = process.env.EMAIL_FROM || 'noreply@replayhub.com';
        const fromName = process.env.EMAIL_FROM_NAME || 'ReplayHub';

        const mailOptions = {
            from: `"${fromName}" <${fromEmail}>`,
            to: email,
            subject: 'Reset Your Password - ReplayHub',
            html: this.getPasswordResetEmailTemplate(resetLink, email),
            text: `
Reset Your Password

You requested to reset your password for your ReplayHub account.

Click the link below to reset your password:
${resetLink}

This link will expire in 1 hour.

If you didn't request this, please ignore this email.

Best regards,
The ReplayHub Team
            `.trim(),
        };

        console.log('📧 Attempting to send email:', {
            to: email,
            from: mailOptions.from,
            subject: mailOptions.subject,
            resetLink,
        });

        try {
            const info = await this.transporter.sendMail(mailOptions);
            console.log('✅ Password reset email sent successfully:', {
                messageId: info.messageId,
                accepted: info.accepted,
                rejected: info.rejected,
                response: info.response,
            });
        } catch (error) {
            console.error('❌ Error sending password reset email:', {
                error: error.message,
                code: error.code,
                command: error.command,
                responseCode: error.responseCode,
                response: error.response,
            });
            throw new Error('Failed to send password reset email');
        }
    }

    private getPasswordResetEmailTemplate(resetLink: string, email: string): string {
        return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Your Password</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background: linear-gradient(135deg, #2ef6fc 0%, #1ac4cf 50%, #fc040e 100%);
            min-height: 100vh;
        }
        .container {
            max-width: 600px;
            margin: 40px auto;
            background: white;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }
        .header {
            background: linear-gradient(135deg, #2ef6fc 0%, #fc040e 100%);
            padding: 40px 20px;
            text-align: center;
        }
        .logo {
            width: 80px;
            height: 80px;
            margin: 0 auto 20px;
            background: white;
            border-radius: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        }
        .logo img {
            width: 60px;
            height: 60px;
        }
        .header h1 {
            color: white;
            margin: 0;
            font-size: 32px;
            font-weight: bold;
            text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
        }
        .content {
            padding: 40px 30px;
        }
        .content h2 {
            color: #1a1a1a;
            font-size: 24px;
            margin: 0 0 20px 0;
        }
        .content p {
            color: #4a5568;
            font-size: 16px;
            line-height: 1.6;
            margin: 0 0 20px 0;
        }
        .button {
            display: inline-block;
            padding: 16px 32px;
            background: linear-gradient(135deg, #2ef6fc 0%, #fc040e 100%);
            color: white;
            text-decoration: none;
            border-radius: 8px;
            font-weight: bold;
            font-size: 16px;
            margin: 20px 0;
            box-shadow: 0 4px 15px rgba(46, 246, 252, 0.3);
            transition: transform 0.2s;
        }
        .button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(46, 246, 252, 0.4);
        }
        .info-box {
            background: #f7fafc;
            border-left: 4px solid #2ef6fc;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
        }
        .info-box p {
            margin: 0;
            font-size: 14px;
            color: #2d3748;
        }
        .footer {
            background: #f7fafc;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e2e8f0;
        }
        .footer p {
            color: #718096;
            font-size: 14px;
            margin: 5px 0;
        }
        .link-box {
            background: #f7fafc;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
            word-break: break-all;
        }
        .link-box a {
            color: #2ef6fc;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">
                <img src="https://assets.mckeonwebsolutions.com/replayhub/replayicon.png" alt="ReplayHub Logo">
            </div>
            <h1>ReplayHub</h1>
        </div>
        
        <div class="content">
            <h2>Reset Your Password</h2>
            
            <p>Hi there,</p>
            
            <p>You requested to reset your password for your ReplayHub account (<strong>${email}</strong>).</p>
            
            <p>Click the button below to create a new password:</p>
            
            <div style="text-align: center;">
                <a href="${resetLink}" class="button">Reset Password</a>
            </div>
            
            <div class="info-box">
                <p><strong>⏰ This link expires in 1 hour</strong></p>
                <p>For security reasons, this password reset link will only work once and will expire in 60 minutes.</p>
            </div>
            
            <p>If the button doesn't work, copy and paste this link into your browser:</p>
            
            <div class="link-box">
                <a href="${resetLink}">${resetLink}</a>
            </div>
            
            <div class="info-box">
                <p><strong>🔒 Security Tip:</strong> If you didn't request this password reset, please ignore this email. Your password will remain unchanged.</p>
            </div>
        </div>
        
        <div class="footer">
            <p><strong>ReplayHub</strong></p>
            <p>Esports Operations Platform</p>
            <p style="margin-top: 15px;">This is an automated email. Please do not reply to this message.</p>
        </div>
    </div>
</body>
</html>
        `.trim();
    }

    async sendEmailVerificationCode(email: string, code: string): Promise<void> {
        const fromEmail = process.env.EMAIL_FROM || 'noreply@replayhub.com';
        const fromName = process.env.EMAIL_FROM_NAME || 'ReplayHub';

        const mailOptions = {
            from: `"${fromName}" <${fromEmail}>`,
            to: email,
            subject: 'Verify Your Email Address - ReplayHub',
            html: this.getEmailVerificationTemplate(email, code),
            text: `
Verify Your Email Address

Please use this verification code to confirm your email address change:

${code}

This code will expire in 10 minutes.

If you didn't request this change, please ignore this email.

Best regards,
The ReplayHub Team
            `.trim(),
        };

        console.log('📧 Attempting to send email verification code:', {
            to: email,
            from: mailOptions.from,
            subject: mailOptions.subject,
            code,
        });

        try {
            const info = await this.transporter.sendMail(mailOptions);
            console.log('✅ Email verification code sent successfully:', {
                messageId: info.messageId,
                accepted: info.accepted,
                rejected: info.rejected,
                response: info.response,
            });
        } catch (error) {
            console.error('❌ Error sending email verification code:', {
                error: error.message,
                code: error.code,
                command: error.command,
                responseCode: error.responseCode,
                response: error.response,
            });
            throw new Error('Failed to send email verification code');
        }
    }

    private getEmailVerificationTemplate(email: string, code: string): string {
        return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Email</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background: linear-gradient(135deg, #2ef6fc 0%, #1ac4cf 50%, #fc040e 100%);
            min-height: 100vh;
        }
        .container {
            max-width: 600px;
            margin: 40px auto;
            background: white;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }
        .header {
            background: linear-gradient(135deg, #2ef6fc 0%, #fc040e 100%);
            padding: 40px 20px;
            text-align: center;
        }
        .logo {
            width: 80px;
            height: 80px;
            margin: 0 auto 20px;
            background: white;
            border-radius: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        }
        .logo img {
            width: 60px;
            height: 60px;
        }
        .header h1 {
            color: white;
            margin: 0;
            font-size: 32px;
            font-weight: bold;
            text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
        }
        .content {
            padding: 40px 30px;
        }
        .content h2 {
            color: #1a1a1a;
            font-size: 24px;
            margin: 0 0 20px 0;
        }
        .content p {
            color: #4a5568;
            font-size: 16px;
            line-height: 1.6;
            margin: 0 0 20px 0;
        }
        .code-box {
            background: linear-gradient(135deg, #2ef6fc 0%, #fc040e 100%);
            padding: 30px;
            text-align: center;
            border-radius: 12px;
            margin: 30px 0;
        }
        .code {
            font-size: 42px;
            font-weight: bold;
            color: white;
            letter-spacing: 8px;
            font-family: 'Courier New', monospace;
            text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
        }
        .info-box {
            background: #f7fafc;
            border-left: 4px solid #2ef6fc;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
        }
        .info-box p {
            margin: 0;
            font-size: 14px;
            color: #2d3748;
        }
        .footer {
            background: #f7fafc;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e2e8f0;
        }
        .footer p {
            color: #718096;
            font-size: 14px;
            margin: 5px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">
                <img src="https://assets.mckeonwebsolutions.com/replayhub/replayicon.png" alt="ReplayHub Logo">
            </div>
            <h1>ReplayHub</h1>
        </div>
        
        <div class="content">
            <h2>Verify Your Email Address</h2>
            
            <p>Hi there,</p>
            
            <p>You requested to change your email address to <strong>${email}</strong>.</p>
            
            <p>Please use this verification code to confirm your new email address:</p>
            
            <div class="code-box">
                <div class="code">${code}</div>
            </div>
            
            <div class="info-box">
                <p><strong>⏰ This code expires in 10 minutes</strong></p>
                <p>For security reasons, this verification code will only work once and will expire in 10 minutes.</p>
            </div>
            
            <div class="info-box">
                <p><strong>🔒 Security Tip:</strong> If you didn't request this email change, please contact support immediately. Someone may be trying to access your account.</p>
            </div>
        </div>
        
        <div class="footer">
            <p><strong>ReplayHub</strong></p>
            <p>Esports Operations Platform</p>
            <p style="margin-top: 15px;">This is an automated email. Please do not reply to this message.</p>
        </div>
    </div>
</body>
</html>
        `.trim();
    }

    async sendInviteEmail(options: {
        to: string;
        organizationName: string;
        organizationLogo?: string;
        inviterName: string;
        roles: string[];
        inviteUrl: string;
        expiresAt: Date;
    }): Promise<void> {
        const fromEmail = process.env.EMAIL_FROM || 'noreply@replayhub.com';
        const fromName = process.env.EMAIL_FROM_NAME || 'ReplayHub';

        const mailOptions = {
            from: `"${fromName}" <${fromEmail}>`,
            to: options.to,
            subject: `You're invited to join ${options.organizationName} on ReplayHub`,
            html: this.getInviteEmailTemplate(options),
            text: `
Join ${options.organizationName} on ReplayHub

${options.inviterName} has invited you to join ${options.organizationName} on ReplayHub.

Roles: ${options.roles.join(', ')}

Click the link below to accept your invitation:
${options.inviteUrl}

This invitation expires on ${options.expiresAt.toLocaleString()}.

Best regards,
The ReplayHub Team
            `.trim(),
        };

        console.log('📧 Attempting to send invite email:', {
            to: options.to,
            from: mailOptions.from,
            subject: mailOptions.subject,
            organization: options.organizationName,
        });

        try {
            const info = await this.transporter.sendMail(mailOptions);
            console.log('✅ Invite email sent successfully:', {
                messageId: info.messageId,
                accepted: info.accepted,
                rejected: info.rejected,
                response: info.response,
            });
        } catch (error) {
            console.error('❌ Error sending invite email:', {
                error: error.message,
                code: error.code,
                command: error.command,
                responseCode: error.responseCode,
                response: error.response,
            });
            throw new Error('Failed to send invite email');
        }
    }

    private getInviteEmailTemplate(options: {
        organizationName: string;
        organizationLogo?: string;
        inviterName: string;
        roles: string[];
        inviteUrl: string;
        expiresAt: Date;
    }): string {
        const expiryDate = options.expiresAt.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });

        return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Join ${options.organizationName}</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background: linear-gradient(135deg, #2ef6fc 0%, #1ac4cf 50%, #fc040e 100%);
            min-height: 100vh;
        }
        .container {
            max-width: 600px;
            margin: 40px auto;
            background: white;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }
        .header {
            background: linear-gradient(135deg, #2ef6fc 0%, #fc040e 100%);
            padding: 40px 20px;
            text-align: center;
        }
        .logo {
            width: 80px;
            height: 80px;
            margin: 0 auto 20px;
            background: white;
            border-radius: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        }
        .logo img {
            width: 60px;
            height: 60px;
        }
        .header h1 {
            color: white;
            margin: 0;
            font-size: 32px;
            font-weight: bold;
            text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
        }
        .content {
            padding: 40px 30px;
        }
        .content h2 {
            color: #1a1a1a;
            font-size: 24px;
            margin: 0 0 20px 0;
        }
        .content p {
            color: #4a5568;
            font-size: 16px;
            line-height: 1.6;
            margin: 0 0 20px 0;
        }
        .button {
            display: inline-block;
            padding: 16px 32px;
            background: linear-gradient(135deg, #2ef6fc 0%, #fc040e 100%);
            color: white;
            text-decoration: none;
            border-radius: 8px;
            font-weight: bold;
            font-size: 16px;
            margin: 20px 0;
            box-shadow: 0 4px 15px rgba(46, 246, 252, 0.3);
            transition: transform 0.2s;
        }
        .button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(46, 246, 252, 0.4);
        }
        .info-box {
            background: #f7fafc;
            border-left: 4px solid #2ef6fc;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
        }
        .info-box p {
            margin: 5px 0;
            font-size: 14px;
            color: #2d3748;
        }
        .roles-box {
            background: #f7fafc;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
        }
        .roles-box h3 {
            margin: 0 0 10px 0;
            color: #2d3748;
            font-size: 16px;
        }
        .role-tag {
            display: inline-block;
            background: linear-gradient(135deg, #2ef6fc 0%, #fc040e 100%);
            color: white;
            padding: 6px 12px;
            border-radius: 4px;
            margin: 4px;
            font-size: 14px;
            font-weight: 500;
        }
        .footer {
            background: #f7fafc;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e2e8f0;
        }
        .footer p {
            color: #718096;
            font-size: 14px;
            margin: 5px 0;
        }
        .link-box {
            background: #f7fafc;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
            word-break: break-all;
        }
        .link-box a {
            color: #2ef6fc;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">
                ${options.organizationLogo 
                    ? `<img src="${options.organizationLogo}" alt="${options.organizationName} Logo">` 
                    : `<img src="https://assets.mckeonwebsolutions.com/replayhub/replayicon.png" alt="ReplayHub Logo">`
                }
            </div>
            <h1>${options.organizationName}</h1>
        </div>
        
        <div class="content">
            <h2>You're Invited!</h2>
            
            <p><strong>${options.inviterName}</strong> has invited you to join <strong>${options.organizationName}</strong> on ReplayHub.</p>
            
            <div class="roles-box">
                <h3>Your Assigned Roles:</h3>
                ${options.roles.map(role => `<span class="role-tag">${role}</span>`).join('')}
            </div>
            
            <p>Click the button below to accept your invitation and get started:</p>
            
            <div style="text-align: center;">
                <a href="${options.inviteUrl}" class="button">Accept Invitation</a>
            </div>
            
            <div class="info-box">
                <p><strong>⏰ This invitation expires on ${expiryDate}</strong></p>
                <p>Make sure to accept your invitation before it expires!</p>
            </div>
            
            <p>If the button doesn't work, copy and paste this link into your browser:</p>
            
            <div class="link-box">
                <a href="${options.inviteUrl}">${options.inviteUrl}</a>
            </div>
            
            <div class="info-box">
                <p><strong>ℹ️ About ReplayHub:</strong> ReplayHub is an esports operations platform that helps organizations manage events, teams, players, and more.</p>
            </div>
        </div>
        
        <div class="footer">
            <p><strong>ReplayHub</strong></p>
            <p>Esports Operations Platform</p>
            <p style="margin-top: 15px;">This is an automated email. Please do not reply to this message.</p>
        </div>
    </div>
</body>
</html>
        `.trim();
    }

    async testConnection(): Promise<boolean> {
        try {
            await this.transporter.verify();
            console.log('SMTP connection successful');
            return true;
        } catch (error) {
            console.error('SMTP connection failed:', error);
            return false;
        }
    }
}
