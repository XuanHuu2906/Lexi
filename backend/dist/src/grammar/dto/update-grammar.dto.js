"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateGrammarDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const create_grammar_dto_1 = require("./create-grammar.dto");
class UpdateGrammarDto extends (0, swagger_1.PartialType)(create_grammar_dto_1.CreateGrammarDto) {
}
exports.UpdateGrammarDto = UpdateGrammarDto;
//# sourceMappingURL=update-grammar.dto.js.map