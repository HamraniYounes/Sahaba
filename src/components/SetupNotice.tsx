import { supabaseConfigured } from "../lib/supabase";

export function SetupNotice() {
  if (supabaseConfigured) return null;
  return (
    <div className="bg-amber-50 border-b border-amber-200 px-4 py-3 text-sm text-amber-900">
      <strong>Supabase n'est pas configuré.</strong> Copiez <code>.env.example</code> vers <code>.env</code>, renseignez
      <code> VITE_SUPABASE_URL</code> et <code>VITE_SUPABASE_ANON_KEY</code>, puis relancez <code>npm run dev</code>.
    </div>
  );
}
