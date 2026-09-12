'use client';
import { useEffect, useMemo, useState } from 'react';
import { createClient } from '../../utils/supabase/client';

export function useStorageImage({ bucket, path, expiresIn = 3600 } = {}) {
  const supabase = useMemo(() => createClient(), []);
  const [revision, setRevision] = useState(0);
  const key = `${bucket}/${path}/${expiresIn}/${revision}`;
  const [result, setResult] = useState(null);
  useEffect(() => {
    if (!bucket || !path) return;
    let cancelled = false;
    async function fetchUrl() {
      try {
        const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, expiresIn);
        const url = data?.signedUrl || supabase.storage.from(bucket).getPublicUrl(path).data?.publicUrl || null;
        if (!cancelled) setResult({ key, url, error });
      } catch (error) {
        if (!cancelled) setResult({ key, url: null, error });
      }
    }
    fetchUrl();
    return () => { cancelled = true; };
  }, [bucket, path, expiresIn, revision, key, supabase]);
  const current = result?.key === key ? result : null;
  return { url: current?.url || null, loading: Boolean(bucket && path && !current), error: current?.error || null, refresh: () => setRevision(r => r + 1) };
}
