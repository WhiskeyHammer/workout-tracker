const esbuild = require('esbuild');

// Define all files you want to watch here
const builds = [
  {
    label: 'Timer Service',
    entryPoints: ['scripts/timerService.src.js'],
    outfile: 'public/js/utils/timerService.js',
    bundle: true,
    platform: 'browser',
  },
  {
    label: 'Wake Lock',
    entryPoints: ['scripts/wakeLock.src.js'],
    outfile: 'public/js/utils/wakeLock.js',
    bundle: true,
    platform: 'browser',
  }
];

async function startWatch() {
  console.log('--- Starting Watch Mode ---');
  
  const ctxs = await Promise.all(builds.map(async (options) => {
    const ctx = await esbuild.context({
      ...options,
      plugins: [{
        name: 'logger',
        setup(build) {
          build.onEnd(result => {
            const timestamp = new Date().toLocaleTimeString();
            if (result.errors.length > 0) {
              console.error(`[${timestamp}] ❌ ${options.label} build failed:`, result.errors);
            } else {
              console.log(`[${timestamp}] ✅ ${options.label} updated`);
            }
          });
        },
      }],
    });
    
    await ctx.watch();
    return ctx;
  }));

  console.log(`Watching ${ctxs.length} files... (Press Ctrl+C to stop)`);
}

startWatch().catch(e => {
  console.error(e);
  process.exit(1);
});