import type { InputHTMLAttributes, LabelHTMLAttributes, TextareaHTMLAttributes } from "react";

const base = "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold";

export function Input({ className = "", ...p }: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...p} className={`${base} ${className}`} />;
}
export function Textarea({ className = "", ...p }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...p} className={`${base} ${className}`} />;
}
export function Label({ className = "", ...p }: LabelHTMLAttributes<HTMLLabelElement>) {
  return <label {...p} className={`mb-1 block text-sm font-medium text-slate-700 ${className}`} />;
}
