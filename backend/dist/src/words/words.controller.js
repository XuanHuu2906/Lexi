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
exports.WordsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const throttler_1 = require("@nestjs/throttler");
const ai_throttle_decorator_1 = require("../common/decorators/ai-throttle.decorator");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
const public_decorator_1 = require("../auth/decorators/public.decorator");
const create_word_dto_1 = require("./dto/create-word.dto");
const generate_examples_dto_1 = require("./dto/generate-examples.dto");
const list_words_dto_1 = require("./dto/list-words.dto");
const lookup_batch_dto_1 = require("./dto/lookup-batch.dto");
const lookup_dto_1 = require("./dto/lookup.dto");
const quick_add_dto_1 = require("./dto/quick-add.dto");
const verify_word_dto_1 = require("./dto/verify-word.dto");
const words_service_1 = require("./words.service");
let WordsController = class WordsController {
    wordsService;
    constructor(wordsService) {
        this.wordsService = wordsService;
    }
    lookup(dto) {
        return this.wordsService.lookup(dto);
    }
    lookupBatch(dto) {
        return this.wordsService.lookupBatch(dto);
    }
    create(userId, dto) {
        return this.wordsService.create(userId, dto);
    }
    verify(dto) {
        return this.wordsService.verify(dto);
    }
    quickAdd(userId, dto) {
        return this.wordsService.quickAdd(userId, dto);
    }
    list(userId, query) {
        return this.wordsService.list(userId, query);
    }
    getOne(userId, id) {
        return this.wordsService.getOne(userId, id);
    }
    remove(userId, id) {
        return this.wordsService.remove(userId, id);
    }
    generateExamples(userId, id, dto) {
        return this.wordsService.generateExamples(userId, id, dto);
    }
};
exports.WordsController = WordsController;
__decorate([
    (0, public_decorator_1.Public)(),
    (0, throttler_1.Throttle)({ default: { limit: 15, ttl: 60_000 } }),
    (0, common_1.Post)('lookup'),
    (0, swagger_1.ApiOperation)({
        summary: 'Look up & explain a word (guest-accessible, rate-limited)',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [lookup_dto_1.LookupDto]),
    __metadata("design:returntype", void 0)
], WordsController.prototype, "lookup", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, throttler_1.Throttle)({ default: { limit: 6, ttl: 60_000 } }),
    (0, common_1.Post)('lookup-batch'),
    (0, swagger_1.ApiOperation)({
        summary: 'Look up several words at once from pasted text (rate-limited)',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [lookup_batch_dto_1.LookupBatchDto]),
    __metadata("design:returntype", void 0)
], WordsController.prototype, "lookupBatch", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Save a word to the notebook (UC06)' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('userId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_word_dto_1.CreateWordDto]),
    __metadata("design:returntype", void 0)
], WordsController.prototype, "create", null);
__decorate([
    (0, common_1.Post)('verify'),
    (0, ai_throttle_decorator_1.AiThrottle)(),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Validate a vocab entry & enrich it like a lookup (UC21, no save)',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [verify_word_dto_1.VerifyWordDto]),
    __metadata("design:returntype", void 0)
], WordsController.prototype, "verify", null);
__decorate([
    (0, common_1.Post)('quick-add'),
    (0, ai_throttle_decorator_1.AiThrottle)(),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Quick-add "term: meaning" + TOEIC synonyms (UC21)',
    }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('userId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, quick_add_dto_1.QuickAddDto]),
    __metadata("design:returntype", void 0)
], WordsController.prototype, "quickAdd", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'List saved words with filters + pagination' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('userId')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, list_words_dto_1.ListWordsDto]),
    __metadata("design:returntype", void 0)
], WordsController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get one saved word' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('userId')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], WordsController.prototype, "getOne", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a saved word' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('userId')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], WordsController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':id/examples'),
    (0, ai_throttle_decorator_1.AiThrottle)(),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Generate personalised examples for a word (UC08)' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('userId')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, generate_examples_dto_1.GenerateExamplesDto]),
    __metadata("design:returntype", void 0)
], WordsController.prototype, "generateExamples", null);
exports.WordsController = WordsController = __decorate([
    (0, swagger_1.ApiTags)('words'),
    (0, common_1.Controller)('words'),
    __metadata("design:paramtypes", [words_service_1.WordsService])
], WordsController);
//# sourceMappingURL=words.controller.js.map