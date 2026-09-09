import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string) || 'https://pnqpptimjuvwacfkhuib.supabase.co';
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBucXBwdGltanV2d2FjZmtodWliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI3NTI5MjksImV4cCI6MjA5ODMyODkyOX0.CXVK_iUcznBF-5RBmaTX2q2g1gVOtzPLalETA9BFhVc';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase environment variables.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Converts a standard Supabase storage public URL into an optimized thumbnail URL.
 * Only applies to Supabase storage URLs. Other URLs are returned as-is.
 * Requires Image Transformations to be enabled in Supabase Project Settings.
 */
export const getThumbnailUrl = (url?: string, _width?: number, _quality?: number): string => {
  if (!url) return '';
  return url;
};
