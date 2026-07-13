import { ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { AiService } from './ai.service';

// Stub the OpenAI client so no network calls happen.
const createMock = jest.fn();
jest.mock('openai', () => {
  const MockOpenAI = jest.fn().mockImplementation(() => ({
    chat: { completions: { create: createMock } },
  }));
  // APIError is used by the service for status-based classification.
  class APIError extends Error {
    status?: number;
    constructor(status: number, message: string) {
      super(message);
      this.status = status;
    }
  }
  (MockOpenAI as unknown as { APIError: typeof APIError }).APIError = APIError;
  return { __esModule: true, default: MockOpenAI, APIError };
});

function makeService(apiKey: string | undefined): AiService {
  const config = {
    get: (key: string) =>
      ({
        AI_MODEL: 'deepseek-chat',
        AI_BASE_URL: 'https://api.deepseek.com',
        AI_API_KEY: apiKey,
      })[key],
  };
  return new AiService(config as unknown as ConfigService);
}

function jsonResponse(obj: unknown) {
  return {
    choices: [
      { finish_reason: 'stop', message: { content: JSON.stringify(obj) } },
    ],
  };
}

describe('AiService', () => {
  beforeEach(() => createMock.mockReset());

  describe('when AI_API_KEY is missing', () => {
    it('throws a non-retryable 503 instead of calling the provider', async () => {
      const service = makeService(undefined);
      await expect(service.classifyInput('design: thiết kế')).rejects.toThrow(
        ServiceUnavailableException,
      );
      expect(createMock).not.toHaveBeenCalled();
    });
  });

  describe('classifyInput', () => {
    it('parses the JSON body into a typed result', async () => {
      createMock.mockResolvedValue(
        jsonResponse({
          type: 'vocabulary',
          confidence: 0.95,
          term: 'design',
          meaning: 'thiết kế',
          rule: '',
          reason: 'có dạng "từ: nghĩa"',
        }),
      );
      const service = makeService('sk-test');
      const res = await service.classifyInput('design: thiết kế');
      expect(res.type).toBe('vocabulary');
      expect(res.term).toBe('design');
    });

    it('strips accidental ```json fences before parsing', async () => {
      createMock.mockResolvedValue({
        choices: [
          {
            finish_reason: 'stop',
            message: {
              content:
                '```json\n{"type":"grammar","confidence":0.8,"term":"","meaning":"","rule":"N + adj","reason":"x"}\n```',
            },
          },
        ],
      });
      const service = makeService('sk-test');
      const res = await service.classifyInput('sau danh từ là tính từ');
      expect(res.type).toBe('grammar');
      expect(res.rule).toBe('N + adj');
    });
  });

  describe('error mapping', () => {
    it('marks provider 429/5xx errors as retryable', async () => {
      createMock.mockRejectedValue(new OpenAI.APIError(503, 'overloaded'));
      const service = makeService('sk-test');
      try {
        await service.classifyInput('x');
        fail('expected throw');
      } catch (err) {
        expect(err).toBeInstanceOf(ServiceUnavailableException);
        expect(
          (err as ServiceUnavailableException).getResponse(),
        ).toMatchObject({ retryable: true });
      }
    });

    it('marks provider 4xx (non-429) errors as non-retryable', async () => {
      createMock.mockRejectedValue(new OpenAI.APIError(400, 'bad request'));
      const service = makeService('sk-test');
      try {
        await service.classifyInput('x');
        fail('expected throw');
      } catch (err) {
        expect(
          (err as ServiceUnavailableException).getResponse(),
        ).toMatchObject({ retryable: false });
      }
    });

    it('treats a content-filter refusal as a non-retryable failure', async () => {
      createMock.mockResolvedValue({
        choices: [
          { finish_reason: 'content_filter', message: { content: '' } },
        ],
      });
      const service = makeService('sk-test');
      await expect(service.classifyInput('x')).rejects.toBeInstanceOf(
        ServiceUnavailableException,
      );
    });

    it('flags malformed JSON as retryable', async () => {
      createMock.mockResolvedValue({
        choices: [
          { finish_reason: 'stop', message: { content: 'not json at all' } },
        ],
      });
      const service = makeService('sk-test');
      try {
        await service.classifyInput('x');
        fail('expected throw');
      } catch (err) {
        expect(
          (err as ServiceUnavailableException).getResponse(),
        ).toMatchObject({ retryable: true });
      }
    });
  });
});
