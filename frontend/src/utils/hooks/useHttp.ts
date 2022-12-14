import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const useHttps = <T>(url: string, options?: RequestInit) => {
  const [data, setData] = useState<T>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(url, options);
      const data = await res.json();

      setData(data);
      setLoading(false);
    } catch (error) {
      setError(true);
      setLoading(false);
    }
  }, [url, options]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
  };
};

export default useHttps;
