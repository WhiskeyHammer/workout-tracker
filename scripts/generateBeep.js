#!/usr/bin/env node
/**
 * Generates a simple beep WAV file for the timer notification
 * Usage: node scripts/generateBeep.js
 * Output: beep.wav in the project root
 */

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
  // Sine wave with fade out
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
  buffer.writeUInt32LE(16, offset); offset += 4; // chunk size
  buffer.writeUInt16LE(1, offset); offset += 2; // audio format (PCM)
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
const outputPath = path.join(__dirname, '..', 'beep.wav');

fs.writeFileSync(outputPath, wavBuffer);
console.log(`Generated beep.wav (${duration}s, ${frequency}Hz) at: ${outputPath}`);
console.log('');
console.log('To use with the app, copy it to:');
console.log('  android/app/src/assets/beep.mp3');
console.log('');
console.log('Commands:');
console.log('  mkdir -p android/app/src/assets');
console.log('  cp beep.wav android/app/src/assets/beep.mp3');
