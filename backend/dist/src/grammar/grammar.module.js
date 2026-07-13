"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GrammarModule = void 0;
const common_1 = require("@nestjs/common");
const grammar_controller_1 = require("./grammar.controller");
const grammar_service_1 = require("./grammar.service");
let GrammarModule = class GrammarModule {
};
exports.GrammarModule = GrammarModule;
exports.GrammarModule = GrammarModule = __decorate([
    (0, common_1.Module)({
        controllers: [grammar_controller_1.GrammarController],
        providers: [grammar_service_1.GrammarService],
        exports: [grammar_service_1.GrammarService],
    })
], GrammarModule);
//# sourceMappingURL=grammar.module.js.map