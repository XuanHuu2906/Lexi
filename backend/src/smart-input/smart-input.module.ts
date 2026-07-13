import { Module } from '@nestjs/common';
import { SmartInputController } from './smart-input.controller';

@Module({
  controllers: [SmartInputController],
})
export class SmartInputModule {}
