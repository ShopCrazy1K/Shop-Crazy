const dbUrl = 'postgresql://postgres.hbufjpxdzmygjnbfsniu:Puggyboy11281991@aws-1-us-east-2.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1&sslmode=require';
const url = new URL(dbUrl);
console.log('✅ URL format valid');
console.log('Protocol:', url.protocol);
console.log('Host:', url.hostname);
console.log('Port:', url.port);
console.log('Has pgbouncer:', url.searchParams.get('pgbouncer'));
console.log('\n✅ Ready to add to Vercel!');
