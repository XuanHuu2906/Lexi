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
exports.AdminScenariosController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("../../generated/prisma/client");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const roles_guard_1 = require("../auth/guards/roles.guard");
const admin_scenarios_service_1 = require("./admin-scenarios.service");
const audit_service_1 = require("./audit.service");
const scenario_dto_1 = require("./dto/scenario.dto");
let AdminScenariosController = class AdminScenariosController {
    scenarios;
    constructor(scenarios) {
        this.scenarios = scenarios;
    }
    list(query) {
        return this.scenarios.list(query);
    }
    create(user, dto) {
        return this.scenarios.create((0, audit_service_1.auditActor)(user), dto);
    }
    update(user, id, dto) {
        return this.scenarios.update((0, audit_service_1.auditActor)(user), id, dto);
    }
    toggle(user, id) {
        return this.scenarios.toggle((0, audit_service_1.auditActor)(user), id);
    }
    duplicate(user, id) {
        return this.scenarios.duplicate((0, audit_service_1.auditActor)(user), id);
    }
    remove(user, id) {
        return this.scenarios.remove((0, audit_service_1.auditActor)(user), id);
    }
};
exports.AdminScenariosController = AdminScenariosController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List conversation scenarios (UCA04)' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [scenario_dto_1.ListScenariosDto]),
    __metadata("design:returntype", void 0)
], AdminScenariosController.prototype, "list", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Add a scenario' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, scenario_dto_1.CreateScenarioDto]),
    __metadata("design:returntype", void 0)
], AdminScenariosController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Edit a scenario' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, scenario_dto_1.UpdateScenarioDto]),
    __metadata("design:returntype", void 0)
], AdminScenariosController.prototype, "update", null);
__decorate([
    (0, common_1.Post)(':id/toggle'),
    (0, swagger_1.ApiOperation)({ summary: 'Show/hide a scenario for learners' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], AdminScenariosController.prototype, "toggle", null);
__decorate([
    (0, common_1.Post)(':id/duplicate'),
    (0, swagger_1.ApiOperation)({ summary: 'Duplicate a scenario (starts hidden)' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], AdminScenariosController.prototype, "duplicate", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a scenario' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], AdminScenariosController.prototype, "remove", null);
exports.AdminScenariosController = AdminScenariosController = __decorate([
    (0, swagger_1.ApiTags)('admin'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, common_1.Controller)('admin/scenarios'),
    __metadata("design:paramtypes", [admin_scenarios_service_1.AdminScenariosService])
], AdminScenariosController);
//# sourceMappingURL=admin-scenarios.controller.js.map