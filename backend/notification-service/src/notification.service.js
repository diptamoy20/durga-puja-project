"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var NotificationService_1;
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const database_1 = require("@dpgc/database");
const shared_1 = require("@dpgc/shared");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const nodemailer = __importStar(require("nodemailer"));
/** Subject lines and bodies, ported from the Laravel Mailable classes. */
const TEMPLATES = {
    welcome: {
        subject: 'Welcome to Durga Puja Global Connect',
        render: (d) => `Hello ${String(d.name ?? 'there')},\n\nYour account has been created. Welcome aboard.`,
    },
    portal_credentials: {
        subject: 'Your Durga Puja Global Connect portal credentials',
        render: (d) => `Hello ${String(d.name ?? 'there')},\n\n` +
            `Your committee portal account is ready.\n\n` +
            `Email: ${String(d.email ?? '')}\nTemporary password: ${String(d.password ?? '')}\n\n` +
            'You will be asked to choose a new password when you first sign in.',
    },
    password_reset: {
        subject: 'Reset your password',
        render: (d) => `A password reset was requested for your account.\n\n` +
            `Use this link within the next hour:\n${String(d.resetUrl ?? '')}\n\n` +
            'If you did not request this, you can safely ignore this email.',
    },
    diaspora_verified: {
        subject: 'Your diaspora registration has been verified',
        render: (d) => `Hello ${String(d.name ?? 'there')},\n\n` +
            `Your registration (${String(d.registrationNo ?? '')}) has been verified.`,
    },
    diaspora_rejected: {
        subject: 'About your diaspora registration',
        render: (d) => `Hello ${String(d.name ?? 'there')},\n\n` +
            `Your registration (${String(d.registrationNo ?? '')}) could not be verified.\n\n` +
            `Reason: ${String(d.reason ?? 'Not specified')}`,
    },
    committee_approved: {
        subject: 'Your puja committee registration has been approved',
        render: (d) => `Congratulations,\n\n${String(d.committeeName ?? 'Your committee')} has been approved.\n\n` +
            `Committee ID: ${String(d.committeeId ?? '')}`,
    },
    committee_rejected: {
        subject: 'About your puja committee registration',
        render: (d) => `Hello,\n\n${String(d.committeeName ?? 'Your committee')} registration was not approved.\n\n` +
            `Reason: ${String(d.reason ?? 'Not specified')}`,
    },
    media_moderated: {
        subject: 'Your gallery upload has been reviewed',
        render: (d) => `Your upload "${String(d.title ?? 'Untitled')}" was ${String(d.decision ?? 'reviewed')}.` +
            (d.reason ? `\n\nReason: ${String(d.reason)}` : ''),
    },
    webinar_rsvp: {
        subject: 'Your webinar registration is confirmed',
        render: (d) => `Hello ${String(d.name ?? 'there')},\n\n` +
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
let NotificationService = NotificationService_1 = class NotificationService {
    prisma;
    config;
    logger = new common_1.Logger(NotificationService_1.name);
    transporter = null;
    constructor(prisma, config) {
        this.prisma = prisma;
        this.config = config;
    }
    onModuleInit() {
        const driver = this.config.get('notification.mail.driver') ?? 'log';
        // `log` keeps local development from needing a real SMTP server.
        if (driver === 'log') {
            this.logger.log('MAIL_DRIVER=log — emails will be logged instead of sent.');
            return;
        }
        this.transporter = nodemailer.createTransport({
            host: this.config.get('notification.mail.host'),
            port: this.config.get('notification.mail.port'),
            secure: this.config.get('notification.mail.port') === 465,
            auth: this.config.get('notification.mail.username')
                ? {
                    user: this.config.get('notification.mail.username'),
                    pass: this.config.get('notification.mail.password'),
                }
                : undefined,
        });
    }
    async sendEmail(payload) {
        const template = TEMPLATES[payload.template];
        if (!template) {
            // Logged rather than thrown: an unknown template must not fail the
            // business operation that triggered the notification.
            this.logger.error(`Unknown email template "${payload.template}"`);
            const record = await this.log(payload, database_1.NotificationStatus.FAILED, 'Unknown template');
            return { queued: true, id: record.id };
        }
        const subject = payload.subject ?? template.subject;
        const body = template.render(payload.data ?? {});
        const record = await this.log(payload, database_1.NotificationStatus.QUEUED, null, subject);
        try {
            if (!this.transporter) {
                this.logger.log(`[mail:log] to=${payload.to} subject="${subject}"\n${body}`);
            }
            else {
                await this.transporter.sendMail({
                    from: `"${this.config.get('notification.mail.fromName')}" <${this.config.get('notification.mail.fromAddress')}>`,
                    to: payload.to,
                    subject,
                    text: body,
                });
            }
            await this.prisma.notificationLog.update({
                where: { id: record.id },
                data: { status: database_1.NotificationStatus.SENT, sentAt: new Date(), attempts: { increment: 1 } },
            });
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            this.logger.error(`Failed to send "${payload.template}" to ${payload.to}: ${message}`);
            await this.prisma.notificationLog.update({
                where: { id: record.id },
                data: {
                    status: database_1.NotificationStatus.FAILED,
                    lastError: message,
                    attempts: { increment: 1 },
                },
            });
        }
        return { queued: true, id: record.id };
    }
    log(payload, status, error = null, subject) {
        return this.prisma.notificationLog.create({
            data: {
                channel: database_1.NotificationChannel.EMAIL,
                recipient: payload.to,
                userId: payload.userId ?? null,
                template: payload.template,
                subject: subject ?? null,
                payload: payload.data ?? database_1.Prisma.DbNull,
                status,
                lastError: error,
            },
        });
    }
    async findAll(query) {
        const { skip, take, page, perPage } = (0, shared_1.toPrismaPagination)(query);
        const where = {
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
        return { items, pagination: (0, shared_1.buildPaginationMeta)(page, perPage, total) };
    }
    /** Totals by status for the admin notifications summary screen. */
    async stats() {
        const [total, queued, sent, failed, retryable] = await this.prisma.$transaction([
            this.prisma.notificationLog.count(),
            this.prisma.notificationLog.count({ where: { status: database_1.NotificationStatus.QUEUED } }),
            this.prisma.notificationLog.count({ where: { status: database_1.NotificationStatus.SENT } }),
            this.prisma.notificationLog.count({ where: { status: database_1.NotificationStatus.FAILED } }),
            this.prisma.notificationLog.count({ where: { status: database_1.NotificationStatus.FAILED, attempts: { lt: 3 } } }),
        ]);
        return { total, queued, sent, failed, retryable };
    }
    /** Retries failed sends, capped so a permanently bad address stops early. */
    async retryFailed(maxAttempts = 3) {
        const failed = await this.prisma.notificationLog.findMany({
            where: { status: database_1.NotificationStatus.FAILED, attempts: { lt: maxAttempts } },
            take: 50,
        });
        for (const record of failed) {
            await this.sendEmail({
                to: record.recipient,
                template: record.template,
                subject: record.subject ?? undefined,
                data: record.payload ?? {},
                userId: record.userId ?? undefined,
            });
        }
        return { retried: failed.length };
    }
};
exports.NotificationService = NotificationService;
exports.NotificationService = NotificationService = NotificationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof database_1.PrismaService !== "undefined" && database_1.PrismaService) === "function" ? _a : Object, typeof (_b = typeof config_1.ConfigService !== "undefined" && config_1.ConfigService) === "function" ? _b : Object])
], NotificationService);
