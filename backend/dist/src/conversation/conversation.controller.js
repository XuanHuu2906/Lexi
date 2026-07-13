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
exports.ConversationController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const ai_throttle_decorator_1 = require("../common/decorators/ai-throttle.decorator");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
const conversation_service_1 = require("./conversation.service");
const conversation_dto_1 = require("./dto/conversation.dto");
let ConversationController = class ConversationController {
    conversationService;
    constructor(conversationService) {
        this.conversationService = conversationService;
    }
    start(userId, dto) {
        return this.conversationService.start(userId, dto.scenario);
    }
    reply(userId, id, dto) {
        return this.conversationService.reply(userId, id, dto.message);
    }
    end(userId, id) {
        return this.conversationService.end(userId, id);
    }
    list(userId) {
        return this.conversationService.list(userId);
    }
    get(userId, id) {
        return this.conversationService.get(userId, id);
    }
};
exports.ConversationController = ConversationController;
__decorate([
    (0, common_1.Post)('start'),
    (0, ai_throttle_decorator_1.AiThrottle)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Start a role-play; AI opens the conversation (UC12)',
    }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('userId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, conversation_dto_1.StartConversationDto]),
    __metadata("design:returntype", void 0)
], ConversationController.prototype, "start", null);
__decorate([
    (0, common_1.Post)(':id/reply'),
    (0, ai_throttle_decorator_1.AiThrottle)(),
    (0, swagger_1.ApiOperation)({ summary: 'Send a turn → AI reply + feedback (UC12)' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('userId')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, conversation_dto_1.ReplyConversationDto]),
    __metadata("design:returntype", void 0)
], ConversationController.prototype, "reply", null);
__decorate([
    (0, common_1.Post)(':id/end'),
    (0, ai_throttle_decorator_1.AiThrottle)(),
    (0, swagger_1.ApiOperation)({ summary: 'End the role-play and get a summary (UC12)' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('userId')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ConversationController.prototype, "end", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List past conversations' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ConversationController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a conversation with its transcript' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('userId')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ConversationController.prototype, "get", null);
exports.ConversationController = ConversationController = __decorate([
    (0, swagger_1.ApiTags)('conversation'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('conversation'),
    __metadata("design:paramtypes", [conversation_service_1.ConversationService])
], ConversationController);
//# sourceMappingURL=conversation.controller.js.map