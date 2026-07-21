import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import {
  getSupabaseServiceRoleKey,
  getSupabaseUrl,
} from '../env';

let serviceClient: SupabaseClient | null = null;

export function createServiceClient(): SupabaseClient {
  if (serviceClient) return serviceClient;

  serviceClient = createClient(getSupabaseUrl(), getSupabaseServiceRoleKey(), {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return serviceClient;
}

export function resetServiceClientForTests(): void {
  serviceClient = null;
}
