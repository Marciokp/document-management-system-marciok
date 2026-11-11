import { useCallback, useEffect, useState } from 'react';
import { listDocuments, uploadDocument } from '../services/api.js';

export default function useDocuments(username) {
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(Boolean(username));
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = useCallback(() => {
    setRefreshKey((current) => current + 1);
  }, []);

  useEffect(() => {
    if (!username) {
      setDocuments([]);
      setError(null);
      setIsLoading(false);
      return undefined;
    }

    const controller = new AbortController();
    setDocuments([]);
    setError(null);
    setIsLoading(true);

    listDocuments({ signal: controller.signal })
      .then(setDocuments)
      .catch((requestError) => {
        if (requestError.name !== 'AbortError') setError(requestError);
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, [username, refreshKey]);

  async function upload(file) {
    const document = await uploadDocument(file);
    refresh();
    return document;
  }

  return {
    documents,
    error,
    isLoading,
    refresh,
    upload,
  };
}
