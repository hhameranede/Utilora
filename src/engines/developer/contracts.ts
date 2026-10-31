import { ToolAdapter } from '../types';
import { decodeBase64Utf8, encodeBase64Utf8, generateDigest, generateUuid, transformUrl } from '../local-core';

function failure<T>(error: unknown) {
  return {
    success: false,
    error: {
      code: 'PROCESSING_ERROR',
      message: error instanceof Error ? error.message : 'Unable to process this input.',
    },
  } as const;
}

// JSON formatter
export interface JsonFormatterInput { rawJson: string; }
export interface JsonFormatterOptions { indent: 2 | 4 | 'tab'; }
export interface JsonFormatterOutput { formattedJson: string; }

export const JsonFormatterAdapter: ToolAdapter<JsonFormatterInput, JsonFormatterOptions, JsonFormatterOutput> = {
  id: 'json-formatter',
  name: 'JSON Formatter Adapter',
  isConnected: true,
  async execute(input, options = { indent: 2 }) {
    const started = performance.now();
    try {
      const parsed: unknown = JSON.parse(input.rawJson);
      const indent = options.indent === 'tab' ? '\t' : options.indent;
      return { success: true, data: { formattedJson: JSON.stringify(parsed, null, indent) }, durationMs: performance.now() - started };
    } catch (error) { return failure<JsonFormatterOutput>(error); }
  },
};

// JSON validator
export interface JsonValidatorInput { rawJson: string; }
export interface JsonValidatorOutput {
  isValid: boolean;
  errors?: Array<{ line: number; column: number; message: string }>;
}

export const JsonValidatorAdapter: ToolAdapter<JsonValidatorInput, Record<string, never>, JsonValidatorOutput> = {
  id: 'json-validator',
  name: 'JSON Validator Adapter',
  isConnected: true,
  async execute(input) {
    const started = performance.now();
    try {
      JSON.parse(input.rawJson);
      return { success: true, data: { isValid: true }, durationMs: performance.now() - started };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Invalid JSON';
      const position = Number(message.match(/position\s+(\d+)/i)?.[1] ?? 0);
      const before = input.rawJson.slice(0, position);
      const line = before.split('\n').length;
      const column = position - before.lastIndexOf('\n');
      return { success: true, data: { isValid: false, errors: [{ line, column, message }] }, durationMs: performance.now() - started };
    }
  },
};

// JSON minifier
export interface JsonMinifierInput { rawJson: string; }
export interface JsonMinifierOutput { minifiedJson: string; bytesSaved: number; }

export const JsonMinifierAdapter: ToolAdapter<JsonMinifierInput, Record<string, never>, JsonMinifierOutput> = {
  id: 'json-minifier',
  name: 'JSON Minifier Adapter',
  isConnected: true,
  async execute(input) {
    const started = performance.now();
    try {
      const parsed: unknown = JSON.parse(input.rawJson);
      const minifiedJson = JSON.stringify(parsed);
      const bytesSaved = new TextEncoder().encode(input.rawJson).length - new TextEncoder().encode(minifiedJson).length;
      return { success: true, data: { minifiedJson, bytesSaved }, durationMs: performance.now() - started };
    } catch (error) { return failure<JsonMinifierOutput>(error); }
  },
};

// Base64 UTF-8 encoder/decoder
export interface Base64Input { text: string; mode: 'encode' | 'decode'; }
export interface Base64Options { urlSafe?: boolean; }
export interface Base64Output { result: string; }

export const Base64Adapter: ToolAdapter<Base64Input, Base64Options, Base64Output> = {
  id: 'base64-encoder-decoder',
  name: 'Base64 Adapter',
  isConnected: true,
  async execute(input, options = {}) {
    const started = performance.now();
    try {
      const result = input.mode === 'encode'
        ? encodeBase64Utf8(input.text)
        : decodeBase64Utf8(input.text);
      const formatted = options.urlSafe && input.mode === 'encode'
        ? result.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
        : result;
      const normalized = options.urlSafe && input.mode === 'decode'
        ? input.text.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(input.text.length / 4) * 4, '=')
        : formatted;
      return { success: true, data: { result: normalized }, durationMs: performance.now() - started };
    } catch (error) { return failure<Base64Output>(error); }
  },
};

