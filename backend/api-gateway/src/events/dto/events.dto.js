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
exports.PushSubscribeDto = exports.ListRsvpsQueryDto = exports.UpdateRsvpStatusDto = exports.StoreRsvpDto = exports.ToggleWebinarStatusDto = exports.UpdateWebinarDto = exports.CreateWebinarDto = exports.ListWebinarsQueryDto = exports.WebinarResourceDto = exports.WebinarSpeakerDto = exports.LivePlatformDto = exports.RsvpStatusDto = exports.WebinarStatusDto = void 0;
const shared_1 = require("@dpgc/shared");
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
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
var LivePlatformDto;
(function (LivePlatformDto) {
    LivePlatformDto["YOUTUBE_LIVE"] = "youtube_live";
    LivePlatformDto["NATIVE_EMBED"] = "native_embed";
    LivePlatformDto["ZOOM"] = "zoom";
    LivePlatformDto["VIMEO"] = "vimeo";
    LivePlatformDto["GOOGLE_MEET"] = "google_meet";
    LivePlatformDto["CUSTOM_STREAM"] = "custom_stream";
})(LivePlatformDto || (exports.LivePlatformDto = LivePlatformDto = {}));
class WebinarSpeakerDto {
    name;
    designation;
    organization;
    bio;
    linkedin;
}
exports.WebinarSpeakerDto = WebinarSpeakerDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(1),
    (0, class_validator_1.MaxLength)(255),
    (0, class_transformer_1.Transform)(({ value }) => (typeof value === 'string' ? value.trim() : value)),
    __metadata("design:type", String)
], WebinarSpeakerDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MaxLength)(255),
    __metadata("design:type", String)
], WebinarSpeakerDto.prototype, "designation", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MaxLength)(255),
    __metadata("design:type", String)
], WebinarSpeakerDto.prototype, "organization", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MaxLength)(500),
    __metadata("design:type", String)
], WebinarSpeakerDto.prototype, "bio", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MaxLength)(500),
    __metadata("design:type", String)
], WebinarSpeakerDto.prototype, "linkedin", void 0);
class WebinarResourceDto {
    title;
    url;
    type;
}
exports.WebinarResourceDto = WebinarResourceDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength(1)),
    (0, class_validator_1.MaxLength)(255),
    __metadata("design:type", String)
], WebinarResourceDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(1000),
    __metadata("design:type", String)
], WebinarResourceDto.prototype, "url", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: ['pdf', 'slides', 'document', 'link'] }),
    (0, class_validator_1.IsIn)(['pdf', 'slides', 'document', 'link']),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], WebinarResourceDto.prototype, "type", void 0);
const WEBINAR_SORTABLE = ['createdAt', 'title', 'scheduledStartTime', 'status'];
class ListWebinarsQueryDto extends shared_1.PaginationQueryDto {
    sortBy = 'createdAt';
    status;
    livePlatform;
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
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: LivePlatformDto }),
    (0, class_validator_1.IsEnum)(LivePlatformDto),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ListWebinarsQueryDto.prototype, "livePlatform", void 0);
class CreateWebinarDto {
    title;
    slug;
    subtitle;
    description;
    bannerImage;
    speakers;
    scheduledStartTime;
    scheduledEndTime;
    timezone;
    status;
    maxAttendees;
    requiresRegistration;
    isFeatured;
    isPublished;
    livePlatform;
    liveStreamUrl;
    liveEmbedCode;
    liveMeetingUrl;
    liveMeetingPasscode;
    replayVideoUrl;
    replayEmbedCode;
    replayDurationMinutes;
    resources;
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
    (0, class_validator_1.MaxLength)(255),
    (0, class_validator_1.Matches)(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, { message: 'Slug must be lowercase letters, numbers, and hyphens only.' }),
    __metadata("design:type", String)
], CreateWebinarDto.prototype, "slug", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateWebinarDto.prototype, "subtitle", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateWebinarDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MaxLength)(500),
    __metadata("design:type", String)
], CreateWebinarDto.prototype, "bannerImage", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: [WebinarSpeakerDto] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => WebinarSpeakerDto),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], CreateWebinarDto.prototype, "speakers", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateWebinarDto.prototype, "scheduledStartTime", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateWebinarDto.prototype, "scheduledEndTime", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: 'Asia/Kolkata' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MaxLength)(50),
    __metadata("design:type", String)
], CreateWebinarDto.prototype, "timezone", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: WebinarStatusDto }),
    (0, class_validator_1.IsEnum)(WebinarStatusDto),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateWebinarDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateWebinarDto.prototype, "maxAttendees", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: true }),
    (0, class_transformer_1.Transform)(({ value }) => value === true || value === 'true' || value === 1 || value === '1'),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CreateWebinarDto.prototype, "requiresRegistration", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: false }),
    (0, class_transformer_1.Transform)(({ value }) => value === true || value === 'true' || value === 1 || value === '1'),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CreateWebinarDto.prototype, "isFeatured", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: true }),
    (0, class_transformer_1.Transform)(({ value }) => value === true || value === 'true' || value === 1 || value === '1'),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CreateWebinarDto.prototype, "isPublished", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: LivePlatformDto, default: LivePlatformDto.YOUTUBE_LIVE }),
    (0, class_validator_1.IsEnum)(LivePlatformDto),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateWebinarDto.prototype, "livePlatform", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateWebinarDto.prototype, "liveStreamUrl", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateWebinarDto.prototype, "liveEmbedCode", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MaxLength)(500),
    __metadata("design:type", String)
], CreateWebinarDto.prototype, "liveMeetingUrl", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], CreateWebinarDto.prototype, "liveMeetingPasscode", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateWebinarDto.prototype, "replayVideoUrl", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateWebinarDto.prototype, "replayEmbedCode", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateWebinarDto.prototype, "replayDurationMinutes", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: [WebinarResourceDto] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => WebinarResourceDto),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], CreateWebinarDto.prototype, "resources", void 0);
class UpdateWebinarDto extends CreateWebinarDto {
}
exports.UpdateWebinarDto = UpdateWebinarDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MinLength)(3),
    (0, class_validator_1.MaxLength)(255),
    __metadata("design:type", String)
], UpdateWebinarDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateWebinarDto.prototype, "scheduledStartTime", void 0);
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
    organization;
    cityCountry;
}
exports.StoreRsvpDto = StoreRsvpDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(150),
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
    (0, class_validator_1.MaxLength)(50),
    __metadata("design:type", String)
], StoreRsvpDto.prototype, "phone", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MaxLength)(200),
    __metadata("design:type", String)
], StoreRsvpDto.prototype, "organization", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MaxLength)(150),
    __metadata("design:type", String)
], StoreRsvpDto.prototype, "cityCountry", void 0);
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
