/**
 * VILLEXA / DIGITAL SHOWROOM — PREFLIGHT CLIENT CONFIGURATION VALIDATOR
 * 
 * Verifies that client branding, contact credentials, theme colors, and
 * backend environment settings are valid and safe before building or deploying.
 * 
 * Run with: node scripts/validate-config.mjs [--mode production]
 */

import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const isProduction = process.argv.includes('--production') || process.env.NODE_ENV === 'production';

console.log('\n======================================================');
console.log('  DIGITAL SHOWROOM — PREFLIGHT CONFIGURATION CHECK    ');
console.log(`  Mode: ${isProduction ? 'PRODUCTION' : 'DEVELOPMENT'} `);
console.log('======================================================\n');

// Read active environment variables from .env files if present
function parseEnvFile(filePath) {
  if (!existsSync(filePath)) return {};
  const content = readFileSync(filePath, 'utf-8');
  const env = {};
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx !== -1) {
      const key = trimmed.slice(0, eqIdx).trim();
      let val = trimmed.slice(eqIdx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      env[key] = val;
    }
  }
  return env;
}

const rootDir = process.cwd();
const envLocal = parseEnvFile(resolve(rootDir, '.env.local'));
const envDefault = parseEnvFile(resolve(rootDir, '.env'));

const activeEnv = {
  ...envDefault,
  ...envLocal,
  ...process.env
};

const errors = [];
const warnings = [];
const notes = [];

// 1. BRAND IDENTITY CHECKS
const brandName = activeEnv.VITE_CLIENT_BRAND_NAME || 'VILLEXA';
if (!brandName || brandName.trim().length < 2) {
  errors.push('VITE_CLIENT_BRAND_NAME must be at least 2 characters.');
} else {
  notes.push(`Brand Name: "${brandName}"`);
}

// 2. CONTACT DETAILS CHECKS
const contactEmail = activeEnv.VITE_CLIENT_CONTACT_EMAIL || 'concierge@villexa.com';
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(contactEmail)) {
  errors.push(`VITE_CLIENT_CONTACT_EMAIL "${contactEmail}" is not a valid email address.`);
} else {
  notes.push(`Contact Email: "${contactEmail}"`);
}

const whatsappNumber = activeEnv.VITE_CLIENT_WHATSAPP_NUMBER || '18004821980';
const digitsOnly = whatsappNumber.replace(/\D/g, '');
if (digitsOnly.length < 7) {
  errors.push(`VITE_CLIENT_WHATSAPP_NUMBER "${whatsappNumber}" must contain at least 7 digits.`);
} else {
  notes.push(`WhatsApp Concierge Number: "${whatsappNumber}" (${digitsOnly.length} digits)`);
}

// 3. THEME ACCENT TOKENS
const hexColorRegex = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;
const accentColor = activeEnv.VITE_CLIENT_THEME_ACCENT || '#d4af37';
if (!hexColorRegex.test(accentColor)) {
  errors.push(`VITE_CLIENT_THEME_ACCENT "${accentColor}" is not a valid hex color code.`);
}

// 4. SUPABASE CREDENTIALS & ISOLATION PREFLIGHT
const supabaseUrl = activeEnv.VITE_SUPABASE_URL || '';
const supabaseAnonKey = activeEnv.VITE_SUPABASE_ANON_KEY || '';

// Security: Check for accidental leak of service-role key
for (const [key, val] of Object.entries(activeEnv)) {
  if (key.includes('SERVICE_ROLE') && key.startsWith('VITE_')) {
    errors.push(`CRITICAL SECURITY VIOLATION: Never prefix service-role key with VITE_ (${key}). It would be bundled into client JavaScript!`);
  }
}

if (!supabaseUrl && !supabaseAnonKey) {
  if (isProduction) {
    warnings.push('Production build initiated without VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY. The showroom will operate in offline/catalog-fallback mode.');
  } else {
    notes.push('Backend: Disconnected Local Sandbox Mode (No Supabase URL provided)');
  }
} else if ((supabaseUrl && !supabaseAnonKey) || (!supabaseUrl && supabaseAnonKey)) {
  errors.push('Partial Supabase configuration: Both VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be provided together.');
} else {
  // Both provided
  if (supabaseUrl.includes('YOUR-PROJECT') || supabaseUrl.includes('placeholder')) {
    errors.push('VITE_SUPABASE_URL contains placeholder text instead of real project domain.');
  } else if (!supabaseUrl.startsWith('https://')) {
    errors.push('VITE_SUPABASE_URL must begin with https://');
  }

  if (supabaseAnonKey.includes('YOUR-ANON-KEY') || supabaseAnonKey.includes('placeholder')) {
    errors.push('VITE_SUPABASE_ANON_KEY contains placeholder text instead of real anonymous key.');
  } else if (supabaseAnonKey.split('.').length !== 3) {
    warnings.push('VITE_SUPABASE_ANON_KEY does not follow standard JWT structure (3 dot-separated segments). Verify key in Supabase Dashboard.');
  }

  notes.push(`Supabase Project URL: "${supabaseUrl}"`);
}

// 5. FEATURE FLAGS INTEGRITY
const featureKeys = [
  'VITE_FEATURE_3D_VIEWER',
  'VITE_FEATURE_360_TURNTABLE',
  'VITE_FEATURE_SHOWROOM_VIDEO',
  'VITE_FEATURE_BESPOKE_INQUIRY',
  'VITE_FEATURE_PRICE_DISPLAY',
  'VITE_FEATURE_COLLECTIONS',
  'VITE_FEATURE_INSPIRATION',
  'VITE_FEATURE_CRAFTSMANSHIP'
];

for (const fk of featureKeys) {
  const val = activeEnv[fk];
  if (val !== undefined && val !== 'true' && val !== 'false') {
    errors.push(`Feature flag ${fk} must be "true" or "false" (received: "${val}").`);
  }
}

// REPORT RESULTS
console.log('--- Configuration Summary ---');
for (const n of notes) {
  console.log(` [OK] ${n}`);
}

if (warnings.length > 0) {
  console.log('\n--- Warnings ---');
  for (const w of warnings) {
    console.log(` [!] ${w}`);
  }
}

if (errors.length > 0) {
  console.log('\n--- Configuration Errors ---');
  for (const e of errors) {
    console.log(` [X] ${e}`);
  }
  console.log('\n❌ Preflight validation FAILED. Resolve the issues above before proceeding.\n');
  process.exit(1);
} else {
  console.log('\n✅ Preflight configuration check PASSED.\n');
  process.exit(0);
}
