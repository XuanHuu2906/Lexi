"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SkillsModule = void 0;
const common_1 = require("@nestjs/common");
const azure_speech_service_1 = require("./azure-speech.service");
const dictation_controller_1 = require("./dictation.controller");
const grammar_qa_controller_1 = require("./grammar-qa.controller");
const pronunciation_controller_1 = require("./pronunciation.controller");
const tutor_controller_1 = require("./tutor.controller");
const writing_controller_1 = require("./writing.controller");
let SkillsModule = class SkillsModule {
};
exports.SkillsModule = SkillsModule;
exports.SkillsModule = SkillsModule = __decorate([
    (0, common_1.Module)({
        controllers: [
            writing_controller_1.WritingController,
            grammar_qa_controller_1.GrammarQaController,
            pronunciation_controller_1.PronunciationController,
            dictation_controller_1.DictationController,
            tutor_controller_1.TutorController,
        ],
        providers: [azure_speech_service_1.AzureSpeechService],
    })
], SkillsModule);
//# sourceMappingURL=skills.module.js.map