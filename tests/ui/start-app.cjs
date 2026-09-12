const { spawn } = require('node:child_process');
const server = spawn(process.execPath, ['node_modules/next/dist/bin/next', process.env.UI_PRODUCTION === '1' ? 'start' : 'dev', '--port', '3100'], {
  stdio:'inherit', env:{...process.env,NEXT_PUBLIC_SUPABASE_URL:'http://127.0.0.1:54329',NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:'fixture-key',NEXT_PUBLIC_SITE_URL:'http://localhost:3100',NEXT_PUBLIC_DISCORD_SERVER_ID:'',NEXT_PUBLIC_DISCORD_INVITE:'https://discord.gg/fixture',NEXT_PUBLIC_UI_TRANSITIONS:process.env.NEXT_PUBLIC_UI_TRANSITIONS || '0'},
});
for (const signal of ['SIGINT','SIGTERM']) process.on(signal,()=>server.kill(signal));
server.on('exit',code=>process.exit(code ?? 1));
