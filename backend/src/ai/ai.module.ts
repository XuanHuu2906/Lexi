import { Global, Module } from '@nestjs/common';
import { AiService } from './ai.service';

/**
 * Global so any feature module can inject AiService without re-importing.
 * All AI access (and the API key) is confined to this module.
 */
@Global()
@Module({
  providers: [AiService],
  exports: [AiService],
})
export class AiModule {}
