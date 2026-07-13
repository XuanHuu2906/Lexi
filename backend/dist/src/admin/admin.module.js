"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminModule = void 0;
const common_1 = require("@nestjs/common");
const roles_guard_1 = require("../auth/guards/roles.guard");
const admin_audit_controller_1 = require("./admin-audit.controller");
const admin_scenarios_controller_1 = require("./admin-scenarios.controller");
const admin_scenarios_service_1 = require("./admin-scenarios.service");
const admin_stats_controller_1 = require("./admin-stats.controller");
const admin_stats_service_1 = require("./admin-stats.service");
const admin_users_controller_1 = require("./admin-users.controller");
const admin_users_service_1 = require("./admin-users.service");
const admin_words_controller_1 = require("./admin-words.controller");
const admin_words_service_1 = require("./admin-words.service");
const audit_service_1 = require("./audit.service");
let AdminModule = class AdminModule {
};
exports.AdminModule = AdminModule;
exports.AdminModule = AdminModule = __decorate([
    (0, common_1.Module)({
        controllers: [
            admin_stats_controller_1.AdminStatsController,
            admin_words_controller_1.AdminWordsController,
            admin_scenarios_controller_1.AdminScenariosController,
            admin_users_controller_1.AdminUsersController,
            admin_audit_controller_1.AdminAuditController,
        ],
        providers: [
            roles_guard_1.RolesGuard,
            audit_service_1.AuditService,
            admin_stats_service_1.AdminStatsService,
            admin_words_service_1.AdminWordsService,
            admin_scenarios_service_1.AdminScenariosService,
            admin_users_service_1.AdminUsersService,
        ],
    })
], AdminModule);
//# sourceMappingURL=admin.module.js.map