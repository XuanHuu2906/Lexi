import { buildClassifySpec } from './classify';

describe('buildClassifySpec', () => {
  it('passes the raw input through as the user message', () => {
    const spec = buildClassifySpec('design: thiết kế');
    expect(spec.messages).toEqual([
      { role: 'user', content: 'design: thiết kế' },
    ]);
  });

  it('constrains the type to vocabulary/grammar/unknown in the schema', () => {
    const spec = buildClassifySpec('sau danh từ là tính từ');
    const props = spec.schema.properties as Record<string, { enum?: string[] }>;
    expect(props.type.enum).toEqual(['vocabulary', 'grammar', 'unknown']);
    expect(spec.schema.required).toEqual(
      expect.arrayContaining(['type', 'confidence', 'term', 'meaning', 'rule']),
    );
  });

  it('uses low effort and a small token budget (cheap routing call)', () => {
    const spec = buildClassifySpec('anything');
    expect(spec.effort).toBe('low');
    expect(spec.maxTokens).toBeLessThanOrEqual(512);
  });
});
