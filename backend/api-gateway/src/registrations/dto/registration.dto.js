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
exports.BulkCommitteeActionDto = exports.UpdateCommitteeDto = exports.ChangeCommitteeStatusDto = exports.ListCommitteesQueryDto = exports.CommitteeStatusDto = exports.SubmitCommitteeDto = exports.DecideDiasporaDto = exports.ListDiasporaQueryDto = exports.DiasporaStatusDto = exports.SubmitDiasporaDto = void 0;
const shared_1 = require("@dpgc/shared");
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
// ---------------------------------------------------------------------------
// Diaspora
// ---------------------------------------------------------------------------
class SubmitDiasporaDto {
    fullName;
    dob;
    gender;
    email;
    mobile;
    country;
    city;
    passportNo;
    nationality;
    address1;
    address2;
    state;
    postalCode;
    districtOrigin;
    village;
    relationshipWithBengal;
    languages;
    interests;
    volunteer;
    receiveUpdates;
    termsAccepted;
    captcha;
    captchaToken;
}
exports.SubmitDiasporaDto = SubmitDiasporaDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Subhash Chandra Bose' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2),
    (0, class_validator_1.MaxLength)(200),
    (0, class_transformer_1.Transform)(({ value }) => (typeof value === 'string' ? value.trim() : value)),
    __metadata("design:type", String)
], SubmitDiasporaDto.prototype, "fullName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '1990-01-15' }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], SubmitDiasporaDto.prototype, "dob", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ['female', 'male', 'non_binary', 'prefer_not_to_say'] }),
    (0, class_validator_1.IsIn)(['female', 'male', 'non_binary', 'prefer_not_to_say']),
    __metadata("design:type", String)
], SubmitDiasporaDto.prototype, "gender", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'subhash@example.com' }),
    (0, class_validator_1.IsEmail)({}, { message: 'Enter a valid email address.' }),
    (0, class_validator_1.MaxLength)(180),
    (0, class_transformer_1.Transform)(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value)),
    __metadata("design:type", String)
], SubmitDiasporaDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '+919876543210' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(25),
    __metadata("design:type", String)
], SubmitDiasporaDto.prototype, "mobile", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'United Kingdom' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], SubmitDiasporaDto.prototype, "country", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'London' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], SubmitDiasporaDto.prototype, "city", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], SubmitDiasporaDto.prototype, "passportNo", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Indian' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], SubmitDiasporaDto.prototype, "nationality", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '12 Baker Street' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(255),
    __metadata("design:type", String)
], SubmitDiasporaDto.prototype, "address1", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MaxLength)(255),
    __metadata("design:type", String)
], SubmitDiasporaDto.prototype, "address2", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], SubmitDiasporaDto.prototype, "state", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MaxLength)(20),
    __metadata("design:type", String)
], SubmitDiasporaDto.prototype, "postalCode", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Kolkata' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], SubmitDiasporaDto.prototype, "districtOrigin", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], SubmitDiasporaDto.prototype, "village", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Born in Bengal' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], SubmitDiasporaDto.prototype, "relationshipWithBengal", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Bengali, English' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(255),
    __metadata("design:type", String)
], SubmitDiasporaDto.prototype, "languages", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        type: [String],
        enum: ['culture_heritage', 'durga_puja', 'tourism', 'business_investment', 'education', 'events_live', 'community_services', 'others'],
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsIn)(['culture_heritage', 'durga_puja', 'tourism', 'business_investment', 'education', 'events_live', 'community_services', 'others'], { each: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], SubmitDiasporaDto.prototype, "interests", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsBoolean)(),
    (0, class_transformer_1.Transform)(({ value }) => value === true || value === 'true' || value === '1'),
    __metadata("design:type", Boolean)
], SubmitDiasporaDto.prototype, "volunteer", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => value === true || value === 'true' || value === '1'),
    __metadata("design:type", Boolean)
], SubmitDiasporaDto.prototype, "receiveUpdates", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsBoolean)(),
    (0, class_transformer_1.Transform)(({ value }) => value === true || value === 'true' || value === '1'),
    __metadata("design:type", Boolean)
], SubmitDiasporaDto.prototype, "termsAccepted", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '12' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(10),
    __metadata("design:type", String)
], SubmitDiasporaDto.prototype, "captcha", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(80),
    __metadata("design:type", String)
], SubmitDiasporaDto.prototype, "captchaToken", void 0);
var DiasporaStatusDto;
(function (DiasporaStatusDto) {
    DiasporaStatusDto["PENDING"] = "PENDING";
    DiasporaStatusDto["VERIFIED"] = "VERIFIED";
    DiasporaStatusDto["REJECTED"] = "REJECTED";
})(DiasporaStatusDto || (exports.DiasporaStatusDto = DiasporaStatusDto = {}));
class ListDiasporaQueryDto extends shared_1.PaginationQueryDto {
    status;
    country;
}
exports.ListDiasporaQueryDto = ListDiasporaQueryDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: DiasporaStatusDto }),
    (0, class_validator_1.IsEnum)(DiasporaStatusDto),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ListDiasporaQueryDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], ListDiasporaQueryDto.prototype, "country", void 0);
