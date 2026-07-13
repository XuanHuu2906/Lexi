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
exports.ListScenariosDto = exports.UpdateScenarioDto = exports.CreateScenarioDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const client_1 = require("../../../generated/prisma/client");
class CreateScenarioDto {
    name;
    description;
    roleHint;
    difficulty;
}
exports.CreateScenarioDto = CreateScenarioDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(1),
    (0, class_validator_1.MaxLength)(120),
    __metadata("design:type", String)
], CreateScenarioDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(1),
    (0, class_validator_1.MaxLength)(300),
    __metadata("design:type", String)
], CreateScenarioDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Opening role/context hint for the AI' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(1000),
    __metadata("design:type", String)
], CreateScenarioDto.prototype, "roleHint", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: client_1.ScenarioDifficulty }),
    (0, class_validator_1.IsEnum)(client_1.ScenarioDifficulty),
    __metadata("design:type", String)
], CreateScenarioDto.prototype, "difficulty", void 0);
class UpdateScenarioDto extends (0, swagger_1.PartialType)(CreateScenarioDto) {
}
exports.UpdateScenarioDto = UpdateScenarioDto;
class ListScenariosDto {
    search;
    difficulty;
    status;
    page;
    limit;
}
exports.ListScenariosDto = ListScenariosDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Search name or description' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ListScenariosDto.prototype, "search", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: client_1.ScenarioDifficulty }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.ScenarioDifficulty),
    __metadata("design:type", String)
], ListScenariosDto.prototype, "difficulty", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: ['on', 'off'], description: 'Visibility filter' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['on', 'off']),
    __metadata("design:type", String)
], ListScenariosDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: 1, minimum: 1 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], ListScenariosDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: 7, minimum: 1, maximum: 100 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], ListScenariosDto.prototype, "limit", void 0);
//# sourceMappingURL=scenario.dto.js.map