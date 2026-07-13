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
exports.PronunciationController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const ai_service_1 = require("../ai/ai.service");
const ai_throttle_decorator_1 = require("../common/decorators/ai-throttle.decorator");
const azure_speech_service_1 = require("./azure-speech.service");
const score_pronunciation_dto_1 = require("./dto/score-pronunciation.dto");
let PronunciationController = class PronunciationController {
    ai;
    azure;
    constructor(ai, azure) {
        this.ai = ai;
        this.azure = azure;
    }
    async score(audio, dto) {
        if (audio?.buffer?.length) {
            if (!this.azure.isConfigured()) {
                throw new common_1.ServiceUnavailableException({
                    message: 'Azure pronunciation assessment is not configured',
                    retryable: false,
                });
            }
            const assessment = await this.azure.assess(audio.buffer, dto.referenceText);
            return this.ai.scorePronunciationFromAzure(dto.referenceText, assessment);
        }
        if (!dto.recognizedText) {
            throw new common_1.BadRequestException('Provide an audio recording or recognizedText');
        }
        return this.ai.scorePronunciation(dto.referenceText, dto.recognizedText);
    }
};
exports.PronunciationController = PronunciationController;
__decorate([
    (0, common_1.Post)('score'),
    (0, ai_throttle_decorator_1.AiThrottle)(),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('audio', { limits: { fileSize: 5 * 1024 * 1024 } })),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiOperation)({
        summary: 'Score pronunciation — Azure assessment from audio, or text fallback (UC13)',
    }),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, score_pronunciation_dto_1.ScorePronunciationDto]),
    __metadata("design:returntype", Promise)
], PronunciationController.prototype, "score", null);
exports.PronunciationController = PronunciationController = __decorate([
    (0, swagger_1.ApiTags)('pronunciation'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('pronunciation'),
    __metadata("design:paramtypes", [ai_service_1.AiService,
        azure_speech_service_1.AzureSpeechService])
], PronunciationController);
//# sourceMappingURL=pronunciation.controller.js.map