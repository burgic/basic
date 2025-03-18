// src/hooks/useSupabase.ts
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabaseClient';

export const useSupabase = <T extends Record<string, any>>(tableName: string) => {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (userId?: string) => {
    setLoading(true);
    setError(null);

    try {
      let query = supabase.from(tableName).select('*');
      
      if (userId) {
        query = query.eq('client_id', userId);
      }

      const { data: fetchedData, error } = await query;

      if (error) throw error;

      setData(fetchedData || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
      console.error(`Error fetching ${tableName}:`, errorMessage);
    } finally {
      setLoading(false);
    }
  }, [tableName]);

  const insertData = useCallback(async (newData: Partial<T>) => {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .insert(newData)
        .select();

      if (error) throw error;

      // Optionally update local state
      setData(prev => [...prev, ...(data || [])]);

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
      console.error(`Error inserting into ${tableName}:`, errorMessage);
      throw err;
    }
  }, [tableName]);

  const updateData = useCallback(async (id: string | number, updatedData: Partial<T>) => {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .update(updatedData)
        .eq('id', id)
        .select();

      if (error) throw error;

      // Update local state
      setData(prev => 
        prev.map(item => 
          item.id === id ? { ...item, ...updatedData } : item
        )
      );

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
      console.error(`Error updating ${tableName}:`, errorMessage);
      throw err;
    }
  }, [tableName]);

  const deleteData = useCallback(async (id: string | number) => {
    try {
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Update local state
      setData(prev => prev.filter(item => item.id !== id));

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
      console.error(`Error deleting from ${tableName}:`, errorMessage);
      throw err;
    }
  }, [tableName]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    fetchData,
    insertData,
    updateData,
    deleteData
  };
};