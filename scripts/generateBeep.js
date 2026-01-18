#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

// WAV file parameters
const sampleRate = 44100;
const duration = 0.3; // seconds
const frequency = 800; // Hz
const volume = 0.5;

// Generate samples
const numSamples = Math.floor(sampleRate * duration);
const samples = new Int16Array(numSamples);

for (let i = 0; i < numSamples; i++) {
  const t = i / sampleRate;
  const fadeOut = 1 - (i / numSamples);
  const sample = Math.sin(2 * Math.PI * frequency * t) * volume * fadeOut;
  samples[i] = Math.floor(sample * 32767);
}

// Create WAV file
function createWav(samples, sampleRate) {
  const numChannels = 1;
  const bitsPerSample = 16;
  const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
  const blockAlign = numChannels * (bitsPerSample / 8);
  const dataSize = samples.length * (bitsPerSample / 8);
  const fileSize = 36 + dataSize;

  const buffer = Buffer.alloc(44 + dataSize);
  let offset = 0;

  // RIFF header
  buffer.write('RIFF', offset); offset += 4;
  buffer.writeUInt32LE(fileSize, offset); offset += 4;
  buffer.write('WAVE', offset); offset += 4;

  // fmt chunk
  buffer.write('fmt ', offset); offset += 4;
  buffer.writeUInt32LE(16, offset); offset += 4;
  buffer.writeUInt16LE(1, offset); offset += 2;
  buffer.writeUInt16LE(numChannels, offset); offset += 2;
  buffer.writeUInt32LE(sampleRate, offset); offset += 4;
  buffer.writeUInt32LE(byteRate, offset); offset += 4;
  buffer.writeUInt16LE(blockAlign, offset); offset += 2;
  buffer.writeUInt16LE(bitsPerSample, offset); offset += 2;

  // data chunk
  buffer.write('data', offset); offset += 4;
  buffer.writeUInt32LE(dataSize, offset); offset += 4;

  // Write samples
  for (let i = 0; i < samples.length; i++) {
    buffer.writeInt16LE(samples[i], offset);
    offset += 2;
  }

  return buffer;
}

const wavBuffer = createWav(samples, sampleRate);

// DEFINING TARGET PATHS
const paths = [
  // For NativeAudio (Foreground)
  path.join(__dirname, '..', 'android/app/src/main/assets/beep.wav'),
  // For Notification Sound (Background)
  path.join(__dirname, '..', 'android/app/src/main/res/raw/beep.wav')
];

console.log('Generating beep files...');

paths.forEach(targetPath => {
  const dir = path.dirname(targetPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Created directory: ${dir}`);
  }
  fs.writeFileSync(targetPath, wavBuffer);
  console.log(`✓ Wrote: ${targetPath}`);
});

console.log('\nSuccess! Audio files present in both assets and raw folders.');