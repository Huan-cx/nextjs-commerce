import {useCallback, useState} from "react";
import {del, get, post, put} from "@utils/request/request";

interface UseRestMutationOptions {
  method?: "POST" | "GET" | "PUT" | "DELETE";
  onCompleted?: (data: any) => void;
  onError?: (error: any) => void;
}

export function useRestMutation<T = any>(
    url: string,
    options: UseRestMutationOptions = {}
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  const [data, setData] = useState<T | null>(null);

  const mutate = useCallback(async (variables?: any) => {
    setLoading(true);
    setError(null);

    const {method = "POST", onCompleted, onError} = options;
    try {
      let response;

      switch (method) {
        case "POST":
          response = await post<T>(url, variables);
          break;
        case "GET":
          response = await get<T>(url, variables);
          break;
        case "PUT":
          response = await put<T>(url, variables);
          break;
        case "DELETE":
          response = await del<T>(url, variables);
          break;
        default:
          response = await post<T>(url, variables);
      }

      setData(response);
      onCompleted?.(response);
      return response;
    } catch (err) {
      setError(err);
      onError?.(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [url, options]);

  return [mutate, {loading, error, data}] as const;
}
