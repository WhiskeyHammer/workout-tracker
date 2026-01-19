#!/usr/bin/env node
/**
 * Generates a SINGLE Loud Beep WAV file at MAX volume
 * Frequency: 800Hz (Classic Beep)
 * Volume: 1.0 (Max)
 */

const fs = require('fs');
const path = require('path');

// WAV parameters
const sampleRate = 44100;
const frequency = 800; // Classic Beep Pitch
const volume = 1.0;    // MAX VOLUME (Originally was 0.5)
const duration = 0.5;  // 500ms (Slightly longer than original 300ms for better audibility)

const numSamples = Math.floor(sampleRate * duration);
const samples = new Int16Array(numSamples);

// Write tone
for (let i = 0; i < numSamples; i++) {
  const t = i / sampleRate;
  const sample = Math.sin(2 * Math.PI * frequency * t) * volume;
  
  // Envelope to prevent clicking at start/end
  let envelope = 1;
  if (i < 500) envelope = i / 500;
  if (i > numSamples - 500) envelope = (numSamples - i) / 500;
  
  samples[i] = Math.floor(sample * 32767 * envelope);
}

// Create WAV Header
function createWav(samples, sampleRate) {
  const numChannels = 1;
  const bitsPerSample = 16;
  const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
  const blockAlign = numChannels * (bitsPerSample / 8);
  const dataSize = samples.length * (bitsPerSample / 8);
  const fileSize = 36 + dataSize;

  const buffer = Buffer.alloc(44 + dataSize);
  let offset = 0;

  buffer.write('RIFF', offset); offset += 4;
  buffer.writeUInt32LE(fileSize, offset); offset += 4;
  buffer.write('WAVE', offset); offset += 4;
  buffer.write('fmt ', offset); offset += 4;
  buffer.writeUInt32LE(16, offset); offset += 4;
  buffer.writeUInt16LE(1, offset); offset += 2;
  buffer.writeUInt16LE(numChannels, offset); offset += 2;
  buffer.writeUInt32LE(sampleRate, offset); offset += 4;
  buffer.writeUInt32LE(byteRate, offset); offset += 4;
  buffer.writeUInt16LE(blockAlign, offset); offset += 2;
  buffer.writeUInt16LE(bitsPerSample, offset); offset += 2;
  buffer.write('data', offset); offset += 4;
  buffer.writeUInt32LE(dataSize, offset); offset += 4;

  for (let i = 0; i < samples.length; i++) {
    buffer.writeInt16LE(samples[i], offset);
    offset += 2;
  }

  return buffer;
}

const wavBuffer = createWav(samples, sampleRate);

// Write to both locations to ensure the build picks it up
const paths = [
    path.join(__dirname, '..', 'android', 'app', 'src', 'main', 'res', 'raw', 'beep.wav'),
];

paths.forEach(p => {
    try {
        const dir = path.dirname(p);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(p, wavBuffer);
        console.log(`✓ Wrote loud classic beep to: ${p}`);
    } catch (e) {
        console.error(`X Failed to write to ${p}`);
    }
});