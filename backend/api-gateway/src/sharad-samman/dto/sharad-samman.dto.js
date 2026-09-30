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
exports.ExtendVotingDto = exports.ConfigureVotingDto = exports.UpdateContestDto = exports.CreateContestDto = exports.CommitteeUpdateNominationDto = exports.CommitteeCreateNominationDto = exports.NominationListQueryDto = exports.NominationStatusTransitionDto = exports.UpdateNominationDto = exports.CreateNominationDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const database_1 = require("@dpgc/database");

class CreateNominationDto {
    contestId;
    pujaCommitteeId;
    category;
    title;
    description;
    photos;
    pandalImage;
}
exports.CreateNominationDto = CreateNominationDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID of the contest' }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreateNominationDto.prototype, "contestId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID of the Puja Committee being nominated' }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreateNominationDto.prototype, "pujaCommitteeId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Award category name (e.g. Best Traditional Pandal, Best Idol)' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Award category is required' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], CreateNominationDto.prototype, "category", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Nomination title or theme' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(200),
    __metadata("design:type", String)
], CreateNominationDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Detailed nomination description / concept notes' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateNominationDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Array of Puja photo URLs (Pandal, Idol, Illumination, Decor)', type: [String] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], CreateNominationDto.prototype, "photos", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Primary pandal cover image URL' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateNominationDto.prototype, "pandalImage", void 0);

class UpdateNominationDto {
    category;
    title;
    description;
    photos;
    pandalImage;
}
exports.UpdateNominationDto = UpdateNominationDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Award category' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Award category cannot be empty' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], UpdateNominationDto.prototype, "category", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Nomination title or theme' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(200),
    __metadata("design:type", String)
], UpdateNominationDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Detailed description' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateNominationDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Array of Puja photo URLs', type: [String] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], UpdateNominationDto.prototype, "photos", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Primary pandal cover image URL' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateNominationDto.prototype, "pandalImage", void 0);

class NominationStatusTransitionDto {
    status;
    reason;
    reviewNotes;
}
exports.NominationStatusTransitionDto = NominationStatusTransitionDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: database_1.NominationStatus, description: 'Target nomination status' }),
    (0, class_validator_1.IsEnum)(database_1.NominationStatus),
    __metadata("design:type", String)
], NominationStatusTransitionDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Mandatory reason when status is REJECTED' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], NominationStatusTransitionDto.prototype, "reason", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Internal admin review notes' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], NominationStatusTransitionDto.prototype, "reviewNotes", void 0);

class NominationListQueryDto {
    page;
    perPage;
    search;
    status;
    contestId;
    pujaCommitteeId;
    sortDir;
}
exports.NominationListQueryDto = NominationListQueryDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: 1 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], NominationListQueryDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: 15 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], NominationListQueryDto.prototype, "perPage", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Search term for committee name, registration no, or title' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], NominationListQueryDto.prototype, "search", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: database_1.NominationStatus, description: 'Filter by status' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(database_1.NominationStatus),
    __metadata("design:type", String)
], NominationListQueryDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Filter by contest ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], NominationListQueryDto.prototype, "contestId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Filter by Puja Committee ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], NominationListQueryDto.prototype, "pujaCommitteeId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: ['asc', 'desc'], default: 'desc' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], NominationListQueryDto.prototype, "sortDir", void 0);

class CommitteeCreateNominationDto {
    contestId;
    category;
    title;
    description;
    photos;
    pandalImage;
    submitNow;
}
exports.CommitteeCreateNominationDto = CommitteeCreateNominationDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Optional contest ID (defaults to active contest)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CommitteeCreateNominationDto.prototype, "contestId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Award category name (required)' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Award category is required' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], CommitteeCreateNominationDto.prototype, "category", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Nomination title or theme' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(200),
    __metadata("design:type", String)
], CommitteeCreateNominationDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Detailed nomination description / concept notes' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CommitteeCreateNominationDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Array of Puja photo URLs (Pandal, Idol, Illumination, Decor)', type: [String] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], CommitteeCreateNominationDto.prototype, "photos", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Primary pandal cover image URL' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CommitteeCreateNominationDto.prototype, "pandalImage", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Whether to submit immediately rather than saving as draft', default: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Boolean),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CommitteeCreateNominationDto.prototype, "submitNow", void 0);

