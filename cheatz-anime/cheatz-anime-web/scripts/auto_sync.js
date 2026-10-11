const { execSync } = require('child_process');

console.log('🔄 SC-ANIME Auto-Sync Service Started');
console.log('📡 Will sync anime catalog every 1 hour');
console.log('-------------------------------------------\n');

let syncCount = 0;

function runSync() {
  syncCount++;
  const timestamp = new Date().toLocaleString();
  
  console.log(`\n[${timestamp}] 🚀 Starting sync #${syncCount}...`);
  
  try {
    execSync('node scripts/sync_animekill.js', { 
      stdio: 'inherit',
      cwd: __dirname.replace('\\scripts', '')
    });
    console.log(`[${timestamp}] ✅ Sync #${syncCount} completed successfully!`);
  } catch (error) {
    console.error(`[${timestamp}] ❌ Sync #${syncCount} failed:`, error.message);
  }
  
  console.log(`Next sync in 1 hour (at ${new Date(Date.now() + 3600000).toLocaleTimeString()})...\n`);
}

// Run immediately on startup
runSync();

// Then run every hour (3600000 ms)
setInterval(runSync, 3600000);

// Keep the process alive
process.on('SIGINT', () => {
  console.log('\n\n🛑 Auto-sync service stopped by user');
  console.log(`Total syncs performed: ${syncCount}`);
  process.exit(0);
});
