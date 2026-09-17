import {
  NotificationChannel,
  NotificationStatus,
  Prisma,
  PrismaService,
} from '@dpgc/database';
import {
  PaginatedResult,
  buildPaginationMeta,
  toPrismaPagination,
} from '@dpgc/shared';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

export interface SendEmailPayload {
  to: string;
  template: EmailTemplate;
  subject?: string;
  data?: Record<string, unknown>;
  userId?: number;
}

export type EmailTemplate =
  | 'welcome'
  | 'portal_credentials'
  | 'password_reset'
  | 'diaspora_verified'
  | 'diaspora_rejected'
  | 'committee_approved'
  | 'committee_rejected'
  | 'media_moderated'
  | 'webinar_rsvp';

/** Subject lines and bodies, ported from the Laravel Mailable classes. */
const TEMPLATES: Record<EmailTemplate, { subject: string; render: (data: Record<string, unknown>) => string }> = {
  welcome: {
    subject: 'Welcome to Durga Puja Global Connect',
    render: (d) => `Hello ${String(d.name ?? 'there')},\n\nYour account has been created. Welcome aboard.`,
  },
  portal_credentials: {
    subject: 'Your Durga Puja Global Connect portal credentials',
    render: (d) =>
      `Hello ${String(d.name ?? 'there')},\n\n` +
      `Your committee portal account is ready.\n\n` +
      `Email: ${String(d.email ?? '')}\nTemporary password: ${String(d.password ?? '')}\n\n` +
      'You will be asked to choose a new password when you first sign in.',
  },
  password_reset: {
    subject: 'Reset your password',
    render: (d) =>
      `A password reset was requested for your account.\n\n` +
      `Use this link within the next hour:\n${String(d.resetUrl ?? '')}\n\n` +
      'If you did not request this, you can safely ignore this email.',
  },
  diaspora_verified: {
    subject: 'Your diaspora registration has been verified',
    render: (d) =>
      `Hello ${String(d.name ?? 'there')},\n\n` +
      `Your registration (${String(d.registrationNo ?? '')}) has been verified.`,
  },
  diaspora_rejected: {
    subject: 'About your diaspora registration',
    render: (d) =>
      `Hello ${String(d.name ?? 'there')},\n\n` +
      `Your registration (${String(d.registrationNo ?? '')}) could not be verified.\n\n` +
      `Reason: ${String(d.reason ?? 'Not specified')}`,
  },
  committee_approved: {
    subject: 'Your puja committee registration has been approved',
    render: (d) =>
      `Congratulations,\n\n${String(d.committeeName ?? 'Your committee')} has been approved.\n\n` +
      `Committee ID: ${String(d.committeeId ?? '')}`,
  },
  committee_rejected: {
    subject: 'About your puja committee registration',
    render: (d) =>
      `Hello,\n\n${String(d.committeeName ?? 'Your committee')} registration was not approved.\n\n` +
      `Reason: ${String(d.reason ?? 'Not specified')}`,
  },
  media_moderated: {
    subject: 'Your gallery upload has been reviewed',
    render: (d) =>
      `Your upload "${String(d.title ?? 'Untitled')}" was ${String(d.decision ?? 'reviewed')}.` +
      (d.reason ? `\n\nReason: ${String(d.reason)}` : ''),
  },
  webinar_rsvp: {
    subject: 'Your webinar registration is confirmed',
    render: (d) =>
      `Hello ${String(d.name ?? 'there')},\n\n` +
      `You are registered for "${String(d.webinarTitle ?? '')}".\n\n` +
      `Registration code: ${String(d.registrationCode ?? '')}\n` +
      (d.joinUrl ? `Join link: ${String(d.joinUrl)}\n` : ''),
  },
};

/**
 * Email and push delivery.
 *
 * Every send is written to `notification_logs` first, so a failed delivery is
 * visible and retryable rather than silently lost — the Laravel app sent mail
 * inline with no record of failures.
 */
