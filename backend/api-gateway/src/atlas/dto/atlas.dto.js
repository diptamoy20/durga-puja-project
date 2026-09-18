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
exports.MapBoundsQueryDto = exports.ModeratePandalDto = exports.UpdatePandalDto = exports.CreatePandalDto = exports.ListPandalsQueryDto = exports.AtlasStatusDto = void 0;
const shared_1 = require("@dpgc/shared");
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
var AtlasStatusDto;
(function (AtlasStatusDto) {
    AtlasStatusDto["DRAFT"] = "DRAFT";
    AtlasStatusDto["SUBMITTED"] = "SUBMITTED";
    AtlasStatusDto["UNDER_REVIEW"] = "UNDER_REVIEW";
    AtlasStatusDto["APPROVED"] = "APPROVED";
    AtlasStatusDto["REJECTED"] = "REJECTED";
})(AtlasStatusDto || (exports.AtlasStatusDto = AtlasStatusDto = {}));
const ATLAS_SORTABLE = ['createdAt', 'name', 'status'];
class ListPandalsQueryDto extends shared_1.PaginationQueryDto {
    sortBy = 'createdAt';
    status;
    pujaCommitteeId;
}
exports.ListPandalsQueryDto = ListPandalsQueryDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: ATLAS_SORTABLE, default: 'createdAt' }),
    (0, class_validator_1.IsIn)(ATLAS_SORTABLE),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], ListPandalsQueryDto.prototype, "sortBy", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: AtlasStatusDto }),
    (0, class_validator_1.IsEnum)(AtlasStatusDto),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ListPandalsQueryDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], ListPandalsQueryDto.prototype, "pujaCommitteeId", void 0);
class CreatePandalDto {
    name;
    location;
    latitude;
    longitude;
    pujaCommitteeId;
    timing;
    ritualSchedule;
    livestreamUrl;
    virtualTourUrl;
    action;
}
exports.CreatePandalDto = CreatePandalDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2),
    (0, class_validator_1.MaxLength)(255),
    (0, class_transformer_1.Transform)(({ value }) => (typeof value === 'string' ? value.trim() : value)),
    __metadata("design:type", String)
], CreatePandalDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(1000),
    __metadata("design:type", String)
], CreatePandalDto.prototype, "location", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 22.5726 }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 7 }),
    __metadata("design:type", Number)
], CreatePandalDto.prototype, "latitude", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 88.3639 }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 7 }),
    __metadata("design:type", Number)
], CreatePandalDto.prototype, "longitude", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreatePandalDto.prototype, "pujaCommitteeId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(255),
    __metadata("design:type", String)
], CreatePandalDto.prototype, "timing", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MaxLength)(5000),
    __metadata("design:type", String)
], CreatePandalDto.prototype, "ritualSchedule", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MaxLength)(500),
    __metadata("design:type", String)
], CreatePandalDto.prototype, "livestreamUrl", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MaxLength)(500),
    __metadata("design:type", String)
], CreatePandalDto.prototype, "virtualTourUrl", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: ['draft', 'submit'] }),
    (0, class_validator_1.IsIn)(['draft', 'submit']),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreatePandalDto.prototype, "action", void 0);
class UpdatePandalDto {
    name;
    location;
    latitude;
    longitude;
    pujaCommitteeId;
    timing;
    ritualSchedule;
    livestreamUrl;
    virtualTourUrl;
    removePhotos;
    action;
}
exports.UpdatePandalDto = UpdatePandalDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MaxLength)(255),
    (0, class_transformer_1.Transform)(({ value }) => (typeof value === 'string' ? value.trim() : value)),
    __metadata("design:type", String)
], UpdatePandalDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MaxLength)(1000),
    __metadata("design:type", String)
], UpdatePandalDto.prototype, "location", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 7 }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], UpdatePandalDto.prototype, "latitude", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 7 }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], UpdatePandalDto.prototype, "longitude", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], UpdatePandalDto.prototype, "pujaCommitteeId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MaxLength)(255),
    __metadata("design:type", String)
], UpdatePandalDto.prototype, "timing", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MaxLength)(5000),
    __metadata("design:type", String)
], UpdatePandalDto.prototype, "ritualSchedule", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MaxLength)(500),
    __metadata("design:type", String)
], UpdatePandalDto.prototype, "livestreamUrl", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MaxLength)(500),
    __metadata("design:type", String)
], UpdatePandalDto.prototype, "virtualTourUrl", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: [String] }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], UpdatePandalDto.prototype, "removePhotos", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: ['save', 'submit'] }),
    (0, class_validator_1.IsIn)(['save', 'submit']),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdatePandalDto.prototype, "action", void 0);
class ModeratePandalDto {
    decision;
    remarks;
}
exports.ModeratePandalDto = ModeratePandalDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ['start_review', 'approve', 'reject'] }),
    (0, class_validator_1.IsIn)(['start_review', 'approve', 'reject']),
    __metadata("design:type", String)
], ModeratePandalDto.prototype, "decision", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MaxLength)(2000),
    __metadata("design:type", String)
], ModeratePandalDto.prototype, "remarks", void 0);
class MapBoundsQueryDto {
    north;
    south;
    east;
    west;
    limit;
    search;
}
exports.MapBoundsQueryDto = MapBoundsQueryDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], MapBoundsQueryDto.prototype, "north", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], MapBoundsQueryDto.prototype, "south", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], MapBoundsQueryDto.prototype, "east", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], MapBoundsQueryDto.prototype, "west", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], MapBoundsQueryDto.prototype, "limit", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], MapBoundsQueryDto.prototype, "search", void 0);
