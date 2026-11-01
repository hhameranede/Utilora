import { expect, test, type Page } from '@playwright/test';
import { readFile } from 'node:fs/promises';

async function makeWebm(page: Page, withAudio = false): Promise<Buffer> {
  const bytes = await page.evaluate(async () => {
    const mimeType = withAudio ? 'video/webm;codecs=vp8,opus' : 'video/webm;codecs=vp8';
    if (!MediaRecorder.isTypeSupported(mimeType)) {
      throw new Error('Chromium does not support the WebM VP8 fixture required by this test.');
    }

    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 360;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Canvas is unavailable for the video fixture.');

    let frame = 0;
    const draw = () => {
      context.fillStyle = frame % 2 === 0 ? '#d6a84b' : '#334155';
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.fillStyle = '#ffffff';
      context.font = 'bold 36px sans-serif';
      context.fillText('UTILORA FRAME ' + frame, 28, 70);
      frame += 1;
    };
    draw();

    const stream = canvas.captureStream(12);
    let audioContext: AudioContext | null = null;
    let oscillator: OscillatorNode | null = null;
    let recorderStream = stream;
    if (withAudio) {
      audioContext = new AudioContext();
      const destination = audioContext.createMediaStreamDestination();
      oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      gain.gain.value = 0.025;
      oscillator.frequency.value = 440;
      oscillator.connect(gain);
      gain.connect(destination);
      oscillator.start();
      recorderStream = new MediaStream([
        ...stream.getVideoTracks(),
        ...destination.stream.getAudioTracks(),
      ]);
    }
    const recorder = new MediaRecorder(recorderStream, { mimeType });
    const chunks: BlobPart[] = [];
    recorder.addEventListener('dataavailable', (event) => {
      if (event.data.size > 0) chunks.push(event.data);
    });
    const stopped = new Promise<void>((resolve) => {
      recorder.addEventListener('stop', () => resolve(), { once: true });
    });

    recorder.start(100);
    const interval = window.setInterval(draw, 80);
    await new Promise((resolve) => window.setTimeout(resolve, 1300));
    window.clearInterval(interval);
    recorder.stop();
    await stopped;
    recorderStream.getTracks().forEach((track) => track.stop());
    if (oscillator) oscillator.stop();
    if (audioContext) await audioContext.close();

    const blob = new Blob(chunks, { type: mimeType });
    if (blob.size < 1000) throw new Error('The browser produced an empty WebM fixture.');
    return Array.from(new Uint8Array(await blob.arrayBuffer()));
  });

  return Buffer.from(bytes);
}

test('video metadata viewer reads real browser-exposed metadata and exports JSON', async ({ page }) => {
  await page.goto('/en/tools/video-metadata-viewer');
  await page.locator('input[type="file"]').setInputFiles({
    name: 'utilora-fixture.webm',
    mimeType: 'video/webm',
    buffer: await makeWebm(page),
  });

  await page.getByRole('button', { name: 'Inspect video metadata' }).click();
  await expect(page.getByRole('status')).toContainText('Video metadata extracted successfully.');
  await expect(page.getByText('WebM', { exact: true })).toBeVisible();
  await expect(page.getByText('640 × 360', { exact: true })).toBeVisible();
  await expect(page.getByText('16:9', { exact: true })).toBeVisible();
  await expect(page.getByText('Not exposed by this browser').first()).toBeVisible();

  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export JSON' }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe('utilora-fixture-metadata.json');
  expect(await download.failure()).toBeNull();
  const path = await download.path();
  expect(path).not.toBeNull();
  const payload = JSON.parse(await readFile(path!, 'utf8'));
  expect(payload.metadata.dimensions).toEqual({ width: 640, height: 360 });
  expect(payload.metadata.aspectRatio).toBe('16:9');
  expect(payload.metadata.videoCodec).toBeNull();
  expect(payload.notes.bitrate).toContain('Estimated');
});

