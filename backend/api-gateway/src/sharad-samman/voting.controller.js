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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b, _c, _d, _e;
Object.defineProperty(exports, "__esModule", { value: true });
exports.VotingController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const shared_1 = require("@dpgc/shared");
const voting_service_1 = require("./voting.service");
const voting_dto_1 = require("./dto/voting.dto");
const response_interceptor_1 = require("../interceptors/response.interceptor");

let VotingController = class VotingController {
    votingService;
    constructor(votingService) {
        this.votingService = votingService;
    }

    /**
     * Get active contest & nominations for public voting
     */
    async getActiveContest(contestId) {
        return this.votingService.getPublicVotingContest(contestId);
    }

    /**
     * Get fresh Math CAPTCHA challenge
     */
    async getCaptcha() {
        return this.votingService.generateCaptcha();
    }

    /**
     * Request a 6-digit OTP code for voter verification
     */
    async requestOtp(dto, req) {
        const clientIp = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        return this.votingService.requestOtp(dto, clientIp);
    }

    /**
     * Cast public vote
     */
    async castVote(dto, req) {
        const clientIp = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        const userAgent = req.headers['user-agent'] || '';
        return this.votingService.castVote(dto, { ipAddress: String(clientIp), userAgent: String(userAgent) });
    }

    /**
     * Get real-time public leaderboard (valid votes only)
     */
    async getLeaderboard(contestId) {
        return this.votingService.getLeaderboard(contestId);
    }

    /**
     * Get official published voting results
     */
    async getResults(contestId) {
        return this.votingService.getResults(contestId);
    }

    // -------------------------------------------------------------------------
    // Admin / Jury Management Endpoints
    // -------------------------------------------------------------------------

    /**
     * Admin: Get flagged votes audit queue
     */
    async adminGetFlaggedVotes(query) {
        return this.votingService.adminGetFlaggedVotes(query);
    }

    /**
     * Admin: Review and approve/reject a flagged vote
     */
    async adminReviewFlaggedVote(id, dto, user) {
        return this.votingService.adminReviewFlaggedVote(id, dto, user.userId);
    }

    /**
     * Admin: Get contest live voting metrics
     */
    async adminGetVotingStats(contestId) {
        return this.votingService.adminGetVotingStats(contestId);
    }

    /**
     * Admin: Open / Close voting or publish final results
     */
    async adminToggleVoting(contestId, dto) {
        return this.votingService.adminToggleVoting(contestId, dto);
    }

    /**
     * Admin: Toggle voting window settings directly
     */
    async toggleVotingWindow(dto) {
        return this.votingService.toggleVotingWindow(dto);
    }

    /**
     * Admin: Publish results directly
     */
    async publishResults(dto) {
        return this.votingService.publishResults(dto);
    }
};

exports.VotingController = VotingController;

