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

## Browser-local video engines now connected

| Tool | Implementation | Scope and limitations |
| :--- | :--- | :--- |
| Video Compressor | Mediabunny decode/encode to WebM | Applies a selected quality and target resolution locally. Device codec support and memory constrain source size; output size can be larger than the source for some clips. |
| Video to Audio | Mediabunny audio-track extraction and encoding | Exports WAV, MP3, or AAC where the browser has a compatible encoder. Files without an audio track or unsupported codecs return an explicit error. |
| Video Trimmer | Mediabunny time-range trimming and WebM encoding | Exports the requested time range locally; validates duration, track compatibility, and cancellation. |
| Video Metadata Viewer | Native HTMLVideoElement metadata | Reads duration, dimensions, container, aspect ratio, and an estimated average bitrate from file size and duration. Browser playback APIs do not reliably expose stream codecs or frame rate, so those values are explicitly shown as unavailable. |
| Thumbnail Extractor | Native HTMLVideoElement seeking + Canvas | Seeks to a chosen timestamp and exports a PNG or JPEG frame locally. Canvas output is capped at 12 megapixels to reduce memory pressure; supported codecs depend on the browser. |

## Preview-only tool

`video-downloader` remains a UI-only preview. It does not pretend to download media. A future implementation should only accept direct media resources the user is authorized to download; it must not bypass DRM, access controls, or a platform's download restrictions.

The five Website & Domain tools use public read-only services. Domain Age Checker and RDAP Lookup call a same-origin Cloudflare Pages Function that fetches the public RDAP service server-side; DNS Lookup uses a same-origin Pages Function backed by Cloudflare DNS-over-HTTPS. This avoids depending on each registry's browser CORS policy. Website Status and HTTP Headers remain credential-free browser-originated HEAD requests after public DNS validation. A target website that blocks cross-origin response access must remain unknown rather than being labeled offline.

## Technology and remaining engineering work

| Domain | Current execution model | Remaining work |
| :--- | :--- | :--- |
| Image processing | Browser Canvas APIs | Profile large inputs and monitor memory on lower-powered devices |
| PDF manipulation/rendering | `pdf-lib` + PDF.js in the browser | Expand PDF.js browser coverage and stress-test large documents |
| Network diagnostics | Same-origin RDAP and DNS Pages Functions; browser-originated credential-free HEAD requests for target-site checks | Verify live Pages Function deployment and provider rate limits; target-site status/header checks remain subject to the target's CORS policy |
| Video compression, trimming, and audio extraction | Mediabunny browser codecs | Expand browser/device codec coverage and test longer high-resolution clips |
| Direct video downloading | Not connected | Design a permissions-respecting direct-file workflow before enabling processing |

## Safety and privacy requirements

- Never display a successful result unless the engine actually completed.
- Validate file types, sizes, and user input before processing.
- Keep user files in memory and avoid server persistence unless a future feature explicitly requires it.
- The RDAP and DNS Pages Functions accept only validated public hostnames and fixed upstream origins; never turn them into arbitrary URL proxies. Website probes must continue to reject private/reserved DNS answers, avoid credentials, and never follow redirects to internal targets.
- Long-running operations must support cancellation or clear timeouts.
- Unsupported browsers must receive an honest compatibility message, not a fake output.

## Automated smoke-test coverage

- `scripts/test-local-core.ts` exercises the text and developer helper functions, including Unicode text, JSON, Base64, URL encoding, UUID generation, and SHA-256.
- `scripts/test-pdf-core.ts` covers page counting, ordered merge, range and burst splitting, selected-page rotation, image-to-PDF orientation, and rejection of invalid rotation/margin values. PDF.js page rendering still needs browser-level execution coverage.
- `scripts/test-image-core.ts` uses deterministic browser API mocks to test Canvas transforms, crop validation, resizing, rotation/flips, MIME export failures, resource cleanup, pixel metadata, and all six image adapter result contracts.
- `e2e/video-tools.spec.ts` records small WebM fixtures in Chromium and verifies actual compression, time-range trimming, audio extraction, metadata inspection, thumbnail seeking, image/audio/video downloads, and JSON export. Codec availability is tested against the Chromium browser used by CI.
- These are engine-level smoke tests. They do **not** replace browser-based UI, touch interaction, real-device compatibility, or visual regression testing; those remain separate QA tasks.