// URL encoder/decoder
export interface UrlEncoderInput { text: string; mode: 'encode' | 'decode'; }
export interface UrlEncoderOptions { componentOnly?: boolean; }
export interface UrlEncoderOutput { result: string; }

export const UrlEncoderAdapter: ToolAdapter<UrlEncoderInput, UrlEncoderOptions, UrlEncoderOutput> = {
  id: 'url-encoder-decoder',
  name: 'URL Encoder Adapter',
  isConnected: true,
  async execute(input, options = { componentOnly: true }) {
    const started = performance.now();
    try {
      const result = input.mode === 'encode'
        ? (options.componentOnly === false ? encodeURI(input.text) : transformUrl(input.text, 'encode'))
        : (options.componentOnly === false ? decodeURI(input.text) : transformUrl(input.text, 'decode'));
      return { success: true, data: { result }, durationMs: performance.now() - started };
    } catch (error) { return failure<UrlEncoderOutput>(error); }
  },
};

// UUID v4 / v7 generator
export interface UuidGeneratorInput { count: number; }
export interface UuidGeneratorOptions { version: 'v4' | 'v7'; uppercase?: boolean; hyphens?: boolean; }
export interface UuidGeneratorOutput { uuids: string[]; }

export const UuidGeneratorAdapter: ToolAdapter<UuidGeneratorInput, UuidGeneratorOptions, UuidGeneratorOutput> = {
  id: 'uuid-generator',
  name: 'UUID Generator Adapter',
  isConnected: true,
  async execute(input, options = { version: 'v4' }) {
    const started = performance.now();
    if (!Number.isInteger(input.count) || input.count < 1 || input.count > 1000) {
      return { success: false, error: { code: 'INVALID_COUNT', message: 'Choose a quantity between 1 and 1000.' } };
    }
    try {
      const uuids = Array.from({ length: input.count }, () => {
        let value = generateUuid(options.version);
        if (options.hyphens === false) value = value.replace(/-/g, '');
        return options.uppercase ? value.toUpperCase() : value;
      });
      return { success: true, data: { uuids }, durationMs: performance.now() - started };
    } catch (error) { return failure<UuidGeneratorOutput>(error); }
  },
  validateInput(input) {
    return { valid: Number.isInteger(input.count) && input.count >= 1 && input.count <= 1000, reason: 'Quantity must be an integer from 1 to 1000.' };
  },
};

// SHA digest generator (MD5 is intentionally not included: Web Crypto does not provide it)
export interface HashGeneratorInput { text: string; }
export interface HashGeneratorOptions { algorithms: Array<'MD5' | 'SHA-1' | 'SHA-256' | 'SHA-384' | 'SHA-512'>; uppercase?: boolean; }
export interface HashGeneratorOutput { hashes: Record<string, string>; }

export const HashGeneratorAdapter: ToolAdapter<HashGeneratorInput, HashGeneratorOptions, HashGeneratorOutput> = {
  id: 'hash-generator',
  name: 'Hash Generator Adapter',
  isConnected: true,
  async execute(input, options = { algorithms: ['SHA-256'] }) {
    const started = performance.now();
    try {
      const hashes: Record<string, string> = {};
      for (const algorithm of options.algorithms) {
        if (algorithm === 'MD5') throw new Error('MD5 is not supported by the secure browser Web Crypto API. Choose SHA-1, SHA-256, SHA-384, or SHA-512.');
        const value = await generateDigest(input.text, algorithm);
        hashes[algorithm] = options.uppercase ? value.toUpperCase() : value;
      }
      return { success: true, data: { hashes }, durationMs: performance.now() - started };
    } catch (error) { return failure<HashGeneratorOutput>(error); }
  },
};
