/**
 * UTILORA Future Engine Integration Contracts
 * Standardized adapter interfaces for Phase 2 engine connections.
 * 
 * DESIGN RULE:
 * The frontend UI strictly communicates through these contracts.
 * Real WASM binaries, FFmpeg.wasm, pdf-lib, DNS resolvers, and Workers
 * will implement these adapters in Phase 2 without requiring UI redesigns.
 */

export interface EngineProgress {
  stage: string;
  percent: number; // 0 - 100
  bytesProcessed?: number;
  totalBytes?: number;
  message?: string;
}

export type EngineStatus =
  | 'idle'
  | 'initializing'
  | 'processing'
  | 'completed'
  | 'error'
  | 'cancelled';

export interface EngineError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface EngineExecutionResult<TOutput> {
  success: boolean;
  data?: TOutput;
  error?: EngineError;
  durationMs?: number;
}

export interface ToolAdapter<TInput, TOptions, TOutput> {
  readonly id: string;
  readonly name: string;
  readonly isConnected: boolean; // false until Phase 2 engine is wired

  /**
   * Execute processing with input data and optional settings
   */
  execute(
    input: TInput,
    options?: TOptions,
    onProgress?: (progress: EngineProgress) => void
  ): Promise<EngineExecutionResult<TOutput>>;

  /**
   * Abort ongoing operation if supported
   */
  cancel?(): void;

  /**
   * Check whether input fulfills format and constraint checks
   */
  validateInput?(input: TInput): { valid: boolean; reason?: string };
}
