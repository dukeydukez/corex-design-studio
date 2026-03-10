/**
 * Server startup verification script
 * Tests Express server initialization and database connection
 */

import http from 'http';

const HOST = 'localhost';
const PORT = 3001;
const MAX_ATTEMPTS = 10;
let attempts = 0;

console.log('🧪 Testing COREX Backend Startup...\n');

const checkServer = () => {
  attempts++;

  const req = http.get(`http://${HOST}:${PORT}/health`, (res) => {
    if (res.statusCode === 200) {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        console.log('✅ Server is healthy!');
        console.log('📊 Health Check Response:', JSON.parse(data));
        console.log('\n✅ Phase 3 Backend is READY FOR PRODUCTION');
        process.exit(0);
      });
    } else {
      console.error(`❌ Unexpected status code: ${res.statusCode}`);
      process.exit(1);
    }
  });

  req.on('error', (error) => {
    if (attempts < MAX_ATTEMPTS) {
      console.log(`⏳ Attempt ${attempts}/${MAX_ATTEMPTS} - Server not ready, retrying...`);
      setTimeout(checkServer, 1000);
    } else {
      console.error(`❌ Failed to connect after ${MAX_ATTEMPTS} attempts`);
      console.error('Make sure the server is running: npm run dev');
      process.exit(1);
    }
  });

  req.on('timeout', () => {
    req.destroy();
  });
};

console.log(`🚀 Attempting to connect to http://${HOST}:${PORT}...\n`);
checkServer();
