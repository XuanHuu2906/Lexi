import { ConfigService } from '@nestjs/config';
export declare class EmailService {
    private readonly logger;
    private readonly resend;
    private readonly from;
    constructor(config: ConfigService);
    send(to: string, subject: string, html: string): Promise<void>;
}
