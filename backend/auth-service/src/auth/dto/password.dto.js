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
exports.LogoutDto = exports.RefreshTokenDto = exports.ResetPasswordDto = exports.ForgotPasswordDto = exports.ChangePasswordDto = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const STRONG_PASSWORD = [
    { pattern: /[a-z]/, message: 'Password must contain a lowercase letter.' },
    { pattern: /[A-Z]/, message: 'Password must contain an uppercase letter.' },
    { pattern: /[0-9]/, message: 'Password must contain a number.' },
];
class ChangePasswordDto {
    userId;
    currentPassword;
    newPassword;
}
exports.ChangePasswordDto = ChangePasswordDto;
__decorate([
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], ChangePasswordDto.prototype, "userId", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: 'Your current password is required.' }),
    (0, class_validator_1.MaxLength)(72),
    __metadata("design:type", String)
], ChangePasswordDto.prototype, "currentPassword", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(8, { message: 'Password must be at least 8 characters.' }),
    (0, class_validator_1.MaxLength)(72),
    (0, class_validator_1.Matches)(STRONG_PASSWORD[0].pattern, { message: STRONG_PASSWORD[0].message }),
    (0, class_validator_1.Matches)(STRONG_PASSWORD[1].pattern, { message: STRONG_PASSWORD[1].message }),
    (0, class_validator_1.Matches)(STRONG_PASSWORD[2].pattern, { message: STRONG_PASSWORD[2].message }),
    __metadata("design:type", String)
], ChangePasswordDto.prototype, "newPassword", void 0);
class ForgotPasswordDto {
    email;
}
exports.ForgotPasswordDto = ForgotPasswordDto;
__decorate([
    (0, class_validator_1.IsEmail)({}, { message: 'Enter a valid email address.' }),
    (0, class_validator_1.MaxLength)(180),
    (0, class_transformer_1.Transform)(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value)),
    __metadata("design:type", String)
], ForgotPasswordDto.prototype, "email", void 0);
class ResetPasswordDto {
    token;
    email;
    password;
}
exports.ResetPasswordDto = ResetPasswordDto;
__decorate([
    (0, class_validator_1.IsString)({ message: 'The reset token is required.' }),
    (0, class_validator_1.MaxLength)(128),
    __metadata("design:type", String)
], ResetPasswordDto.prototype, "token", void 0);
__decorate([
    (0, class_validator_1.IsEmail)({}, { message: 'Enter a valid email address.' }),
    (0, class_validator_1.MaxLength)(180),
    (0, class_transformer_1.Transform)(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value)),
    __metadata("design:type", String)
], ResetPasswordDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(8, { message: 'Password must be at least 8 characters.' }),
    (0, class_validator_1.MaxLength)(72),
    (0, class_validator_1.Matches)(STRONG_PASSWORD[0].pattern, { message: STRONG_PASSWORD[0].message }),
    (0, class_validator_1.Matches)(STRONG_PASSWORD[1].pattern, { message: STRONG_PASSWORD[1].message }),
    (0, class_validator_1.Matches)(STRONG_PASSWORD[2].pattern, { message: STRONG_PASSWORD[2].message }),
    __metadata("design:type", String)
], ResetPasswordDto.prototype, "password", void 0);
class RefreshTokenDto {
    refreshToken;
}
exports.RefreshTokenDto = RefreshTokenDto;
__decorate([
    (0, class_validator_1.IsString)({ message: 'A refresh token is required.' }),
    __metadata("design:type", String)
], RefreshTokenDto.prototype, "refreshToken", void 0);
class LogoutDto {
    refreshToken;
}
exports.LogoutDto = LogoutDto;
__decorate([
    (0, class_validator_1.IsString)({ message: 'A refresh token is required.' }),
    __metadata("design:type", String)
], LogoutDto.prototype, "refreshToken", void 0);
