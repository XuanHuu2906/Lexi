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
exports.AnswerDto = exports.RATING_QUALITY = exports.ReviewRating = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
var ReviewRating;
(function (ReviewRating) {
    ReviewRating["FORGOT"] = "forgot";
    ReviewRating["HARD"] = "hard";
    ReviewRating["GOOD"] = "good";
    ReviewRating["EASY"] = "easy";
})(ReviewRating || (exports.ReviewRating = ReviewRating = {}));
exports.RATING_QUALITY = {
    [ReviewRating.FORGOT]: 0,
    [ReviewRating.HARD]: 3,
    [ReviewRating.GOOD]: 4,
    [ReviewRating.EASY]: 5,
};
class AnswerDto {
    wordId;
    rating;
}
exports.AnswerDto = AnswerDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Id of the reviewed word' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], AnswerDto.prototype, "wordId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ReviewRating }),
    (0, class_validator_1.IsEnum)(ReviewRating),
    __metadata("design:type", String)
], AnswerDto.prototype, "rating", void 0);
//# sourceMappingURL=answer.dto.js.map