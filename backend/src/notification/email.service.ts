import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly resend: Resend | null;
  private readonly from: string;

  constructor(config: ConfigService) {
    const key = config.get<string>('RESEND_KEY');
    this.from =
      config.get<string>('EMAIL_FROM') || 'Lexi <onboarding@resend.dev>';
    this.resend = key ? new Resend(key) : null;
    if (!key) {
      this.logger.warn('RESEND_KEY not set — emails will be skipped');
    }
  }

  /** Best-effort send; never throws (email is a secondary channel). */
  async send(to: string, subject: string, html: string): Promise<void> {
    if (!this.resend) return;
    try {
      const { error } = await this.resend.emails.send({
        from: this.from,
        to,
        subject,
        html,
      });
      if (error) {
        this.logger.warn(`Email to ${to} rejected: ${error.message}`);
      }
    } catch (err) {
      this.logger.warn(`Email to ${to} failed: ${String(err)}`);
    }
  }
}
