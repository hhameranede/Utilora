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
| Hash generator | Web Crypto SHA-1, SHA-256, SHA-384, SHA-512 (SHA-1 is legacy and not recommended for security) |

MD5 is not exposed by the current browser-native hash workspace. It requires a separate implementation and should not be presented as a secure cryptographic digest.

| Tools | Implementation |
| :--- | :--- |
| Image converter and compressor | Canvas image decode/re-encode with WebP, JPEG, and PNG output; quality and size metrics |
| Image resizer | Canvas resampling with pixel dimensions and aspect-ratio locking |
| Image cropper and rotator | Source-pixel crop rectangle and 90°/180°/270° canvas rotation |
| Image metadata viewer | Pixel dimensions, MIME type, file size, aspect ratio, and sampled transparency; EXIF camera/GPS tags are not extracted |
| PDF merge, split, and rotate | `pdf-lib` in the local browser; supports ordered merge, page ranges/burst split, and selected-page rotation |
| JPG/PNG to PDF | `pdf-lib` image embedding with fit/A4/Letter pages, margins, and orientation controls |
| PDF to JPG/PNG | Mozilla PDF.js renderer with DPI controls and a per-batch page limit |
| PDF page counter | PDF page count, PDF header version, and AcroForm field presence |

## Still preview-only

The five website/domain tools (domain age, RDAP, DNS, website status, HTTP headers) and six video tools remain preview-only. Their interfaces must stay marked as previews until their processing paths, input validation, safety controls, error handling, and downloadable outputs are implemented and tested.

## Engine architecture for remaining tools

| Domain | Planned technology | Execution model |
| :--- | :--- | :--- |
| Image conversion/compression/resize/crop/rotate | Browser Canvas APIs | Main thread currently; large inputs need performance profiling |
| PDF manipulation/rendering | `pdf-lib` + PDF.js | In-memory browser processing; PDF.js worker for rendering |
| Network and diagnostics | Cloudflare Worker with strict URL validation, SSRF protection and rate limiting | Edge API |
| Video processing | WebCodecs / Mediabunny with optional ffmpeg.wasm fallback | Worker where supported |

## Safety and privacy requirements

- Never display a successful result unless the engine actually completed.
- Validate file types, sizes, and user input before processing.
- Keep user files in memory and avoid server persistence unless a future feature explicitly requires it.
- Network tools must defend against private IPs, redirects to internal targets, DNS rebinding, and abuse.
- Long-running operations must support cancellation or clear timeouts.
- Unsupported browsers must receive an honest compatibility message, not a fake output.
