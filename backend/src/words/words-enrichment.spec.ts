import { AiService } from '../ai/ai.service';
import { PrismaService } from '../prisma/prisma.service';
import { WordsService } from './words.service';

function setup() {
  const word = {
    findUnique: jest.fn().mockResolvedValue(null),
    create: jest.fn<Promise<unknown>, [{ data: Record<string, unknown> }]>(),
    findFirst: jest.fn(),
    updateMany: jest.fn().mockResolvedValue({ count: 1 }),
    update: jest.fn(),
  };
  word.create.mockImplementation(({ data }) =>
    Promise.resolve({ id: 'w1', ...data }),
  );
  const verified = {
    isValid: true,
    correctedTerm: 'increase',
    meaningVerdict: 'match',
    phonetic: '/ɪnˈkriːs/',
    partOfSpeech: 'verb',
    examples: [{ en: 'Sales increase.', vi: 'Doanh số tăng.' }],
    synonyms: ['grow'],
    antonyms: ['decrease'],
  };
  const ai = {
    verifyVocab: jest
      .fn<Promise<typeof verified>, []>()
      .mockResolvedValue(verified),
    synonyms: jest.fn().mockResolvedValue({ synonyms: [] }),
  };
  const service = new WordsService(
    {
      word,
      toeicWord: { findMany: jest.fn().mockResolvedValue([]) },
    } as unknown as PrismaService,
    ai as unknown as AiService,
  );
  return { service, word, ai };
}

describe('Notebook enrichment', () => {
  it('saves manual vocabulary without AI when processing is declined', async () => {
    const { service, ai } = setup();
    const saved = await service.create('a', {
      term: 'increase',
      meaning: 'tăng',
      enrich: false,
    });
    expect(ai.verifyVocab).not.toHaveBeenCalled();
    expect(saved.examples).toEqual([]);
    expect(saved.meaning).toBe('tăng');
    expect(saved.phonetic).toBeUndefined();
    expect(saved.partOfSpeech).toBeUndefined();
  });
  it('fills manual entries while preserving their meaning, notes and supplied examples', async () => {
    const { service, word } = setup();
    await service.create('a', {
      term: 'increase',
      meaning: 'tăng',
      examples: ['My example.'],
      note: 'mine',
      phonetic: '/my transcription/',
      partOfSpeech: 'my word class',
    });
    expect(word.create.mock.calls[0][0].data).toMatchObject({
      userId: 'a',
      meaning: 'tăng',
      examples: ['My example.'],
      note: 'mine',
      phonetic: '/my transcription/',
      partOfSpeech: 'my word class',
      synonyms: ['grow'],
      antonyms: ['decrease'],
    });
  });

  it('quick-add persists examples and antonyms too', async () => {
    const { service } = setup();
    const result = await service.quickAdd('a', { text: 'increase: tăng' });
    expect(result.word.examples).toEqual(['Sales increase. — Doanh số tăng.']);
    expect(result.word.antonyms).toEqual(['decrease']);
    expect(result.word.phonetic).toBe('/ɪnˈkriːs/');
    expect(result.word.partOfSpeech).toBe('verb');
  });

  it('fills missing pronunciation and word class even when other details are complete', async () => {
    const { service, ai } = setup();
    const saved = await service.create('a', {
      term: 'increase',
      meaning: 'tăng',
      phonetic: '   ',
      examples: ['My example.'],
      synonyms: ['grow'],
      antonyms: ['decrease'],
      enrich: true,
    });
    expect(ai.verifyVocab).toHaveBeenCalledTimes(1);
    expect(saved).toMatchObject({
      phonetic: '/ɪnˈkriːs/',
      partOfSpeech: 'verb',
      meaning: 'tăng',
      examples: ['My example.'],
    });
  });

  it('keeps pronunciation and word class absent when AI returns blank values', async () => {
    const { service, ai } = setup();
    ai.verifyVocab.mockResolvedValue({
      ...(await ai.verifyVocab()),
      phonetic: ' ',
      partOfSpeech: '',
    });
    const saved = await service.create('a', {
      term: 'increase',
      meaning: 'tăng',
    });
    expect(saved.phonetic).toBeUndefined();
    expect(saved.partOfSpeech).toBeUndefined();
    expect(saved.examples).toHaveLength(1);
  });

  it('skips AI for complete entries and rejects duplicates before spending an AI call', async () => {
    const { service, word, ai } = setup();
    await service.create('a', {
      term: 'increase',
      meaning: 'tăng',
      examples: ['x'],
      phonetic: '/ɪnˈkriːs/',
      partOfSpeech: 'verb',
      synonyms: ['grow'],
      antonyms: ['decrease'],
    });
    expect(ai.verifyVocab).not.toHaveBeenCalled();
    word.findUnique.mockResolvedValue({ id: 'existing' });
    await expect(
      service.create('a', { term: 'increase', meaning: 'tăng' }),
    ).rejects.toThrow();
    expect(ai.verifyVocab).not.toHaveBeenCalled();
  });

  it.each(['mismatch', 'invalid', 'corrected', 'unavailable'])(
    'does not silently replace user data for %s',
    async (kind) => {
      const { service, ai } = setup();
      const result = await ai.verifyVocab();
      ai.verifyVocab.mockResolvedValue({
        ...result,
        meaningVerdict: kind === 'mismatch' ? 'mismatch' : 'match',
        isValid: kind !== 'invalid',
        correctedTerm: kind === 'corrected' ? 'other' : 'increase',
      });
      if (kind === 'unavailable')
        ai.verifyVocab.mockRejectedValue(new Error('offline'));
      const saved = await service.create('a', {
        term: 'increase',
        meaning: 'my meaning',
      });
      expect(saved.meaning).toBe('my meaning');
      expect(saved.examples).toEqual([]);
      expect(saved.antonyms).toEqual([]);
      expect(saved.phonetic).toBeUndefined();
      expect(saved.partOfSpeech).toBeUndefined();
    },
  );

  it('backfills only the account-owned unchanged entry and leaves SRS alone', async () => {
    const { service, word } = setup();
    word.findFirst.mockResolvedValue({
      id: 'w1',
      userId: 'a',
      term: 'increase',
      meaning: 'tăng',
      phonetic: null,
      partOfSpeech: 'verb',
      examples: [],
      synonyms: ['my synonym'],
      antonyms: [],
    });
    await service.enrichMissing('a', 'w1');
    expect(word.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          id: 'w1',
          userId: 'a',
        },
      }),
    );
    expect(word.updateMany).toHaveBeenCalledWith({
      where: {
        id: 'w1',
        userId: 'a',
        term: 'increase',
        meaning: 'tăng',
        phonetic: null,
        partOfSpeech: 'verb',
        examples: { equals: [] },
        synonyms: { equals: ['my synonym'] },
        antonyms: { equals: [] },
      },
      data: {
        phonetic: '/ɪnˈkriːs/',
        examples: ['Sales increase. — Doanh số tăng.'],
        antonyms: ['decrease'],
      },
    });
  });

  it('does not invent antonyms when none exist', async () => {
    const { service, ai } = setup();
    ai.verifyVocab.mockResolvedValue({
      ...(await ai.verifyVocab()),
      antonyms: [],
    });
    const saved = await service.create('a', {
      term: 'increase',
      meaning: 'tăng',
    });
    expect(saved.antonyms).toEqual([]);
    expect(saved.examples.length).toBe(1);
  });
});
