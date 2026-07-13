import { AiService } from '../ai/ai.service';
import { ClassifyInputDto } from './dto/classify-input.dto';
export declare class SmartInputController {
    private readonly ai;
    constructor(ai: AiService);
    classify(dto: ClassifyInputDto): Promise<import("../ai/features/classify").ClassifyResult>;
}
