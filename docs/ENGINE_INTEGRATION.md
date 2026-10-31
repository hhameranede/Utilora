# Browser Engine Integration

UTILORA separates executable browser-local tools from preview workspaces. The adapter interface in `src/engines/types.ts` standardizes typed inputs, outputs, timing, and error handling.

## Browser-local engines currently connected

The modules below execute on the client and do not upload input text to a server:

| Tools | Implementation |
| :--- | :--- |
| Word and character counters | Unicode-aware local text metrics |
| Case converter | Upper, lower, title, sentence, camel, snake, kebab transformations |
| Duplicate line remover | Configurable case sensitivity, trimming, and empty-line handling |
| Text line sorter | Alphabetical, reverse, numeric, and length sorting |
| Text diff checker | Line, word, and character comparison with a bounded LCS matrix |
| JSON formatter, validator, minifier | Native `JSON.parse` / `JSON.stringify` |
| Base64 encoder/decoder | UTF-8 safe `TextEncoder` / `TextDecoder` |
| URL encoder/decoder | Browser URI encoding APIs |
| UUID generator | Web Crypto random values, UUID v4 and v7 |
| Hash generator | Web Crypto SHA-256, SHA-384, SHA-512 (SHA-1 can be requested through the adapter but is not recommended for security) |

MD5 is not exposed by the current browser-native hash workspace. It requires a separate implementation and should not be presented as a secure cryptographic digest.

## Still preview-only

Image manipulation, PDF handling, video processing, downloading, RDAP, DNS, HTTP status, and header inspection are not yet connected to complete production engines. Their interfaces may exist, but they must remain marked as previews until their processing paths, validation, error handling, and output downloads are implemented and tested.

## Engine architecture for remaining tools

| Domain | Planned technology | Execution model |
| :--- | :--- | :--- |
| Image compression/conversion | Browser Canvas APIs and dedicated codecs | Web Worker where practical |
| Image resize/crop/rotate | Canvas / OffscreenCanvas | Main thread or Worker |
| PDF manipulation | `pdf-lib` + PDF.js | In-memory Worker |
| Network and diagnostics | Cloudflare Worker with strict URL validation, SSRF protection and rate limiting | Edge API |
| Video processing | WebCodecs / Mediabunny with optional ffmpeg.wasm fallback | Worker where supported |

## Safety and privacy requirements

- Never display a successful result unless the engine actually completed.
- Validate file types, sizes, and user input before processing.
- Keep user files in memory and avoid server persistence unless a future feature explicitly requires it.
- Network tools must defend against private IPs, redirects to internal targets, DNS rebinding, and abuse.
- Long-running operations must support cancellation or clear timeouts.
- Unsupported browsers must receive an honest compatibility message, not a fake output.
