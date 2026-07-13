import { AiService } from '../ai/ai.service';
import { AnalyzeContextDto } from './dto/analyze-context.dto';
export declare class ContextController {
    private readonly ai;
    constructor(ai: AiService);
    analyze(dto: AnalyzeContextDto): Promise<import("../ai/features/context").ContextResult>;
}
