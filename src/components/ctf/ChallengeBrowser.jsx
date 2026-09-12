'use client';
import { Activity, useState } from 'react';
import { ToggleGroup } from '@base-ui/react/toggle-group';
import { Toggle } from '@base-ui/react/toggle';
import { useRouter } from 'next/navigation';
import ChallengeCard from './ChallengeCard';

export default function ChallengeBrowser({ challenges, solvedChallenges, unlockedHints, isLoggedIn, competitionActive }) {
  const [category, setCategory] = useState('all');
  const [status, setStatus] = useState(['all']);
  const [confirmed, setConfirmed] = useState({});
  const router = useRouter();
  const solved = new Map(solvedChallenges.map(s => [s.challenge_id, s]));
  const categories = [...new Set(challenges.map(c => c.category || 'misc'))].sort();
  const visible = c => (category === 'all' || (c.category || 'misc') === category) && (!isLoggedIn || status[0] === 'all' || (status[0] === 'solved' ? solved.has(c.id) || confirmed[c.id] : !solved.has(c.id) && !confirmed[c.id]));
  const count = challenges.filter(visible).length;
  return <section aria-label="Challenges">
    <div className="lab-filters"><label className="lab-filter-field">Category<select value={category} onChange={e => setCategory(e.target.value)}><option value="all">All categories</option>{categories.map(c=><option value={c} key={c}>{c.toUpperCase()}</option>)}</select></label>{isLoggedIn && <div className="lab-filter-field"><span>Solve status</span><ToggleGroup aria-label="Solve status" className="lab-toggle-group" value={status} onValueChange={value => { if (value.length) setStatus(value); }}>{['all','unsolved','solved'].map(value=><Toggle key={value} value={value}>{value[0].toUpperCase()+value.slice(1)}</Toggle>)}</ToggleGroup></div>}</div>
    <p role="status" className="lab-muted text-xs mb-5">{count} of {challenges.length} challenges{count === 0 ? ' · No challenges match these filters.' : ''}</p>
    {challenges.map(challenge=><Activity key={challenge.id} mode={visible(challenge) ? 'visible' : 'hidden'}><ChallengeCard challenge={challenge} isSolved={solved.has(challenge.id) || Boolean(confirmed[challenge.id])} solveInfo={solved.get(challenge.id)} unlockedHints={unlockedHints.filter(h=>h.challenge_id === challenge.id)} isLoggedIn={isLoggedIn} competitionActive={competitionActive} onSolve={result=>{setConfirmed(prev=>({...prev,[challenge.id]:result}));router.refresh();}} /></Activity>)}
  </section>;
}
