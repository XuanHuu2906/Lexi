import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import {
  buildConversationOpenSpec,
  buildConversationSummarySpec,
  buildConversationTurnSpec,
  ConversationSummary,
  ConversationTurnResult,
} from './features/conversation';
import {
  AzureAssessment,
  buildAzureFeedbackFallback,
  buildPronunciationFeedbackSpec,
  buildPronunciationSpec,
  PronunciationResult,
} from './features/pronunciation';
import { buildContextSpec, ContextResult } from './features/context';
import {
  buildDictationFeedbackSpec,
  buildDictationSentencesSpec,
  DictationFeedbackResult,
  DictationSentencesResult,
} from './features/dictation';
import { buildClassifySpec, ClassifyResult } from './features/classify';
import { buildDictionarySpec, DictionaryResult } from './features/dictionary';
import {
  buildVocabVerifySpec,
  VocabVerifyResult,
} from './features/vocab-verify';
import { buildExamplesSpec, ExampleResult } from './features/examples';
import {
  buildGrammarExamplesSpec,
  buildGrammarNormalizeSpec,
  GrammarExamplesResult,
  GrammarNormalizeResult,
} from './features/grammar';
import { buildGrammarQaSpec } from './features/grammar-qa';
import { buildTutorSpec, TutorResult } from './features/tutor';
import { buildQuizSpec, QuizResult, QuizWordInput } from './features/quiz';
import { buildSynonymsSpec, SynonymResult } from './features/synonyms';
import { buildWritingSpec, WritingResult } from './features/writing';
import type {
  AiJsonSpec,
  AiTextSpec,
  CefrLevel,
  ChatMessage,
} from './features/types';

const DEFAULT_MODEL = 'deepseek-chat';
const DEFAULT_BASE_URL = 'https://api.deepseek.com';

/**
 * Reasoning models (e.g. deepseek-v4-flash) count their hidden reasoning tokens
 * against `max_tokens`, and that reasoning length varies run-to-run. A feature's
 * `maxTokens` sizes the *answer* only, so we add this headroom for reasoning —
 * otherwise reasoning can eat the whole budget and leave an empty or truncated
 * response (finish_reason: 'length'). `max_tokens` is a cap, not a target, so
 * raising it costs nothing on non-reasoning models or short reasoning runs.
 */
const REASONING_HEADROOM = 2048;

/**
 * Single entry point for all AI calls. Backed by DeepSeek via its
 * OpenAI-compatible API. Other modules inject this service and never touch the
 * client or API key directly. Feature prompts and schemas live under ./features.
 */