@Injectable()
export class NotificationService implements OnModuleInit {
  private readonly logger = new Logger(NotificationService.name);
  private transporter: nodemailer.Transporter | null = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  onModuleInit(): void {
    const driver = this.config.get<string>('notification.mail.driver') ?? 'log';

    // `log` keeps local development from needing a real SMTP server.
    if (driver === 'log') {
      this.logger.log('MAIL_DRIVER=log — emails will be logged instead of sent.');
      return;
    }

    this.transporter = nodemailer.createTransport({
      host: this.config.get<string>('notification.mail.host'),
      port: this.config.get<number>('notification.mail.port'),
      secure: this.config.get<number>('notification.mail.port') === 465,
      auth: this.config.get<string>('notification.mail.username')
        ? {
            user: this.config.get<string>('notification.mail.username'),
            pass: this.config.get<string>('notification.mail.password'),
          }
        : undefined,
    });
  }

  async sendEmail(payload: SendEmailPayload): Promise<{ queued: true; id: number }> {
    const template = TEMPLATES[payload.template];

    if (!template) {
      // Logged rather than thrown: an unknown template must not fail the
      // business operation that triggered the notification.
      this.logger.error(`Unknown email template "${payload.template}"`);

      const record = await this.log(payload, NotificationStatus.FAILED, 'Unknown template');
      return { queued: true, id: record.id };
    }

    const subject = payload.subject ?? template.subject;
    const body = template.render(payload.data ?? {});

    const record = await this.log(payload, NotificationStatus.QUEUED, null, subject);

    try {
      if (!this.transporter) {
        this.logger.log(
          `[mail:log] to=${payload.to} subject="${subject}"\n${body}`,
        );
      } else {
        await this.transporter.sendMail({
          from: `"${this.config.get<string>('notification.mail.fromName')}" <${this.config.get<string>(
            'notification.mail.fromAddress',
          )}>`,
          to: payload.to,
          subject,
          text: body,
        });
      }

      await this.prisma.notificationLog.update({
        where: { id: record.id },
        data: { status: NotificationStatus.SENT, sentAt: new Date(), attempts: { increment: 1 } },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to send "${payload.template}" to ${payload.to}: ${message}`);

      await this.prisma.notificationLog.update({
        where: { id: record.id },
        data: {
          status: NotificationStatus.FAILED,
          lastError: message,
          attempts: { increment: 1 },
        },
      });
    }

    return { queued: true, id: record.id };
  }

  private log(
    payload: SendEmailPayload,
    status: NotificationStatus,
    error: string | null = null,
    subject?: string,
  ) {
    return this.prisma.notificationLog.create({
      data: {
        channel: NotificationChannel.EMAIL,
        recipient: payload.to,
        userId: payload.userId ?? null,
        template: payload.template,
        subject: subject ?? null,
        payload: (payload.data as Prisma.InputJsonValue) ?? Prisma.DbNull,
        status,
        lastError: error,
      },
    });
  }

  async findAll(query: {
    page: number;
    perPage: number;
    search?: string;
    sortDir: 'asc' | 'desc';
    status?: NotificationStatus;
  }): Promise<PaginatedResult<unknown>> {
    const { skip, take, page, perPage } = toPrismaPagination(query);

    const where: Prisma.NotificationLogWhereInput = {
      ...(query.status ? { status: query.status } : {}),
      ...(query.search
        ? {
            OR: [
              { recipient: { contains: query.search, mode: 'insensitive' } },
              { template: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.notificationLog.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: query.sortDir },
      }),
      this.prisma.notificationLog.count({ where }),
    ]);

    return { items, pagination: buildPaginationMeta(page, perPage, total) };
  }

  /** Retries failed sends, capped so a permanently bad address stops early. */
  async retryFailed(maxAttempts = 3): Promise<{ retried: number }> {
    const failed = await this.prisma.notificationLog.findMany({
      where: { status: NotificationStatus.FAILED, attempts: { lt: maxAttempts } },
      take: 50,
    });

    for (const record of failed) {
      await this.sendEmail({
        to: record.recipient,
        template: record.template as EmailTemplate,
        subject: record.subject ?? undefined,
        data: (record.payload as Record<string, unknown>) ?? {},
        userId: record.userId ?? undefined,
      });
    }

    return { retried: failed.length };
  }
}
