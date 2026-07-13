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
exports.AdminWordsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("../../generated/prisma/client");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const roles_guard_1 = require("../auth/guards/roles.guard");
const admin_words_service_1 = require("./admin-words.service");
const audit_service_1 = require("./audit.service");
const word_dto_1 = require("./dto/word.dto");
let AdminWordsController = class AdminWordsController {
    words;
    constructor(words) {
        this.words = words;
    }
    list(query) {
        return this.words.list(query);
    }
    create(user, dto) {
        return this.words.create((0, audit_service_1.auditActor)(user), dto);
    }
    import(user, dto) {
        return this.words.import((0, audit_service_1.auditActor)(user), dto);
    }
    export(user) {
        return this.words.export((0, audit_service_1.auditActor)(user));
    }
    update(user, id, dto) {
        return this.words.update((0, audit_service_1.auditActor)(user), id, dto);
    }
    remove(user, id) {
        return this.words.remove((0, audit_service_1.auditActor)(user), id);
    }
};
exports.AdminWordsController = AdminWordsController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List TOEIC word list with search/filter (UCA03)' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [word_dto_1.ListAdminWordsDto]),
    __metadata("design:returntype", void 0)
], AdminWordsController.prototype, "list", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Add a word to the TOEIC list' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, word_dto_1.CreateAdminWordDto]),
    __metadata("design:returntype", void 0)
], AdminWordsController.prototype, "create", null);
__decorate([
    (0, common_1.Post)('import'),
    (0, swagger_1.ApiOperation)({ summary: 'Bulk-import words from CSV (preview + commit)' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, word_dto_1.ImportWordsDto]),
    __metadata("design:returntype", void 0)
], AdminWordsController.prototype, "import", null);
__decorate([
    (0, common_1.Get)('export'),
    (0, swagger_1.ApiOperation)({ summary: 'Export the whole list as CSV text' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AdminWordsController.prototype, "export", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Edit a word' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, word_dto_1.UpdateAdminWordDto]),
    __metadata("design:returntype", void 0)
], AdminWordsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a word from the list' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], AdminWordsController.prototype, "remove", null);
exports.AdminWordsController = AdminWordsController = __decorate([
    (0, swagger_1.ApiTags)('admin'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, common_1.Controller)('admin/words'),
    __metadata("design:paramtypes", [admin_words_service_1.AdminWordsService])
], AdminWordsController);
//# sourceMappingURL=admin-words.controller.js.map