class DecideDiasporaDto {
    reason;
}
exports.DecideDiasporaDto = DecideDiasporaDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Required when rejecting.' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MaxLength)(2000),
    __metadata("design:type", String)
], DecideDiasporaDto.prototype, "reason", void 0);
// ---------------------------------------------------------------------------
// Committees
// ---------------------------------------------------------------------------
class SubmitCommitteeDto {
    committeeName;
    establishedYear;
    pujaType;
    pujaCategory;
    committeeDescription;
    contactPersonName;
    designation;
    email;
    mobile;
    country;
    state;
    city;
    postalCode;
    venueName;
    venueAddress;
    landmark;
    address;
    registrationCertificate;
    addressProof;
    pandalImage;
    declaration;
    captcha;
    captchaToken;
}
exports.SubmitCommitteeDto = SubmitCommitteeDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2),
    (0, class_validator_1.MaxLength)(200),
    (0, class_transformer_1.Transform)(({ value }) => (typeof value === 'string' ? value.trim() : value)),
    __metadata("design:type", String)
], SubmitCommitteeDto.prototype, "committeeName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1920 }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], SubmitCommitteeDto.prototype, "establishedYear", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ['sarbojanin', 'barowari', 'private'] }),
    (0, class_validator_1.IsIn)(['sarbojanin', 'barowari', 'private']),
    __metadata("design:type", String)
], SubmitCommitteeDto.prototype, "pujaType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ['traditional', 'theme_based', 'heritage'] }),
    (0, class_validator_1.IsIn)(['traditional', 'theme_based', 'heritage']),
    __metadata("design:type", String)
], SubmitCommitteeDto.prototype, "pujaCategory", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(10),
    (0, class_validator_1.MaxLength)(300),
    __metadata("design:type", String)
], SubmitCommitteeDto.prototype, "committeeDescription", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(200),
    (0, class_transformer_1.Transform)(({ value }) => (typeof value === 'string' ? value.trim() : value)),
    __metadata("design:type", String)
], SubmitCommitteeDto.prototype, "contactPersonName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], SubmitCommitteeDto.prototype, "designation", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsEmail)({}, { message: 'Enter a valid email address.' }),
    (0, class_validator_1.MaxLength)(180),
    (0, class_transformer_1.Transform)(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value)),
    __metadata("design:type", String)
], SubmitCommitteeDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(25),
    __metadata("design:type", String)
], SubmitCommitteeDto.prototype, "mobile", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], SubmitCommitteeDto.prototype, "country", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], SubmitCommitteeDto.prototype, "state", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], SubmitCommitteeDto.prototype, "city", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(20),
    __metadata("design:type", String)
], SubmitCommitteeDto.prototype, "postalCode", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(180),
    __metadata("design:type", String)
], SubmitCommitteeDto.prototype, "venueName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(255),
    __metadata("design:type", String)
], SubmitCommitteeDto.prototype, "venueAddress", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MaxLength)(255),
    __metadata("design:type", String)
], SubmitCommitteeDto.prototype, "landmark", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SubmitCommitteeDto.prototype, "address", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'File path for the registration certificate.' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SubmitCommitteeDto.prototype, "registrationCertificate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'File path for the address proof.' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SubmitCommitteeDto.prototype, "addressProof", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'File path for the pandal image.' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SubmitCommitteeDto.prototype, "pandalImage", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsBoolean)(),
    (0, class_transformer_1.Transform)(({ value }) => value === true || value === 'true' || value === '1'),
    __metadata("design:type", Boolean)
], SubmitCommitteeDto.prototype, "declaration", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '12' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(10),
    __metadata("design:type", String)
], SubmitCommitteeDto.prototype, "captcha", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(80),
    __metadata("design:type", String)
], SubmitCommitteeDto.prototype, "captchaToken", void 0);
var CommitteeStatusDto;
(function (CommitteeStatusDto) {
    CommitteeStatusDto["PENDING"] = "PENDING";
    CommitteeStatusDto["UNDER_REVIEW"] = "UNDER_REVIEW";
    CommitteeStatusDto["APPROVED"] = "APPROVED";
    CommitteeStatusDto["REJECTED"] = "REJECTED";
    CommitteeStatusDto["INACTIVE"] = "INACTIVE";
})(CommitteeStatusDto || (exports.CommitteeStatusDto = CommitteeStatusDto = {}));
const COMMITTEE_SORTABLE = ['createdAt', 'committeeName', 'status'];
class ListCommitteesQueryDto extends shared_1.PaginationQueryDto {
    sortBy = 'createdAt';
    status;
    city;
}
exports.ListCommitteesQueryDto = ListCommitteesQueryDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: COMMITTEE_SORTABLE, default: 'createdAt' }),
    (0, class_validator_1.IsIn)(COMMITTEE_SORTABLE),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], ListCommitteesQueryDto.prototype, "sortBy", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: CommitteeStatusDto }),
    (0, class_validator_1.IsEnum)(CommitteeStatusDto),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ListCommitteesQueryDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], ListCommitteesQueryDto.prototype, "city", void 0);
