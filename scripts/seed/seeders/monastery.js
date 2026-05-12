import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const IMAGES_DIR = path.resolve(__dirname, '../images');
const DATA_FILE = path.resolve(__dirname, '../data/monastery.json');

function getApiUrl() {
  const envPath = path.resolve(__dirname, '../../../.env');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf-8').split('\n');
    for (const line of lines) {
      const match = line.match(/^VITE_API_URL=(.+)$/);
      if (match) return match[1].trim().replace(/\/$/, '');
    }
  }
  return 'http://localhost:3001/api';
}

function toBase64(imagePath) {
  if (!imagePath) return '';
  const abs = path.resolve(IMAGES_DIR, imagePath);
  if (!fs.existsSync(abs)) {
    console.warn(`  ⚠ Image not found: ${abs} — sending empty string`);
    return '';
  }
  const ext = path.extname(abs).slice(1).toLowerCase();
  const mime = ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : `image/${ext}`;
  const buf = fs.readFileSync(abs);
  return `data:${mime};base64,${buf.toString('base64')}`;
}

function processImageFields(obj) {
  if (typeof obj !== 'object' || obj === null) return obj;
  if (Array.isArray(obj)) return obj.map(processImageFields);

  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    const isImageField = key === 'image' || key.endsWith('_image');
    result[key] = isImageField ? toBase64(value) : processImageFields(value);
  }
  return result;
}

export async function seedMonastery() {
  if (!fs.existsSync(DATA_FILE)) {
    throw new Error(`Data file not found: ${DATA_FILE}`);
  }

  const raw = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
  const processed = processImageFields(raw);

  const payload = { ...processed };

  const apiUrl = getApiUrl();
  console.log(`  API: ${apiUrl}/monastery`);

  await axios.put(`${apiUrl}/monastery`, payload, {
    headers: { 'Content-Type': 'application/json' },
    timeout: 30000,
  });
}
