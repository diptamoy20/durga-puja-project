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
exports.SendEmailDto = exports.ListNotificationsQueryDto = exports.NotificationStatusDto = void 0;
const shared_1 = require("@dpgc/shared");
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
var NotificationStatusDto;
(function (NotificationStatusDto) {
    NotificationStatusDto["QUEUED"] = "QUEUED";
    NotificationStatusDto["SENT"] = "SENT";
    NotificationStatusDto["FAILED"] = "FAILED";
})(NotificationStatusDto || (exports.NotificationStatusDto = NotificationStatusDto = {}));
/** The template keys the notification service knows how to render. */
const EMAIL_TEMPLATES = [
    'welcome',
    'portal_credentials',
    'password_reset',
    'diaspora_verified',
    'diaspora_rejected',
    'committee_approved',
    'committee_rejected',
    'media_moderated',
    'webinar_rsvp',
];
class ListNotificationsQueryDto extends shared_1.PaginationQueryDto {
    status;
}
exports.ListNotificationsQueryDto = ListNotificationsQueryDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: NotificationStatusDto }),
    (0, class_validator_1.IsEnum)(NotificationStatusDto),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ListNotificationsQueryDto.prototype, "status", void 0);
class SendEmailDto {
    to;
    template;
    subject;
    data;
    userId;
}
exports.SendEmailDto = SendEmailDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'guest@example.com' }),
    (0, class_validator_1.IsEmail)({}, { message: 'Enter a valid email address.' }),
    (0, class_validator_1.MaxLength)(255),
    (0, class_transformer_1.Transform)(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value)),
    __metadata("design:type", String)
], SendEmailDto.prototype, "to", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: EMAIL_TEMPLATES }),
    (0, class_validator_1.IsIn)(EMAIL_TEMPLATES),
    __metadata("design:type", String)
], SendEmailDto.prototype, "template", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MaxLength)(255),
    __metadata("design:type", String)
], SendEmailDto.prototype, "subject", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Variables merged into the template body (e.g. a reset link).',
        type: Object,
    }),
    (0, class_validator_1.IsObject)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], SendEmailDto.prototype, "data", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], SendEmailDto.prototype, "userId", void 0);