class ChangeCommitteeStatusDto {
    status;
    reason;
}
exports.ChangeCommitteeStatusDto = ChangeCommitteeStatusDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: CommitteeStatusDto }),
    (0, class_validator_1.IsEnum)(CommitteeStatusDto),
    __metadata("design:type", String)
], ChangeCommitteeStatusDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Required when rejecting.' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MaxLength)(2000),
    __metadata("design:type", String)
], ChangeCommitteeStatusDto.prototype, "reason", void 0);
class UpdateCommitteeDto {
    committeeName;
    establishedYear;
    pujaType;
    pujaCategory;
    committeeDescription;
    contactPersonName;
    designation;
    email;
    mobile;
    country;
    state;
    city;
    postalCode;
    venueName;
    venueAddress;
    landmark;
    address;
}
exports.UpdateCommitteeDto = UpdateCommitteeDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MaxLength)(200),
    (0, class_transformer_1.Transform)(({ value }) => (typeof value === 'string' ? value.trim() : value)),
    __metadata("design:type", String)
], UpdateCommitteeDto.prototype, "committeeName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], UpdateCommitteeDto.prototype, "establishedYear", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MaxLength)(60),
    __metadata("design:type", String)
], UpdateCommitteeDto.prototype, "pujaType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], UpdateCommitteeDto.prototype, "pujaCategory", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateCommitteeDto.prototype, "committeeDescription", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MaxLength)(200),
    (0, class_transformer_1.Transform)(({ value }) => (typeof value === 'string' ? value.trim() : value)),
    __metadata("design:type", String)
], UpdateCommitteeDto.prototype, "contactPersonName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], UpdateCommitteeDto.prototype, "designation", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsEmail)({}, { message: 'Enter a valid email address.' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MaxLength)(180),
    (0, class_transformer_1.Transform)(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value)),
    __metadata("design:type", String)
], UpdateCommitteeDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MaxLength)(25),
    __metadata("design:type", String)
], UpdateCommitteeDto.prototype, "mobile", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], UpdateCommitteeDto.prototype, "country", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], UpdateCommitteeDto.prototype, "state", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], UpdateCommitteeDto.prototype, "city", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MaxLength)(20),
    __metadata("design:type", String)
], UpdateCommitteeDto.prototype, "postalCode", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MaxLength)(180),
    __metadata("design:type", String)
], UpdateCommitteeDto.prototype, "venueName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MaxLength)(255),
    __metadata("design:type", String)
], UpdateCommitteeDto.prototype, "venueAddress", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MaxLength)(255),
    __metadata("design:type", String)
], UpdateCommitteeDto.prototype, "landmark", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateCommitteeDto.prototype, "address", void 0);
class BulkCommitteeActionDto {
    ids;
    action;
    status;
    reason;
}
exports.BulkCommitteeActionDto = BulkCommitteeActionDto;
__decorate([
    (0, swagger_1.ApiProperty)({ type: [Number] }),
    (0, class_validator_1.IsArray)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)({ each: true }),
    __metadata("design:type", Array)
], BulkCommitteeActionDto.prototype, "ids", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ['approve', 'reject', 'status', 'delete'] }),
    (0, class_validator_1.IsIn)(['approve', 'reject', 'status', 'delete']),
    __metadata("design:type", String)
], BulkCommitteeActionDto.prototype, "action", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: CommitteeStatusDto }),
    (0, class_validator_1.IsEnum)(CommitteeStatusDto),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], BulkCommitteeActionDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MaxLength)(2000),
    __metadata("design:type", String)
], BulkCommitteeActionDto.prototype, "reason", void 0);
