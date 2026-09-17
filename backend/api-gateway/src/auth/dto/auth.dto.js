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
exports.ResetPasswordRequestDto = exports.ForgotPasswordRequestDto = exports.ChangePasswordRequestDto = exports.RefreshRequestDto = exports.RegisterRequestDto = exports.LoginRequestDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const PASSWORD_RULES = {
    lower: { pattern: /[a-z]/, message: 'Password must contain a lowercase letter.' },
    upper: { pattern: /[A-Z]/, message: 'Password must contain an uppercase letter.' },
    digit: { pattern: /[0-9]/, message: 'Password must contain a number.' },
};
class LoginRequestDto {
    email;
    password;
    remember;
}
exports.LoginRequestDto = LoginRequestDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'admin@durgapujaglobalconnect.in' }),
    (0, class_validator_1.IsEmail)({}, { message: 'Enter a valid email address.' }),
    (0, class_validator_1.MaxLength)(180),
    (0, class_transformer_1.Transform)(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value)),
    __metadata("design:type", String)
], LoginRequestDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Password123!', minLength: 1 }),
    (0, class_validator_1.IsString)({ message: 'Password is required.' }),
    (0, class_validator_1.MinLength)(1, { message: 'Password is required.' }),
    (0, class_validator_1.MaxLength)(72),
    __metadata("design:type", String)
], LoginRequestDto.prototype, "password", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Issue a longer-lived session.', default: false }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], LoginRequestDto.prototype, "remember", void 0);
class RegisterRequestDto {
    firstName;
    lastName;
    email;
    password;
    phone;
}
exports.RegisterRequestDto = RegisterRequestDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Ananya' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(1, { message: 'First name is required.' }),
    (0, class_validator_1.MaxLength)(100),
    (0, class_transformer_1.Transform)(({ value }) => (typeof value === 'string' ? value.trim() : value)),
    __metadata("design:type", String)
], RegisterRequestDto.prototype, "firstName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Sen' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(1, { message: 'Last name is required.' }),
    (0, class_validator_1.MaxLength)(100),
    (0, class_transformer_1.Transform)(({ value }) => (typeof value === 'string' ? value.trim() : value)),
    __metadata("design:type", String)
], RegisterRequestDto.prototype, "lastName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'ananya.sen@example.com' }),
    (0, class_validator_1.IsEmail)({}, { message: 'Enter a valid email address.' }),
    (0, class_validator_1.MaxLength)(180),
    (0, class_transformer_1.Transform)(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value)),
    __metadata("design:type", String)
], RegisterRequestDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Password123!',
        description: 'At least 8 characters with upper case, lower case and a digit.',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(8, { message: 'Password must be at least 8 characters.' }),
    (0, class_validator_1.MaxLength)(72),
    (0, class_validator_1.Matches)(PASSWORD_RULES.lower.pattern, { message: PASSWORD_RULES.lower.message }),
    (0, class_validator_1.Matches)(PASSWORD_RULES.upper.pattern, { message: PASSWORD_RULES.upper.message }),
    (0, class_validator_1.Matches)(PASSWORD_RULES.digit.pattern, { message: PASSWORD_RULES.digit.message }),
    __metadata("design:type", String)
], RegisterRequestDto.prototype, "password", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '+91 98300 00000' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MaxLength)(25),
    __metadata("design:type", String)
], RegisterRequestDto.prototype, "phone", void 0);
class RefreshRequestDto {
    refreshToken;
}
exports.RefreshRequestDto = RefreshRequestDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'The refresh token issued at login.' }),
    (0, class_validator_1.IsString)({ message: 'A refresh token is required.' }),
    __metadata("design:type", String)
], RefreshRequestDto.prototype, "refreshToken", void 0);
class ChangePasswordRequestDto {
    currentPassword;
    newPassword;
}
exports.ChangePasswordRequestDto = ChangePasswordRequestDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)({ message: 'Your current password is required.' }),
    (0, class_validator_1.MaxLength)(72),
    __metadata("design:type", String)
], ChangePasswordRequestDto.prototype, "currentPassword", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'At least 8 characters with upper case, lower case and a digit.' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(8, { message: 'Password must be at least 8 characters.' }),
    (0, class_validator_1.MaxLength)(72),
    (0, class_validator_1.Matches)(PASSWORD_RULES.lower.pattern, { message: PASSWORD_RULES.lower.message }),
    (0, class_validator_1.Matches)(PASSWORD_RULES.upper.pattern, { message: PASSWORD_RULES.upper.message }),
    (0, class_validator_1.Matches)(PASSWORD_RULES.digit.pattern, { message: PASSWORD_RULES.digit.message }),
    __metadata("design:type", String)
], ChangePasswordRequestDto.prototype, "newPassword", void 0);
class ForgotPasswordRequestDto {
    email;
}
exports.ForgotPasswordRequestDto = ForgotPasswordRequestDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'admin@durgapujaglobalconnect.in' }),
    (0, class_validator_1.IsEmail)({}, { message: 'Enter a valid email address.' }),
    (0, class_validator_1.MaxLength)(180),
    (0, class_transformer_1.Transform)(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value)),
    __metadata("design:type", String)
], ForgotPasswordRequestDto.prototype, "email", void 0);
class ResetPasswordRequestDto {
    token;
    email;
    password;
}
exports.ResetPasswordRequestDto = ResetPasswordRequestDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'The token from the password reset email.' }),
    (0, class_validator_1.IsString)({ message: 'The reset token is required.' }),
    (0, class_validator_1.MaxLength)(128),
    __metadata("design:type", String)
], ResetPasswordRequestDto.prototype, "token", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsEmail)({}, { message: 'Enter a valid email address.' }),
    (0, class_validator_1.MaxLength)(180),
    (0, class_transformer_1.Transform)(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value)),
    __metadata("design:type", String)
], ResetPasswordRequestDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'At least 8 characters with upper case, lower case and a digit.' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(8, { message: 'Password must be at least 8 characters.' }),
    (0, class_validator_1.MaxLength)(72),
    (0, class_validator_1.Matches)(PASSWORD_RULES.lower.pattern, { message: PASSWORD_RULES.lower.message }),
    (0, class_validator_1.Matches)(PASSWORD_RULES.upper.pattern, { message: PASSWORD_RULES.upper.message }),
    (0, class_validator_1.Matches)(PASSWORD_RULES.digit.pattern, { message: PASSWORD_RULES.digit.message }),
    __metadata("design:type", String)
], ResetPasswordRequestDto.prototype, "password", void 0);
