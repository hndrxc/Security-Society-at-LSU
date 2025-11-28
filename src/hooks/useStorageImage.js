"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "../../utils/supabase/client";

/**
 * Simple helper to read a Supabase Storage object and return a temporary URL.
 */
export function useStorageImage({ bucket, path, expiresIn = 3600 } = {}) {
  const supabase = useMemo(() => createClient(), []);
  const [url, setUrl] = useState(null);
  const [loading, setLoading] = useState(Boolean(path));
  const [error, setError] = useState(null);

  const fetchUrl = useCallback(async () => {
    if (!bucket || !path) {
      setUrl(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const { data, error: signedError } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, expiresIn);

    if (signedError || !data?.signedUrl) {
      const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(path);
      setUrl(publicUrlData?.publicUrl || null);
      setError(signedError || null);
      setLoading(false);
      return;
    }

    setUrl(data.signedUrl);
    setLoading(false);
  }, [bucket, expiresIn, path, supabase]);

  useEffect(() => {
    fetchUrl();
  }, [fetchUrl]);

  return { url, loading, error, refresh: fetchUrl };
}
