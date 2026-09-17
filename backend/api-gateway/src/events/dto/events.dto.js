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
exports.PushSubscribeDto = exports.ListRsvpsQueryDto = exports.UpdateRsvpStatusDto = exports.StoreRsvpDto = exports.ToggleWebinarStatusDto = exports.UpdateWebinarDto = exports.CreateWebinarDto = exports.ListWebinarsQueryDto = exports.RsvpStatusDto = exports.WebinarStatusDto = void 0;
const shared_1 = require("@dpgc/shared");
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
// ---------------------------------------------------------------------------
// Webinars
// ---------------------------------------------------------------------------
var WebinarStatusDto;
(function (WebinarStatusDto) {
    WebinarStatusDto["SCHEDULED"] = "SCHEDULED";
    WebinarStatusDto["LIVE"] = "LIVE";
    WebinarStatusDto["COMPLETED"] = "COMPLETED";
    WebinarStatusDto["CANCELLED"] = "CANCELLED";
})(WebinarStatusDto || (exports.WebinarStatusDto = WebinarStatusDto = {}));
var RsvpStatusDto;
(function (RsvpStatusDto) {
    RsvpStatusDto["REGISTERED"] = "REGISTERED";
    RsvpStatusDto["CONFIRMED"] = "CONFIRMED";
    RsvpStatusDto["ATTENDED"] = "ATTENDED";
    RsvpStatusDto["CANCELLED"] = "CANCELLED";
    RsvpStatusDto["NO_SHOW"] = "NO_SHOW";
})(RsvpStatusDto || (exports.RsvpStatusDto = RsvpStatusDto = {}));
const WEBINAR_SORTABLE = ['createdAt', 'title', 'scheduledAt', 'status'];
class ListWebinarsQueryDto extends shared_1.PaginationQueryDto {
    sortBy = 'createdAt';
    status;
}
exports.ListWebinarsQueryDto = ListWebinarsQueryDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: WEBINAR_SORTABLE, default: 'createdAt' }),
    (0, class_validator_1.IsIn)(WEBINAR_SORTABLE),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], ListWebinarsQueryDto.prototype, "sortBy", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: WebinarStatusDto }),
    (0, class_validator_1.IsEnum)(WebinarStatusDto),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ListWebinarsQueryDto.prototype, "status", void 0);
class CreateWebinarDto {
    title;
    description;
    scheduledAt;
    duration;
    meetingLink;
    speaker;
    speakerBio;
    bannerImage;
    maxAttendees;
}
exports.CreateWebinarDto = CreateWebinarDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(3),
    (0, class_validator_1.MaxLength)(255),
    (0, class_transformer_1.Transform)(({ value }) => (typeof value === 'string' ? value.trim() : value)),
    __metadata("design:type", String)
], CreateWebinarDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateWebinarDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateWebinarDto.prototype, "scheduledAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(10),
    __metadata("design:type", String)
], CreateWebinarDto.prototype, "duration", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MaxLength)(500),
    __metadata("design:type", String)
], CreateWebinarDto.prototype, "meetingLink", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MaxLength)(255),
    __metadata("design:type", String)
], CreateWebinarDto.prototype, "speaker", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateWebinarDto.prototype, "speakerBio", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MaxLength)(500),
    __metadata("design:type", String)
], CreateWebinarDto.prototype, "bannerImage", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateWebinarDto.prototype, "maxAttendees", void 0);
class UpdateWebinarDto {
    title;
    description;
    scheduledAt;
    duration;
    meetingLink;
    speaker;
    speakerBio;
    bannerImage;
    maxAttendees;
    replayUrl;
}
exports.UpdateWebinarDto = UpdateWebinarDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MaxLength)(255),
    (0, class_transformer_1.Transform)(({ value }) => (typeof value === 'string' ? value.trim() : value)),
    __metadata("design:type", String)
], UpdateWebinarDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateWebinarDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateWebinarDto.prototype, "scheduledAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MaxLength)(10),
    __metadata("design:type", String)
], UpdateWebinarDto.prototype, "duration", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MaxLength)(500),
    __metadata("design:type", String)
], UpdateWebinarDto.prototype, "meetingLink", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MaxLength)(255),
    __metadata("design:type", String)
], UpdateWebinarDto.prototype, "speaker", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateWebinarDto.prototype, "speakerBio", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MaxLength)(500),
    __metadata("design:type", String)
], UpdateWebinarDto.prototype, "bannerImage", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], UpdateWebinarDto.prototype, "maxAttendees", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MaxLength)(500),
    __metadata("design:type", String)
], UpdateWebinarDto.prototype, "replayUrl", void 0);
class ToggleWebinarStatusDto {
    status;
}
exports.ToggleWebinarStatusDto = ToggleWebinarStatusDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: WebinarStatusDto }),
    (0, class_validator_1.IsEnum)(WebinarStatusDto),
    __metadata("design:type", String)
], ToggleWebinarStatusDto.prototype, "status", void 0);
class StoreRsvpDto {
    name;
    email;
    phone;
}
exports.StoreRsvpDto = StoreRsvpDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(200),
    (0, class_transformer_1.Transform)(({ value }) => (typeof value === 'string' ? value.trim() : value)),
    __metadata("design:type", String)
], StoreRsvpDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsEmail)({}, { message: 'Enter a valid email address.' }),
    (0, class_validator_1.MaxLength)(180),
    (0, class_transformer_1.Transform)(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value)),
    __metadata("design:type", String)
], StoreRsvpDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MaxLength)(25),
    __metadata("design:type", String)
], StoreRsvpDto.prototype, "phone", void 0);
class UpdateRsvpStatusDto {
    status;
    notes;
}
exports.UpdateRsvpStatusDto = UpdateRsvpStatusDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: RsvpStatusDto }),
    (0, class_validator_1.IsEnum)(RsvpStatusDto),
    __metadata("design:type", String)
], UpdateRsvpStatusDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MaxLength)(500),
    __metadata("design:type", String)
], UpdateRsvpStatusDto.prototype, "notes", void 0);
class ListRsvpsQueryDto extends shared_1.PaginationQueryDto {
    webinarId;
    status;
}
exports.ListRsvpsQueryDto = ListRsvpsQueryDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], ListRsvpsQueryDto.prototype, "webinarId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: RsvpStatusDto }),
    (0, class_validator_1.IsEnum)(RsvpStatusDto),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ListRsvpsQueryDto.prototype, "status", void 0);
class PushSubscribeDto {
    endpoint;
    publicKey;
    authToken;
    contentEncoding;
}
exports.PushSubscribeDto = PushSubscribeDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PushSubscribeDto.prototype, "endpoint", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], PushSubscribeDto.prototype, "publicKey", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], PushSubscribeDto.prototype, "authToken", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], PushSubscribeDto.prototype, "contentEncoding", void 0);
