import { AiService } from '../ai/ai.service';
import { GradeWritingDto } from './dto/grade-writing.dto';
export declare class WritingController {
    private readonly ai;
    constructor(ai: AiService);
    grade(dto: GradeWritingDto): Promise<import("../ai/features/writing").WritingResult>;
}
