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
exports.UpdateSettingsDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const client_1 = require("../../../generated/prisma/client");
const is_valid_timezone_1 = require("../../common/validators/is-valid-timezone");
class UpdateSettingsDto {
    dailyGoal;
    cefrLevel;
    topics;
    reminderTime;
    timeZone;
    notifyEnabled;
    ttsVoice;
}
exports.UpdateSettingsDto = UpdateSettingsDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ minimum: 1, maximum: 500, example: 10 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(500),
    __metadata("design:type", Number)
], UpdateSettingsDto.prototype, "dailyGoal", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: client_1.CefrLevel }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.CefrLevel),
    __metadata("design:type", String)
], UpdateSettingsDto.prototype, "cefrLevel", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: [String], example: ['business', 'travel'] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], UpdateSettingsDto.prototype, "topics", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: '20:00',
        description: "HH:mm in the user's timeZone",
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Matches)(/^([01]\d|2[0-3]):[0-5]\d$/, {
        message: 'reminderTime must be in HH:mm format',
    }),
    __metadata("design:type", String)
], UpdateSettingsDto.prototype, "reminderTime", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: 'Asia/Ho_Chi_Minh',
        description: 'IANA timezone that reminderTime is interpreted in',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, is_valid_timezone_1.IsValidTimeZone)({ message: 'timeZone must be a valid IANA timezone' }),
    __metadata("design:type", String)
], UpdateSettingsDto.prototype, "timeZone", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateSettingsDto.prototype, "notifyEnabled", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: client_1.TtsVoice }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.TtsVoice),
    __metadata("design:type", String)
], UpdateSettingsDto.prototype, "ttsVoice", void 0);
//# sourceMappingURL=update-settings.dto.js.map