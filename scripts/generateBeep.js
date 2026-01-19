#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

// 1.5 seconds of a solid 880Hz tone (A5)
const sampleRate = 44100;
const duration = 1.5;
const frequency = 880;
const volume = 1.0; 

const numSamples = Math.floor(sampleRate * duration);
const samples = new Int16Array(numSamples);

for (let i = 0; i < numSamples; i++) {
  const t = i / sampleRate;
  const sample = Math.sin(2 * Math.PI * frequency * t) * volume;
  // Simple fade in/out to avoid clicking
  let envelope = 1;
  if (i < 1000) envelope = i / 1000;
  if (i > numSamples - 1000) envelope = (numSamples - i) / 1000;
  samples[i] = Math.floor(sample * 32767 * envelope);
}

const byteRate = sampleRate * 2; // 16-bit mono
const blockAlign = 2;
const dataSize = samples.length * 2;
const fileSize = 36 + dataSize;

const buffer = Buffer.alloc(44 + dataSize);
let o = 0;

// Standard RIFF WAVE header
buffer.write('RIFF', o); o+=4;
buffer.writeUInt32LE(fileSize, o); o+=4;
buffer.write('WAVE', o); o+=4;
buffer.write('fmt ', o); o+=4;
buffer.writeUInt32LE(16, o); o+=4; // Subchunk1Size (16 for PCM)
buffer.writeUInt16LE(1, o); o+=2;  // AudioFormat (1 = PCM)
buffer.writeUInt16LE(1, o); o+=2;  // NumChannels (1 = Mono)
buffer.writeUInt32LE(sampleRate, o); o+=4;
buffer.writeUInt32LE(byteRate, o); o+=4;
buffer.writeUInt16LE(blockAlign, o); o+=2;
buffer.writeUInt16LE(16, o); o+=2; // BitsPerSample
buffer.write('data', o); o+=4;
buffer.writeUInt32LE(dataSize, o); o+=4;

for (let i = 0; i < samples.length; i++) {
  buffer.writeInt16LE(samples[i], o);
  o += 2;
}

// Write to raw (for Notification) and assets (for App)
const paths = [
    path.join(__dirname, '..', 'android/app/src/main/res/raw/beep.wav'),
    path.join(__dirname, '..', 'android/app/src/main/assets/beep.wav')
];

paths.forEach(p => {
    const dir = path.dirname(p);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(p, buffer);
    console.log(`✓ Wrote beep to: ${p}`);
});