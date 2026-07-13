import { AiService } from '../ai/ai.service';
import type { PronunciationResult } from '../ai/features/pronunciation';
import { AzureSpeechService } from './azure-speech.service';
import { ScorePronunciationDto } from './dto/score-pronunciation.dto';
export declare class PronunciationController {
    private readonly ai;
    private readonly azure;
    constructor(ai: AiService, azure: AzureSpeechService);
    score(audio: Express.Multer.File | undefined, dto: ScorePronunciationDto): Promise<PronunciationResult>;
}
