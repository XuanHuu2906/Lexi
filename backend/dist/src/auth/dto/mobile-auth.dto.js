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
exports.MobileRefreshDto = exports.MobileRegisterDto = exports.MobileLoginDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class MobileLoginDto {
    email;
    password;
}
exports.MobileLoginDto = MobileLoginDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'learner@example.invalid', maxLength: 254 }),
    (0, class_validator_1.IsEmail)(),
    (0, class_validator_1.MaxLength)(254),
    __metadata("design:type", String)
], MobileLoginDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ minLength: 1, maxLength: 72, writeOnly: true }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(1),
    (0, class_validator_1.MaxLength)(72),
    __metadata("design:type", String)
], MobileLoginDto.prototype, "password", void 0);
class MobileRegisterDto extends MobileLoginDto {
}
exports.MobileRegisterDto = MobileRegisterDto;
__decorate([
    (0, swagger_1.ApiProperty)({ minLength: 8, maxLength: 72, writeOnly: true }),
    (0, class_validator_1.MinLength)(8),
    (0, class_validator_1.IsByteLength)(8, 72),
    __metadata("design:type", String)
], MobileRegisterDto.prototype, "password", void 0);
class MobileRefreshDto {
    refreshToken;
}
exports.MobileRefreshDto = MobileRefreshDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Opaque refresh credential (64 lowercase hex characters)',
        writeOnly: true,
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^[a-f0-9]{64}$/),
    __metadata("design:type", String)
], MobileRefreshDto.prototype, "refreshToken", void 0);
//# sourceMappingURL=mobile-auth.dto.js.map