import { useCallback, useEffect, useRef, useState } from 'react';

export function unwrapData<T = any>(response: any): T {
  if (response && typeof response === 'object' && !('data' in response)) {
    return response as T;
  }

  const data = response?.data?.data;

  if (!data) {
    return response?.data as T;
  }

  if (data.dashboard) {
    return data.dashboard as T;
  }

  if (data.announcements) {
    return data.announcements as T;
  }

  if (data.channels) {
    return data.channels as T;
  }

  if (data.channel) {
    return data.channel as T;
  }

  if (data.messages) {
    return data.messages as T;
  }

  if (data.message) {
    return data.message as T;
  }

  if (data.teams) {
    return data.teams as T;
  }

  if (data.team) {
    return data.team as T;
  }

  if (data.members) {
    return data.members as T;
  }

  if (data.notifications) {
    return data.notifications as T;
  }

  if (data.users) {
    return data.users as T;
  }

  if (data.user) {
    return data.user as T;
  }

  if (data.course) {
    return data.course as T;
  }

  if (data.courses) {
    return data.courses as T;
  }

  if (data.stats) {
    return data.stats as T;
  }

  if (data.metrics) {
    return data.metrics as T;
  }

  if (data.analytics) {
    return data.analytics as T;
  }

  if (data.logs) {
    return data.logs as T;
  }

  if (data.settings) {
    return data.settings as T;
  }

  if (data.preferences) {
    return data.preferences as T;
  }

  if (data.progress) {
    return data.progress as T;
  }

  if (data.assignment) {
    return data.assignment as T;
  }

  if (data.submission) {
    return data.submission as T;
  }

  if (data.certificate) {
    return data.certificate as T;
  }

  return data as T;
}

export function formatDate(value?: string | null) {
  if (!value) {
    return 'N/A';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

export function useAsyncResource<T = any>(loader: () => Promise<any>, initialValue: any) {
  const [data, setData] = useState<any>(initialValue);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const loaderRef = useRef(loader);

  useEffect(() => {
    loaderRef.current = loader;
  }, [loader]);

  const refetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await loaderRef.current();
      setData(unwrapData<T>(response));
    } catch (err: any) {
      setError(err?.response?.data?.meta?.message || err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, setData, loading, error, refetch };
}
