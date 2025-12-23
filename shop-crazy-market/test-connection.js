// Test database connection with different URL formats
const { PrismaClient } = require('@prisma/client');

const testUrls = [
  // Option 1: Pooling with project ref username
  'postgresql://postgres.hbufjpxdzmygjnbfsniu:Icemanbaby1991%23@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true',
  
  // Option 2: Pooling with simple username
  'postgresql://postgres:Icemanbaby1991%23@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true',
  
  // Option 3: Direct connection (to verify password)
  'postgresql://postgres:Icemanbaby1991%23@db.hbufjpxdzmygjnbfsniu.supabase.co:5432/postgres',
  
  // Option 4: Different regions
  'postgresql://postgres.hbufjpxdzmygjnbfsniu:Icemanbaby1991%23@aws-0-us-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true',
  'postgresql://postgres.hbufjpxdzmygjnbfsniu:Icemanbaby1991%23@aws-0-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true',
];

async function testConnection(url, name) {
  console.log(`\n🧪 Testing: ${name}`);
  console.log(`URL: ${url.substring(0, 50)}...`);
  
  try {
    process.env.DATABASE_URL = url;
    const prisma = new PrismaClient();
    
    await prisma.$connect();
    const count = await prisma.user.count();
    
    console.log(`✅ SUCCESS! Connected. User count: ${count}`);
    await prisma.$disconnect();
    return true;
  } catch (error) {
    console.log(`❌ FAILED: ${error.message}`);
    return false;
  }
}

async function runTests() {
  console.log('🔍 Testing all connection formats...\n');
  
  const results = await Promise.all([
    testConnection(testUrls[0], 'Option 1: Pooling with project ref (us-east-1)'),
    testConnection(testUrls[1], 'Option 2: Pooling with simple username (us-east-1)'),
    testConnection(testUrls[2], 'Option 3: Direct connection (verify password)'),
    testConnection(testUrls[3], 'Option 4: Pooling with project ref (us-west-1)'),
    testConnection(testUrls[4], 'Option 5: Pooling with project ref (eu-west-1)'),
  ]);
  
  console.log('\n📊 Results Summary:');
  const working = results.filter(r => r).length;
  console.log(`✅ Working: ${working}/${results.length}`);
  
  if (working === 0) {
    console.log('\n❌ None of the connection formats worked!');
    console.log('🔧 Possible issues:');
    console.log('   1. Password is incorrect');
    console.log('   2. Database is paused');
    console.log('   3. Connection pooling not enabled');
    console.log('   4. Region is different');
    console.log('\n💡 Next steps:');
    console.log('   1. Check Supabase dashboard for exact connection string');
    console.log('   2. Verify password in Supabase settings');
    console.log('   3. Check if database is running');
  }
}

runTests().catch(console.error);

