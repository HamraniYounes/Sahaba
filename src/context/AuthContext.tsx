import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase, supabaseConfigured } from "../lib/supabase";
import type { Profile, Role } from "../types";

interface AuthState {
  user: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string, asOwner?: boolean) => Promise<{ needsConfirmation: boolean }>;
  verifySignUpOtp: (email: string, code: string) => Promise<void>;
  resendSignUpOtp: (email: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  sendResetEmail: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
  /** Passe le compte USER en OWNER (réclamation de lieux). */
  becomeOwner: () => Promise<void>;
  isModerator: boolean;
  /** OWNER, modérateur ou admin : peut déposer une réclamation. */
  canClaim: boolean;
}

const Ctx = createContext<AuthState | null>(null);

async function loadProfile(session: Session | null): Promise<Profile | null> {
  if (!session) return null;
  const { data } = await supabase.from("profiles").select("name, role, avatar_url").eq("id", session.user.id).maybeSingle();
  return {
    id: session.user.id,
    email: session.user.email ?? "",
    name: data?.name || (session.user.user_metadata?.name as string) || session.user.email?.split("@")[0] || "",
    role: ((data?.role as Role) ?? "USER"),
    avatarUrl: data?.avatar_url,
  };
}

const sameProfile = (a: Profile | null, b: Profile | null) =>
  a === b || (!!a && !!b && a.id === b.id && a.email === b.email && a.name === b.name && a.role === b.role && a.avatarUrl === b.avatarUrl);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(supabaseConfigured);

  useEffect(() => {
    if (!supabaseConfigured) return;
    let active = true;
    supabase.auth.getSession().then(async ({ data }) => {
      const p = await loadProfile(data.session);
      if (active) { setUser(p); setLoading(false); }
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      // différé : pas d'appel Supabase directement dans le callback
      setTimeout(async () => {
        const p = await loadProfile(session);
        // évite de recréer l'objet user (et de relancer les effets qui en dépendent) à chaque rafraîchissement de jeton
        if (active) setUser((prev) => (sameProfile(prev, p) ? prev : p));
      }, 0);
    });
    return () => { active = false; sub.subscription.unsubscribe(); };
  }, []);

  const refreshProfile = useCallback(async () => {
    const { data } = await supabase.auth.getSession();
    setUser(await loadProfile(data.session));
  }, []);

  const value = useMemo<AuthState>(() => ({
    user,
    loading,
    isModerator: user?.role === "MODERATOR" || user?.role === "ADMIN",
    canClaim: user?.role === "OWNER" || user?.role === "MODERATOR" || user?.role === "ADMIN",
    async signIn(email, password) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw new Error(error.message === "Invalid login credentials" ? "Email ou mot de passe incorrect." : error.message);
    },
    async signUp(name, email, password, asOwner = false) {
      const { data, error } = await supabase.auth.signUp({
        email, password,
        options: { data: { name, ...(asOwner ? { account_type: "owner" } : {}) }, emailRedirectTo: window.location.origin },
      });
      if (error) throw new Error(error.message);
      return { needsConfirmation: !data.session };
    },
    async verifySignUpOtp(email, code) {
      const { error } = await supabase.auth.verifyOtp({ email, token: code.trim(), type: "signup" });
      if (error) throw new Error("Code invalide ou expiré.");
    },
    async resendSignUpOtp(email) {
      const { error } = await supabase.auth.resend({ type: "signup", email });
      if (error) throw new Error(error.message);
    },
    async signInWithGoogle() {
      const { error } = await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: window.location.origin } });
      if (error) throw new Error(error.message);
    },
    async signOut() { await supabase.auth.signOut(); setUser(null); },
    async sendResetEmail(email) {
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` });
      if (error) throw new Error(error.message);
    },
    async updatePassword(password) {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw new Error(error.message);
    },
    refreshProfile,
    async becomeOwner() {
      const { error } = await supabase.rpc("become_owner");
      if (error) throw new Error(error.message);
      await refreshProfile();
    },
  }), [user, loading, refreshProfile]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth doit être utilisé dans <AuthProvider>");
  return v;
}
