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
exports.AdminAssociationImportDto = exports.CreateAssociationDto = exports.PublicAssociationListQueryDto = void 0;
const shared_1 = require("@dpgc/shared");
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const ASSOCIATION_SORTABLE = ['createdAt', 'name'];
class PublicAssociationListQueryDto extends shared_1.PaginationQueryDto {
    sortBy = 'name';
    country;
    state;
    city;
}
exports.PublicAssociationListQueryDto = PublicAssociationListQueryDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: ASSOCIATION_SORTABLE, default: 'name' }),
    (0, class_validator_1.IsIn)(ASSOCIATION_SORTABLE),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], PublicAssociationListQueryDto.prototype, "sortBy", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Filter by country' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(100),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], PublicAssociationListQueryDto.prototype, "country", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Filter by state / region' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(100),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], PublicAssociationListQueryDto.prototype, "state", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Filter by city' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(100),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], PublicAssociationListQueryDto.prototype, "city", void 0);
class CreateAssociationDto {
    name;
    description;
    establishedYear;
    contactPersonName;
    designation;
    email;
    mobile;
    website;
    socialLinks;
    country;
    state;
    city;
    postalCode;
    address;
    logoImage;
    coverImage;
}
exports.CreateAssociationDto = CreateAssociationDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2),
    (0, class_validator_1.MaxLength)(200),
    (0, class_transformer_1.Transform)(({ value }) => (typeof value === 'string' ? value.trim() : value)),
    __metadata("design:type", String)
], CreateAssociationDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(10),
    (0, class_validator_1.MaxLength)(300),
    __metadata("design:type", String)
], CreateAssociationDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 1920 }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1900),
    (0, class_validator_1.Max)(new Date().getFullYear() + 1),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateAssociationDto.prototype, "establishedYear", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(200),
    (0, class_transformer_1.Transform)(({ value }) => (typeof value === 'string' ? value.trim() : value)),
    __metadata("design:type", String)
], CreateAssociationDto.prototype, "contactPersonName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], CreateAssociationDto.prototype, "designation", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsEmail)({}, { message: 'Enter a valid email address.' }),
    (0, class_validator_1.MaxLength)(180),
    (0, class_transformer_1.Transform)(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value)),
    __metadata("design:type", String)
], CreateAssociationDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(25),
    __metadata("design:type", String)
], CreateAssociationDto.prototype, "mobile", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Website URL' }),
    (0, class_validator_1.IsUrl)({}, { message: 'Enter a valid URL.' }),
    (0, class_validator_1.MaxLength)(500),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateAssociationDto.prototype, "website", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Social media links as JSON object' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreateAssociationDto.prototype, "socialLinks", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], CreateAssociationDto.prototype, "country", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], CreateAssociationDto.prototype, "state", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], CreateAssociationDto.prototype, "city", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(20),
    __metadata("design:type", String)
], CreateAssociationDto.prototype, "postalCode", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(5),
    (0, class_validator_1.MaxLength)(1000),
    __metadata("design:type", String)
], CreateAssociationDto.prototype, "address", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Relative path to an existing logo image under the upload root.' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MaxLength)(500),
    __metadata("design:type", String)
], CreateAssociationDto.prototype, "logoImage", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Relative path to an existing cover image under the upload root.' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MaxLength)(500),
    __metadata("design:type", String)
], CreateAssociationDto.prototype, "coverImage", void 0);
class AdminAssociationImportDto {
    items;
}
exports.AdminAssociationImportDto = AdminAssociationImportDto;
__decorate([
    (0, swagger_1.ApiProperty)({ type: [CreateAssociationDto], description: 'Up to 100 associations per batch.' }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMinSize)(1),
    (0, class_validator_1.ArrayMaxSize)(100),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => CreateAssociationDto),
    __metadata("design:type", Array)
], AdminAssociationImportDto.prototype, "items", void 0);