@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly client: OpenAI | null;
  private readonly model: string;

  constructor(config: ConfigService) {
    this.model = config.get<string>('AI_MODEL') || DEFAULT_MODEL;
    const apiKey = config.get<string>('AI_API_KEY');
    const baseURL = config.get<string>('AI_BASE_URL') || DEFAULT_BASE_URL;
    if (apiKey) {
      this.client = new OpenAI({
        apiKey,
        baseURL,
        timeout: 60_000,
        maxRetries: 2,
      });
    } else {
      this.client = null;
      this.logger.warn(
        'AI_API_KEY not set — AI features will return 503 until configured',
      );
    }
  }

  // ── Feature methods (used by words / grammar / review / skills modules) ──

  dictionary(
    term: string,
    opts?: { level?: CefrLevel },
  ): Promise<DictionaryResult> {
    return this.runJson<DictionaryResult>(buildDictionarySpec(term, opts));
  }

  verifyVocab(
    term: string,
    opts?: { userMeaning?: string; level?: CefrLevel },
  ): Promise<VocabVerifyResult> {
    return this.runJson<VocabVerifyResult>(buildVocabVerifySpec(term, opts));
  }

  classifyInput(input: string): Promise<ClassifyResult> {
    return this.runJson<ClassifyResult>(buildClassifySpec(input));
  }

  synonyms(
    word: string,
    opts?: { meaning?: string; limit?: number },
  ): Promise<SynonymResult> {
    return this.runJson<SynonymResult>(buildSynonymsSpec(word, opts));
  }

  examples(
    word: string,
    opts?: { meaning?: string; topics?: string[]; count?: number },
  ): Promise<ExampleResult> {
    return this.runJson<ExampleResult>(buildExamplesSpec(word, opts));
  }

  analyzeContext(
    passage: string,
    opts?: { level?: CefrLevel },
  ): Promise<ContextResult> {
    return this.runJson<ContextResult>(buildContextSpec(passage, opts));
  }

  gradeWriting(text: string): Promise<WritingResult> {
    return this.runJson<WritingResult>(buildWritingSpec(text));
  }

  /** UC20 — normalise a rough grammar note into formula + explanation + examples. */
  normalizeGrammar(rule: string): Promise<GrammarNormalizeResult> {
    return this.runJson<GrammarNormalizeResult>(
      buildGrammarNormalizeSpec(rule),
    );
  }

  grammarExamples(
    formula: string,
    explanation: string,
    count?: number,
  ): Promise<GrammarExamplesResult> {
    return this.runJson<GrammarExamplesResult>(
      buildGrammarExamplesSpec(formula, explanation, count),
    );
  }

  grammarQa(history: ChatMessage[], question: string): Promise<string> {
    return this.runText(buildGrammarQaSpec(history, question));
  }

  /** Streaming variant for the grammar chatbot (used by SSE endpoints). */
  grammarQaStream(history: ChatMessage[], question: string) {
    return this.stream(buildGrammarQaSpec(history, question));
  }

  /**
   * Ask Lexi — general-knowledge tutor chat (any topic, keeps context).
   * Returns the prose answer plus the saveable words/grammar extracted from it.
   */
  tutorAsk(history: ChatMessage[], question: string): Promise<TutorResult> {
    return this.runJson<TutorResult>(buildTutorSpec(history, question));
  }

  /** UC12 — the AI's opening line for a role-play scenario. */
  conversationOpen(scenario: string): Promise<string> {
    return this.runText(buildConversationOpenSpec(scenario));
  }

  conversationReply(
    scenario: string,
    history: ChatMessage[],
    userMessage: string,
  ): Promise<ConversationTurnResult> {
    return this.runJson<ConversationTurnResult>(
      buildConversationTurnSpec(scenario, history, userMessage),
    );
  }

  /** UC13 — score pronunciation from recognised vs target text (fallback). */
  scorePronunciation(
    reference: string,
    recognized: string,
  ): Promise<PronunciationResult> {
    return this.runJson<PronunciationResult>(
      buildPronunciationSpec(reference, recognized),
    );
  }

  /**
   * UC13 — build a PronunciationResult from an objective Azure assessment.
   * Scores/transcript/mispronounced come from Azure; the Vietnamese feedback is
   * generated by the LLM, with a deterministic template if that call fails
   * (so the audio path never 503s just because feedback generation hiccuped).
   */
  async scorePronunciationFromAzure(
    reference: string,
    assessment: AzureAssessment,
  ): Promise<PronunciationResult> {
    const mispronounced = assessment.words
      .filter((w) => w.errorType !== 'None' || w.accuracy < 60)
      .map((w) => w.word);

    let feedback: string;
    try {
      const res = await this.runJson<{ feedback: string }>(
        buildPronunciationFeedbackSpec(reference, assessment),
      );
      feedback = res.feedback?.trim() || buildAzureFeedbackFallback(assessment, mispronounced);
    } catch (err) {
      this.logger.warn(
        `Pronunciation feedback generation failed, using template: ${String(err)}`,
      );
      feedback = buildAzureFeedbackFallback(assessment, mispronounced);
    }

    return {
      score: Math.round(assessment.pronunciation),
      transcriptHeard: assessment.transcript,
      mispronounced,
      feedback,
    };
  }

  conversationSummary(
    scenario: string,
    transcript: ChatMessage[],
  ): Promise<ConversationSummary> {
    return this.runJson<ConversationSummary>(
      buildConversationSummarySpec(scenario, transcript),
    );
  }

  generateQuiz(words: QuizWordInput[]): Promise<QuizResult> {
    return this.runJson<QuizResult>(buildQuizSpec(words));
  }

  /** Dictation — generate level-appropriate sentences to listen and type. */
  generateDictation(opts: {
    level?: CefrLevel;
    topics?: string[];
    count?: number;
  }): Promise<DictationSentencesResult> {
    return this.runJson<DictationSentencesResult>(
      buildDictationSentencesSpec(opts),
    );
  }

  /** Dictation — explain the learner's mistakes in Vietnamese (on error only). */
  explainDictation(
    reference: string,
    attempt: string,
  ): Promise<DictationFeedbackResult> {
    return this.runJson<DictationFeedbackResult>(
      buildDictationFeedbackSpec(reference, attempt),
    );
  }

  // ── Low-level runners ──────────────────────────────────────────────────

  /** Run a request that returns JSON conforming to a schema. */
  private async runJson<T>(spec: AiJsonSpec): Promise<T> {
    const client = this.getClient();
    try {
      const res = await client.chat.completions.create({
        model: this.model,
        max_tokens: (spec.maxTokens ?? 1024) + REASONING_HEADROOM,
        temperature: this.temperature(spec),
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content: this.jsonSystem(spec.system, spec.schema),
          },
          ...this.toParams(spec.messages),
        ],
      });
      return JSON.parse(this.readContent(res)) as T;
    } catch (err) {
      throw this.toRetryableError(err);
    }
  }

  /** Run a request that returns free-form text. */
  private async runText(spec: AiTextSpec): Promise<string> {
    const client = this.getClient();
    try {
      const res = await client.chat.completions.create({
        model: this.model,
        max_tokens: (spec.maxTokens ?? 1024) + REASONING_HEADROOM,
        temperature: this.temperature(spec),
        messages: [
          { role: 'system', content: spec.system },
          ...this.toParams(spec.messages),
        ],
      });
      return this.readContent(res);
    } catch (err) {
      throw this.toRetryableError(err);
    }
  }

  /** Return a streaming handle for long/interactive responses. */
  private stream(spec: AiTextSpec) {
    const client = this.getClient();
    return client.chat.completions.create({
      model: this.model,
      max_tokens: (spec.maxTokens ?? 1024) + REASONING_HEADROOM,
      temperature: this.temperature(spec),
      stream: true,
      messages: [
        { role: 'system', content: spec.system },
        ...this.toParams(spec.messages),
      ],
    });
  }

  private getClient(): OpenAI {
    if (!this.client) {
      throw new ServiceUnavailableException({
        message: 'AI service is not configured (missing AI_API_KEY)',
        retryable: false,
      });
    }
    return this.client;
  }

  private toParams(
    messages: ChatMessage[],
  ): OpenAI.Chat.Completions.ChatCompletionMessageParam[] {
    return messages.map((m) =>
      m.role === 'user'
        ? { role: 'user', content: m.content }
        : { role: 'assistant', content: m.content },
    );
  }

  /** Careful/reasoning tasks get a lower temperature; creative ones higher. */
  private temperature(spec: { thinking?: boolean; effort?: string }): number {
    if (spec.thinking || spec.effort === 'high') return 0.3;
    if (spec.effort === 'low') return 0.4;
    return 0.7;
  }

  private jsonSystem(system: string, schema: Record<string, unknown>): string {
    return (
      `${system}\n\n` +
      `Respond with a single valid JSON object only — no markdown fences, no prose — ` +
      `that conforms to this JSON schema:\n${JSON.stringify(schema)}`
    );
  }

  private readContent(res: OpenAI.Chat.Completions.ChatCompletion): string {
    const choice = res.choices[0];
    if (choice?.finish_reason === 'content_filter') {
      throw new ServiceUnavailableException({
        message: 'The AI declined to answer this request',
        retryable: false,
      });
    }
    // Reasoning models can burn the whole token budget on hidden reasoning and
    // return an empty or half-written answer. Call it out so it isn't mistaken
    // for a generic empty/parse failure.
    if (choice?.finish_reason === 'length') {
      const reasoning =
        res.usage?.completion_tokens_details?.reasoning_tokens ?? 0;
      this.logger.warn(
        `AI response hit the token limit (reasoning_tokens=${reasoning}); ` +
          `consider raising maxTokens for this feature`,
      );
    }
    const text = (choice?.message?.content ?? '').trim();
    if (!text) {
      throw new Error('Empty AI response');
    }
    // Be tolerant of accidental ```json fences.
    return text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
  }

  private toRetryableError(err: unknown): ServiceUnavailableException {
    if (err instanceof ServiceUnavailableException) {
      return err;
    }
    if (err instanceof OpenAI.APIError) {
      const status: number = (err.status as number | undefined) ?? 503;
      const retryable = status === 429 || status >= 500;
      this.logger.error(`AI provider error ${status}: ${err.message}`);
      return new ServiceUnavailableException({
        message: 'AI request failed, please try again',
        retryable,
      });
    }
    if (err instanceof SyntaxError) {
      this.logger.error(`Failed to parse AI JSON response: ${err.message}`);
      return new ServiceUnavailableException({
        message: 'AI returned malformed data, please try again',
        retryable: true,
      });
    }
    this.logger.error(`Unexpected AI error: ${String(err)}`);
    return new ServiceUnavailableException({
      message: 'AI request failed, please try again',
      retryable: true,
    });
  }
}
