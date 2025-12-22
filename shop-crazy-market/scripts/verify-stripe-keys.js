// Script to verify Stripe keys are set (for local testing)
// This checks environment variables, not Vercel directly

console.log('🔍 Checking Stripe Environment Variables...\n');

const requiredKeys = [
  'STRIPE_SECRET_KEY',
  'STRIPE_PUBLISHABLE_KEY',
  'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
  'STRIPE_WEBHOOK_SECRET',
];

const results = requiredKeys.map(key => {
  const value = process.env[key];
  const isSet = !!value;
  const preview = isSet 
    ? (key.includes('SECRET') || key.includes('WEBHOOK')
        ? `${value.substring(0, 10)}...${value.substring(value.length - 4)}` 
        : value.substring(0, 20) + '...')
    : '❌ NOT SET';

  return {
    key,
    isSet,
    preview,
    length: value?.length || 0,
  };
});

console.log('📋 Results:\n');
results.forEach(({ key, isSet, preview, length }) => {
  const status = isSet ? '✅' : '❌';
  const lengthInfo = isSet ? ` (${length} chars)` : '';
  console.log(`${status} ${key}: ${preview}${lengthInfo}`);
});

const allSet = results.every(r => r.isSet);
const missing = results.filter(r => !r.isSet);

console.log('\n' + '='.repeat(50));
if (allSet) {
  console.log('✅ All Stripe keys are set!');
} else {
  console.log(`❌ Missing ${missing.length} key(s):`);
  missing.forEach(({ key }) => {
    console.log(`   - ${key}`);
  });
  console.log('\n💡 To add to Vercel:');
  console.log('   1. Go to: Vercel Project → Settings → Environment Variables');
  console.log('   2. Add each missing key');
  console.log('   3. Redeploy your application');
}
console.log('='.repeat(50));

// Validate key formats
console.log('\n🔐 Validating key formats:\n');

results.forEach(({ key, isSet, preview }) => {
  if (!isSet) return;
  
  const value = process.env[key];
  let isValid = false;
  let expectedFormat = '';

  if (key === 'STRIPE_SECRET_KEY') {
    isValid = value.startsWith('sk_live_') || value.startsWith('sk_test_');
    expectedFormat = 'sk_live_... or sk_test_...';
  } else if (key === 'STRIPE_PUBLISHABLE_KEY' || key === 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY') {
    isValid = value.startsWith('pk_live_') || value.startsWith('pk_test_');
    expectedFormat = 'pk_live_... or pk_test_...';
  } else if (key === 'STRIPE_WEBHOOK_SECRET') {
    isValid = value.startsWith('whsec_');
    expectedFormat = 'whsec_...';
  }

  const status = isValid ? '✅' : '⚠️';
  console.log(`${status} ${key}: ${isValid ? 'Valid format' : `Expected ${expectedFormat}`}`);
});

console.log('\n📝 Note: This checks local environment variables.');
console.log('   For Vercel, check: Project → Settings → Environment Variables');