class CommitteeUpdateNominationDto {
    category;
    title;
    description;
    photos;
    pandalImage;
    submitNow;
}
exports.CommitteeUpdateNominationDto = CommitteeUpdateNominationDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Award category' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Award category cannot be empty' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], CommitteeUpdateNominationDto.prototype, "category", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Nomination title or theme' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(200),
    __metadata("design:type", String)
], CommitteeUpdateNominationDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Detailed description' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CommitteeUpdateNominationDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Array of Puja photo URLs (Pandal, Idol, Illumination, Decor)', type: [String] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], CommitteeUpdateNominationDto.prototype, "photos", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Primary pandal cover image URL' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CommitteeUpdateNominationDto.prototype, "pandalImage", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Whether to transition from draft to submitted on save', default: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Boolean),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CommitteeUpdateNominationDto.prototype, "submitNow", void 0);

class CreateContestDto {
    name;
    year;
    description;
    startDate;
    endDate;
    status;
}
exports.CreateContestDto = CreateContestDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Contest name' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Contest Name is required' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(150),
    __metadata("design:type", String)
], CreateContestDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Contest year' }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)({ message: 'Contest Year must be a valid integer' }),
    (0, class_validator_1.Min)(2000),
    (0, class_validator_1.Max)(2100),
    __metadata("design:type", Number)
], CreateContestDto.prototype, "year", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Contest description' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateContestDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Start Date (ISO 8601)' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Start Date is required' }),
    (0, class_validator_1.IsDateString)({}, { message: 'Start Date must be a valid ISO date' }),
    __metadata("design:type", String)
], CreateContestDto.prototype, "startDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Last Date / End Date (ISO 8601)' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Last Date is required' }),
    (0, class_validator_1.IsDateString)({}, { message: 'Last Date must be a valid ISO date' }),
    __metadata("design:type", String)
], CreateContestDto.prototype, "endDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: database_1.ContestStatus, description: 'Contest status', default: database_1.ContestStatus.DRAFT }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(database_1.ContestStatus, { message: 'Status must be DRAFT, ACTIVE, or CLOSED' }),
    __metadata("design:type", String)
], CreateContestDto.prototype, "status", void 0);

class UpdateContestDto {
    name;
    year;
    description;
    startDate;
    endDate;
    status;
}
exports.UpdateContestDto = UpdateContestDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Contest name' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Contest Name cannot be empty' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(150),
    __metadata("design:type", String)
], UpdateContestDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Contest year' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)({ message: 'Contest Year must be a valid integer' }),
    (0, class_validator_1.Min)(2000),
    (0, class_validator_1.Max)(2100),
    __metadata("design:type", Number)
], UpdateContestDto.prototype, "year", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Contest description' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateContestDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Start Date (ISO 8601)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)({}, { message: 'Start Date must be a valid ISO date' }),
    __metadata("design:type", String)
], UpdateContestDto.prototype, "startDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Last Date / End Date (ISO 8601)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)({}, { message: 'Last Date must be a valid ISO date' }),
    __metadata("design:type", String)
], UpdateContestDto.prototype, "endDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: database_1.ContestStatus, description: 'Contest status' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(database_1.ContestStatus, { message: 'Status must be DRAFT, ACTIVE, or CLOSED' }),
    __metadata("design:type", String)
], UpdateContestDto.prototype, "status", void 0);

class ConfigureVotingDto {
    votingStartDate;
    votingEndDate;
}
exports.ConfigureVotingDto = ConfigureVotingDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Voting Start Date & Time (ISO 8601)' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Voting Start Date is required' }),
    (0, class_validator_1.IsDateString)({}, { message: 'Voting Start Date must be a valid ISO date' }),
    __metadata("design:type", String)
], ConfigureVotingDto.prototype, "votingStartDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Voting End Date & Time (ISO 8601)' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Voting End Date is required' }),
    (0, class_validator_1.IsDateString)({}, { message: 'Voting End Date must be a valid ISO date' }),
    __metadata("design:type", String)
], ConfigureVotingDto.prototype, "votingEndDate", void 0);

class ExtendVotingDto {
    votingExtendedUntil;
}
exports.ExtendVotingDto = ExtendVotingDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Voting Extended Until Date & Time (ISO 8601)' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Extended Until Date is required' }),
    (0, class_validator_1.IsDateString)({}, { message: 'Extended Until Date must be a valid ISO date' }),
    __metadata("design:type", String)
], ExtendVotingDto.prototype, "votingExtendedUntil", void 0);


