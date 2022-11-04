import { useCallback, useEffect, useState } from "react";

// Trying to lessen annoyingness of fetching on page load. This may need to evolve,
// but I think it works on standard test cases + is generic for different data types
const useHttps = <T>(url: string) => {
  const [data, setPokemon] = useState<T>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(url);
      const data = await res.json();

      setPokemon(data.results);
      setLoading(false);
    } catch (error) {
      setError(true);
      setLoading(false);
    }
  }, [url]);

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
