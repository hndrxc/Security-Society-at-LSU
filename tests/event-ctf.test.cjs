const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const { transformSync } = require('next/dist/build/swc');
const { createClient } = require('@supabase/supabase-js');

const competitionId = '00000000-0000-4000-8000-000000000001';
const now = '2026-09-12T00:00:00Z';
const start = '2026-09-11T23:00:00Z';
const end = '2026-09-12T01:00:00Z';
const competition = { id: competitionId, title: 'Attached CTF', is_active: true, starts_at: start, ends_at: end, created_by: 'admin-user' };
const event = { id: 'event-1', title: 'Live workshop', location: 'PFT 1225', is_visible: true, starts_at: start, ends_at: end, ctf_competition_id: competitionId };

function load(file, mocks = {}) {
  const { code } = transformSync(fs.readFileSync(file, 'utf8'), {
    filename: file,
    jsc: { parser: { syntax: 'ecmascript', jsx: true }, transform: { react: { runtime: 'automatic' } }, target: 'es2022' },
    module: { type: 'commonjs' },
  });
  const exports = {};
  vm.runInNewContext(code, {
    exports, process: { env: {} }, File, console,
    Date: class extends Date { constructor(...args) { super(...(args.length ? args : [now])); } },
    require: (name) => {
      if (Object.hasOwn(mocks, name)) return mocks[name];
      if (name === '@/components/ui/Reveal') return ({ children }) => children;
      if (name.startsWith('@/') || name.startsWith('.')) {
        let target = name.startsWith('@/') ? path.join('src', name.slice(2)) : path.join(path.dirname(file), name);
        if (!path.extname(target)) target += fs.existsSync(target + '.jsx') ? '.jsx' : '.js';
        return load(target, mocks);
      }
      return require(name);
    },
  });
  return exports;
}

const helpers = load('utils/events/ctf.js');

// Exercise the real Supabase query builder over an in-memory HTTP fixture.
function database({ events = [event], competitions = [competition], missingColumn = false, admin = true, queryError = false } = {}) {
  const writes = [];
  const client = createClient('https://example.supabase.co', 'test-key', {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: async (input, options) => {
      const url = new URL(input);
      const table = url.pathname.split('/').pop();
      const select = url.searchParams.get('select') || '*';
      if (table === 'profiles') return Response.json({ is_admin: admin, username: 'member' });
      if (queryError && table === 'events') return Response.json({ code: '42501', message: 'permission denied' }, { status: 403 });
      if (missingColumn && table === 'events' && select.includes('ctf_competition')) {
        return Response.json({ code: '42703', message: 'column events.ctf_competition_id does not exist' }, { status: 400 });
      }
      if (['POST', 'PATCH', 'DELETE'].includes(options.method)) {
        writes.push({ table, method: options.method, values: options.body ? JSON.parse(options.body) : null });
        return options.method === 'POST' ? Response.json({ id: 'new-event' }) : new Response(null, { status: 204 });
      }
      let rows = table === 'events' ? events : table === 'ctf_competitions' ? competitions : [];
      rows = rows.map((row) => ({ ...row }));
      if (select.includes('competition:')) {
        rows = rows.map((row) => ({ ...row, competition: competitions.find((c) => c.id === row.ctf_competition_id) || null }));
        if (select.includes('!inner')) rows = rows.filter((row) => row.competition);
      }
      for (const [column, filter] of url.searchParams) {
        if (['select', 'order', 'limit'].includes(column)) continue;
        if (column === 'or') {
          rows = rows.filter((row) => row.ends_at ? Date.parse(row.ends_at) >= Date.parse(now) : Date.parse(row.starts_at) >= Date.parse(now));
          continue;
        }
        const split = filter.indexOf('.');
        const op = filter.slice(0, split);
        const value = filter.slice(split + 1);
        rows = rows.filter((row) => {
          const actual = column.split('.').reduce((obj, key) => obj?.[key], row);
          if (actual == null) return false;
          if (op === 'eq') return String(actual) === value;
          if (op === 'lte') return Date.parse(actual) <= Date.parse(value);
          if (op === 'gte') return Date.parse(actual) >= Date.parse(value);
          if (op === 'in') return value.slice(1, -1).split(',').includes(String(actual));
          throw Error(`Unexpected filter: ${filter}`);
        });
      }
      const orders = (url.searchParams.get('order') || '').split(',').filter(Boolean);
      rows.sort((a, b) => {
        for (const order of orders) {
          const [key, direction] = order.split('.');
          const difference = String(a[key]).localeCompare(String(b[key]));
          if (difference) return difference * (direction === 'desc' ? -1 : 1);
        }
        return 0;
      });
      if (url.searchParams.has('limit')) rows = rows.slice(0, Number(url.searchParams.get('limit')));
      if (select !== '*' && !select.includes('(')) rows = rows.map((row) => Object.fromEntries(select.split(',').map((key) => key.trim()).map((key) => [key, row[key]])));
      return Response.json(new Headers(options.headers).get('accept')?.includes('vnd.pgrst.object') ? rows[0] || null : rows);
    } },
  });
  client.auth.getUser = async () => ({ data: { user: { id: 'admin-user' } } });
  return { client, writes };
}