test('thumbnail extractor captures a selected frame and downloads a real JPEG', async ({ page }) => {
  await page.goto('/en/tools/thumbnail-extractor');
  await page.locator('input[type="file"]').setInputFiles({
    name: 'frame-fixture.webm',
    mimeType: 'video/webm',
    buffer: await makeWebm(page),
  });

  const extractButton = page.getByRole('button', { name: 'Extract thumbnail' });
  await expect(extractButton).toBeEnabled();
  await page.getByLabel('Timestamp (seconds)').fill('0.5');
  await page.getByRole('button', { name: 'jpg', exact: true }).click();
  await extractButton.click();

  await expect(page.getByRole('status')).toContainText('Video frame extracted successfully.');
  const preview = page.getByAltText('Extracted video frame');
  await expect(preview).toBeVisible();
  await expect(preview).toHaveJSProperty('naturalWidth', 640);

  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('link', { name: 'Download image' }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe('frame-fixture-frame-0.50.jpg');
  expect(await download.failure()).toBeNull();
  const path = await download.path();
  expect(path).not.toBeNull();
  const bytes = await readFile(path!);
  expect(bytes[0]).toBe(0xff);
  expect(bytes[1]).toBe(0xd8);
});

test('video compressor produces a downloadable WebM file from a real video fixture', async ({ page }) => {
  await page.goto('/en/tools/video-compressor');
  await page.getByLabel('Choose a video file').setInputFiles({
    name: 'compress-fixture.webm',
    mimeType: 'video/webm',
    buffer: await makeWebm(page),
  });

  await page.getByLabel('Compression quality').selectOption('balanced');
  await page.getByLabel('Output resolution').selectOption('original');
  await page.getByRole('button', { name: 'Compress video' }).click();
  await expect(page.getByRole('status')).toContainText('File ready', { timeout: 60_000 });

  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('link', { name: 'Download video' }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe('compress-fixture-compressed.webm');
  expect(await download.failure()).toBeNull();
  const path = await download.path();
  expect(path).not.toBeNull();
  const bytes = await readFile(path!);
  expect(bytes.byteLength).toBeGreaterThan(1000);
  expect(Array.from(bytes.slice(0, 4))).toEqual([0x1a, 0x45, 0xdf, 0xa3]);
});

test('video trimmer exports only the selected time range as a real WebM file', async ({ page }) => {
  await page.goto('/en/tools/video-trimmer');
  await page.getByLabel('Choose a video file').setInputFiles({
    name: 'trim-fixture.webm',
    mimeType: 'video/webm',
    buffer: await makeWebm(page),
  });

  await expect(page.locator('#video-trim-end')).toHaveValue(/^[1-9]/, { timeout: 15_000 });
  await page.locator('#video-trim-start').fill('0.10');
  await page.locator('#video-trim-end').fill('0.80');
  await page.getByRole('button', { name: 'Export selected clip' }).click();
  await expect(page.getByRole('status')).toContainText('File ready', { timeout: 60_000 });

  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('link', { name: 'Download video' }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe('trim-fixture-trimmed.webm');
  expect(await download.failure()).toBeNull();
  const path = await download.path();
  expect(path).not.toBeNull();
  expect((await readFile(path!)).byteLength).toBeGreaterThan(1000);
});

test('video-to-audio extracts an audio track and exports a valid WAV file', async ({ page }) => {
  await page.goto('/en/tools/video-to-audio');
  await page.getByLabel('Choose a video file').setInputFiles({
    name: 'audio-fixture.webm',
    mimeType: 'video/webm',
    buffer: await makeWebm(page, true),
  });

  await page.getByLabel('Audio format').selectOption('wav');
  await page.getByRole('button', { name: 'Extract audio' }).click();
  await expect(page.getByRole('status')).toContainText('File ready', { timeout: 60_000 });

  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('link', { name: 'Download audio' }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe('audio-fixture.wav');
  expect(await download.failure()).toBeNull();
  const path = await download.path();
  expect(path).not.toBeNull();
  const bytes = await readFile(path!);
  expect(bytes.subarray(0, 4).toString('ascii')).toBe('RIFF');
  expect(bytes.subarray(8, 12).toString('ascii')).toBe('WAVE');
});