__decorate([
    (0, common_1.Get)(['sharad-samman/voting/active', 'sharad-samman/voting/contest']),
    (0, shared_1.Public)(),
    (0, response_interceptor_1.ResponseMessage)('Active voting contest retrieved successfully'),
    (0, swagger_1.ApiOperation)({ summary: 'Get active contest and nominations for public voting' }),
    __param(0, (0, common_1.Query)('contestId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], VotingController.prototype, "getActiveContest", null);

__decorate([
    (0, common_1.Get)('sharad-samman/voting/captcha'),
    (0, shared_1.Public)(),
    (0, response_interceptor_1.ResponseMessage)('CAPTCHA challenge generated'),
    (0, swagger_1.ApiOperation)({ summary: 'Generate math CAPTCHA challenge for voting' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], VotingController.prototype, "getCaptcha", null);

__decorate([
    (0, common_1.Post)(['sharad-samman/voting/otp/request', 'sharad-samman/voting/request-otp']),
    (0, shared_1.Public)(),
    (0, response_interceptor_1.ResponseMessage)('OTP request processed'),
    (0, swagger_1.ApiOperation)({ summary: 'Request 6-digit OTP verification code for voting' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_a = typeof voting_dto_1.RequestVotingOtpDto !== "undefined" && voting_dto_1.RequestVotingOtpDto) === "function" ? _a : Object, Object]),
    __metadata("design:returntype", Promise)
], VotingController.prototype, "requestOtp", null);

__decorate([
    (0, common_1.Post)(['sharad-samman/voting/cast', 'sharad-samman/voting/cast-vote']),
    (0, shared_1.Public)(),
    (0, response_interceptor_1.ResponseMessage)('Vote recorded successfully'),
    (0, swagger_1.ApiOperation)({ summary: 'Cast a verified vote for a nomination' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_b = typeof voting_dto_1.CastVoteDto !== "undefined" && voting_dto_1.CastVoteDto) === "function" ? _b : Object, Object]),
    __metadata("design:returntype", Promise)
], VotingController.prototype, "castVote", null);

__decorate([
    (0, common_1.Get)('sharad-samman/voting/leaderboard'),
    (0, shared_1.Public)(),
    (0, response_interceptor_1.ResponseMessage)('Voting leaderboard retrieved successfully'),
    (0, swagger_1.ApiOperation)({ summary: 'Get real-time voting leaderboard (valid votes only)' }),
    __param(0, (0, common_1.Query)('contestId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], VotingController.prototype, "getLeaderboard", null);

__decorate([
    (0, common_1.Get)('sharad-samman/voting/results'),
    (0, shared_1.Public)(),
    (0, response_interceptor_1.ResponseMessage)('Final voting results retrieved successfully'),
    (0, swagger_1.ApiOperation)({ summary: 'Get official published voting results and winners' }),
    __param(0, (0, common_1.Query)('contestId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], VotingController.prototype, "getResults", null);

__decorate([
    (0, common_1.Get)('sharad-samman/admin/voting/flagged'),
    (0, shared_1.RequirePermissions)(shared_1.PERMISSIONS.REVIEW_NOMINATIONS, shared_1.PERMISSIONS.MANAGE_NOMINATIONS),
    (0, response_interceptor_1.ResponseMessage)('Flagged votes queue retrieved successfully'),
    (0, swagger_1.ApiOperation)({ summary: 'Admin: Get flagged votes queue for review' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], VotingController.prototype, "adminGetFlaggedVotes", null);

__decorate([
    (0, common_1.Post)('sharad-samman/admin/voting/flagged/:id/review'),
    (0, shared_1.RequirePermissions)(shared_1.PERMISSIONS.REVIEW_NOMINATIONS, shared_1.PERMISSIONS.MANAGE_NOMINATIONS),
    (0, response_interceptor_1.ResponseMessage)('Flagged vote reviewed successfully'),
    (0, swagger_1.ApiOperation)({ summary: 'Admin: Approve or reject a flagged vote' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, shared_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, typeof (_c = typeof voting_dto_1.ReviewFlaggedVoteDto !== "undefined" && voting_dto_1.ReviewFlaggedVoteDto) === "function" ? _c : Object, Object]),
    __metadata("design:returntype", Promise)
], VotingController.prototype, "adminReviewFlaggedVote", null);

__decorate([
    (0, common_1.Patch)('sharad-samman/admin/voting/:id/review'),
    (0, shared_1.RequirePermissions)(shared_1.PERMISSIONS.REVIEW_NOMINATIONS, shared_1.PERMISSIONS.MANAGE_NOMINATIONS),
    (0, response_interceptor_1.ResponseMessage)('Flagged vote reviewed successfully'),
    (0, swagger_1.ApiOperation)({ summary: 'Admin: Review a flagged vote' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, shared_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, typeof (_c = typeof voting_dto_1.ReviewFlaggedVoteDto !== "undefined" && voting_dto_1.ReviewFlaggedVoteDto) === "function" ? _c : Object, Object]),
    __metadata("design:returntype", Promise)
], VotingController.prototype, "adminReviewFlaggedVote", null);

__decorate([
    (0, common_1.Get)('sharad-samman/admin/voting/contest/:id/stats'),
    (0, shared_1.RequirePermissions)(shared_1.PERMISSIONS.VIEW_NOMINATIONS, shared_1.PERMISSIONS.MANAGE_NOMINATIONS),
    (0, response_interceptor_1.ResponseMessage)('Voting metrics retrieved successfully'),
    (0, swagger_1.ApiOperation)({ summary: 'Admin: Get live voting summary metrics' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], VotingController.prototype, "adminGetVotingStats", null);

__decorate([
    (0, common_1.Post)('sharad-samman/admin/voting/contest/:id/controls'),
    (0, shared_1.RequirePermissions)(shared_1.PERMISSIONS.MANAGE_NOMINATIONS),
    (0, response_interceptor_1.ResponseMessage)('Voting settings updated successfully'),
    (0, swagger_1.ApiOperation)({ summary: 'Admin: Open / Close voting and publish results' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, typeof (_d = typeof voting_dto_1.ToggleVotingDto !== "undefined" && voting_dto_1.ToggleVotingDto) === "function" ? _d : Object]),
    __metadata("design:returntype", Promise)
], VotingController.prototype, "adminToggleVoting", null);

__decorate([
    (0, common_1.Post)('sharad-samman/admin/voting/toggle-window'),
    (0, shared_1.RequirePermissions)(shared_1.PERMISSIONS.MANAGE_NOMINATIONS),
    (0, response_interceptor_1.ResponseMessage)('Voting window settings updated successfully'),
    (0, swagger_1.ApiOperation)({ summary: 'Admin: Toggle voting window settings' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], VotingController.prototype, "toggleVotingWindow", null);

__decorate([
    (0, common_1.Post)('sharad-samman/admin/voting/publish-results'),
    (0, shared_1.RequirePermissions)(shared_1.PERMISSIONS.MANAGE_NOMINATIONS),
    (0, response_interceptor_1.ResponseMessage)('Voting results published successfully'),
    (0, swagger_1.ApiOperation)({ summary: 'Admin: Publish final voting results' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], VotingController.prototype, "publishResults", null);

exports.VotingController = VotingController = __decorate([
    (0, swagger_1.ApiTags)('Sharad Samman Voting'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [typeof (_e = typeof voting_service_1.VotingService !== "undefined" && voting_service_1.VotingService) === "function" ? _e : Object])
], VotingController);