function form(id = competitionId) {
  const data = new FormData();
  data.set('title', 'Workshop');
  data.set('starts_at', '2026-09-11T23:00');
  data.set('ends_at', '2026-09-12T01:00');
  data.set('timezone', 'UTC');
  data.set('is_visible', 'true');
  data.set('ctf_competition_id', id);
  return data;
}

const link = ({ children, ...props }) => React.createElement('a', props, children);
function pageMocks(client) {
  return {
    'next/link': link,
    'next/image': () => null,
    '@/components/Navbar': () => null,
    '../../utils/supabase/server': { createClient: async () => client },
    '../../utils/events/ctf': helpers,
    '../../../utils/supabase/server': { createClient: async () => client },
    '../../../utils/auth/getAuthData': { getAuthData: async () => ({ user: null, profile: null }) },
  };
}

test('live linked event opens its exact CTF, with timing boundaries included', async () => {
  for (const row of [event, { ...event, starts_at: now }, { ...event, ends_at: now }]) {
    const { client } = database({ events: [row] });
    const Home = load('src/app/page.jsx', pageMocks(client)).default;
    const html = renderToStaticMarkup(await Home());
    assert.match(html, new RegExp(`href="/ctf/${competitionId}"`));
    assert.match(html, /Live workshop/);
  }
});

test('unlinked, hidden, future, ended, and unbounded events cannot promote a CTF', async () => {
  for (const row of [
    { ...event, ctf_competition_id: null },
    { ...event, is_visible: false },
    { ...event, starts_at: end },
    { ...event, ends_at: start },
    { ...event, ends_at: null },
  ]) {
    const { client } = database({ events: [row] });
    assert.equal((await helpers.getLiveCtfEvent(client, now)).data, null);
  }
});

test('hidden or RLS-inaccessible competitions never produce a public banner, even for admins', async () => {
  for (const competitions of [[], [{ ...competition, is_active: false }]]) {
    const { client } = database({ competitions });
    assert.equal((await helpers.getLiveCtfEvent(client, now)).data, null);
  }
});

test('unlinked or hidden CTF events cannot crowd out the earliest eligible event', async () => {
  const { client } = database({ events: [
    { ...event, id: 'unlinked', ends_at: '2026-09-12T00:01:00Z', ctf_competition_id: null },
    { ...event, id: 'later', ends_at: '2026-09-12T02:00:00Z' },
    event,
  ] });
  assert.equal((await helpers.getLiveCtfEvent(client, now)).data.id, event.id);
});

test('homepage stays available when the migration is pending or event lookup fails', async () => {
  for (const options of [{ missingColumn: true }, { queryError: true }]) {
    const { client } = database(options);
    const html = renderToStaticMarkup(await load('src/app/page.jsx', pageMocks(client)).default());
    assert.doesNotMatch(html, /Live event CTF access/);
    assert.match(html, /Hello member!/);
  }
});

test('event listing links visible attached CTFs and survives a pending migration', async () => {
  for (const options of [{}, { missingColumn: true }]) {
    const { client } = database(options);
    const html = renderToStaticMarkup(await load('src/app/events/page.jsx', pageMocks(client)).default());
    assert.match(html, /Live workshop/);
    assert.doesNotMatch(html, /Unable to load events/);
    if (!options.missingColumn) assert.match(html, /View CTF: Attached CTF/);
    else assert.doesNotMatch(html, /View CTF:/);
  }
  const { client } = database({ competitions: [{ ...competition, is_active: false }] });
  const html = renderToStaticMarkup(await load('src/app/events/page.jsx', pageMocks(client)).default());
  assert.doesNotMatch(html, /View CTF:/);
});

