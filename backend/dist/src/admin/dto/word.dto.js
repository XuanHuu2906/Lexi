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
exports.ImportWordsDto = exports.ListAdminWordsDto = exports.UpdateAdminWordDto = exports.CreateAdminWordDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
class CreateAdminWordDto {
    word;
    meaning;
    group;
}
exports.CreateAdminWordDto = CreateAdminWordDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'English word (surface form)' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(1),
    (0, class_validator_1.MaxLength)(120),
    __metadata("design:type", String)
], CreateAdminWordDto.prototype, "word", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Suggested Vietnamese meaning' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(1),
    (0, class_validator_1.MaxLength)(300),
    __metadata("design:type", String)
], CreateAdminWordDto.prototype, "meaning", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Theme/group, e.g. "Tài chính"' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(80),
    __metadata("design:type", String)
], CreateAdminWordDto.prototype, "group", void 0);
class UpdateAdminWordDto extends (0, swagger_1.PartialType)(CreateAdminWordDto) {
}
exports.UpdateAdminWordDto = UpdateAdminWordDto;
class ListAdminWordsDto {
    search;
    group;
    page;
    limit;
}
exports.ListAdminWordsDto = ListAdminWordsDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Search word or meaning' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ListAdminWordsDto.prototype, "search", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ListAdminWordsDto.prototype, "group", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: 1, minimum: 1 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], ListAdminWordsDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: 7, minimum: 1, maximum: 100 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], ListAdminWordsDto.prototype, "limit", void 0);
class ImportWordsDto {
    text;
    commit;
}
exports.ImportWordsDto = ImportWordsDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'CSV text; each line "word;meaning;group"' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(100_000),
    __metadata("design:type", String)
], ImportWordsDto.prototype, "text", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'When false, only parse + report; do not persist.',
        default: true,
    }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], ImportWordsDto.prototype, "commit", void 0);
//# sourceMappingURL=word.dto.js.map