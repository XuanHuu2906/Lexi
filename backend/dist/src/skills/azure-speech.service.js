"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var AzureSpeechService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AzureSpeechService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const sdk = __importStar(require("microsoft-cognitiveservices-speech-sdk"));
function parseWav(buf) {
    if (buf.length < 44 ||
        buf.toString('ascii', 0, 4) !== 'RIFF' ||
        buf.toString('ascii', 8, 12) !== 'WAVE') {
        throw new common_1.UnprocessableEntityException('Invalid WAV audio');
    }
    let offset = 12;
    let fmt = null;
    let data = null;
    while (offset + 8 <= buf.length) {
        const id = buf.toString('ascii', offset, offset + 4);
        const size = buf.readUInt32LE(offset + 4);
        const body = offset + 8;
        if (id === 'fmt ') {
            fmt = {
                channels: buf.readUInt16LE(body + 2),
                sampleRate: buf.readUInt32LE(body + 4),
                bitsPerSample: buf.readUInt16LE(body + 14),
            };
        }
        else if (id === 'data') {
            data = buf.subarray(body, Math.min(body + size, buf.length));
        }
        offset = body + size + (size % 2);
    }
    if (!fmt || !data) {
        throw new common_1.UnprocessableEntityException('WAV missing fmt/data chunk');
    }
    return { ...fmt, data };
}
let AzureSpeechService = AzureSpeechService_1 = class AzureSpeechService {
    logger = new common_1.Logger(AzureSpeechService_1.name);
    key;
    region;
    constructor(config) {
        this.key = config.get('AZURE_SPEECH_KEY') || undefined;
        this.region = config.get('AZURE_SPEECH_REGION') || undefined;
        if (!this.isConfigured()) {
            this.logger.warn('AZURE_SPEECH_KEY/AZURE_SPEECH_REGION not set — pronunciation will use the LLM fallback scorer');
        }
    }
    isConfigured() {
        return Boolean(this.key && this.region);
    }
    assess(wav, referenceText) {
        if (!this.isConfigured()) {
            throw new common_1.ServiceUnavailableException({
                message: 'Azure pronunciation assessment is not configured',
                retryable: false,
            });
        }
        const { sampleRate, bitsPerSample, channels, data } = parseWav(wav);
        const speechConfig = sdk.SpeechConfig.fromSubscription(this.key, this.region);
        speechConfig.speechRecognitionLanguage = 'en-US';
        const format = sdk.AudioStreamFormat.getWaveFormatPCM(sampleRate, bitsPerSample, channels);
        const pushStream = sdk.AudioInputStream.createPushStream(format);
        const ab = data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength);
        pushStream.write(ab);
        pushStream.close();
        const audioConfig = sdk.AudioConfig.fromStreamInput(pushStream);
        const paConfig = new sdk.PronunciationAssessmentConfig(referenceText, sdk.PronunciationAssessmentGradingSystem.HundredMark, sdk.PronunciationAssessmentGranularity.Phoneme, true);
        const recognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig);
        paConfig.applyTo(recognizer);
        return new Promise((resolve, reject) => {
            recognizer.recognizeOnceAsync((result) => {
                try {
                    if (result.reason === sdk.ResultReason.RecognizedSpeech) {
                        resolve(this.toAssessment(result));
                    }
                    else if (result.reason === sdk.ResultReason.NoMatch) {
                        reject(new common_1.UnprocessableEntityException({
                            message: 'No clear speech detected, please try again',
                            retryable: false,
                        }));
                    }
                    else if (result.reason === sdk.ResultReason.Canceled) {
                        const cancel = sdk.CancellationDetails.fromResult(result);
                        this.logger.error(`Azure assessment canceled: ${cancel.reason} ${cancel.errorDetails}`);
                        reject(new common_1.ServiceUnavailableException({
                            message: 'Pronunciation assessment failed, please try again',
                            retryable: true,
                        }));
                    }
                    else {
                        reject(new common_1.ServiceUnavailableException({
                            message: 'Pronunciation assessment failed, please try again',
                            retryable: true,
                        }));
                    }
                }
                catch (err) {
                    reject(this.wrap(err));
                }
                finally {
                    recognizer.close();
                }
            }, (err) => {
                recognizer.close();
                this.logger.error(`Azure recognizeOnce error: ${String(err)}`);
                reject(new common_1.ServiceUnavailableException({
                    message: 'Pronunciation assessment failed, please try again',
                    retryable: true,
                }));
            });
        });
    }
    toAssessment(result) {
        const pa = sdk.PronunciationAssessmentResult.fromResult(result);
        const words = (pa.detailResult?.Words ?? []).map((w) => ({
            word: w.Word,
            accuracy: w.PronunciationAssessment?.AccuracyScore ?? 0,
            errorType: w.PronunciationAssessment?.ErrorType ?? 'None',
        }));
        return {
            accuracy: pa.accuracyScore,
            fluency: pa.fluencyScore,
            completeness: pa.completenessScore,
            pronunciation: pa.pronunciationScore,
            transcript: result.text ?? '',
            words,
        };
    }
    wrap(err) {
        if (err instanceof common_1.ServiceUnavailableException ||
            err instanceof common_1.UnprocessableEntityException) {
            return err;
        }
        this.logger.error(`Unexpected Azure error: ${String(err)}`);
        return new common_1.ServiceUnavailableException({
            message: 'Pronunciation assessment failed, please try again',
            retryable: true,
        });
    }
};
exports.AzureSpeechService = AzureSpeechService;
exports.AzureSpeechService = AzureSpeechService = AzureSpeechService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], AzureSpeechService);
//# sourceMappingURL=azure-speech.service.js.map