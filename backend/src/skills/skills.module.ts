import { Module } from '@nestjs/common';
import { AzureSpeechService } from './azure-speech.service';
import { DictationController } from './dictation.controller';
import { GrammarQaController } from './grammar-qa.controller';
import { PronunciationController } from './pronunciation.controller';
import { TutorController } from './tutor.controller';
import { WritingController } from './writing.controller';

// Stateless AI skills — writing grading (UC14), grammar Q&A (UC15),
// pronunciation scoring (UC13), dictation (listen & type), Ask Lexi tutor. All
// delegate to the global AiService; pronunciation additionally uses
// AzureSpeechService for acoustic scoring.
@Module({
  controllers: [
    WritingController,
    GrammarQaController,
    PronunciationController,
    DictationController,
    TutorController,
  ],
  providers: [AzureSpeechService],
})
export class SkillsModule {}
