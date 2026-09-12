export async function getLiveCtfEvent(supabase, now) {
  // Filter before limiting: an unlinked event or a hidden competition must not
  // hide another live event with an available CTF. The join also respects RLS.
  return supabase
    .from('events')
    .select('id,title,location,ends_at,ctf_competition_id,competition:ctf_competitions!events_ctf_competition_id_fkey!inner(id,is_active)')
    .eq('is_visible', true)
    .eq('competition.is_active', true)
    .lte('starts_at', now)
    .gte('ends_at', now)
    .order('ends_at', { ascending: true })
    .order('id', { ascending: true })
    .limit(1)
    .maybeSingle();
}

export async function getEventCompetitionValues(supabase, formData, startsAt, endsAt) {
  // A disabled selector (e.g. options failed to load) must preserve the link.
  if (!formData.has('ctf_competition_id')) return { values: {} };

  const id = formData.get('ctf_competition_id')?.toString().trim() || null;
  if (id && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    return { error: 'Select a valid CTF competition.' };
  }
  if (id && (!endsAt || !Number.isFinite(Date.parse(endsAt)) || Date.parse(endsAt) <= Date.parse(startsAt))) {
    return { error: 'An event with a CTF needs an end time after its start time.' };
  }

  const { error: columnError } = await supabase.from('events').select('ctf_competition_id').limit(0);
  if (columnError) {
    if (['42703', 'PGRST204'].includes(columnError.code) && columnError.message?.includes('ctf_competition_id')) {
      return id
        ? { error: 'Event CTF links are not configured yet. Apply database migration 011.' }
        : { values: {} };
    }
    return { error: 'Unable to verify event CTF support. Please try again.' };
  }

  if (id) {
    const { data, error } = await supabase.from('ctf_competitions').select('id').eq('id', id).maybeSingle();
    if (error || !data) return { error: 'The selected CTF is no longer available. Reload and choose another competition.' };
  }

  return { values: { ctf_competition_id: id } };
}
