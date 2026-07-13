import { ConfigService } from '@nestjs/config';
import type { AzureAssessment } from '../ai/features/pronunciation';
export declare class AzureSpeechService {
    private readonly logger;
    private readonly key?;
    private readonly region?;
    constructor(config: ConfigService);
    isConfigured(): boolean;
    assess(wav: Buffer, referenceText: string): Promise<AzureAssessment>;
    private toAssessment;
    private wrap;
}
