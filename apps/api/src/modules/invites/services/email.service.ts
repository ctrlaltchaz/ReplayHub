import { Injectable, Logger } from '@nestjs/common';
import { EmailTemplate } from '../templates/invite-email.template';

export interface SendEmailOptions {
    to: string;
    subject: string;
    html: string;
    text: string;
}

@Injectable()
export class EmailService {
    private readonly logger = new Logger(EmailService.name);

    /**
     * Send an email using the configured email provider
     * TODO: Configure actual email provider (SendGrid, AWS SES, Mailgun, etc.)
     */
    async sendEmail(options: SendEmailOptions): Promise<void> {
        const { to, subject, html, text } = options;

        // Log email for development (replace with actual email service)
        this.logger.log(`
========================================
EMAIL SENT
========================================
To: ${to}
Subject: ${subject}
----------------------------------------
${text}
========================================
        `);

        // TODO: Implement actual email sending
        // Example with SendGrid:
        // const msg = {
        //     to,
        //     from: process.env.SENDGRID_FROM_EMAIL,
        //     subject,
        //     text,
        //     html,
        // };
        // await sgMail.send(msg);

        // Example with AWS SES:
        // const params = {
        //     Destination: { ToAddresses: [to] },
        //     Message: {
        //         Body: {
        //             Html: { Charset: 'UTF-8', Data: html },
        //             Text: { Charset: 'UTF-8', Data: text },
        //         },
        //         Subject: { Charset: 'UTF-8', Data: subject },
        //     },
        //     Source: process.env.AWS_SES_FROM_EMAIL,
        // };
        // await ses.sendEmail(params).promise();

        // For now, just log and return success
        return Promise.resolve();
    }

    /**
     * Send email from template
     */
    async sendTemplateEmail(to: string, template: EmailTemplate): Promise<void> {
        return this.sendEmail({
            to,
            subject: template.subject,
            html: template.html,
            text: template.text,
        });
    }
}
