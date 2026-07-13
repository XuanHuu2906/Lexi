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
exports.GrammarController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const ai_throttle_decorator_1 = require("../common/decorators/ai-throttle.decorator");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
const create_grammar_dto_1 = require("./dto/create-grammar.dto");
const generate_examples_dto_1 = require("./dto/generate-examples.dto");
const list_grammar_dto_1 = require("./dto/list-grammar.dto");
const preview_grammar_dto_1 = require("./dto/preview-grammar.dto");
const update_grammar_dto_1 = require("./dto/update-grammar.dto");
const grammar_service_1 = require("./grammar.service");
let GrammarController = class GrammarController {
    grammarService;
    constructor(grammarService) {
        this.grammarService = grammarService;
    }
    preview(dto) {
        return this.grammarService.preview(dto.rule);
    }
    create(userId, dto) {
        return this.grammarService.create(userId, dto);
    }
    list(userId, query) {
        return this.grammarService.list(userId, query);
    }
    getOne(userId, id) {
        return this.grammarService.getOne(userId, id);
    }
    update(userId, id, dto) {
        return this.grammarService.update(userId, id, dto);
    }
    remove(userId, id) {
        return this.grammarService.remove(userId, id);
    }
    generateExamples(userId, id, dto) {
        return this.grammarService.generateExamples(userId, id, dto);
    }
};
exports.GrammarController = GrammarController;
__decorate([
    (0, common_1.Post)('preview'),
    (0, ai_throttle_decorator_1.AiThrottle)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Normalise a rough rule → formula + explanation + examples (UC20, no save)',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [preview_grammar_dto_1.PreviewGrammarDto]),
    __metadata("design:returntype", void 0)
], GrammarController.prototype, "preview", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Save a grammar rule to the library' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('userId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_grammar_dto_1.CreateGrammarDto]),
    __metadata("design:returntype", void 0)
], GrammarController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List grammar rules with search + pagination' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('userId')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, list_grammar_dto_1.ListGrammarDto]),
    __metadata("design:returntype", void 0)
], GrammarController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get one grammar rule' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('userId')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], GrammarController.prototype, "getOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Edit a grammar rule' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('userId')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, update_grammar_dto_1.UpdateGrammarDto]),
    __metadata("design:returntype", void 0)
], GrammarController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a grammar rule' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('userId')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], GrammarController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':id/examples'),
    (0, ai_throttle_decorator_1.AiThrottle)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Generate more examples for a rule and append them',
    }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('userId')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, generate_examples_dto_1.GenerateGrammarExamplesDto]),
    __metadata("design:returntype", void 0)
], GrammarController.prototype, "generateExamples", null);
exports.GrammarController = GrammarController = __decorate([
    (0, swagger_1.ApiTags)('grammar'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('grammar'),
    __metadata("design:paramtypes", [grammar_service_1.GrammarService])
], GrammarController);
//# sourceMappingURL=grammar.controller.js.map