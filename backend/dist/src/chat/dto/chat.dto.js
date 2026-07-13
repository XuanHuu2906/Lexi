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
exports.UpdateChatThreadDto = exports.CreateChatThreadDto = exports.ListChatThreadsDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const client_1 = require("../../../generated/prisma/client");
class ListChatThreadsDto {
    kind;
}
exports.ListChatThreadsDto = ListChatThreadsDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: client_1.ChatKind }),
    (0, class_validator_1.IsEnum)(client_1.ChatKind),
    __metadata("design:type", String)
], ListChatThreadsDto.prototype, "kind", void 0);
class CreateChatThreadDto {
    kind;
    title;
    messages;
}
exports.CreateChatThreadDto = CreateChatThreadDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: client_1.ChatKind }),
    (0, class_validator_1.IsEnum)(client_1.ChatKind),
    __metadata("design:type", String)
], CreateChatThreadDto.prototype, "kind", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Lạm phát là gì?' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(200),
    __metadata("design:type", String)
], CreateChatThreadDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Client-shaped transcript turns, stored opaquely.',
        type: [Object],
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMaxSize)(200),
    __metadata("design:type", Array)
], CreateChatThreadDto.prototype, "messages", void 0);
class UpdateChatThreadDto {
    title;
    messages;
}
exports.UpdateChatThreadDto = UpdateChatThreadDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Lạm phát là gì?' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(200),
    __metadata("design:type", String)
], UpdateChatThreadDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Full replacement transcript.', type: [Object] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMaxSize)(200),
    __metadata("design:type", Array)
], UpdateChatThreadDto.prototype, "messages", void 0);
//# sourceMappingURL=chat.dto.js.map