test('link validation supports attach, detach, hidden competitions, and disabled selectors', async () => {
  const { client } = database({ competitions: [{ ...competition, is_active: false }] });
  assert.equal((await helpers.getEventCompetitionValues(client, form(), start, end)).values.ctf_competition_id, competitionId);
  assert.equal((await helpers.getEventCompetitionValues(client, form(''), start, end)).values.ctf_competition_id, null);
  const disabled = form(); disabled.delete('ctf_competition_id');
  assert.equal(Object.keys((await helpers.getEventCompetitionValues(client, disabled, start, end)).values).length, 0);
});

test('invalid IDs, missing competitions, missing end times and reversed dates are rejected', async () => {
  const { client } = database();
  for (const [data, endsAt] of [[form('invalid'), end], [form(), null], [form(), start], [form(), '2026-09-11T22:00:00Z']]) {
    assert.ok((await helpers.getEventCompetitionValues(client, data, start, endsAt)).error);
  }
  assert.ok((await helpers.getEventCompetitionValues(database({ competitions: [] }).client, form(), start, end)).error);
});

test('pending migration blocks attaching but permits ordinary event saves', async () => {
  const { client } = database({ missingColumn: true });
  assert.match((await helpers.getEventCompetitionValues(client, form(), start, end)).error, /migration 011/);
  assert.equal(Object.keys((await helpers.getEventCompetitionValues(client, form(''), start, end)).values).length, 0);
});

function actions(client, revalidated) {
  return load('src/app/admin/events/actions.js', {
    '../../../../utils/supabase/server': { createClient: async () => client },
    '../../../../utils/events/ctf': helpers,
    'next/cache': { revalidatePath: (path) => revalidated.push(path) },
  });
}

test('admin create persists the link and invalidates the homepage and listings', async () => {
  const { client, writes } = database();
  const revalidated = [];
  const result = await actions(client, revalidated).createEvent(null, form());
  assert.equal(result.success, true, result.message);
  assert.equal(writes[0].values.ctf_competition_id, competitionId);
  for (const path of ['/', '/events', '/admin/events']) assert.ok(revalidated.includes(path));
});

test('admin update can replace, detach, or preserve a link', async () => {
  for (const mode of ['attach', 'detach', 'preserve']) {
    const { client, writes } = database();
    const revalidated = [];
    const data = form(mode === 'detach' ? '' : competitionId);
    data.set('id', event.id);
    if (mode === 'preserve') data.delete('ctf_competition_id');
    const result = await actions(client, revalidated).updateEvent(null, data);
    assert.equal(result.success, true, result.message);
    const values = writes[0].values;
    if (mode === 'preserve') assert.ok(!Object.hasOwn(values, 'ctf_competition_id'));
    else assert.equal(values.ctf_competition_id, mode === 'detach' ? null : competitionId);
    assert.ok(revalidated.includes('/'));
  }
});

test('non-admin and invalid form submissions do not write events', async () => {
  for (const options of [{ admin: false }, { competitions: [] }]) {
    const { client, writes } = database(options);
    const result = await actions(client, []).createEvent(null, form());
    assert.equal(result.success, false);
    assert.equal(writes.length, 0);
  }
});

test('admin form preselects the link and labels hidden competitions', () => {
  const EventForm = load('src/components/admin/EventForm.jsx', {
    'next/navigation': { useRouter: () => ({}) },
    '@/app/admin/events/actions': {},
  }).default;
  const html = renderToStaticMarkup(React.createElement(EventForm, { event, competitions: [{ ...competition, is_active: false }] }));
  assert.match(html, new RegExp(`value="${competitionId}" selected`));
  assert.match(html, /Attached CTF \(hidden\)/);
  assert.match(html, /No CTF attached/);
  assert.match(html.match(/<input[^>]*name="ends_at"[^>]*>/)[0], /required=""/);
});

test('competition changes invalidate public links and all event admin pages', async () => {
  for (const name of ['createCompetition', 'updateCompetition', 'deleteCompetition']) {
    const { client } = database();
    const revalidated = [];
    const competitionActions = load('src/app/admin/actions.js', {
      '../../../utils/supabase/server': { createClient: async () => client },
      'next/navigation': {},
      'next/cache': { revalidatePath: (...args) => revalidated.push(args) },
    });
    const data = form(); data.set('id', competitionId);
    const result = name === 'deleteCompetition'
      ? await competitionActions[name](competitionId)
      : await competitionActions[name](null, data);
    assert.equal(result.success, true, `${name}: ${result.message}`);
    for (const path of ['/', '/events', '/admin/events', '/admin/events/new']) {
      assert.ok(revalidated.some(([actual]) => actual === path), `${name} invalidates ${path}`);
    }
    assert.ok(revalidated.some(([path, type]) => path === '/admin/events/[id]' && type === 'page'));
  }
});
