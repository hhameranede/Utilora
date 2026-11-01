import { ToolAdapter } from '../types';
import { convertTextCase, createTextDiff, getTextMetrics, removeDuplicateTextLines, sortTextLines } from '../local-core';

function failure<T>(error: unknown) {
  return {
    success: false,
    error: { code: 'PROCESSING_ERROR', message: error instanceof Error ? error.message : 'Unable to process this text.' },
  } as const;
}

export interface WordCounterInput { text: string; }
export interface WordCounterOutput {
  words: number;
  charactersWithSpaces: number;
  charactersWithoutSpaces: number;
  sentences: number;
  paragraphs: number;
  readingTimeMinutes: number;
  speakingTimeMinutes: number;
}
export const WordCounterAdapter: ToolAdapter<WordCounterInput, Record<string, never>, WordCounterOutput> = {
  id: 'word-counter', name: 'Word Counter Adapter', isConnected: true,
  async execute(input) {
    const started = performance.now();
    const metrics = getTextMetrics(input.text);
    const sentences = input.text.trim() ? (input.text.match(/[.!?؟。！]+(?=\s|$)/gu) ?? []).length || 1 : 0;
    return { success: true, data: {
      words: metrics.words,
      charactersWithSpaces: metrics.charactersTotal,
      charactersWithoutSpaces: metrics.charactersWithoutSpaces,
      sentences,
      paragraphs: metrics.paragraphs,
      readingTimeMinutes: metrics.readingTimeMinutes,
      speakingTimeMinutes: metrics.speakingTimeMinutes,
    }, durationMs: performance.now() - started };
  },
};

export interface CharacterCounterInput { text: string; }
export interface CharacterCounterOutput {
  charactersTotal: number;
  letters: number;
  digits: number;
  spaces: number;
  punctuation: number;
  lines: number;
  limits: { twitter: { current: number; max: 280 }; sms: { current: number; segments: number } };
}
export const CharacterCounterAdapter: ToolAdapter<CharacterCounterInput, Record<string, never>, CharacterCounterOutput> = {
  id: 'character-counter', name: 'Character Counter Adapter', isConnected: true,
  async execute(input) {
    const started = performance.now();
    const metrics = getTextMetrics(input.text);
    const smsSegments = input.text.length <= 160 ? 1 : Math.ceil(input.text.length / 153);
    return { success: true, data: {
      charactersTotal: metrics.charactersTotal,
      letters: metrics.letters,
      digits: metrics.digits,
      spaces: metrics.spaces,
      punctuation: metrics.punctuation,
      lines: metrics.lines,
      limits: { twitter: { current: metrics.charactersTotal, max: 280 }, sms: { current: input.text.length, segments: input.text.length ? smsSegments : 0 } },
    }, durationMs: performance.now() - started };
  },
};

export interface CaseConverterInput { text: string; }
export interface CaseConverterOptions { targetCase: 'upper' | 'lower' | 'title' | 'sentence' | 'camel' | 'snake' | 'kebab'; }
export interface CaseConverterOutput { transformedText: string; }
export const CaseConverterAdapter: ToolAdapter<CaseConverterInput, CaseConverterOptions, CaseConverterOutput> = {
  id: 'case-converter', name: 'Case Converter Adapter', isConnected: true,
  async execute(input, options = { targetCase: 'title' }) {
    const started = performance.now();
    try {
      return { success: true, data: { transformedText: convertTextCase(input.text, options.targetCase) }, durationMs: performance.now() - started };
    } catch (error) { return failure<CaseConverterOutput>(error); }
  },
};

export interface DuplicateLinesRemoverInput { text: string; }
export interface DuplicateLinesRemoverOptions { caseSensitive: boolean; trimWhitespace: boolean; removeEmptyLines: boolean; }
export interface DuplicateLinesRemoverOutput { cleanedText: string; duplicatesRemoved: number; remainingLines: number; }
export const DuplicateLinesRemoverAdapter: ToolAdapter<DuplicateLinesRemoverInput, DuplicateLinesRemoverOptions, DuplicateLinesRemoverOutput> = {
  id: 'duplicate-lines-remover', name: 'Duplicate Lines Remover Adapter', isConnected: true,
  async execute(input, options = { caseSensitive: false, trimWhitespace: true, removeEmptyLines: false }) {
    const started = performance.now();
    try {
      const result = removeDuplicateTextLines(input.text, options);
      return { success: true, data: { cleanedText: result.text, duplicatesRemoved: result.duplicatesRemoved, remainingLines: result.text ? result.text.split('\n').length : 0 }, durationMs: performance.now() - started };
    } catch (error) { return failure<DuplicateLinesRemoverOutput>(error); }
  },
};

export interface SortTextLinesInput { text: string; }
export interface SortTextLinesOptions { mode: 'alphabetical-asc' | 'alphabetical-desc' | 'numeric' | 'length' | 'reverse'; ignoreCase?: boolean; }
export interface SortTextLinesOutput { sortedText: string; }
export const SortTextLinesAdapter: ToolAdapter<SortTextLinesInput, SortTextLinesOptions, SortTextLinesOutput> = {
  id: 'sort-text-lines', name: 'Sort Text Lines Adapter', isConnected: true,
  async execute(input, options = { mode: 'alphabetical-asc', ignoreCase: true }) {
    const started = performance.now();
    try {
      return { success: true, data: { sortedText: sortTextLines(input.text, options.mode, options.ignoreCase) }, durationMs: performance.now() - started };
    } catch (error) { return failure<SortTextLinesOutput>(error); }
  },
};

export interface TextDiffCheckerInput { originalText: string; modifiedText: string; }
export interface TextDiffCheckerOptions { granularity: 'lines' | 'words' | 'characters'; ignoreWhitespace?: boolean; }
export interface TextDiffCheckerOutput {
  diffBlocks: Array<{ type: 'unchanged' | 'added' | 'removed'; value: string; lineNumberOriginal?: number; lineNumberModified?: number }>;
  totalAdditions: number;
  totalDeletions: number;
}
export const TextDiffCheckerAdapter: ToolAdapter<TextDiffCheckerInput, TextDiffCheckerOptions, TextDiffCheckerOutput> = {
  id: 'text-diff-checker', name: 'Text Diff Checker Adapter', isConnected: true,
  async execute(input, options = { granularity: 'lines' }) {
    const started = performance.now();
    try {
      const result = createTextDiff(input.originalText, input.modifiedText, options.granularity === 'characters' ? 'chars' : options.granularity);
      return { success: true, data: { diffBlocks: result.blocks, totalAdditions: result.additions, totalDeletions: result.deletions }, durationMs: performance.now() - started };
    } catch (error) { return failure<TextDiffCheckerOutput>(error); }
  },
};
