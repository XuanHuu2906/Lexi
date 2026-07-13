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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DictationController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const ai_service_1 = require("../ai/ai.service");
const ai_throttle_decorator_1 = require("../common/decorators/ai-throttle.decorator");
const generate_dictation_dto_1 = require("./dto/generate-dictation.dto");
const explain_dictation_dto_1 = require("./dto/explain-dictation.dto");
let DictationController = class DictationController {
    ai;
    constructor(ai) {
        this.ai = ai;
    }
    generate(dto) {
        return this.ai.generateDictation(dto);
    }
    explain(dto) {
        return this.ai.explainDictation(dto.reference, dto.attempt);
    }
};
exports.DictationController = DictationController;
__decorate([
    (0, common_1.Post)('generate'),
    (0, ai_throttle_decorator_1.AiThrottle)(),
    (0, swagger_1.ApiOperation)({ summary: 'Generate sentences to dictate (listen & type)' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [generate_dictation_dto_1.GenerateDictationDto]),
    __metadata("design:returntype", void 0)
], DictationController.prototype, "generate", null);
__decorate([
    (0, common_1.Post)('explain'),
    (0, ai_throttle_decorator_1.AiThrottle)(),
    (0, swagger_1.ApiOperation)({ summary: 'Explain a dictation mistake in Vietnamese' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [explain_dictation_dto_1.ExplainDictationDto]),
    __metadata("design:returntype", void 0)
], DictationController.prototype, "explain", null);
exports.DictationController = DictationController = __decorate([
    (0, swagger_1.ApiTags)('dictation'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('dictation'),
    __metadata("design:paramtypes", [ai_service_1.AiService])
], DictationController);
//# sourceMappingURL=dictation.controller.js.map