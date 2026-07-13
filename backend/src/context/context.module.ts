import { Module } from '@nestjs/common';
import { ContextController } from './context.controller';

// Stateless AI skill — passage analysis (UC07). Delegates to the global
// AiService, so no providers of its own.
@Module({
  controllers: [ContextController],
})
export class ContextModule {}
