// src/hooks/useFetch.ts
import { useState, useEffect, useCallback } from 'react';

interface UseFetchOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: any;
  immediate?: boolean;
}

interface UseFetchState<T> {
  data: T | null;
  error: Error | null;
  loading: boolean;
}

export const useFetch = <T>(url: string, options: UseFetchOptions = {}) => {
  const { method = 'GET', headers = {}, body = null, immediate = true } = options;
  
  const [state, setState] = useState<UseFetchState<T>>({
    data: null,
    error: null,
    loading: false
  });

  // Define our fetch function
  const fetchData = useCallback(async (overrideOptions: Partial<UseFetchOptions> = {}) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const mergedOptions = {
        method,
        headers: {
          ...headers,
          ...overrideOptions.headers
        },
        ...(body || overrideOptions.body ? {
          body: JSON.stringify(overrideOptions.body || body)
        } : {})
      };
      
      const response = await fetch(url, mergedOptions);
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      setState({ data, error: null, loading: false });
      return data;
    } catch (error) {
      setState({ data: null, error: error as Error, loading: false });
      throw error;
    }
  }, [url, method, headers, body]);

  // Call fetchData if immediate is true
  useEffect(() => {
    if (immediate) {
      fetchData();
    }
  }, [immediate, fetchData]);

  return { ...state, fetchData };
};