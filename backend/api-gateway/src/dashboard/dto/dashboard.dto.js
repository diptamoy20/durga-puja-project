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
exports.DashboardSummaryDto = exports.ArticleCountsDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class ArticleCountsDto {
    total;
    draft;
    inReview;
    approved;
    rejected;
    scheduled;
    published;
    archived;
}
exports.ArticleCountsDto = ArticleCountsDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 128 }),
    __metadata("design:type", Number)
], ArticleCountsDto.prototype, "total", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 31 }),
    __metadata("design:type", Number)
], ArticleCountsDto.prototype, "draft", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 7, description: 'Pending review and in review combined.' }),
    __metadata("design:type", Number)
], ArticleCountsDto.prototype, "inReview", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 12 }),
    __metadata("design:type", Number)
], ArticleCountsDto.prototype, "approved", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 3 }),
    __metadata("design:type", Number)
], ArticleCountsDto.prototype, "rejected", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 5 }),
    __metadata("design:type", Number)
], ArticleCountsDto.prototype, "scheduled", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 66 }),
    __metadata("design:type", Number)
], ArticleCountsDto.prototype, "published", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 4, description: 'Called "unpublished" in the previous portal.' }),
    __metadata("design:type", Number)
], ArticleCountsDto.prototype, "archived", void 0);
class DashboardSummaryDto {
    diasporaMembers;
    pujaCommittees;
    pandals;
    pendingApprovals;
    articles;
    unavailable;
}
exports.DashboardSummaryDto = DashboardSummaryDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 2431 }),
    __metadata("design:type", Number)
], DashboardSummaryDto.prototype, "diasporaMembers", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 512 }),
    __metadata("design:type", Number)
], DashboardSummaryDto.prototype, "pujaCommittees", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1028 }),
    __metadata("design:type", Number)
], DashboardSummaryDto.prototype, "pandals", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 34, description: 'Committees pending or under review.' }),
    __metadata("design:type", Number)
], DashboardSummaryDto.prototype, "pendingApprovals", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: ArticleCountsDto }),
    __metadata("design:type", ArticleCountsDto)
], DashboardSummaryDto.prototype, "articles", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: [],
        description: 'Sections whose service could not be reached; their counts are zero.',
        isArray: true,
        type: String,
    }),
    __metadata("design:type", Array)
], DashboardSummaryDto.prototype, "unavailable", void 0);
