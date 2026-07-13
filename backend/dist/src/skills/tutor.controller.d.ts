import { AiService } from '../ai/ai.service';
import { AskTutorDto } from './dto/ask-tutor.dto';
export declare class TutorController {
    private readonly ai;
    constructor(ai: AiService);
    ask(dto: AskTutorDto): Promise<import("../ai/features/tutor").TutorResult>;
}
