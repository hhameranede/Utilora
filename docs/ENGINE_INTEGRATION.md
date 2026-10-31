# Phase 2 Engine Integration Architecture

All heavy processing logic in UTILORA connects through the `ToolAdapter<TInput, TOptions, TOutput>` interface defined in `src/engines/types.ts`.

## 1. Adapter Contract Structure

```typescript
export interface ToolAdapter<TInput, TOptions, TOutput> {
  readonly id: string;
  readonly name: string;
  readonly isConnected: boolean;

  execute(
    input: TInput,
    options?: TOptions,
    onProgress?: (progress: EngineProgress) => void
  ): Promise<EngineExecutionResult<TOutput>>;

  cancel?(): void;
  validateInput?(input: TInput): { valid: boolean; reason?: string };
}
```

## 2. Recommended Engine Technologies for Phase 2

| Domain | Recommended Technology | Execution Model |
| :--- | :--- | :--- |
| **Image Compression** | `mozjpeg-wasm`, `oxipng-wasm`, `libwebp-wasm` | Web Worker |
| **Image Resize/Crop** | OffscreenCanvas + Pica / WebGL Lanczos shader | GPU/Worker |
| **PDF Manipulation** | `pdf-lib` + `pdfjs-dist` | In-memory Worker |
| **Text & Diff** | Unicode `Intl.Segmenter` + Myers Diff Algorithm | Main/Worker |
| **JSON & Encoding** | Browser Native `JSON.parse` streaming + `SubtleCrypto` | Native APIs |
| **Network & Diagnostics** | Cloudflare Worker edge proxies (DoH, RDAP proxy) | Edge API |
| **Video Processing** | WebCodecs API + `@ffmpeg/ffmpeg` (WASM) | SharedArrayBuffer Worker |

## 3. Disconnection Safeguards
In Phase 1, `isConnected` evaluates to `false` for all adapters. UI components inspect this flag through `DisabledAction.tsx`, preventing dead clicks or misleading promises of processed outputs.
