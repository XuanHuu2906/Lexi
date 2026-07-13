import { AiService } from '../ai/ai.service';
import { GenerateDictationDto } from './dto/generate-dictation.dto';
import { ExplainDictationDto } from './dto/explain-dictation.dto';
export declare class DictationController {
    private readonly ai;
    constructor(ai: AiService);
    generate(dto: GenerateDictationDto): Promise<import("../ai/features/dictation").DictationSentencesResult>;
    explain(dto: ExplainDictationDto): Promise<import("../ai/features/dictation").DictationFeedbackResult>;
}
