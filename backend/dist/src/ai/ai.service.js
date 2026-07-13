"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var AiService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const openai_1 = __importDefault(require("openai"));
const conversation_1 = require("./features/conversation");
const pronunciation_1 = require("./features/pronunciation");
const context_1 = require("./features/context");
const dictation_1 = require("./features/dictation");
const classify_1 = require("./features/classify");
const dictionary_1 = require("./features/dictionary");
const vocab_verify_1 = require("./features/vocab-verify");
const examples_1 = require("./features/examples");
const grammar_1 = require("./features/grammar");
const grammar_qa_1 = require("./features/grammar-qa");
const tutor_1 = require("./features/tutor");
const quiz_1 = require("./features/quiz");
const synonyms_1 = require("./features/synonyms");
const writing_1 = require("./features/writing");
const DEFAULT_MODEL = 'deepseek-chat';
const DEFAULT_BASE_URL = 'https://api.deepseek.com';
const REASONING_HEADROOM = 2048;
let AiService = AiService_1 = class AiService {
    logger = new common_1.Logger(AiService_1.name);
    client;
    model;
    constructor(config) {
        this.model = config.get('AI_MODEL') || DEFAULT_MODEL;
        const apiKey = config.get('AI_API_KEY');
        const baseURL = config.get('AI_BASE_URL') || DEFAULT_BASE_URL;
        if (apiKey) {
            this.client = new openai_1.default({
                apiKey,
                baseURL,
                timeout: 60_000,
                maxRetries: 2,
            });
        }
        else {
            this.client = null;
            this.logger.warn('AI_API_KEY not set — AI features will return 503 until configured');
        }
    }
    dictionary(term, opts) {
        return this.runJson((0, dictionary_1.buildDictionarySpec)(term, opts));
    }
    verifyVocab(term, opts) {
        return this.runJson((0, vocab_verify_1.buildVocabVerifySpec)(term, opts));
    }
    classifyInput(input) {
        return this.runJson((0, classify_1.buildClassifySpec)(input));
    }
    synonyms(word, opts) {
        return this.runJson((0, synonyms_1.buildSynonymsSpec)(word, opts));
    }
    examples(word, opts) {
        return this.runJson((0, examples_1.buildExamplesSpec)(word, opts));
    }
    analyzeContext(passage, opts) {
        return this.runJson((0, context_1.buildContextSpec)(passage, opts));
    }
    gradeWriting(text) {
        return this.runJson((0, writing_1.buildWritingSpec)(text));
    }
    normalizeGrammar(rule) {
        return this.runJson((0, grammar_1.buildGrammarNormalizeSpec)(rule));
    }
    grammarExamples(formula, explanation, count) {
        return this.runJson((0, grammar_1.buildGrammarExamplesSpec)(formula, explanation, count));
    }
    grammarQa(history, question) {
        return this.runText((0, grammar_qa_1.buildGrammarQaSpec)(history, question));
    }
    grammarQaStream(history, question) {
        return this.stream((0, grammar_qa_1.buildGrammarQaSpec)(history, question));
    }
    tutorAsk(history, question) {
        return this.runJson((0, tutor_1.buildTutorSpec)(history, question));
    }
    conversationOpen(scenario) {
        return this.runText((0, conversation_1.buildConversationOpenSpec)(scenario));
    }
    conversationReply(scenario, history, userMessage) {
        return this.runJson((0, conversation_1.buildConversationTurnSpec)(scenario, history, userMessage));
    }
    scorePronunciation(reference, recognized) {
        return this.runJson((0, pronunciation_1.buildPronunciationSpec)(reference, recognized));
    }
    async scorePronunciationFromAzure(reference, assessment) {
        const mispronounced = assessment.words
            .filter((w) => w.errorType !== 'None' || w.accuracy < 60)
            .map((w) => w.word);
        let feedback;
        try {
            const res = await this.runJson((0, pronunciation_1.buildPronunciationFeedbackSpec)(reference, assessment));
            feedback = res.feedback?.trim() || (0, pronunciation_1.buildAzureFeedbackFallback)(assessment, mispronounced);
        }
        catch (err) {
            this.logger.warn(`Pronunciation feedback generation failed, using template: ${String(err)}`);
            feedback = (0, pronunciation_1.buildAzureFeedbackFallback)(assessment, mispronounced);
        }
        return {
            score: Math.round(assessment.pronunciation),
            transcriptHeard: assessment.transcript,
            mispronounced,
            feedback,
        };
    }
    conversationSummary(scenario, transcript) {
        return this.runJson((0, conversation_1.buildConversationSummarySpec)(scenario, transcript));
    }
    generateQuiz(words) {
        return this.runJson((0, quiz_1.buildQuizSpec)(words));
    }
    generateDictation(opts) {
        return this.runJson((0, dictation_1.buildDictationSentencesSpec)(opts));
    }
    explainDictation(reference, attempt) {
        return this.runJson((0, dictation_1.buildDictationFeedbackSpec)(reference, attempt));
    }
    async runJson(spec) {
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
            return JSON.parse(this.readContent(res));
        }
        catch (err) {
            throw this.toRetryableError(err);
        }
    }
    async runText(spec) {
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
        }
        catch (err) {
            throw this.toRetryableError(err);
        }
    }
    stream(spec) {
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
    getClient() {
        if (!this.client) {
            throw new common_1.ServiceUnavailableException({
                message: 'AI service is not configured (missing AI_API_KEY)',
                retryable: false,
            });
        }
        return this.client;
    }
    toParams(messages) {
        return messages.map((m) => m.role === 'user'
            ? { role: 'user', content: m.content }
            : { role: 'assistant', content: m.content });
    }
    temperature(spec) {
        if (spec.thinking || spec.effort === 'high')
            return 0.3;
        if (spec.effort === 'low')
            return 0.4;
        return 0.7;
    }
    jsonSystem(system, schema) {
        return (`${system}\n\n` +
            `Respond with a single valid JSON object only — no markdown fences, no prose — ` +
            `that conforms to this JSON schema:\n${JSON.stringify(schema)}`);
    }
    readContent(res) {
        const choice = res.choices[0];
        if (choice?.finish_reason === 'content_filter') {
            throw new common_1.ServiceUnavailableException({
                message: 'The AI declined to answer this request',
                retryable: false,
            });
        }
        if (choice?.finish_reason === 'length') {
            const reasoning = res.usage?.completion_tokens_details?.reasoning_tokens ?? 0;
            this.logger.warn(`AI response hit the token limit (reasoning_tokens=${reasoning}); ` +
                `consider raising maxTokens for this feature`);
        }
        const text = (choice?.message?.content ?? '').trim();
        if (!text) {
            throw new Error('Empty AI response');
        }
        return text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
    }
    toRetryableError(err) {
        if (err instanceof common_1.ServiceUnavailableException) {
            return err;
        }
        if (err instanceof openai_1.default.APIError) {
            const status = err.status ?? 503;
            const retryable = status === 429 || status >= 500;
            this.logger.error(`AI provider error ${status}: ${err.message}`);
            return new common_1.ServiceUnavailableException({
                message: 'AI request failed, please try again',
                retryable,
            });
        }
        if (err instanceof SyntaxError) {
            this.logger.error(`Failed to parse AI JSON response: ${err.message}`);
            return new common_1.ServiceUnavailableException({
                message: 'AI returned malformed data, please try again',
                retryable: true,
            });
        }
        this.logger.error(`Unexpected AI error: ${String(err)}`);
        return new common_1.ServiceUnavailableException({
            message: 'AI request failed, please try again',
            retryable: true,
        });
    }
};
exports.AiService = AiService;
exports.AiService = AiService = AiService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], AiService);
//# sourceMappingURL=ai.service.js.map