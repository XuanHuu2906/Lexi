import { AiService } from '../ai/ai.service';
import { AskGrammarDto } from './dto/ask-grammar.dto';
export declare class GrammarQaController {
    private readonly ai;
    constructor(ai: AiService);
    ask(dto: AskGrammarDto): Promise<{
        answer: string;
    }>;
}
