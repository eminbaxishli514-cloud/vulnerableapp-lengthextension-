const INITIAL_STATE = new Uint32Array([
  0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
  0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19
]);

const K = new Uint32Array([
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1,
  0x923f82a4, 0xab1c5ed5, 0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3,
  0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174, 0xe49b69c1, 0xefbe4786,
  0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147,
  0x06ca6351, 0x14292967, 0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13,
  0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85, 0xa2bfe8a1, 0xa81a664b,
  0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a,
  0x5b9cca4f, 0x682e6ff3, 0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208,
  0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
]);

const encoder = new TextEncoder();
const decoder = new TextDecoder();

const rotr = (x: number, n: number) => (x >>> n) | (x << (32 - n));

export const utf8ToBytes = (input: string): Uint8Array => encoder.encode(input);
export const bytesToUtf8 = (input: Uint8Array): string => decoder.decode(input);

export const bytesToHex = (bytes: Uint8Array): string =>
  [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");

export const hexToBytes = (hex: string): Uint8Array => {
  if (!/^[0-9a-fA-F]{64}$/.test(hex)) {
    throw new Error("Expected a 64-character SHA-256 hex digest");
  }
  const out = new Uint8Array(32);
  for (let i = 0; i < 64; i += 2) {
    out[i / 2] = Number.parseInt(hex.slice(i, i + 2), 16);
  }
  return out;
};

export const sha256Padding = (messageLengthBytes: number): Uint8Array => {
  const total = messageLengthBytes + 1 + 8;
  const zeroPadLen = (64 - (total % 64)) % 64;
  const padding = new Uint8Array(1 + zeroPadLen + 8);
  padding[0] = 0x80;

  const bitLength = BigInt(messageLengthBytes) * 8n;
  for (let i = 0; i < 8; i++) {
    padding[padding.length - 1 - i] = Number((bitLength >> BigInt(i * 8)) & 0xffn);
  }

  return padding;
};

const toState = (hashHex: string): Uint32Array => {
  const hashBytes = hexToBytes(hashHex);
  const state = new Uint32Array(8);
  for (let i = 0; i < 8; i++) {
    state[i] =
      (hashBytes[i * 4] << 24) |
      (hashBytes[i * 4 + 1] << 16) |
      (hashBytes[i * 4 + 2] << 8) |
      hashBytes[i * 4 + 3];
  }
  return state;
};

const stateToHex = (state: Uint32Array): string => {
  const out = new Uint8Array(32);
  for (let i = 0; i < 8; i++) {
    out[i * 4] = (state[i] >>> 24) & 0xff;
    out[i * 4 + 1] = (state[i] >>> 16) & 0xff;
    out[i * 4 + 2] = (state[i] >>> 8) & 0xff;
    out[i * 4 + 3] = state[i] & 0xff;
  }
  return bytesToHex(out);
};

const hashBlocks = (input: Uint8Array, initialState?: Uint32Array): Uint32Array => {
  const state = initialState ? new Uint32Array(initialState) : new Uint32Array(INITIAL_STATE);
  const w = new Uint32Array(64);

  for (let offset = 0; offset < input.length; offset += 64) {
    for (let i = 0; i < 16; i++) {
      const j = offset + i * 4;
      w[i] = (input[j] << 24) | (input[j + 1] << 16) | (input[j + 2] << 8) | input[j + 3];
    }

    for (let i = 16; i < 64; i++) {
      const s0 = rotr(w[i - 15], 7) ^ rotr(w[i - 15], 18) ^ (w[i - 15] >>> 3);
      const s1 = rotr(w[i - 2], 17) ^ rotr(w[i - 2], 19) ^ (w[i - 2] >>> 10);
      w[i] = (((w[i - 16] + s0) | 0) + ((w[i - 7] + s1) | 0)) >>> 0;
    }

    let [a, b, c, d, e, f, g, h] = state;

    for (let i = 0; i < 64; i++) {
      const S1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25);
      const ch = (e & f) ^ (~e & g);
      const t1 = (((((h + S1) | 0) + ((ch + K[i]) | 0)) | 0) + w[i]) >>> 0;
      const S0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const t2 = (S0 + maj) >>> 0;

      h = g;
      g = f;
      f = e;
      e = (d + t1) >>> 0;
      d = c;
      c = b;
      b = a;
      a = (t1 + t2) >>> 0;
    }

    state[0] = (state[0] + a) >>> 0;
    state[1] = (state[1] + b) >>> 0;
    state[2] = (state[2] + c) >>> 0;
    state[3] = (state[3] + d) >>> 0;
    state[4] = (state[4] + e) >>> 0;
    state[5] = (state[5] + f) >>> 0;
    state[6] = (state[6] + g) >>> 0;
    state[7] = (state[7] + h) >>> 0;
  }

  return state;
};

export const sha256 = (data: Uint8Array): string => {
  const padded = concatBytes(data, sha256Padding(data.length));
  return stateToHex(hashBlocks(padded));
};

export const sha256FromString = (text: string): string => sha256(utf8ToBytes(text));

export const concatBytes = (...parts: Uint8Array[]): Uint8Array => {
  const len = parts.reduce((acc, p) => acc + p.length, 0);
  const out = new Uint8Array(len);
  let offset = 0;
  for (const part of parts) {
    out.set(part, offset);
    offset += part.length;
  }
  return out;
};

export const extendSha256 = (
  originalDigestHex: string,
  knownMessageLengthBytes: number,
  appendedData: Uint8Array
): { newDigestHex: string; gluePadding: Uint8Array } => {
  const gluePadding = sha256Padding(knownMessageLengthBytes);
  const resumedState = toState(originalDigestHex);

  const totalSoFar = knownMessageLengthBytes + gluePadding.length;
  const finalPadding = sha256Padding(totalSoFar + appendedData.length);
  const continuationBlocks = concatBytes(appendedData, finalPadding);
  const state = hashBlocks(continuationBlocks, resumedState);

  return {
    newDigestHex: stateToHex(state),
    gluePadding
  };
};

export const bytesToPercentEncoded = (bytes: Uint8Array): string =>
  [...bytes]
    .map((b) => {
      const ch = String.fromCharCode(b);
      const isUnreserved = /^[A-Za-z0-9\-._~=&]$/.test(ch);
      return isUnreserved ? ch : `%${b.toString(16).toUpperCase().padStart(2, "0")}`;
    })
    .join("");

export const percentEncodedToBytes = (input: string): Uint8Array => {
  const out: number[] = [];
  for (let i = 0; i < input.length; i++) {
    const ch = input[i];
    if (ch === "%" && i + 2 < input.length) {
      const hex = input.slice(i + 1, i + 3);
      if (/^[0-9a-fA-F]{2}$/.test(hex)) {
        out.push(Number.parseInt(hex, 16));
        i += 2;
        continue;
      }
    }
    out.push(ch.charCodeAt(0) & 0xff);
  }
  return new Uint8Array(out);
};
