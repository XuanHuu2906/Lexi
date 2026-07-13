import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { ConversationSummary, ConversationTurnResult } from './features/conversation';
import { AzureAssessment, PronunciationResult } from './features/pronunciation';
import { ContextResult } from './features/context';
import { DictationFeedbackResult, DictationSentencesResult } from './features/dictation';
import { ClassifyResult } from './features/classify';
import { DictionaryResult } from './features/dictionary';
import { VocabVerifyResult } from './features/vocab-verify';
import { ExampleResult } from './features/examples';
import { GrammarExamplesResult, GrammarNormalizeResult } from './features/grammar';
import { TutorResult } from './features/tutor';
import { QuizResult, QuizWordInput } from './features/quiz';
import { SynonymResult } from './features/synonyms';
import { WritingResult } from './features/writing';
import type { CefrLevel, ChatMessage } from './features/types';
export declare class AiService {
    private readonly logger;
    private readonly client;
    private readonly model;
    constructor(config: ConfigService);
    dictionary(term: string, opts?: {
        level?: CefrLevel;
    }): Promise<DictionaryResult>;
    verifyVocab(term: string, opts?: {
        userMeaning?: string;
        level?: CefrLevel;
    }): Promise<VocabVerifyResult>;
    classifyInput(input: string): Promise<ClassifyResult>;
    synonyms(word: string, opts?: {
        meaning?: string;
        limit?: number;
    }): Promise<SynonymResult>;
    examples(word: string, opts?: {
        meaning?: string;
        topics?: string[];
        count?: number;
    }): Promise<ExampleResult>;
    analyzeContext(passage: string, opts?: {
        level?: CefrLevel;
    }): Promise<ContextResult>;
    gradeWriting(text: string): Promise<WritingResult>;
    normalizeGrammar(rule: string): Promise<GrammarNormalizeResult>;
    grammarExamples(formula: string, explanation: string, count?: number): Promise<GrammarExamplesResult>;
    grammarQa(history: ChatMessage[], question: string): Promise<string>;
    grammarQaStream(history: ChatMessage[], question: string): import("openai").APIPromise<import("openai/core/streaming.js").Stream<OpenAI.Chat.Completions.ChatCompletionChunk>>;
    tutorAsk(history: ChatMessage[], question: string): Promise<TutorResult>;
    conversationOpen(scenario: string): Promise<string>;
    conversationReply(scenario: string, history: ChatMessage[], userMessage: string): Promise<ConversationTurnResult>;
    scorePronunciation(reference: string, recognized: string): Promise<PronunciationResult>;
    scorePronunciationFromAzure(reference: string, assessment: AzureAssessment): Promise<PronunciationResult>;
    conversationSummary(scenario: string, transcript: ChatMessage[]): Promise<ConversationSummary>;
    generateQuiz(words: QuizWordInput[]): Promise<QuizResult>;
    generateDictation(opts: {
        level?: CefrLevel;
        topics?: string[];
        count?: number;
    }): Promise<DictationSentencesResult>;
    explainDictation(reference: string, attempt: string): Promise<DictationFeedbackResult>;
    private runJson;
    private runText;
    private stream;
    private getClient;
    private toParams;
    private temperature;
    private jsonSystem;
    private readContent;
    private toRetryableError;
}
