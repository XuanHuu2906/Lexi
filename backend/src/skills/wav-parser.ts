import { UnprocessableEntityException } from '@nestjs/common';

export interface ParsedWav {
  sampleRate: number;
  bitsPerSample: number;
  channels: number;
  data: Buffer;
}

const MAX_WAV_BYTES = 5 * 1024 * 1024;

// Azure's native Lexi contract is 16 kHz, mono, signed PCM16 in a real RIFF/WAVE container.
// Keep validation independent from the Azure SDK so malformed uploads fail with 422.
export function parseWav(buf: Buffer): ParsedWav {
  const invalid = (): never => {
    throw new UnprocessableEntityException(
      'Invalid WAV: expected 16 kHz mono 16-bit PCM',
    );
  };
  if (
    !Buffer.isBuffer(buf) ||
    buf.length < 44 ||
    buf.length > MAX_WAV_BYTES ||
    buf.toString('ascii', 0, 4) !== 'RIFF' ||
    buf.toString('ascii', 8, 12) !== 'WAVE' ||
    buf.readUInt32LE(4) + 8 !== buf.length
  ) {
    return invalid();
  }

  let offset = 12;
  let hasFormat = false;
  let data: Buffer | undefined;

  while (offset < buf.length) {
    if (buf.length - offset < 8) return invalid();
    const id = buf.toString('ascii', offset, offset + 4);
    const size = buf.readUInt32LE(offset + 4);
    const start = offset + 8;
    if (size > buf.length - start) return invalid();
    const end = start + size;
    // RIFF chunks have an extra padding byte when their data length is odd.
    if (size % 2 === 1 && end === buf.length) return invalid();

    if (id === 'fmt ') {
      if (hasFormat || size < 16) return invalid();
      const format = buf.readUInt16LE(start);
      const channels = buf.readUInt16LE(start + 2);
      const sampleRate = buf.readUInt32LE(start + 4);
      const bytesPerSecond = buf.readUInt32LE(start + 8);
      const blockAlign = buf.readUInt16LE(start + 12);
      const bitsPerSample = buf.readUInt16LE(start + 14);
      if (
        format !== 1 ||
        channels !== 1 ||
        sampleRate !== 16000 ||
        bytesPerSecond !== 32000 ||
        blockAlign !== 2 ||
        bitsPerSample !== 16
      ) {
        return invalid();
      }
      hasFormat = true;
    } else if (id === 'data') {
      if (data !== undefined) return invalid();
      data = buf.subarray(start, end);
    }
    offset = end + (size % 2);
  }

  if (!hasFormat || !data || data.length === 0 || data.length % 2 !== 0) {
    return invalid();
  }
  return { sampleRate: 16000, bitsPerSample: 16, channels: 1, data };
}
