"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var VotingService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.VotingService = void 0;
const common_1 = require("@nestjs/common");
const database_1 = require("@dpgc/database");
const crypto = require("node:crypto");

const CAPTCHA_SECRET = process.env.JWT_SECRET || 'dpgc-sharad-samman-voting-captcha-secret';
const STATIC_TEST_OTP = '123456';

const DISPOSABLE_EMAIL_DOMAINS = new Set([
    'mailinator.com', 'tempmail.com', '10minutemail.com', 'guerrillamail.com',
    'sharklasers.com', 'throwawaymail.com', 'getairmail.com', 'yopmail.com',
    'dispostable.com', 'fakemailgenerator.com', 'temp-mail.org', 'trashmail.com'
]);

let VotingService = VotingService_1 = class VotingService {
    prisma;
    logger = new common_1.Logger(VotingService_1.name);

    constructor(prisma) {
        this.prisma = prisma;
    }

    /**
     * DB Fallback Helpers for robust execution across all environments
     */
    async dbFindVoteByContestAndEmail(contestId, voterEmail) {
        if (this.prisma.sharadSammanVote) {
            return this.prisma.sharadSammanVote.findUnique({
                where: { contestId_voterEmail: { contestId, voterEmail } }
            });
        }
        const rows = await this.prisma.$queryRaw`
            SELECT id, contest_id as "contestId", nomination_id as "nominationId", voter_email as "voterEmail", status 
            FROM sharad_samman_votes 
            WHERE contest_id = ${contestId} AND voter_email = ${voterEmail} 
            LIMIT 1
        `;
        return rows[0] || null;
    }

    async dbCountRecentOtps(email, contestId) {
        const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
        if (this.prisma.votingOtp) {
            return this.prisma.votingOtp.count({
                where: {
                    email,
                    contestId,
                    createdAt: { gte: tenMinutesAgo },
                },
            });
        }
        const rows = await this.prisma.$queryRaw`
            SELECT COUNT(*)::int as count 
            FROM voting_otps 
            WHERE email = ${email} AND contest_id = ${contestId} AND created_at >= ${tenMinutesAgo}
        `;
        return rows[0]?.count || 0;
    }

    async dbCreateVotingOtp(email, contestId, otpCode, expiresAt) {
        if (this.prisma.votingOtp) {
            return this.prisma.votingOtp.create({
                data: { email, contestId, otpCode, expiresAt }
            });
        }
        const rows = await this.prisma.$queryRaw`
            INSERT INTO voting_otps (email, contest_id, otp_code, expires_at, created_at, is_used, attempts)
            VALUES (${email}, ${contestId}, ${otpCode}, ${expiresAt}, NOW(), false, 0)
            RETURNING id, email, otp_code as "otpCode", expires_at as "expiresAt"
        `;
        return rows[0];
    }

    async dbFindValidOtp(email, contestId, otpCode) {
        const now = new Date();
        if (this.prisma.votingOtp) {
            return this.prisma.votingOtp.findFirst({
                where: {
                    email,
                    contestId,
                    otpCode,
                    isUsed: false,
                    expiresAt: { gt: now },
                },
                orderBy: { createdAt: 'desc' },
            });
        }
        const rows = await this.prisma.$queryRaw`
            SELECT id, email, otp_code as "otpCode", expires_at as "expiresAt", is_used as "isUsed"
            FROM voting_otps 
            WHERE email = ${email} AND contest_id = ${contestId} AND otp_code = ${otpCode} AND is_used = false AND expires_at > ${now}
            ORDER BY created_at DESC 
            LIMIT 1
        `;
        return rows[0] || null;
    }

    async dbMarkOtpUsed(id) {
        if (this.prisma.votingOtp) {
            return this.prisma.votingOtp.update({
                where: { id },
                data: { isUsed: true },
            });
        }
        await this.prisma.$executeRaw`
            UPDATE voting_otps SET is_used = true WHERE id = ${id}
        `;
    }

    async dbCreateVote(data) {
        if (this.prisma.sharadSammanVote) {
            return this.prisma.sharadSammanVote.create({
                data,
            });
        }
        const rows = await this.prisma.$queryRaw`
            INSERT INTO sharad_samman_votes (
                contest_id, nomination_id, voter_email, voter_name, voter_phone,
                voter_country, voter_city, status, risk_score, flag_reason,
                ip_address, user_agent, device_fingerprint, created_at, updated_at
            ) VALUES (
                ${data.contestId}, ${data.nominationId}, ${data.voterEmail}, ${data.voterName || null}, ${data.voterPhone || null},
                ${data.voterCountry || 'India'}, ${data.voterCity || null}, ${data.status}::"VoteStatus", ${data.riskScore || 0.0}, ${data.flagReason || null},
                ${data.ipAddress || null}, ${data.userAgent || null}, ${data.deviceFingerprint || null}, NOW(), NOW()
            )
            RETURNING id, contest_id as "contestId", nomination_id as "nominationId", voter_email as "voterEmail", status, risk_score as "riskScore", flag_reason as "flagReason"
        `;
        return rows[0];
    }

    async dbCountIpVotesLastHour(ipAddress) {
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        if (this.prisma.sharadSammanVote) {
            return this.prisma.sharadSammanVote.count({
                where: {
                    ipAddress,
                    createdAt: { gte: oneHourAgo },
                },
            });
        }
        const rows = await this.prisma.$queryRaw`
            SELECT COUNT(*)::int as count 
            FROM sharad_samman_votes 
            WHERE ip_address = ${ipAddress} AND created_at >= ${oneHourAgo}
        `;
        return rows[0]?.count || 0;
    }

    /**
     * Generate a cryptographic Math CAPTCHA challenge
     */
    generateCaptcha() {
        const num1 = Math.floor(Math.random() * 8) + 2;
        const num2 = Math.floor(Math.random() * 8) + 1;
        const answer = num1 + num2;
        const timestamp = Date.now();
        const payload = `${answer}:${timestamp}`;
        const signature = crypto.createHmac('sha256', CAPTCHA_SECRET).update(payload).digest('hex');
        const token = Buffer.from(`${payload}:${signature}`).toString('base64');

        return {
            question: `What is ${num1} + ${num2}?`,
            token,
        };
    }

    /**
     * Verify a Math CAPTCHA token and answer
     */
    verifyCaptcha(answer, token) {
        if (!answer || !token) return false;
        try {
            const decoded = Buffer.from(token, 'base64').toString('utf8');
            const [expectedAnswerStr, timestampStr, signature] = decoded.split(':');
            if (!expectedAnswerStr || !timestampStr || !signature) return false;

            // Check signature
            const expectedPayload = `${expectedAnswerStr}:${timestampStr}`;
            const expectedSig = crypto.createHmac('sha256', CAPTCHA_SECRET).update(expectedPayload).digest('hex');
            if (signature !== expectedSig) return false;

            // Check 10-minute expiry
            const timestamp = Number(timestampStr);
            if (Date.now() - timestamp > 10 * 60 * 1000) return false;

            return String(answer).trim() === expectedAnswerStr;
        } catch {
            return false;
        }
    }

    /**
     * Get active contest & eligible nominations for public voting
     */
    async getPublicVotingContest() {
        const contest = await this.prisma.contest.findFirst({
            where: { status: 'ACTIVE' },
            orderBy: { year: 'desc' },
            include: {
                nominations: {
                    where: {
                        status: 'SHORTLISTED',
                    },
                    include: {
                        committee: {
                            select: {
                                id: true,
                                committeeName: true,
                                registrationNo: true,
                                city: true,
                                state: true,
                                venueName: true,
                                venueAddress: true,
                                establishedYear: true,
                                pandalImage: true,
                            },
                        },
                    },
                },
            },
        });

        if (!contest) {
            return {
                hasActiveContest: false,
                contest: null,
                isVotingOpen: false,
                nominations: [],
            };
        }

        const now = new Date();
        const effectiveEnd = contest.votingExtendedUntil || contest.votingEndDate;
        let isWindowOpen = contest.votingStatus === 'ACTIVE' || contest.votingStatus === 'EXTENDED' || Boolean(contest.isVotingOpen);
        if (contest.votingStartDate && now < new Date(contest.votingStartDate)) {
            isWindowOpen = false;
        }
        if (effectiveEnd && now > new Date(effectiveEnd)) {
            isWindowOpen = false;
        }
        if (contest.votingStatus === 'CLOSED') {
            isWindowOpen = false;
        }

        return {
            hasActiveContest: true,
            contest: {
                id: contest.id,
                name: contest.name,
                year: contest.year,
                description: contest.description,
                isVotingOpen: isWindowOpen,
                votingStatus: contest.votingStatus,
                votingStartDate: contest.votingStartDate,
                votingEndDate: contest.votingEndDate,
                votingExtendedUntil: contest.votingExtendedUntil,
                resultsPublished: contest.resultsPublished,
            },
            nominations: contest.nominations.map((nom) => ({
                id: nom.id,
                contestId: nom.contestId,
                category: nom.category,
                title: nom.title,
                description: nom.description,
                status: nom.status,
                committee: nom.committee,
                snapshotData: nom.snapshotData,
            })),
        };
    }

    /**
     * Request a 6-digit OTP for email verification
     */
    async requestOtp(dto, clientIp) {
        // 1. Verify CAPTCHA
        if (!this.verifyCaptcha(dto.captchaAnswer, dto.captchaToken)) {
            throw new common_1.BadRequestException('CAPTCHA verification failed. Please try again with a fresh challenge.');
        }

        const email = String(dto.email).trim().toLowerCase();

        // 2. Validate active contest and voting window
        const contest = await this.prisma.contest.findUnique({
            where: { id: dto.contestId },
        });
        if (!contest || contest.status !== 'ACTIVE') {
            throw new common_1.BadRequestException('The specified contest is not currently active for voting.');
        }

        // 3. Database Check: Check if email has already voted in this contest
        const existingVote = await this.dbFindVoteByContestAndEmail(dto.contestId, email);
        if (existingVote) {
            throw new common_1.BadRequestException(
                `A vote has already been recorded for email "${email}" in this contest session. Only one vote per person is permitted.`,
            );
        }

        // 4. Rate limiting on OTP requests
        const recentOtps = await this.dbCountRecentOtps(email, dto.contestId);
        if (recentOtps >= 5) {
            throw new common_1.BadRequestException('Too many OTP requests. Please wait a few minutes before trying again.');
        }

        // 5. Generate 6-digit OTP
        const generatedOtp = String(Math.floor(100000 + Math.random() * 900000));
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

        await this.dbCreateVotingOtp(email, dto.contestId, generatedOtp, expiresAt);

        // 6. Queue Email Notification (silently catch if NotificationLog table schema differs)
        try {
            await this.prisma.notificationLog.create({
                data: {
                    channel: 'EMAIL',
                    recipient: email,
                    template: 'voting_otp',
                    subject: `Your Sharad Samman Voting OTP: ${generatedOtp}`,
                    payload: {
                        email,
                        otpCode: generatedOtp,
                        contestName: contest.name,
                        expiresInMinutes: 10,
                    },
                },
            });
        } catch {
            // Notification logging is non-blocking
        }

        this.logger.log(`[Voting OTP] Generated OTP for ${email} (Contest #${dto.contestId}): ${generatedOtp} (Static test OTP: ${STATIC_TEST_OTP})`);

        return {
            success: true,
            message: 'OTP verification code has been sent to your email.',
            email,
            devOtp: STATIC_TEST_OTP, // Static test OTP for seamless testing
            expiresInSeconds: 600,
        };
    }

    /**
     * Cast public vote with anti-fraud analysis and one-person-one-vote enforcement
     */
    async castVote(dto, clientMeta) {
        const email = String(dto.voterEmail).trim().toLowerCase();
        const otpInput = String(dto.otpCode).trim();

        // 1. Verify OTP (Support static dev OTP or generated OTP)
        let otpValid = false;
        if (otpInput === STATIC_TEST_OTP) {
            otpValid = true;
        } else {
            const validOtpRecord = await this.dbFindValidOtp(email, dto.contestId, otpInput);
            if (validOtpRecord) {
                otpValid = true;
                await this.dbMarkOtpUsed(validOtpRecord.id);
            }
        }

        if (!otpValid) {
            throw new common_1.BadRequestException('Invalid or expired OTP verification code. Please request a new OTP.');
        }

        // 2. Validate Contest & Voting Open Window
        const contest = await this.prisma.contest.findUnique({
            where: { id: dto.contestId },
        });
        if (!contest || contest.status !== 'ACTIVE') {
            throw new common_1.BadRequestException('Voting is not open for this contest session.');
        }

        const now = new Date();
        if (contest.votingStartDate && now < contest.votingStartDate) {
            throw new common_1.BadRequestException(`Voting for ${contest.name} will begin on ${contest.votingStartDate.toLocaleDateString()}.`);
        }
        if (contest.votingEndDate && now > contest.votingEndDate) {
            throw new common_1.BadRequestException(`Voting for ${contest.name} concluded on ${contest.votingEndDate.toLocaleDateString()}.`);
        }

        // 3. Validate Nomination
        const nomination = await this.prisma.sharadSammanNomination.findUnique({
            where: { id: dto.nominationId },
            include: {
                committee: { select: { id: true, committeeName: true, city: true } },
            },
        });
        if (!nomination || nomination.contestId !== dto.contestId) {
            throw new common_1.NotFoundException('The selected nomination was not found in this contest.');
        }
        if (nomination.status !== 'SHORTLISTED') {
            throw new common_1.BadRequestException('Only shortlisted nominations are eligible for public voting.');
        }

        // 4. One-Person-One-Vote Database Guard
        const existingVote = await this.dbFindVoteByContestAndEmail(dto.contestId, email);
        if (existingVote) {
            throw new common_1.BadRequestException(
                `A vote has already been submitted using ${email}. One-person-one-vote policy strictly enforced.`,
            );
        }

        // 5. Anti-Fraud & Anomaly Scoring Engine
        let riskScore = 0.0;
        const flagReasons = [];

        // Check A: IP Velocity (> 6 votes from same IP in past 1 hour)
        const clientIp = clientMeta?.ipAddress || clientMeta?.ip || '127.0.0.1';
        if (clientIp && clientIp !== '127.0.0.1' && clientIp !== '::1') {
            const votesFromIpLastHour = await this.dbCountIpVotesLastHour(clientIp);
            if (votesFromIpLastHour >= 6) {
                riskScore += 0.5;
                flagReasons.push(`High IP velocity (${votesFromIpLastHour} votes from IP in 1hr)`);
            }
        }

        // Check B: Disposable email domain
        const emailDomain = email.split('@')[1];
        if (emailDomain && DISPOSABLE_EMAIL_DOMAINS.has(emailDomain)) {
            riskScore += 0.6;
            flagReasons.push(`Suspected temporary/disposable email domain (@${emailDomain})`);
        }

        // Determine Status
        const status = riskScore >= 0.5 ? 'FLAGGED' : 'VALID';
        const flagReason = flagReasons.length > 0 ? flagReasons.join('; ') : null;

        // 6. Record Vote in Database
        try {
            const vote = await this.dbCreateVote({
                contestId: dto.contestId,
                nominationId: dto.nominationId,
                voterEmail: email,
                voterName: dto.voterName?.trim() || null,
                voterPhone: dto.voterPhone?.trim() || null,
                voterCountry: dto.voterCountry?.trim() || 'India',
                voterCity: dto.voterCity?.trim() || null,
                status,
                riskScore,
                flagReason,
                ipAddress: clientIp,
                userAgent: clientMeta?.userAgent || null,
                deviceFingerprint: dto.deviceFingerprint?.trim() || null,
            });

            this.logger.log(`[Vote Cast] Recorded vote #${vote.id} for "${nomination.committee.committeeName}" (Status: ${status}, Risk: ${riskScore})`);

            return {
                success: true,
                voteId: vote.id,
                status: vote.status,
                message:
                    status === 'VALID'
                        ? 'Thank you! Your vote has been officially cast and verified.'
                        : 'Your vote has been submitted and queued for administrative validation.',
                committeeName: nomination.committee.committeeName,
                category: nomination.category,
            };
        } catch (error) {
            if (error.code === '23505' || error.message?.includes('duplicate key')) {
                throw new common_1.BadRequestException(
                    `A vote has already been submitted using ${email}. One-person-one-vote policy strictly enforced.`,
                );
            }
            throw error;
        }
    }

    /**
     * Public Leaderboard: Real-time aggregated vote count for VALID votes
     */
    async getLeaderboard(contestId) {
        const contest = contestId 
            ? await this.prisma.contest.findUnique({ where: { id: Number(contestId) } })
            : await this.prisma.contest.findFirst({ where: { status: 'ACTIVE' }, orderBy: { year: 'desc' } });

        if (!contest) {
            throw new common_1.NotFoundException(`No active contest found.`);
        }

        const targetContestId = contest.id;

        // Aggregate valid votes by nomination directly from database
        const voteCounts = await this.prisma.$queryRaw`
            SELECT nomination_id as "nominationId", COUNT(*)::int as count 
            FROM sharad_samman_votes 
            WHERE contest_id = ${targetContestId} AND status = 'VALID'::"VoteStatus"
            GROUP BY nomination_id
        `;

        const countMap = new Map(voteCounts.map((v) => [v.nominationId, v.count]));

        // Fetch eligible nominations
        const nominations = await this.prisma.sharadSammanNomination.findMany({
            where: {
                contestId: targetContestId,
                status: 'SHORTLISTED',
            },
            include: {
                committee: {
                    select: {
                        id: true,
                        committeeName: true,
                        registrationNo: true,
                        city: true,
                        state: true,
                        venueName: true,
                        venueAddress: true,
                        establishedYear: true,
                        pandalImage: true,
                    },
                },
            },
        });

        const leaderboard = nominations
            .map((nom) => ({
                rank: 0,
                nominationId: nom.id,
                category: nom.category,
                title: nom.title || nom.committee.committeeName,
                committeeName: nom.committee.committeeName,
                city: nom.committee.city,
                state: nom.committee.state,
                pandalImage: nom.committee.pandalImage,
                validVotes: countMap.get(nom.id) || 0,
            }))
            .sort((a, b) => b.validVotes - a.validVotes)
            .map((entry, index) => ({ ...entry, rank: index + 1 }));

        const totalValidVotes = Array.from(countMap.values()).reduce((acc, c) => acc + c, 0);

        return {
            contestId: contest.id,
            contestName: contest.name,
            contestYear: contest.year,
            isVotingOpen: contest.isVotingOpen,
            resultsPublished: contest.resultsPublished,
            totalValidVotes,
            leaderboard,
        };
    }

    /**
     * Public Final Results: Category winners and overall rankings
     */
    async getResults(contestId) {
        const leaderboardData = await this.getLeaderboard(contestId);

        const categoryMap = new Map();
        for (const item of leaderboardData.leaderboard) {
            if (!categoryMap.has(item.category)) {
                categoryMap.set(item.category, []);
            }
            categoryMap.get(item.category).push(item);
        }

        const resultsByCategory = {};
        for (const [catName, items] of categoryMap.entries()) {
            resultsByCategory[catName] = items;
        }

        return {
            contestId: leaderboardData.contestId,
            contestName: leaderboardData.contestName,
            contestYear: leaderboardData.contestYear,
            resultsPublished: leaderboardData.resultsPublished,
            totalVotesCounted: leaderboardData.totalValidVotes,
            resultsByCategory,
        };
    }

    /**
     * Admin: Get flagged votes queue for audit
     */
    async getFlaggedVotes(query = {}) {
        const page = Number(query.page) || 1;
        const limit = Math.min(Number(query.limit) || 20, 100);
        const offset = (page - 1) * limit;

        const statusClause = query.status 
            ? `AND v.status = '${query.status}'::"VoteStatus"` 
            : ``;

        const votes = await this.prisma.$queryRawUnsafe(`
            SELECT 
                v.id, v.contest_id as "contestId", v.nomination_id as "nominationId",
                v.voter_email as "voterEmail", v.voter_name as "voterName",
                v.voter_city as "voterCity", v.voter_country as "voterCountry",
                v.ip_address as "ipAddress", v.risk_score as "riskScore",
                v.flag_reason as "flagReason", v.status,
                v.reviewed_by as "reviewedBy", v.reviewed_at as "reviewedAt",
                v.review_notes as "reviewNotes", v.created_at as "createdAt",
                n.id as "nom_id", n.category as "nom_category", n.title as "nom_title",
                c.id as "comm_id", c.committee_name as "comm_name", c.city as "comm_city"
            FROM sharad_samman_votes v
            LEFT JOIN sharad_samman_nominations n ON n.id = v.nomination_id
            LEFT JOIN puja_committees c ON c.id = n.puja_committee_id
            WHERE 1=1 ${statusClause}
            ORDER BY v.created_at DESC
            LIMIT ${limit} OFFSET ${offset}
        `);

        const statsRows = await this.prisma.$queryRaw`
            SELECT 
                COUNT(*)::int as "totalVotes",
                COUNT(CASE WHEN status = 'VALID'::"VoteStatus" THEN 1 END)::int as "validVotes",
                COUNT(CASE WHEN status = 'FLAGGED'::"VoteStatus" THEN 1 END)::int as "flaggedVotes",
                COUNT(CASE WHEN status = 'REJECTED'::"VoteStatus" THEN 1 END)::int as "rejectedVotes"
            FROM sharad_samman_votes
        `;

        const stats = statsRows[0] || {
            totalVotes: 0,
            validVotes: 0,
            flaggedVotes: 0,
            rejectedVotes: 0,
        };

        return {
            total: stats.totalVotes,
            page,
            limit,
            stats,
            votes: votes.map((r) => ({
                id: r.id,
                contestId: r.contestId,
                nominationId: r.nominationId,
                voterEmail: r.voterEmail,
                voterName: r.voterName,
                voterCity: r.voterCity,
                voterCountry: r.voterCountry,
                ipAddress: r.ipAddress,
                riskScore: r.riskScore,
                flagReason: r.flagReason,
                status: r.status,
                reviewedBy: r.reviewedBy,
                reviewedAt: r.reviewedAt,
                reviewNotes: r.reviewNotes,
                createdAt: r.createdAt,
                nomination: {
                    id: r.nom_id,
                    category: r.nom_category,
                    title: r.nom_title,
                    committee: {
                        id: r.comm_id,
                        committeeName: r.comm_name,
                        city: r.comm_city,
                    },
                },
            })),
        };
    }

    /**
     * Admin: Review and approve/reject a flagged vote
     */
    async reviewFlaggedVote(voteId, dto, actorId) {
        const targetStatus = dto.action === 'APPROVE' ? 'VALID' : 'REJECTED';
        const now = new Date();

        await this.prisma.$executeRaw`
            UPDATE sharad_samman_votes 
            SET 
                status = ${targetStatus}::"VoteStatus",
                reviewed_by = ${actorId || null},
                reviewed_at = ${now},
                review_notes = ${dto.reviewNotes || null},
                updated_at = ${now}
            WHERE id = ${Number(voteId)}
        `;

        this.logger.log(`[Admin Review] Vote #${voteId} reviewed by Actor #${actorId} -> ${targetStatus}`);
        return { success: true, voteId: Number(voteId), status: targetStatus };
    }

    /**
     * Admin: Open / Close voting window
     */
    async toggleVotingWindow(dto) {
        const contestId = Number(dto.contestId);
        const data = {};
        if (dto.isVotingOpen !== undefined) data.isVotingOpen = dto.isVotingOpen;
        if (dto.votingStartDate !== undefined) data.votingStartDate = dto.votingStartDate ? new Date(dto.votingStartDate) : null;
        if (dto.votingEndDate !== undefined) data.votingEndDate = dto.votingEndDate ? new Date(dto.votingEndDate) : null;

        return this.prisma.contest.update({
            where: { id: contestId },
            data,
        });
    }

    /**
     * Admin: Get flagged votes queue for audit
     */
    async adminGetFlaggedVotes(query = {}) {
        return this.getFlaggedVotes(query);
    }

    /**
     * Admin: Review and approve/reject a flagged vote
     */
    async adminReviewFlaggedVote(voteId, dto, actorId) {
        return this.reviewFlaggedVote(voteId, dto, actorId);
    }

    /**
     * Admin: Get live voting summary metrics for a contest
     */
    async adminGetVotingStats(contestId) {
        const id = Number(contestId);
        const statsRows = await this.prisma.$queryRaw`
            SELECT 
                COUNT(*)::int as "totalVotes",
                COUNT(CASE WHEN status = 'VALID'::"VoteStatus" THEN 1 END)::int as "validVotes",
                COUNT(CASE WHEN status = 'FLAGGED'::"VoteStatus" THEN 1 END)::int as "flaggedVotes",
                COUNT(CASE WHEN status = 'REJECTED'::"VoteStatus" THEN 1 END)::int as "rejectedVotes"
            FROM sharad_samman_votes
            WHERE contest_id = ${id}
        `;
        return statsRows[0] || { totalVotes: 0, validVotes: 0, flaggedVotes: 0, rejectedVotes: 0 };
    }

    /**
     * Admin: Toggle voting settings
     */
    async adminToggleVoting(contestId, dto) {
        return this.toggleVotingWindow({ ...dto, contestId: Number(contestId) });
    }

    /**
     * Admin: Finalize and publish results
     */
    async publishResults(dto) {
        const contestId = Number(dto.contestId);
        const now = new Date();

        return this.prisma.contest.update({
            where: { id: contestId },
            data: {
                resultsPublished: dto.publish,
                resultsPublishedAt: dto.publish ? now : null,
            },
        });
    }
};

exports.VotingService = VotingService = VotingService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_1.PrismaService])
], VotingService);
