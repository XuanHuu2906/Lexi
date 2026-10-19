import { UnprocessableEntityException } from '@nestjs/common';
import { parseWav } from './wav-parser';

function chunk(id: string, data: Buffer): Buffer {
  const header = Buffer.alloc(8);
  header.write(id, 0, 4, 'ascii');
  header.writeUInt32LE(data.length, 4);
  return Buffer.concat([header, data, data.length % 2 ? Buffer.alloc(1) : Buffer.alloc(0)]);
}

function wav(overrides: {
  format?: number;
  channels?: number;
  rate?: number;
  byteRate?: number;
  blockAlign?: number;
  bits?: number;
  samples?: Buffer;
  extra?: Buffer;
} = {}): Buffer {
  const fmt = Buffer.alloc(16);
  fmt.writeUInt16LE(overrides.format ?? 1, 0);
  fmt.writeUInt16LE(overrides.channels ?? 1, 2);
  fmt.writeUInt32LE(overrides.rate ?? 16000, 4);
  fmt.writeUInt32LE(overrides.byteRate ?? 32000, 8);
  fmt.writeUInt16LE(overrides.blockAlign ?? 2, 12);
  fmt.writeUInt16LE(overrides.bits ?? 16, 14);
  const body = Buffer.concat([
    Buffer.from('WAVE'),
    overrides.extra ?? Buffer.alloc(0),
    chunk('fmt ', fmt),
    chunk('data', overrides.samples ?? Buffer.alloc(32000, 1)),
  ]);
  const header = Buffer.alloc(8);
  header.write('RIFF', 0, 4, 'ascii');
  header.writeUInt32LE(body.length, 4);
  return Buffer.concat([header, body]);
}

describe('parseWav – untrusted pronunciation input', () => {
  it('accepts real PCM16 mono/16k and correctly traverses odd padded metadata', () => {
    for (const input of [wav(), wav({ extra: chunk('JUNK', Buffer.from([7])) })]) {
      const result = parseWav(input);
      expect(result.sampleRate).toBe(16000);
      expect(result.bitsPerSample).toBe(16);
      expect(result.channels).toBe(1);
      expect(result.data.length).toBe(32000);
    }
  });

  it.each([
    ['wrong RIFF signature', () => { const b = wav(); b.write('RIFX'); return b; }],
    ['incorrect declared RIFF length', () => { const b = wav(); b.writeUInt32LE(44, 4); return b; }],
    ['truncated WAV', () => wav().subarray(0, 100)],
    ['short fmt body', () => { const b = wav(); b.writeUInt32LE(4, 16); return b; }],
    ['chunk data length beyond file', () => { const b = wav(); b.writeUInt32LE(0xffffffff, 40); return b; }],
    ['trailing byte', () => Buffer.concat([wav(), Buffer.from([1])])],
    ['wrong audio codec', () => wav({ format: 3 })],
    ['stereo', () => wav({ channels: 2 })],
    ['wrong sample rate', () => wav({ rate: 44100 })],
    ['wrong bytes per second', () => wav({ byteRate: 64000 })],
    ['wrong block alignment', () => wav({ blockAlign: 4 })],
    ['wrong bit depth', () => wav({ bits: 8 })],
    ['empty data chunk', () => wav({ samples: Buffer.alloc(0) })],
    ['partial PCM frame', () => wav({ samples: Buffer.from([1]) })],
    ['oversize file', () => Buffer.alloc(5 * 1024 * 1024 + 1)],
    ['duplicate data chunk', () => {
      const a = wav();
      const extra = chunk('data', Buffer.from([1, 0]));
      const b = Buffer.concat([a, extra]);
      b.writeUInt32LE(b.length - 8, 4);
      return b;
    }],
    ['duplicate fmt chunk', () => {
      const a = wav();
      const fmt = Buffer.from(a.subarray(12, 36));
      const b = Buffer.concat([a, fmt]);
      b.writeUInt32LE(b.length - 8, 4);
      return b;
    }],
  ])('returns 422 for %s without passing malformed WAV into Azure', (_name, make) => {
    expect(() => parseWav(make())).toThrow(UnprocessableEntityException);
  });
});
