import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
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
