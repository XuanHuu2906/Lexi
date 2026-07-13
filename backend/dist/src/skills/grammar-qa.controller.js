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
exports.GrammarQaController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const ai_service_1 = require("../ai/ai.service");
const ai_throttle_decorator_1 = require("../common/decorators/ai-throttle.decorator");
const ask_grammar_dto_1 = require("./dto/ask-grammar.dto");
let GrammarQaController = class GrammarQaController {
    ai;
    constructor(ai) {
        this.ai = ai;
    }
    async ask(dto) {
        const answer = await this.ai.grammarQa(dto.history ?? [], dto.question);
        return { answer };
    }
};
exports.GrammarQaController = GrammarQaController;
__decorate([
    (0, common_1.Post)('ask'),
    (0, ai_throttle_decorator_1.AiThrottle)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Ask a grammar question (keeps context via history) (UC15)',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ask_grammar_dto_1.AskGrammarDto]),
    __metadata("design:returntype", Promise)
], GrammarQaController.prototype, "ask", null);
exports.GrammarQaController = GrammarQaController = __decorate([
    (0, swagger_1.ApiTags)('grammar-qa'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('grammar-qa'),
    __metadata("design:paramtypes", [ai_service_1.AiService])
], GrammarQaController);
//# sourceMappingURL=grammar-qa.controller.js.map