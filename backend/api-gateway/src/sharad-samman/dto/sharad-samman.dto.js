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
exports.CommitteeUpdateNominationDto = exports.CommitteeCreateNominationDto = exports.NominationListQueryDto = exports.NominationStatusTransitionDto = exports.UpdateNominationDto = exports.CreateNominationDto = void 0;
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

class UpdateNominationDto {
    category;
    title;
    description;
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
    (0, swagger_1.ApiPropertyOptional)({ description: 'Whether to transition from draft to submitted on save', default: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Boolean),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CommitteeUpdateNominationDto.prototype, "submitNow", void 0);

