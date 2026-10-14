import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const supabaseConfigured = Boolean(url && key);

// Valeurs factices si non configuré : l'app affiche alors un message de configuration.
export const supabase = createClient(
  url || "http://localhost:54321",
  key || "public-anon-key-not-configured",
  { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } }
);
