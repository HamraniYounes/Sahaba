import type { ReactNode } from "react";

export function AuthCard({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
        <div className="w-10 h-10 rounded-xl bg-gold flex items-center justify-center text-white font-bold text-xl mb-4">S</div>
        <h1 className="text-2xl font-bold">{title}</h1>
        {subtitle && <p className="text-slate-600 mt-1 mb-6">{subtitle}</p>}
        {children}
      </div>
    </div>
  );
}

export function FormMessage({ error, info }: { error?: string; info?: string }) {
  if (error) return <p className="rounded-lg bg-red-50 text-red-700 text-sm p-3" role="alert">{error}</p>;
  if (info) return <p className="rounded-lg bg-emerald-50 text-emerald-800 text-sm p-3">{info}</p>;
  return null;
}
