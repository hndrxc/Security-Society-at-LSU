// In-memory Supabase HTTP substitute. Runs only through the UI test runner.
const http = require('node:http');
const { randomUUID } = require('node:crypto');
const competitionId = '00000000-0000-4000-8000-000000000001';
let db;
let scenario;
function reset(mode = 'normal') {
  scenario = mode;
  const start = new Date(Date.now() - 3600000).toISOString();
  const end = new Date(Date.now() + 86400000).toISOString();
  db = {
    profiles: ['member', 'admin', 'incomplete'].map((id) => ({ id, username: id === 'incomplete' ? '' : id, full_name: id === 'incomplete' ? '' : 'SSL Tester', is_admin: id === 'admin' })),
    ctf_competitions: [{ id: competitionId, title: 'TigerSec / Fall Capture the Flag', description: 'Find the vulnerability. Follow the evidence. Capture the flag. A hands-on competition for curious minds at every skill level.', is_active: true, starts_at: mode === 'upcoming' ? end : start, ends_at: mode === 'ended' ? start : end, created_by: 'admin', rules: 'Work independently. Respect the competition infrastructure. Have fun.' }],
    events: [{ id: 'event-1', title: mode === 'long' ? 'Inside the attack: ' + 'a very long workshop title '.repeat(6) : 'Inside the attack: web security workshop', description: 'Explore how real vulnerabilities work with the Security Society. Bring your laptop, meet your teammates, and build something worth defending.', location: 'PFT 1225', timezone: 'America/Chicago', starts_at: start, ends_at: end, is_visible: true, ctf_competition_id: competitionId }],
    ctf_challenges: ['Headers up', 'Hidden in plain sight', 'Packet trail'].map((title, i) => ({ id: 'challenge-' + i, title, description: 'Investigate the evidence and find the flag hidden in this challenge. Take your time and document what you discover.', competition_id: competitionId, category: i === 1 ? 'crypto' : 'web', difficulty: i === 2 ? 'hard' : 'easy', points: 100 * (i + 1), is_visible: true, flag_format: 'SSL{...}', hint_1: 'Inspect the response headers.', hint_1_cost: 10, sort_order: i })),
    ctf_solves: [{ user_id: 'member', competition_id: competitionId, challenge_id: 'challenge-1', points_awarded: 200, solved_at: start }],
    ctf_hint_unlocks: [], ctf_submissions: [], ctf_collaborators: [],
  };
  if (mode === 'empty') { db.events = []; db.ctf_competitions = []; }
}
function user(id) { return { id, aud: 'authenticated', role: 'authenticated', email: `${id}@ssl.test`, app_metadata: { provider: 'email', providers: ['email'] }, user_metadata: {}, created_at: '2026-01-01T00:00:00Z' }; }
function session(id) {
  const encode = (v) => Buffer.from(JSON.stringify(v)).toString('base64url');
  const exp = Math.floor(Date.now() / 1000) + 3600;
  return { access_token: `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode({ sub: id, exp, role: 'authenticated' })}.fixture`, refresh_token: `fixture-${id}`, token_type: 'bearer', expires_in: 3600, expires_at: exp, user: user(id) };
}
function identity(req) { try { return JSON.parse(Buffer.from(req.headers.authorization.split('.')[1], 'base64url')).sub; } catch { return null; } }
function match(row, column, filter) {
  const actual = column.split('.').reduce((obj, k) => obj?.[k], row);
  const [op, ...rest] = filter.split('.'); const value = rest.join('.');
  if (op === 'eq') return String(actual) === value;
  if (op === 'in') return value.slice(1,-1).split(',').includes(String(actual));
  if (op === 'gte') return actual >= value;
  if (op === 'lte') return actual <= value;
  if (op === 'is') return value === 'null' ? actual == null : String(actual) === value;
  return true;
}
reset();
http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://127.0.0.1');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,PUT,DELETE,OPTIONS,HEAD');
  res.setHeader('Access-Control-Expose-Headers', 'Content-Range');
  res.setHeader('Content-Type', 'application/json');
  const send = (value, status = 200) => { res.statusCode = status; res.end(req.method === 'HEAD' ? '' : JSON.stringify(value)); };
  if (req.method === 'OPTIONS') return send({});
  let raw = ''; for await (const chunk of req) raw += chunk;
  let body; try { body = raw ? JSON.parse(raw) : {}; } catch { body = {}; }
  if (url.pathname === '/__reset') { reset(body.scenario); return send({ ok: true }); }
  if (url.pathname === '/__state') return send(db);
  if (url.pathname === '/__session') return send(session(url.searchParams.get('role') || 'member'));
  const id = identity(req);
  if (url.pathname.startsWith('/auth/v1/')) {
    if (url.pathname.endsWith('/token') || url.pathname.endsWith('/signup')) {
      if (body.password === 'wrong-password') return send({ msg: 'Invalid login credentials', code: 'invalid_credentials' },400);
      return send(session(body.email?.startsWith('admin') ? 'admin' : body.email?.startsWith('incomplete') ? 'incomplete' : 'member'));
    }
    if (url.pathname.endsWith('/user')) return id ? send(user(id)) : send({ msg: 'No session' },401);
    return send({});
  }
  if (url.pathname.startsWith('/storage')) return send({ message: 'Fixture image intentionally missing' },404);
  const table = url.pathname.split('/').pop();
  if (scenario === 'error' && ['events','ctf_competitions'].includes(table)) return send({ message: 'Fixture unavailable', code: '42501' },503);
  if (url.pathname.includes('/rpc/')) {
    if (table === 'get_competition_leaderboard') {
      const entries = [{ rank:1, username:'packetghost', total_points:500, challenges_solved:3, user_id:'other', last_solve_at:new Date().toISOString() }];
      const solves = db.ctf_solves.filter(s => s.user_id === 'member');
      if (solves.length) entries.push({ rank:2, username:'member', total_points:solves.reduce((n,s)=>n+s.points_awarded,0), challenges_solved:solves.length, user_id:'member', last_solve_at:solves[0].solved_at });
      return send(entries);
    }
    if (table === 'verify_ctf_flag') {
      const challenge = db.ctf_challenges.find(c=>c.id === body.p_challenge_id);
      const competition = db.ctf_competitions[0];
      if (!id || Date.now() > Date.parse(competition.ends_at)) return send([{ success:false,message:'Competition not active' }]);
      const success = body.p_submitted_flag === 'SSL{correct}';
      db.ctf_submissions.push({ id:randomUUID(),challenge_id:challenge.id,user_id:id,is_correct:success,submitted_at:new Date().toISOString(),ctf_challenges:{title:challenge.title} });
      if (success && !db.ctf_solves.some(s=>s.user_id === id && s.challenge_id === challenge.id)) db.ctf_solves.push({ user_id:id,competition_id:competition.id,challenge_id:challenge.id,points_awarded:challenge.points-10,solved_at:new Date().toISOString() });
      return send([{ success,message:success?'Correct flag!':'Incorrect flag. Try again.',points_awarded:success?challenge.points-10:0,first_blood:success }]);
    }
    if (table === 'unlock_hint') {
      if (!db.ctf_hint_unlocks.some(h=>h.user_id === id && h.challenge_id === body.p_challenge_id)) db.ctf_hint_unlocks.push({user_id:id,challenge_id:body.p_challenge_id,hint_number:body.p_hint_number,points_deducted:10});
      return send([{success:true,hint_text:'Inspect the response headers.',points_deducted:10}]);
    }
    return send([]);
  }
  let rows = (db[table] || []).map(row => ({ ...row }));
  const select = url.searchParams.get('select') || '*';
  if (select.includes('competition:')) rows = rows.map(row=>({...row,competition:db.ctf_competitions.find(c=>c.id === row.ctf_competition_id)}));
  for (const [column, filter] of url.searchParams) {
    if (['select','order','limit','offset','or'].includes(column)) continue;
    rows = rows.filter(row=>match(row,column,filter));
  }
  if (['POST','PATCH','DELETE'].includes(req.method)) {
    if (req.method === 'DELETE') db[table] = (db[table] || []).filter(r=>!rows.some(row=>row.id === r.id));
    else if (req.method === 'PATCH') { for (const row of rows) Object.assign(db[table].find(r=>r.id === row.id),body); }
    else {
      const record = { id:body.id || randomUUID(),...body };
      const previous = (db[table] || []).find(r=>r.id === record.id);
      if (previous) Object.assign(previous,record); else (db[table] ||= []).push(record);
      rows = [record];
    }
    if (!req.headers.prefer?.includes('return=representation')) { res.statusCode=204; return res.end(); }
  }
  if (url.searchParams.has('limit')) rows = rows.slice(0,Number(url.searchParams.get('limit')));
  res.setHeader('Content-Range', `0-${Math.max(0,rows.length-1)}/${rows.length}`);
  return send(req.headers.accept?.includes('vnd.pgrst.object') ? rows[0] || null : rows);
}).listen(54329,'127.0.0.1',()=>console.log('UI fixture server: 127.0.0.1:54329'));
