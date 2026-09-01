import { useCallback, useState } from "react";

const useFetch = <T, TArgs extends unknown[]>(
  cb: (...args: TArgs) => Promise<T>,
) => {
  const [data, setData] = useState<T | undefined>(undefined);
  const [loading, setLoading] = useState<boolean | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const fn = useCallback(
    async (...args: TArgs) => {
      setLoading(true);
      setError(null);

      try {
        const response = await cb(...args);
        setData(response);
        setError(null);
        return response;
      } catch (error) {
        setError(error instanceof Error ? error : new Error(String(error)));
        return undefined;
      } finally {
        setLoading(false);
      }
    },
    [cb],
  );

  return { data, loading, error, fn };
};

export default useFetch;
