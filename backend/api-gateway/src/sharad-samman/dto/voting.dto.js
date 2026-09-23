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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ToggleVotingDto = exports.ReviewFlaggedVoteDto = exports.CastVoteDto = exports.RequestVotingOtpDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");

class RequestVotingOtpDto {
    email;
    contestId;
    captchaAnswer;
    captchaToken;
}
exports.RequestVotingOtpDto = RequestVotingOtpDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Voter email address' }),
    (0, class_validator_1.IsEmail)({}, { message: 'A valid email address is required' }),
    (0, class_transformer_1.Transform)(({ value }) => typeof value === 'string' ? value.trim().toLowerCase() : value),
    __metadata("design:type", String)
], RequestVotingOtpDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID of the active contest' }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], RequestVotingOtpDto.prototype, "contestId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'CAPTCHA mathematical answer' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'CAPTCHA verification answer is required' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RequestVotingOtpDto.prototype, "captchaAnswer", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'CAPTCHA cryptographic token' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'CAPTCHA token is required' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RequestVotingOtpDto.prototype, "captchaToken", void 0);

class CastVoteDto {
    contestId;
    nominationId;
    voterEmail;
    voterName;
    voterPhone;
    voterCountry;
    voterCity;
    otpCode;
    submissionTimeMs;
    deviceFingerprint;
}
exports.CastVoteDto = CastVoteDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID of the active contest' }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CastVoteDto.prototype, "contestId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID of the nomination / committee receiving the vote' }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CastVoteDto.prototype, "nominationId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Voter email address' }),
    (0, class_validator_1.IsEmail)({}, { message: 'A valid email address is required' }),
    (0, class_transformer_1.Transform)(({ value }) => typeof value === 'string' ? value.trim().toLowerCase() : value),
    __metadata("design:type", String)
], CastVoteDto.prototype, "voterEmail", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Voter full name' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(150),
    __metadata("design:type", String)
], CastVoteDto.prototype, "voterName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Voter phone number' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(50),
    __metadata("design:type", String)
], CastVoteDto.prototype, "voterPhone", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Voter country', default: 'India' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], CastVoteDto.prototype, "voterCountry", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Voter city' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], CastVoteDto.prototype, "voterCity", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '6-digit OTP received via email (or static test OTP)' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'OTP code is required' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CastVoteDto.prototype, "otpCode", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Time taken on the form in milliseconds (anti-bot signal)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CastVoteDto.prototype, "submissionTimeMs", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Client device fingerprint hash' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CastVoteDto.prototype, "deviceFingerprint", void 0);

class ReviewFlaggedVoteDto {
    action;
    reviewNotes;
}
exports.ReviewFlaggedVoteDto = ReviewFlaggedVoteDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ['APPROVE', 'REJECT'], description: 'Audit action for flagged vote' }),
    (0, class_validator_1.IsIn)(['APPROVE', 'REJECT'], { message: 'Action must be APPROVE or REJECT' }),
    __metadata("design:type", String)
], ReviewFlaggedVoteDto.prototype, "action", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Admin or Jury remarks' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ReviewFlaggedVoteDto.prototype, "reviewNotes", void 0);

class ToggleVotingDto {
    isVotingOpen;
    votingStartDate;
    votingEndDate;
    resultsPublished;
}
exports.ToggleVotingDto = ToggleVotingDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Whether public voting is currently active' }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], ToggleVotingDto.prototype, "isVotingOpen", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Scheduled start date for voting' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], ToggleVotingDto.prototype, "votingStartDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Scheduled end date for voting' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], ToggleVotingDto.prototype, "votingEndDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Whether final voting results are officially published to public' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], ToggleVotingDto.prototype, "resultsPublished", void 0);
