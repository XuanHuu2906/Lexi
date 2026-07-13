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
exports.SaveQuizProgressDto = exports.SubmitQuizDto = exports.GenerateQuizDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
class GenerateQuizDto {
    count;
}
exports.GenerateQuizDto = GenerateQuizDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: 10, minimum: 4, maximum: 20 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(4),
    (0, class_validator_1.Max)(20),
    __metadata("design:type", Number)
], GenerateQuizDto.prototype, "count", void 0);
class SubmitQuizDto {
    quizId;
    answers;
}
exports.SubmitQuizDto = SubmitQuizDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Quiz id from /quiz/generate' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], SubmitQuizDto.prototype, "quizId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: [Number],
        description: 'Chosen option index per question (use -1 for unanswered)',
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsInt)({ each: true }),
    __metadata("design:type", Array)
], SubmitQuizDto.prototype, "answers", void 0);
class SaveQuizProgressDto {
    answers;
}
exports.SaveQuizProgressDto = SaveQuizProgressDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        type: [Number],
        description: 'Chosen option index per question so far',
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsInt)({ each: true }),
    __metadata("design:type", Array)
], SaveQuizProgressDto.prototype, "answers", void 0);
//# sourceMappingURL=quiz.dto.js.map